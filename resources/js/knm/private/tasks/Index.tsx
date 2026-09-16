/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable curly */
import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface LabelValueColor {
    value: string;
    label: string;
    color: string;
}

interface TaskItem {
    id: number;
    title: string;
    description: string | null;
    status: LabelValueColor;
    priority: LabelValueColor;
    due_date: string | null;
    is_overdue: boolean;
    is_due_today: boolean;
    matter: { id: number; title: string; file_number: string } | null;
    assignee: { id: number; name: string } | null;
    created_by: { id: number; name: string } | null;
    completed_at: string | null;
    is_my_task: boolean;
}

interface Paginator {
    data: TaskItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Props {
    tasks: Paginator;
    filters: {
        status: string | null;
        priority: string | null;
        assignee_id: string | null;
        matter_id: string | null;
        search: string | null;
        due_from: string | null;
        due_to: string | null;
        sort: string;
        direction: string;
        per_page: number;
    };
    statuses: LabelValueColor[];
    priorities: LabelValueColor[];
    staff: { id: number; name: string }[];
    matters: { id: number; title: string; file_number: string }[];
}

const selectClasses = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function Index({ tasks, filters, statuses, priorities, staff, matters }: Props) {
    const { can, user: currentUser } = useAuth();
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TaskItem | null>(null);

    const canCreate = can('tasks.manage_own') || can('tasks.assign') || can('tasks.manage_all');

    const canEditTask = (task: TaskItem) => {
        if (can('tasks.manage_all')) return true;
        if (can('tasks.assign')) return true;
        if (can('tasks.manage_own') && (task.is_my_task || task.created_by?.id === currentUser?.id)) return true;
        return false;
    };

    const canDeleteTask = (task: TaskItem) => {
        if (can('tasks.manage_all')) return true;
        if (can('tasks.manage_own') && task.created_by?.id === currentUser?.id) return true;
        return false;
    };

    const applyFilters = (patch: Record<string, string | null>) => {
        const next = { ...(filters as Record<string, string | null>), ...patch };
        const params: Record<string, string> = {};
        Object.entries(next).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') params[key] = value;
        });
        params.page = '1';
        router.get('/private/tasks', params, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if ((searchInput || '') !== (filters.search ?? '')) {
                applyFilters({ search: searchInput || null });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const goToPage = (page: number) => {
        const params: Record<string, string> = {};
        Object.entries(filters as Record<string, string | null>).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') params[key] = value;
        });
        params.page = String(page);
        router.get('/private/tasks', params, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearchInput('');
        router.get('/private/tasks', {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = !!(filters.status || filters.priority || filters.assignee_id || filters.matter_id || filters.search);

    /* ---------------- Task form ---------------- */

    const taskForm = useForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        assignee_id: '',
        matter_id: '',
    });

    const deleteForm = useForm({});

    const openCreateModal = () => {
        setEditingTask(null);
        taskForm.reset();
        taskForm.clearErrors();
        taskForm.setData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'pending',
            due_date: '',
            assignee_id: currentUser?.id?.toString() ?? '',
            matter_id: '',
        });
        setModalOpen(true);
    };

    const openEditModal = (task: TaskItem) => {
        setEditingTask(task);
        taskForm.clearErrors();
        taskForm.setData({
            title: task.title,
            description: task.description ?? '',
            priority: task.priority.value,
            status: task.status.value,
            due_date: task.due_date ?? '',
            assignee_id: task.assignee?.id?.toString() ?? '',
            matter_id: task.matter?.id?.toString() ?? '',
        });
        setModalOpen(true);
    };

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = editingTask !== null;
        const url = isEditing ? `/private/tasks/${editingTask.id}` : '/private/tasks';
        const method = isEditing ? 'put' : 'post';

