<?php

namespace App\Http\Controllers\Private;

use App\Enums\Permission;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Permission helpers                                                  */
    /* ------------------------------------------------------------------ */

    private function canView(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::TasksView);
    }

    private function canAssign(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::TasksAssign);
    }

        private function canManageOwn(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::TasksManageOwn);
    }

    private function canManageAll(): bool
    {
        return auth()->user()->isSuperAdmin() || auth()->user()->hasPermission(Permission::TasksManageAll);
    }

    /* ------------------------------------------------------------------ */
    /* Index                                                               */
    /* ------------------------------------------------------------------ */

        public function index(Request $request): Response
    {
        abort_unless($this->canView() || $this->canManageAll(), 403);

        $user = auth()->user();

        // Start with base query + eager loading
        $query = Task::query()->with(['assignee', 'matter', 'createdBy', 'completedBy']);

        // Apply filters
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($assigneeId = $request->query('assignee_id')) {
            $query->where('assignee_id', $assigneeId);
        }

        if ($matterId = $request->query('matter_id')) {
            $query->where('matter_id', $matterId);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Date range filters
        if ($dueFrom = $request->query('due_from')) {
            $query->where('due_date', '>=', $dueFrom);
        }

        if ($dueTo = $request->query('due_to')) {
            $query->where('due_date', '<=', $dueTo);
        }

        // If user can't manage all, only show tasks they're assigned to or created
        if (!$this->canManageAll()) {
            $query->where(function ($q) use ($user) {
                $q->where('assignee_id', $user->id)
                  ->orWhere('created_by_id', $user->id);
            });
        }

        // Sorting
        $sort = $request->query('sort', 'due_date');
        $direction = $request->query('direction', 'asc');

        $allowedSorts = ['title', 'due_date', 'priority', 'status', 'created_at'];
        if (in_array($sort, $allowedSorts, true)) {
            if ($sort === 'due_date') {
                // Put null dates at the end when sorting by due_date
                $query->orderByRaw("CASE WHEN due_date IS NULL THEN 1 ELSE 0 END {$direction}")
                      ->orderBy('due_date', $direction);
            } else {
                $query->orderBy($sort, $direction);
            }
        } else {
            $query->latest('created_at');
        }

        // Pagination
        $perPage = $request->query('per_page', 25);
        $perPage = $perPage === 'all' || $perPage == 999999 ? 10000 : min((int) $perPage, 100);

        $tasks = $query->paginate($perPage)->withQueryString();

        \Log::info('📋 Tasks query', [
            'user' => $user->name,
            'filters' => $request->only(['status', 'priority', 'assignee_id', 'matter_id', 'search', 'due_from', 'due_to']),
            'sort' => $sort,
            'direction' => $direction,
            'total' => $tasks->total(),
        ]);

        // Transform tasks for frontend
        $mappedTasks = $tasks->through(function (Task $task) use ($user) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'status' => [
                    'value' => $task->status->value,
                    'label' => $task->status->label(),
                    'color' => $task->status->color(),
                ],
                'priority' => [
                    'value' => $task->priority->value,
                    'label' => $task->priority->label(),
                    'color' => $task->priority->color(),
                ],
                'due_date' => $task->due_date?->toDateString(),
                'is_overdue' => $task->isOverdue(),
                'is_due_today' => $task->isDueToday(),
                'matter' => $task->matter ? [
                    'id' => $task->matter->id,
                    'title' => $task->matter->title,
                    'file_number' => $task->matter->file_number,
                ] : null,
                'assignee' => $task->assignee ? [
                    'id' => $task->assignee->id,
                    'name' => $task->assignee->name,
                ] : null,
                'created_by' => $task->createdBy ? [
                    'id' => $task->createdBy->id,
                    'name' => $task->createdBy->name,
                ] : null,
                'completed_at' => $task->completed_at?->toIso8601String(),
                'is_my_task' => $task->assignee_id === $user->id,
            ];
        });

        return Inertia::render('private/tasks/Index', [
            'tasks' => $mappedTasks,
            'filters' => [
                'status' => $request->query('status'),
                'priority' => $request->query('priority'),
                'assignee_id' => $request->query('assignee_id'),
                'matter_id' => $request->query('matter_id'),
                'search' => $request->query('search'),
                'due_from' => $request->query('due_from'),
                'due_to' => $request->query('due_to'),
                'sort' => $request->query('sort', 'due_date'),
                'direction' => $request->query('direction', 'asc'),
                'per_page' => $perPage,
            ],
            'statuses' => collect(TaskStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ])->values(),
            'priorities' => collect(TaskPriority::cases())->map(fn ($p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'color' => $p->color(),
            ])->values(),
            'staff' => User::orderBy('name')->get(['id', 'name']),
            'matters' => \App\Models\Matter::where('status', 'open')->orderBy('title')->get(['id', 'title', 'file_number']),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* My Tasks                                                            */
    /* ------------------------------------------------------------------ */

    public function myTasks(Request $request)
    {
        abort_unless(auth()->check(), 403);

        $tasks = Task::where('assignee_id', auth()->id())
            ->whereNotIn('status', [TaskStatus::Completed, TaskStatus::Cancelled])
            ->orderByRaw("CASE WHEN due_date IS NULL THEN 1 ELSE 0 END")
            ->orderBy('due_date')
            ->with(['matter', 'createdBy'])
            ->limit(50)
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'due_date' => $task->due_date?->toDateString(),
                'priority' => [
                    'value' => $task->priority->value,
                    'label' => $task->priority->label(),
                    'color' => $task->priority->color(),
                ],
                'status' => [
                    'value' => $task->status->value,
                    'label' => $task->status->label(),
                    'color' => $task->status->color(),
                ],
                'is_overdue' => $task->isOverdue(),
                'is_due_today' => $task->isDueToday(),
                'matter' => $task->matter ? [
                    'id' => $task->matter->id,
                    'title' => $task->matter->title,
                    'file_number' => $task->matter->file_number,
                ] : null,
                'created_by' => $task->createdBy ? [
                    'id' => $task->createdBy->id,
                    'name' => $task->createdBy->name,
                ] : null,
            ]);

        return response()->json(['tasks' => $tasks]);
    }

    /* ------------------------------------------------------------------ */
    /* Store                                                               */
    /* ------------------------------------------------------------------ */

        public function store(Request $request)
    {
        abort_unless($this->canManageOwn() || $this->canAssign() || $this->canManageAll(), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'status' => ['required', 'string', 'in:pending,in_progress,completed,cancelled'],
            'due_date' => ['nullable', 'date'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'matter_id' => ['nullable', 'exists:matters,id'],
        ]);

        // Auto-set created_by to current user
        $validated['created_by_id'] = auth()->id();

        // If status is completed, set completion audit fields
        if ($validated['status'] === 'completed') {
            $validated['completed_at'] = now();
            $validated['completed_by_id'] = auth()->id();
        }

        // Default assignee to creator if not specified
        if (empty($validated['assignee_id'])) {
            $validated['assignee_id'] = auth()->id();
        }

        // Assigning to someone else requires assign permission
        if ((int) $validated['assignee_id'] !== auth()->id()) {
            abort_unless($this->canAssign() || $this->canManageAll(), 403, 'You are not allowed to assign tasks to other staff.');
        }

        $task = Task::create($validated);

        \Log::info('✅ Task created', [
            'task_id' => $task->id,
            'title' => $task->title,
            'assignee' => $task->assignee?->name,
            'created_by' => auth()->user()->name,
            'priority' => $task->priority->label(),
            'status' => $task->status->label(),
            'due_date' => $task->due_date?->toDateString(),
        ]);

        return back()->with('success', 'Task created successfully.');
    }

    /* ------------------------------------------------------------------ */
    /* Update                                                              */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, Task $task)
    {
        $userId = auth()->id();
        $isAssignee = $task->assignee_id === $userId;
        $isCreator = $task->created_by_id === $userId;

        // Managers, dispatchers (assign), or manage_own users involved in the task
        abort_unless(
            $this->canManageAll()
            || $this->canAssign()
            || ($this->canManageOwn() && ($isAssignee || $isCreator)),
            403,
            'You are not allowed to update this task.'
        );

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['sometimes', 'required', 'string', 'in:low,medium,high,urgent'],
            'status' => ['sometimes', 'required', 'string', 'in:pending,in_progress,completed,cancelled'],
            'due_date' => ['nullable', 'date'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'matter_id' => ['nullable', 'exists:matters,id'],
        ]);

        // Reassigning to a different person requires assign permission
        if (array_key_exists('assignee_id', $validated) && (int) $validated['assignee_id'] !== (int) $task->assignee_id) {
            abort_unless(
                $this->canAssign() || $this->canManageAll(),
                403,
                'You are not allowed to reassign tasks.'
            );
        }

        $oldStatus = $task->status;

        // Completion audit trail: stamp when completed, clear when reopened
        if (isset($validated['status']) && $validated['status'] !== $oldStatus->value) {
            if ($validated['status'] === 'completed') {
                $validated['completed_at'] = now();
                $validated['completed_by_id'] = $userId;
            } else {
                $validated['completed_at'] = null;
                $validated['completed_by_id'] = null;
            }
        }

        $task->update($validated);

        \Log::info('🔄 Task updated', [
            'task_id' => $task->id,
            'title' => $task->title,
            'updated_by' => auth()->user()->name,
            'status_change' => $oldStatus->value !== $task->status->value
                ? $oldStatus->value . ' → ' . $task->status->value
                : null,
            'changed_fields' => array_keys($validated),
        ]);

        return back()->with('success', 'Task updated successfully.');
    }

    /* ------------------------------------------------------------------ */
    /* Destroy                                                             */
    /* ------------------------------------------------------------------ */

    public function destroy(Task $task)
    {
        // Only managers or the creator can delete.
        // Assignees cannot delete their tasks — they can cancel them instead (audit safety).
        abort_unless(
            $this->canManageAll() || ($this->canManageOwn() && $task->created_by_id === auth()->id()),
            403,
            'You are not allowed to delete this task.'
        );

        \Log::info('🗑️ Task deleted', [
            'task_id' => $task->id,
            'title' => $task->title,
            'status_at_deletion' => $task->status->value,
            'assignee' => $task->assignee?->name,
            'deleted_by' => auth()->user()->name,
        ]);

        $task->delete();

        return back()->with('success', 'Task deleted.');
    }
}
