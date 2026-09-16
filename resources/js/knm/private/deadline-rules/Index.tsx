import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface EventType {
    id: number;
    name: string;
    color: string;
    is_deadline: boolean;
}

interface Rule {
    id: number;
    calendar_event_type_id: number;
    trigger_type_name: string;
    title_template: string;
    offset_days: number;
    offset_label: string;
    is_all_day: boolean;
    follow_up_type_id: number | null;
    follow_up_type_name: string | null;
    is_active: boolean;
}

interface Props {
    rules: Rule[];
    eventTypes: EventType[];
}

const inputClasses = 'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

export default function Index({ rules, eventTypes }: Props) {
    const { can } = useAuth();
    const hasPermission = can('deadline.rules.manage');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null);

    const ruleForm = useForm({
        calendar_event_type_id: '',
        title_template: '',
        offset_days: -3,
        is_all_day: true,
        follow_up_type_id: '',
        is_active: true,
    });

    const deleteForm = useForm({});

    const openCreateModal = () => {
        setEditingRule(null);
        ruleForm.reset();
        ruleForm.clearErrors();
        ruleForm.setData({
            calendar_event_type_id: eventTypes[0]?.id?.toString() ?? '',
            title_template: 'Prepare bundle for {title}',
            offset_days: -3,
            is_all_day: true,
            follow_up_type_id: '',
            is_active: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (rule: Rule) => {
        setEditingRule(rule);
        ruleForm.clearErrors();
        ruleForm.setData({
            calendar_event_type_id: rule.calendar_event_type_id.toString(),
            title_template: rule.title_template,
            offset_days: rule.offset_days,
            is_all_day: rule.is_all_day,
            follow_up_type_id: rule.follow_up_type_id?.toString() ?? '',
            is_active: rule.is_active,
        });
        setModalOpen(true);
    };

    const submitRule = (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = editingRule !== null;
        const url = isEditing ? `/private/deadline-rules/${editingRule.id}` : '/private/deadline-rules';
        const method = isEditing ? 'put' : 'post';

        ruleForm.submit(method, url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Rule updated' : 'Rule created', {
                    description: `Deadline rule has been ${isEditing ? 'updated' : 'created'}.`,
                });
                setModalOpen(false);
            },
            onError: () => {
                toast.error('Could not save rule', {
                    description: 'Please check the form for errors.',
                });
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteForm.delete(`/private/deadline-rules/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Rule deleted', { description: 'The deadline rule has been removed.' });
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error('Could not delete rule');
                setDeleteTarget(null);
            },
        });
    };

    const getEventTypeColor = (id: number) => eventTypes.find(e => e.id === id)?.color ?? '#891920';

    return (
        <>
            <Head title="Deadline Rules · K&A Internal" />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Deadline Rules</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Automatically generate follow-up deadlines when specific events are scheduled.
                    </p>
                </div>
                {hasPermission && (
                    <Button variant="gold" onClick={openCreateModal}>
                        + Add Rule
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-serif font-bold text-slate-900">Active Rules ({rules.filter(r => r.is_active).length})</h2>
                    <p className="text-xs text-slate-500">{rules.length} total rules configured</p>
                </CardHeader>
                <CardBody className="p-0">
                    {rules.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {rules.map((rule, idx) => (
                                <motion.div
                                    key={rule.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div
                                            className="w-3 h-10 rounded-full shrink-0"
                                            style={{ backgroundColor: getEventTypeColor(rule.calendar_event_type_id) }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-900">
                                                    When a <span className="text-[#891920]">{rule.trigger_type_name}</span> is scheduled...
                                                </span>
                                                <Badge color={rule.is_active ? 'success' : 'neutral'} dot>
                                                    {rule.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">
                                                ...create a <span className="font-medium">{rule.is_all_day ? 'all-day' : 'timed'}</span> deadline:
                                                <span className="font-mono text-[#891920] font-medium mx-1">"{rule.title_template}"</span>
                                                <span className="font-medium">{rule.offset_label}</span>
                                                {rule.follow_up_type_name && (
                                                    <span className="text-slate-400 ml-1">(Type: {rule.follow_up_type_name})</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {hasPermission && (
                                        <div className="flex items-center gap-1 ml-4 shrink-0">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(rule)}>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteTarget(rule)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-serif font-bold text-slate-900">No deadline rules configured</h3>
                            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                                Create your first rule to automatically generate follow-up deadlines (e.g., "Prepare bundle" 3 days before a Court Hearing).
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingRule ? 'Edit Deadline Rule' : 'New Deadline Rule'}
                subtitle={editingRule ? `Updating rule for ${editingRule.trigger_type_name}` : 'Configure an automated follow-up deadline.'}
                size="md"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={ruleForm.processing} onClick={submitRule as any}>
                            {editingRule ? 'Save Changes' : 'Create Rule'}
                        </Button>
                    </>
                }
            >
                <form id="rule-form" onSubmit={submitRule} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Trigger Event Type</label>
                        <select
                            className={inputClasses}
                            value={ruleForm.data.calendar_event_type_id}
                            onChange={(e) => ruleForm.setData('calendar_event_type_id', e.target.value)}
                        >
                            <option value="">Select trigger type...</option>
                            {eventTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        {ruleForm.errors.calendar_event_type_id && (
                            <p className="text-xs text-red-600 mt-1">{ruleForm.errors.calendar_event_type_id}</p>
                        )}
                    </div>

                    <FormField
                        label="Deadline Title Template"
                        value={ruleForm.data.title_template}
                        onChange={(e) => ruleForm.setData('title_template', e.target.value)}
                        error={ruleForm.errors.title_template}
                        placeholder="e.g. Prepare bundle for {title}"
                    />
                    <p className="text-xs text-slate-500 -mt-3">
                        Use <code className="px-1 py-0.5 rounded bg-slate-100 text-[#891920] font-mono text-[10px]">{'{title}'}</code> to insert the original event's title.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Offset (Days)</label>
                            <input
                                type="number"
                                className={inputClasses}
                                value={ruleForm.data.offset_days}
                                onChange={(e) => ruleForm.setData('offset_days', parseInt(e.target.value) || 0)}
                                min={-365}
                                max={365}
                            />
                            <p className="text-xs text-slate-500">
                                Negative = before (e.g. -3). Positive = after.
                            </p>
                            {ruleForm.errors.offset_days && (
                                <p className="text-xs text-red-600 mt-1">{ruleForm.errors.offset_days}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Follow-up Type (Optional)</label>
                            <select
                                className={inputClasses}
                                value={ruleForm.data.follow_up_type_id}
                                onChange={(e) => ruleForm.setData('follow_up_type_id', e.target.value)}
                            >
                                <option value="">Same as trigger type</option>
                                {eventTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                            <div>
                                <span className="block text-sm font-medium text-slate-900">All-day deadline</span>
                                <span className="block text-xs text-slate-500">No specific time, just a date.</span>
                            </div>
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-[#891920] focus:ring-[#891920]"
                                checked={ruleForm.data.is_all_day}
                                onChange={(e) => ruleForm.setData('is_all_day', e.target.checked)}
                            />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                            <div>
                                <span className="block text-sm font-medium text-slate-900">Rule Active</span>
                                <span className="block text-xs text-slate-500">Enable or pause this rule.</span>
                            </div>
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-[#891920] focus:ring-[#891920]"
                                checked={ruleForm.data.is_active}
                                onChange={(e) => ruleForm.setData('is_active', e.target.checked)}
                            />
                        </label>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Deadline Rule"
                message={`Are you sure you want to delete this rule? Future events of this type will no longer auto-generate this deadline.`}
                confirmLabel="Delete Rule"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
