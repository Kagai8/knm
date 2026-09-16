/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable curly */
import { useCallback, useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Card, CardBody, CardHeader, toast } from '@/knm/shared/ui';

interface MyTask {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: { value: string; label: string; color: string };
    status: { value: string; label: string; color: string };
    is_overdue: boolean;
    is_due_today: boolean;
    matter: { id: number; title: string; file_number: string } | null;
    created_by: { id: number; name: string } | null;
}

const priorityText: Record<string, string> = {
    low: 'text-slate-400',
    medium: 'text-blue-600',
    high: 'text-amber-600',
    urgent: 'text-red-600',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

export default function MyTasksWidget() {
    const [tasks, setTasks] = useState<MyTask[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        fetch('/private/tasks/mine', { headers: { Accept: 'application/json' } })
            .then((res) => (res.ok ? res.json() : { tasks: [] }))
            .then((data) => {
                setTasks(data.tasks ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const completeTask = (task: MyTask) => {
        router.put(`/private/tasks/${task.id}`, { status: 'completed' }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Task completed', { description: `"${task.title}" marked as done.` });
                load();
            },
            onError: () => toast.error('Could not complete task'),
        });
    };

    const overdue = tasks.filter((t) => t.is_overdue);
    const dueToday = tasks.filter((t) => t.is_due_today);
    const upcoming = tasks.filter((t) => !t.is_overdue && !t.is_due_today);

    const renderRow = (task: MyTask) => (
        <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors group"
        >
            <div className={`w-1 self-stretch rounded-full ${task.is_overdue ? 'bg-red-500' : task.is_due_today ? 'bg-amber-400' : 'bg-slate-200'}`} />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{task.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {task.matter ? `${task.matter.file_number} · ` : ''}
                    {task.due_date ? `Due ${formatDate(task.due_date)}` : 'No due date'}
                    {' · '}
                    <span className={priorityText[task.priority.value] ?? 'text-slate-500'}>{task.priority.label}</span>
                </div>
            </div>
            <button
                onClick={() => completeTask(task)}
                title="Mark as complete"
                className="p-1.5 rounded-lg text-slate-300 hover:text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </button>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-lg font-serif font-bold text-slate-900">My Tasks</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {loading ? 'Loading…' : `${tasks.length} open task${tasks.length === 1 ? '' : 's'}`}
                        </p>
                    </div>
                    <Link href="/private/tasks" className="text-xs font-medium text-[#891920] hover:underline">
                        View all →
                    </Link>
                </div>
            </CardHeader>
            <CardBody className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-6 text-sm text-slate-400">Loading your tasks…</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-500">You're all caught up. 🎉</p>
                    </div>
                ) : (
                    <>
                        {overdue.length > 0 && (
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-2">
                                    Overdue ({overdue.length})
                                </div>
                                <div className="space-y-2">{overdue.slice(0, 4).map(renderRow)}</div>
                            </div>
                        )}
                        {dueToday.length > 0 && (
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">
                                    Due today ({dueToday.length})
                                </div>
                                <div className="space-y-2">{dueToday.slice(0, 4).map(renderRow)}</div>
                            </div>
                        )}
                        {upcoming.length > 0 && (
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Upcoming ({upcoming.length})
                                </div>
                                <div className="space-y-2">{upcoming.slice(0, 5).map(renderRow)}</div>
                            </div>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
}