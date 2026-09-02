<?php

namespace App\Http\Controllers\Private\Admin;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\CalendarEventType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CalendarEventTypeController extends Controller
{
    private function guard(): void
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::CalendarEventTypesManage),
            403
        );
    }

    public function index(Request $request): Response
    {
        $this->guard();

        $types = CalendarEventType::query()
            ->orderBy('name')
            ->get()
            ->map(fn (CalendarEventType $type) => [
                'id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'color' => $type->color,
                'is_deadline' => $type->is_deadline,
                'is_active' => $type->is_active,
                'events_count' => $type->events()->count(),
            ]);

        return Inertia::render('private/admin/CalendarEventTypes', [
            'types' => $types,
        ]);
    }

    public function store(Request $request)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:calendar_event_types,name'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_deadline' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        $validated['code'] = Str::snake(Str::lower($validated['name']));

        CalendarEventType::create($validated);

        return back()->with('success', 'Event type created.');
    }

    public function update(Request $request, CalendarEventType $calendarEventType)
    {
        $this->guard();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:calendar_event_types,name,' . $calendarEventType->id],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_deadline' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        $calendarEventType->update($validated);

        return back()->with('success', 'Event type updated.');
    }

    public function destroy(CalendarEventType $calendarEventType)
    {
        $this->guard();

        if ($calendarEventType->events()->exists()) {
            return back()->with('error', "Cannot delete \"{$calendarEventType->name}\": it is used by existing events. Deactivate it instead.");
        }

        $calendarEventType->delete();

        return back()->with('success', 'Event type deleted.');
    }
}