        taskForm.submit(method, url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Task updated' : 'Task created', {
                    description: `"${taskForm.data.title}" has been ${isEditing ? 'updated' : 'assigned'}.`,
                });
                setModalOpen(false);
            },
            onError: (errors) => {
                toast.error(isEditing ? 'Could not update task' : 'Could not create task', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    /* ---------------- Inline status change ---------------- */

    const changeStatus = (task: TaskItem, status: string) => {
        const label = statuses.find((s) => s.value === status)?.label ?? status;

        router.put(`/private/tasks/${task.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status updated', { description: `"${task.title}" is now ${label}.` });
            },
            onError: () => {
                toast.error('Could not update status', { description: 'You may not have permission for this task.' });
            },
        });
    };

    /* ---------------- Delete ---------------- */

    const handleDelete = () => {
        if (!deleteTarget) return;

        deleteForm.delete(`/private/tasks/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Task deleted', { description: `"${deleteTarget.title}" has been removed.` });
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error('Could not delete task', { description: 'Only the creator or a manager can delete tasks.' });
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Tasks · K&A Internal" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Tasks</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {tasks.total} task{tasks.total === 1 ? '' : 's'} · work assigned across the firm
                    </p>
                </div>
                {canCreate && (
                    <Button variant="gold" onClick={openCreateModal}>
                        + New Task
                    </Button>
                )}
            </div>

            {/* Filter bar */}
            <Card className="mb-6">
                <CardBody className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <input
                            type="text"
                            className={selectClasses}
                            placeholder="Search tasks..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <select
                            className={selectClasses}
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilters({ status: e.target.value || null })}
                        >
                            <option value="">All statuses</option>
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <select
                            className={selectClasses}
                            value={filters.priority ?? ''}
                            onChange={(e) => applyFilters({ priority: e.target.value || null })}
                        >
                            <option value="">All priorities</option>
                            {priorities.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        <select
                            className={selectClasses}
                            value={filters.assignee_id ?? ''}
                            onChange={(e) => applyFilters({ assignee_id: e.target.value || null })}
                        >
                            <option value="">All assignees</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <select
                            className={selectClasses}
                            value={filters.matter_id ?? ''}
                            onChange={(e) => applyFilters({ matter_id: e.target.value || null })}
                        >
                            <option value="">All matters</option>
                            {matters.map((m) => (
                                <option key={m.id} value={m.id}>{m.file_number}</option>
                            ))}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-3 text-xs font-medium text-[#891920] hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </CardBody>
            </Card>

            {/* Tasks table */}
            <Card>
                <CardBody className="p-0">
                    {tasks.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50">
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Task</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Assignee</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Due</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Priority</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tasks.data.map((task, idx) => (
                                        <motion.tr
                                            key={task.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={`hover:bg-slate-50/50 transition-colors ${
                                                task.is_overdue ? 'bg-red-50/40' : ''
                                            }`}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                    {task.title}
                                                    {task.is_my_task && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                            Mine
                                                        </span>
                                                    )}
                                                </div>
                                                {task.matter && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {task.matter.file_number} — {task.matter.title}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {task.assignee?.name ?? <span className="text-slate-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`font-medium ${task.is_overdue ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {formatDate(task.due_date)}
                                                </div>
                                                {task.is_overdue && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                                        Overdue
                                                    </span>
                                                )}
                                                {task.is_due_today && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                        Due today
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge color={task.priority.color as any}>{task.priority.label}</Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                {canEditTask(task) ? (
                                                    <select
                                                        value={task.status.value}
                                                        onChange={(e) => changeStatus(task, e.target.value)}
                                                        title="Change status"
                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#891920]/20 ${statusStyles[task.status.value] ?? ''}`}
                                                    >
                                                        {statuses.map((s) => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <Badge color={task.status.color as any} dot>{task.status.label}</Badge>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {canEditTask(task) && (
                                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(task)}>
                                                            Edit
                                                        </Button>
                                                    )}
                                                    {canDeleteTask(task) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setDeleteTarget(task)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125m-7.5-3h4.5" />
                            </svg>
                            <h3 className="text-lg font-serif font-bold text-slate-900">No tasks found</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {hasActiveFilters ? 'Try adjusting your filters.' : 'Tasks assigned to you or your team will appear here.'}
                            </p>
                        </div>
                    )}
                </CardBody>

                {/* Pagination */}
                {tasks.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                            Showing {tasks.from}–{tasks.to} of {tasks.total}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={tasks.current_page <= 1}
                                onClick={() => goToPage(tasks.current_page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-xs text-slate-600">
                                Page {tasks.current_page} of {tasks.last_page}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={tasks.current_page >= tasks.last_page}
                                onClick={() => goToPage(tasks.current_page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingTask ? 'Edit Task' : 'New Task'}
                subtitle={editingTask ? `Updating "${editingTask.title}"` : 'Assign a new piece of work.'}
                size="md"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={taskForm.processing} onClick={submitTask as any}>
                            {editingTask ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </>
                }
            >
                <form id="task-form" onSubmit={submitTask} className="space-y-5">
                    <FormField
                        label="Task Title"
                        value={taskForm.data.title}
                        onChange={(e) => taskForm.setData('title', e.target.value)}
                        error={taskForm.errors.title}
                        placeholder="e.g. Draft summary judgment application"
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Description (optional)</label>
                        <textarea
                            rows={3}
                            className={selectClasses}
                            value={taskForm.data.description}
                            onChange={(e) => taskForm.setData('description', e.target.value)}
                            placeholder="Instructions, context, references..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Priority</label>
                            <select
                                className={selectClasses}
                                value={taskForm.data.priority}
                                onChange={(e) => taskForm.setData('priority', e.target.value)}
                            >
                                {priorities.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select
                                className={selectClasses}
                                value={taskForm.data.status}
                                onChange={(e) => taskForm.setData('status', e.target.value)}
                            >
                                {statuses.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Due Date (optional)</label>
                            <input
                                type="date"
                                className={selectClasses}
                                value={taskForm.data.due_date}
                                onChange={(e) => taskForm.setData('due_date', e.target.value)}
                            />
                            {taskForm.errors.due_date && (
                                <p className="text-xs text-red-600 mt-1">{taskForm.errors.due_date}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Assignee</label>
                            <select
                                className={selectClasses}
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
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Link to Matter (optional)</label>
                        <select
                            className={selectClasses}
                            value={taskForm.data.matter_id}
                            onChange={(e) => taskForm.setData('matter_id', e.target.value)}
                        >
                            <option value="">No matter link</option>
                            {matters.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.file_number} — {m.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmLabel="Delete Task"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}