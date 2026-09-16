<?php

namespace App\Http\Controllers\Private;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\CalendarEventType;
use App\Models\DeadlineRule;
use App\Models\Matter;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Permission helpers                                                  */
    /* ------------------------------------------------------------------ */

    private function canManageAll(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::CalendarManageAll);
    }

    private function canManageOwn(): bool
    {
        return auth()->user()->hasPermission(Permission::CalendarManageOwn);
    }

    private function canDelegate(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::CalendarDelegate);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Resolve the attendee IDs from either the new multi-select input
     * (attendee_ids array) or the legacy single input (attendee_id).
     */
    private function resolveAttendeeIds(Request $request, array $validated, array $fallback = []): array
    {
        if ($request->has('attendee_ids')) {
            $ids = array_map('intval', (array) ($validated['attendee_ids'] ?? []));
        } else {
            $ids = $fallback;
        }

        if (empty($ids)) {
            $ids = [auth()->id()];
        }

        return array_values(array_unique($ids));
    }

    /**
     * Find events where ONE specific attendee is already committed
     * during the proposed time window.
     */
    private function findConflicts(int $attendeeId, Carbon $start, ?Carbon $end, ?int $ignoreEventId = null)
    {
        $newEnd = $end ?? $start->copy()->addHour();

        return CalendarEvent::whereHas('attendees', fn ($q) => $q->where('users.id', $attendeeId))
            ->where('starts_at', '<', $newEnd)
            ->when($ignoreEventId, fn ($q) => $q->where('id', '!=', $ignoreEventId))
            ->with('type')
            ->get()
            ->filter(function (CalendarEvent $existing) use ($start) {
                $existingEnd = $existing->ends_at ?? $existing->starts_at->copy()->addHour();
                return $existingEnd->gt($start);
            })
            ->values()
            ->map(fn (CalendarEvent $e) => [
                'id' => $e->id,
                'title' => $e->title,
                'time' => $e->is_all_day
                    ? $e->starts_at->format('d M Y (all day)')
                    : $e->starts_at->format('d M Y H:i') . '–' . ($e->ends_at ? $e->ends_at->format('H:i') : $e->starts_at->copy()->addHour()->format('H:i')),
            ]);
    }

    /**
     * Collect conflicts across ALL proposed attendees.
     */
    private function collectConflicts(array $attendeeIds, Carbon $start, ?Carbon $end, ?int $ignoreEventId = null)
    {
        $all = collect();

        foreach ($attendeeIds as $attendeeId) {
            $conflicts = $this->findConflicts($attendeeId, $start, $end, $ignoreEventId);

            foreach ($conflicts as $conflict) {
                $all->push([
                    'attendee' => User::find($attendeeId)?->name,
                    'conflict' => $conflict,
                ]);
            }
        }

        return $all;
    }

    /**
     * Apply active deadline rules to a newly created event.
     * Creates one follow-up deadline per matching rule.
     * Returns the number of deadlines generated.
     */
    private function applyDeadlineRules(CalendarEvent $event, array $attendeeIds): int
    {
        // Safety: never chain rules on auto-generated events
        if ($event->source_event_id !== null) {
            return 0;
        }

        $rules = DeadlineRule::where('calendar_event_type_id', $event->calendar_event_type_id)
            ->where('is_active', true)
            ->get();

        \Log::info('⏰ RULE CHECK', [
            'event_id' => $event->id,
            'event_type_id' => $event->calendar_event_type_id,
            'matching_active_rules' => $rules->count(),
            'all_rules_in_db' => DeadlineRule::all()->map(fn ($r) => [
                'id' => $r->id,
                'trigger_type_id' => $r->calendar_event_type_id,
                'active' => $r->is_active,
            ]),
        ]);

        $generated = 0;

        foreach ($rules as $rule) {
            $followUpStart = $event->starts_at->copy()->addDays($rule->offset_days);

            if ($rule->is_all_day) {
                $followUpStart->startOfDay();
            }

            $followUp = CalendarEvent::create([
                'title' => str_replace('{title}', $event->title, $rule->title_template),
                'description' => 'Auto-generated by deadline rule (' . $rule->offsetLabel() . '). Source event: ' . $event->title,
                'starts_at' => $followUpStart,
                'ends_at' => null,
                'is_all_day' => $rule->is_all_day,
                'location' => null,
                'calendar_event_type_id' => $rule->follow_up_type_id ?? $event->calendar_event_type_id,
                'matter_id' => $event->matter_id,
                'client_id' => $event->client_id,
                'created_by_id' => $event->created_by_id,
                'source_event_id' => $event->id,
                'notify_client' => false,
            ]);

            $followUp->attendees()->sync($attendeeIds);

            \Log::info('⏰ Deadline rule fired', [
                'rule_id' => $rule->id,
                'rule_template' => $rule->title_template,
                'source_event' => $event->title,
                'generated_event_id' => $followUp->id,
                'generated_date' => $followUp->starts_at->toDateTimeString(),
            ]);

            $generated++;
        }

        return $generated;
    }

    /* ------------------------------------------------------------------ */
    /* Index                                                               */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): Response
    {
        $user = auth()->user();
        $userId = $user->id;
        $canViewAll = $user->isSuperAdmin() || $user->hasPermission(Permission::CalendarViewAll);

        $requestedScope = $request->query('scope', 'own');
        $scope = ($requestedScope === 'all' && $canViewAll) ? 'all' : 'own';

        $viewScale = $request->query('view_scale', 'month');
        $viewMode = $request->query('view_mode', 'calendar');
        $matterId = $request->query('matter_id');

        $start = $request->query('start', Carbon::now()->startOfMonth()->toDateString());
        $end = $request->query('end', Carbon::now()->endOfMonth()->toDateString());
        $startCarbon = Carbon::parse($start)->startOfDay();
        $endCarbon = Carbon::parse($end)->endOfDay();

        \Log::info('📅 CALENDAR REQUEST', [
            'user' => $user->name,
            'requested_scope' => $requestedScope,
            'effective_scope' => $scope,
            'view' => $viewScale . '/' . $viewMode,
            'range' => $start . ' → ' . $end,
        ]);

        $query = CalendarEvent::query()->with(['type', 'matter', 'client', 'attendees', 'createdBy']);
        $query->whereBetween('starts_at', [$startCarbon, $endCarbon]);

        if ($scope === 'own') {
            // My Calendar = events where I am ANY attendee
            $query->whereHas('attendees', fn ($q) => $q->where('users.id', $userId));
        }

        if ($matterId) {
            $query->where('matter_id', $matterId);
        }

        $events = $query->orderBy('starts_at')->get();

        \Log::info('🔍 RESULTS', ['count' => $events->count()]);

        $mappedEvents = $events->map(function (CalendarEvent $event) use ($userId) {
            $attendeeNames = $event->attendees->pluck('name')->join(', ');

            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'starts_at' => $event->starts_at->toIso8601String(),
                'ends_at' => $event->ends_at?->toIso8601String(),
                'is_all_day' => $event->is_all_day,
                'location' => $event->location,
                'color' => $event->type?->color ?? '#891920',
                'is_deadline' => $event->isDeadline(),
                'notify_client' => $event->notify_client,

                // New multi-attendee shape
                'attendees' => $event->attendees->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])->values()->all(),
                'attendee_ids' => $event->attendees->pluck('id')->map(fn ($i) => (int) $i)->values()->all(),
                'created_by_id' => $event->created_by_id,
                'created_by_name' => $event->createdBy?->name,
                'is_my_event' => $event->attendees->contains('id', $userId),

                // TEMPORARY aliases so the current frontend stays green until C.1.4.c.3 — remove then
                'attendee_id' => $event->attendees->first()?->id,
                'attendee_name' => $attendeeNames,
                'owner_id' => $event->attendees->first()?->id,
                'owner_name' => $attendeeNames,

                'matter_id' => $event->matter_id,
                'matter_title' => $event->matter?->title,
                'matter_file_number' => $event->matter?->file_number,
                'client_id' => $event->client_id,
                'client_name' => $event->client?->displayName(),
                'type_id' => $event->calendar_event_type_id,
                'type_name' => $event->type?->name,
            ];
        });

        \Log::info('📦 PAYLOAD SENT TO FRONTEND', [
            'events' => $mappedEvents->map(fn ($e) => [
                'id' => $e['id'],
                'title' => $e['title'],
                'attendee_ids' => $e['attendee_ids'],
            ]),
        ]);

        $eventTypes = CalendarEventType::where('is_active', true)->orderBy('name')->get(['id', 'name', 'color', 'is_deadline']);
        $matters = Matter::where('status', 'open')->with('client')->orderBy('title')->get(['id', 'title', 'file_number', 'client_id']);

        return Inertia::render('private/calendar/Index', [
            'events' => $mappedEvents,
            'eventTypes' => $eventTypes,
            'matters' => $matters,
            'staff' => User::orderBy('name')->get(['id', 'name']),
            'canDelegate' => $this->canDelegate(),
            'filters' => [
                'start' => $start,
                'end' => $end,
                'scope' => $scope,
                'matter_id' => $matterId,
                'view_scale' => $viewScale,
                'view_mode' => $viewMode,
            ],
            'canViewAll' => $canViewAll,
            'openModal' => $request->boolean('open_modal'),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Store                                                               */
    /* ------------------------------------------------------------------ */

    public function store(Request $request)
    {
        abort_unless($this->canManageAll() || $this->canManageOwn(), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_all_day' => ['required', 'boolean'],
            'location' => ['nullable', 'string', 'max:255'],
            'calendar_event_type_id' => ['required', 'exists:calendar_event_types,id'],
            'matter_id' => ['nullable', 'exists:matters,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'attendee_ids' => ['nullable', 'array', 'min:1'],
            'attendee_ids.*' => ['exists:users,id'],
            'notify_client' => ['nullable', 'boolean'],
            'force' => ['nullable', 'boolean'],
        ]);

        $attendeeIds = $this->resolveAttendeeIds($request, $validated);

        // Booking anyone other than yourself needs delegate permission
        $others = array_diff($attendeeIds, [auth()->id()]);
        if (!empty($others)) {
            abort_unless($this->canDelegate(), 403, 'You are not allowed to book events for other staff.');
        }

        $startCarbon = Carbon::parse($validated['starts_at']);
        $endCarbon = !empty($validated['ends_at']) ? Carbon::parse($validated['ends_at']) : null;
        $attendeeNames = User::whereIn('id', $attendeeIds)->pluck('name')->join(', ');

        // RULE 1: exact duplicate (same title + same start + shares any attendee)
        $duplicate = CalendarEvent::where('title', $validated['title'])
            ->where('starts_at', $startCarbon)
            ->whereHas('attendees', fn ($q) => $q->whereIn('users.id', $attendeeIds))
            ->exists();

        if ($duplicate) {
            \Log::warning('🚫 Event creation blocked: EXACT DUPLICATE', [
                'creator' => auth()->user()->name,
                'attendees' => $attendeeNames,
                'title' => $validated['title'],
            ]);
            throw ValidationException::withMessages([
                'title' => ['An identical event (same attendee, same title, same start time) already exists.'],
            ]);
        }

        // RULE 2: overlap across ANY attendee; requires force to proceed
        if (! $request->boolean('force')) {
            $conflicts = $this->collectConflicts($attendeeIds, $startCarbon, $endCarbon);

            if ($conflicts->isNotEmpty()) {
                $first = $conflicts->first();
                \Log::warning('⚠️ Event creation blocked: OVERLAP', [
                    'creator' => auth()->user()->name,
                    'attendees' => $attendeeNames,
                    'title' => $validated['title'],
                    'conflict' => $first,
                ]);
                throw ValidationException::withMessages([
                    'starts_at' => ["{$first['attendee']} is already committed to \"{$first['conflict']['title']}\" ({$first['conflict']['time']}). Check 'Force book' and submit again to override."],
                ]);
            }
        }

        unset($validated['attendee_ids'], $validated['force']);
        $validated['created_by_id'] = auth()->id();
        $validated['notify_client'] = $request->boolean('notify_client');

        if (!empty($validated['matter_id']) && empty($validated['client_id'])) {
            $validated['client_id'] = Matter::find($validated['matter_id'])?->client_id;
        }

        $event = CalendarEvent::create($validated);
        $event->attendees()->sync($attendeeIds);

        $generated = $this->applyDeadlineRules($event, $attendeeIds);

        \Log::info('✅ Event created', [
            'creator' => auth()->user()->name,
            'attendees' => $attendeeNames,
            'title' => $validated['title'],
            'force_override' => $request->boolean('force'),
            'auto_deadlines_generated' => $generated,
        ]);

        $message = 'Event created successfully.';
        if ($generated > 0) {
            $message .= ' ' . $generated . ' follow-up deadline' . ($generated === 1 ? '' : 's') . ' auto-generated.';
        }

        return back()->with('success', $message);
    }

    /* ------------------------------------------------------------------ */
    /* Update                                                              */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        $iAmAttendee = $calendarEvent->attendees->contains('id', auth()->id());
        $isCreator = $calendarEvent->created_by_id === auth()->id();

        abort_unless(
            $this->canManageAll() || ($this->canManageOwn() && ($iAmAttendee || $isCreator)),
            403
        );

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_all_day' => ['required', 'boolean'],
            'location' => ['nullable', 'string', 'max:255'],
            'calendar_event_type_id' => ['required', 'exists:calendar_event_types,id'],
            'matter_id' => ['nullable', 'exists:matters,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'attendee_ids' => ['nullable', 'array', 'min:1'],
            'attendee_ids.*' => ['exists:users,id'],
            'attendee_id' => ['nullable', 'exists:users,id'],
            'notify_client' => ['nullable', 'boolean'],
            'force' => ['nullable', 'boolean'],
        ]);

        $originalIds = $calendarEvent->attendees->pluck('id')->map(fn ($i) => (int) $i)->all();
        $attendeeIds = $this->resolveAttendeeIds($request, $validated, $originalIds);

        // Adding a NEW person (other than yourself) needs delegate permission
        $addedOthers = array_diff($attendeeIds, $originalIds, [auth()->id()]);
        if (!empty($addedOthers)) {
            abort_unless($this->canDelegate(), 403, 'You are not allowed to book events for other staff.');
        }

        $startCarbon = Carbon::parse($validated['starts_at']);
        $endCarbon = !empty($validated['ends_at']) ? Carbon::parse($validated['ends_at']) : null;
        $attendeeNames = User::whereIn('id', $attendeeIds)->pluck('name')->join(', ');

        // RULE 1
        $duplicate = CalendarEvent::where('title', $validated['title'])
            ->where('starts_at', $startCarbon)
            ->where('id', '!=', $calendarEvent->id)
            ->whereHas('attendees', fn ($q) => $q->whereIn('users.id', $attendeeIds))
            ->exists();

        if ($duplicate) {
            \Log::warning('🚫 Event update blocked: EXACT DUPLICATE', ['event_id' => $calendarEvent->id]);
            throw ValidationException::withMessages([
                'title' => ['An identical event already exists.'],
            ]);
        }

        // RULE 2
        if (! $request->boolean('force')) {
            $conflicts = $this->collectConflicts($attendeeIds, $startCarbon, $endCarbon, $calendarEvent->id);

            if ($conflicts->isNotEmpty()) {
                $first = $conflicts->first();
                \Log::warning('⚠️ Event update blocked: OVERLAP', ['event_id' => $calendarEvent->id, 'conflict' => $first]);
                throw ValidationException::withMessages([
                    'starts_at' => ["{$first['attendee']} is already committed to \"{$first['conflict']['title']}\" ({$first['conflict']['time']}). Check 'Force book' to override."],
                ]);
            }
        }

        unset($validated['attendee_ids'], $validated['force']);
        $validated['notify_client'] = $request->boolean('notify_client');

        $calendarEvent->update($validated);
        $calendarEvent->attendees()->sync($attendeeIds);

        \Log::info('🔄 Event updated', [
            'event_id' => $calendarEvent->id,
            'title' => $validated['title'],
            'attendees' => $attendeeNames,
        ]);

        return back()->with('success', 'Event updated successfully.');
    }

    /* ------------------------------------------------------------------ */
    /* Destroy                                                             */
    /* ------------------------------------------------------------------ */

    public function destroy(CalendarEvent $calendarEvent)
    {
        $iAmAttendee = $calendarEvent->attendees->contains('id', auth()->id());
        $isCreator = $calendarEvent->created_by_id === auth()->id();

        abort_unless(
            $this->canManageAll() || ($this->canManageOwn() && ($iAmAttendee || $isCreator)),
            403
        );

        \Log::info('🗑️ Event deleted', [
            'user' => auth()->user()->name,
            'event_id' => $calendarEvent->id,
            'title' => $calendarEvent->title,
        ]);

        $calendarEvent->delete();

        return back()->with('success', 'Event deleted.');
    }
}
