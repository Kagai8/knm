<?php

namespace App\Http\Controllers\Private;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\CalendarEventType;
use App\Models\DeadlineRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeadlineRuleController extends Controller
{
    public function index(): Response
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::DeadlineRulesManage),
            403
        );

        $rules = DeadlineRule::with(['triggerType', 'followUpType'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rule) {
                return [
                    'id' => $rule->id,
                    'calendar_event_type_id' => $rule->calendar_event_type_id,
                    'trigger_type_name' => $rule->triggerType?->name ?? 'Unknown',
                    'title_template' => $rule->title_template,
                    'offset_days' => $rule->offset_days,
                    'offset_label' => $rule->offsetLabel(),
                    'is_all_day' => $rule->is_all_day,
                    'follow_up_type_id' => $rule->follow_up_type_id,
                    'follow_up_type_name' => $rule->followUpType?->name,
                    'is_active' => $rule->is_active,
                ];
            });

        $eventTypes = CalendarEventType::where('is_active', true)->orderBy('name')->get(['id', 'name', 'color', 'is_deadline']);

        return Inertia::render('private/deadline-rules/Index', [
            'rules' => $rules,
            'eventTypes' => $eventTypes,
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::DeadlineRulesManage),
            403
        );

        $validated = $request->validate([
            'calendar_event_type_id' => ['required', 'exists:calendar_event_types,id'],
            'title_template' => ['required', 'string', 'max:255'],
            'offset_days' => ['required', 'integer', 'min:-365', 'max:365'],
            'is_all_day' => ['required', 'boolean'],
            'follow_up_type_id' => ['nullable', 'exists:calendar_event_types,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        DeadlineRule::create($validated);

        return back()->with('success', 'Deadline rule created successfully.');
    }

    public function update(Request $request, DeadlineRule $deadlineRule)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::DeadlineRulesManage),
            403
        );

        $validated = $request->validate([
            'calendar_event_type_id' => ['required', 'exists:calendar_event_types,id'],
            'title_template' => ['required', 'string', 'max:255'],
            'offset_days' => ['required', 'integer', 'min:-365', 'max:365'],
            'is_all_day' => ['required', 'boolean'],
            'follow_up_type_id' => ['nullable', 'exists:calendar_event_types,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        $deadlineRule->update($validated);

        return back()->with('success', 'Deadline rule updated successfully.');
    }

    public function destroy(DeadlineRule $deadlineRule)
    {
        abort_unless(
            auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::DeadlineRulesManage),
            403
        );

        $deadlineRule->delete();

        return back()->with('success', 'Deadline rule deleted.');
    }
}
