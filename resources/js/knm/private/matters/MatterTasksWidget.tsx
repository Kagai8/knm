/* eslint-disable import/order */
/* eslint-disable curly */
/* eslint-disable @stylistic/padding-line-between-statements */
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Badge, Button, Card, CardBody, CardHeader, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

// Mirrors App\Enums\TaskStatus (kept local to avoid an extra backend prop)
const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

export interface MatterTask {
    id: number;
    title: string;
    description: string | null;
    status: { value: string; label: string; color: string };
    priority: { value: string; label: string; color: string };
    due_date: string | null;
    is_overdue: boolean;
    is_due_today: boolean;
    assignee: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
    completed_at: string | null;
    completed_by: { id: number; name: string } | null;
}

interface Props {
    tasks: MatterTask[];
    matterId: number;
    staff: { id: number; name: string }[];
}

const priorityBar: Record<string, string> = {
    low: 'bg-slate-300',
    medium: 'bg-blue-400',
    high: 'bg-amber-400',
    urgent: 'bg-red-500',
};

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function MatterTasksWidget({ tasks, matterId, staff }: Props) {
    const { can, user: currentUser } = useAuth();
    const [showCompleted, setShowCompleted] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const canCreate = can('tasks.manage_own') || can('tasks.assign') || can('tasks.manage_all');

    const taskForm = useForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assignee_id: '',
        matter_id: '',
        status: 'pending',
    });

    const openCreateModal = () => {
        taskForm.clearErrors();
        taskForm.setData({
            title: '',
            description: '',
            priority: 'medium',
            due_date: '',
            assignee_id: currentUser?.id?.toString() ?? '',
            matter_id: String(matterId),
            status: 'pending',
        });
        setCreateOpen(true);
    };

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        taskForm.post('/private/tasks', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Task created', { description: `"${taskForm.data.title}" added to this matter.` });
                setCreateOpen(false);
            },
            onError: (errors) => toast.error('Could not create task', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const canEditTask = (task: MatterTask) => {
        if (can('tasks.manage_all')) return true;
        if (can('tasks.assign')) return true;
        if (can('tasks.manage_own') && (task.assignee?.id === currentUser?.id || task.created_by?.id === currentUser?.id)) return true;
        return false;
    };

    const changeStatus = (task: MatterTask, status: string) => {
        const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;

        router.put(`/private/tasks/${task.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status updated', { description: `"${task.title}" is now ${label}.` }),
            onError: () => toast.error('Could not update status'),
        });
    };

    const open = tasks.filter((t) => t.status.value === 'pending' || t.status.value === 'in_progress');
    const completed = tasks.filter((t) => t.status.value === 'completed');
    const cancelled = tasks.filter((t) => t.status.value === 'cancelled');
    const overdue = open.filter((t) => t.is_overdue);

    const total = tasks.length;
    const active = tasks.filter((t) => t.status.value !== 'cancelled');
    const donePct = active.length > 0 ? Math.round((completed.length / active.length) * 100) : 0;

    return (
        <>
        <Card>
            <CardHeader>
                <div className="w-full">
                    <div className="flex items-center justify-between w-full gap-3">
                        <h2 className="text-lg font-serif font-bold text-slate-900">Tasks</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                                {open.length} open · {overdue.length} overdue · {completed.length} done
                            </span>
                            {canCreate && (
                                <Button variant="secondary" size="sm" onClick={openCreateModal}>
                                    + Add Task
                                </Button>
                            )}
                        </div>
                    </div>
                    {total > 0 && (
                        <div className="mt-3">
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#891920] transition-all duration-500"
                                    style={{ width: `${donePct}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{donePct}% complete</div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardBody>
                {total === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">No tasks on this matter yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {open.length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-sm">All tasks completed. 🎉</div>
                        )}

                        {open.map((task) => (
                            <div key={task.id} className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                                <div className={`w-1 rounded-full shrink-0 ${priorityBar[task.priority.value] ?? 'bg-slate-200'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-slate-900 text-sm">{task.title}</span>
                                        <Badge color={task.priority.color as any}>{task.priority.label}</Badge>
                                        {task.is_overdue && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                                Overdue
                                            </span>
                                        )}
                                        {task.is_due_today && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                Due today
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Due {formatDate(task.due_date)}
                                        {task.assignee && <> · {task.assignee.name}</>}
                                    </div>
                                </div>
                                <div className="shrink-0 self-center">
                                    {canEditTask(task) ? (
                                        <select
                                            value={task.status.value}
                                            onChange={(e) => changeStatus(task, e.target.value)}
                                            title="Change status"
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#891920]/20 ${statusStyles[task.status.value] ?? ''}`}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Badge color={task.status.color as any} dot>{task.status.label}</Badge>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(completed.length > 0 || cancelled.length > 0) && (
                            <div className="pt-2">
                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showCompleted ? 'Hide' : 'Show'} completed / cancelled ({completed.length + cancelled.length})
                                </button>
                                {showCompleted && (
                                    <div className="mt-2 space-y-2">
                                        {[...completed, ...cancelled].map((task) => (
                                            <div key={task.id} className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                                <div className="w-1 rounded-full shrink-0 bg-slate-200" />
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm ${task.status.value === 'completed' ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                                                        {task.title}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        {task.status.value === 'completed'
                                                            ? `Completed ${formatDate(task.completed_at)}${task.completed_by ? ` by ${task.completed_by.name}` : ''}`
                                                            : 'Cancelled'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>

        <Modal
            isOpen={createOpen}
            onClose={() => setCreateOpen(false)}
            title="New Task on this Matter"
            subtitle="The task will be linked to this matter automatically."
            size="sm"
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={taskForm.processing} onClick={submitTask as any}>
                        Create Task
                    </Button>
                </>
            }
        >
            <form id="matter-task-form" onSubmit={submitTask} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Task Title</label>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                        value={taskForm.data.title}
                        onChange={(e) => taskForm.setData('title', e.target.value)}
                        placeholder="e.g. Draft defence statements"
                    />
                    {taskForm.errors.title && <p className="text-xs text-red-600 mt-1">{taskForm.errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Priority</label>
                        <select
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#891920] focus:outline-none"
                            value={taskForm.data.priority}
                            onChange={(e) => taskForm.setData('priority', e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Due Date</label>
                        <input
                            type="date"
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#891920] focus:outline-none"
                            value={taskForm.data.due_date}
                            onChange={(e) => taskForm.setData('due_date', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Assignee</label>
                    <select
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none"
                        value={taskForm.data.assignee_id}
                        onChange={(e) => taskForm.setData('assignee_id', e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {staff.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.id === currentUser?.id ? `Me (${s.name})` : s.name}
                            </option>
                        ))}
                    </select>
                </div>
            </form>
        </Modal>
        </>
    );
}