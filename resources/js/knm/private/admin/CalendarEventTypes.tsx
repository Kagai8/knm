/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable import/order */
/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { useState, type FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface CalendarEventType {
    id: number;
    name: string;
    code: string;
    color: string;
    is_deadline: boolean;
    is_active: boolean;
    events_count: number;
}

interface Props {
    types: CalendarEventType[];
}

const colorPalette = [
    { hex: '#891920', name: 'Firm Red' },
    { hex: '#1E3A8A', name: 'Navy Blue' },
    { hex: '#047857', name: 'Emerald' },
    { hex: '#D97706', name: 'Amber' },
    { hex: '#BE123C', name: 'Rose' },
    { hex: '#4338CA', name: 'Indigo' },
    { hex: '#0F766E', name: 'Teal' },
    { hex: '#EA580C', name: 'Orange' },
    { hex: '#7E22CE', name: 'Purple' },
    { hex: '#475569', name: 'Slate' },
];

export default function CalendarEventTypes({ types }: Props) {
    const { can } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<CalendarEventType | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CalendarEventType | null>(null);

    const form = useForm({
        name: '',
        color: '#891920',
        is_deadline: false,
        is_active: true,
    });

    const deleteForm = useForm({});

    const openCreateModal = () => {
        setEditingType(null);
        form.reset();
        form.clearErrors();
        form.setData('name', '');
        form.setData('color', '#891920');
        form.setData('is_deadline', false);
        form.setData('is_active', true);
        setModalOpen(true);
    };

    const openEditModal = (type: CalendarEventType) => {
        setEditingType(type);
        form.clearErrors();
        form.setData({
            name: type.name,
            color: type.color,
            is_deadline: type.is_deadline,
            is_active: type.is_active,
        });
        setModalOpen(true);
    };

    const openDeleteModal = (type: CalendarEventType) => {
        setDeleteTarget(type);
        setDeleteModalOpen(true);
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();
        const isEditing = editingType !== null;
        const url = isEditing ? `/private/admin/calendar-event-types/${editingType.id}` : '/private/admin/calendar-event-types';
        const method = isEditing ? 'put' : 'post';

        form.submit(method, url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Event type updated' : 'Event type created', {
                    description: `${form.data.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
                });
                setModalOpen(false);
                if (!isEditing) form.reset();
            },
            onError: (errors) => {
                toast.error(isEditing ? 'Could not update type' : 'Could not create type', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        deleteForm.delete(`/private/admin/calendar-event-types/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event type deleted', { description: `${deleteTarget.name} has been permanently removed.` });
                setDeleteModalOpen(false);
                setDeleteTarget(null);
            },
            onError: (errors) => {
                toast.error('Could not delete type', { description: Object.values(errors).flat().join(' ') });
                setDeleteModalOpen(false);
            },
        });
    };

    const selectedColorName = colorPalette.find(c => c.hex === form.data.color)?.name ?? 'Custom Color';

    return (
        <>
            <Head title="Calendar Event Types · Admin · K&A Internal" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Calendar Event Types</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Configure the kinds of events that appear on the firm calendar — court dates, deadlines, meetings, and more.
                    </p>
                </div>
                {can('calendar.event_types.manage') && (
                    <Button variant="gold" onClick={openCreateModal}>
                        + New Event Type
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-serif font-bold text-slate-900">Configured Types</h2>
                    <p className="text-xs text-slate-500">{types.length} type{types.length === 1 ? '' : 's'} configured.</p>
                </CardHeader>
                <CardBody className="p-0">
                    {types.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {types.map((type, idx) => (
                                <motion.div
                                    key={type.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Color swatch */}
                                        <div
                                            className="w-8 h-8 rounded-lg border border-slate-200 shadow-inner shrink-0"
                                            style={{ backgroundColor: type.color }}
                                        />
                                        <div>
                                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                {type.name}
                                                {type.is_deadline && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                                        Deadline
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-mono text-xs text-slate-400 mt-0.5">{type.code}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge color={type.is_active ? 'success' : 'neutral'} dot>
                                            {type.is_active ? 'Active' : 'Inactive'}
                                        </Badge>

                                        {type.events_count > 0 && (
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                                {type.events_count} event{type.events_count === 1 ? '' : 's'}
                                            </span>
                                        )}

                                        {can('calendar.event_types.manage') && (
                                            <div className="flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(type)}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => openDeleteModal(type)}
                                                    disabled={type.events_count > 0}
                                                    title={type.events_count > 0 ? "Cannot delete: type is in use" : "Delete type"}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <h3 className="text-lg font-serif font-bold text-slate-900">No event types yet</h3>
                            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                                Create your first event type to start scheduling on the calendar.
                            </p>
                            {can('calendar.event_types.manage') && (
                                <div className="mt-6">
                                    <Button variant="primary" onClick={openCreateModal}>
                                        + Create First Type
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingType ? 'Edit Event Type' : 'New Event Type'}
                subtitle={editingType ? `Updating ${editingType.name}` : 'Define a new kind of calendar event.'}
                size="sm"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={form.processing} onClick={submitForm as any}>
                            {editingType ? 'Save Changes' : 'Create Type'}
                        </Button>
                    </>
                }
            >
                <form id="event-type-form" onSubmit={submitForm} className="space-y-6">
                    <FormField
                        label="Type Name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                        placeholder="e.g. Court Hearing, Client Meeting, Filing Deadline"
                        hint="The machine code (e.g., court_hearing) will be generated automatically."
                    />

                    {/* Visual Color Palette */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Display Color</label>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-xl border-2 border-slate-200 shadow-inner shrink-0 transition-colors duration-200"
                                style={{ backgroundColor: form.data.color }}
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-sm text-slate-900">
                                    {selectedColorName}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Events of this type will appear in this color on the calendar.
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {colorPalette.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => form.setData('color', color.hex)}
                                    className={`group relative aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                                        form.data.color === color.hex
                                            ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-900 scale-110'
                                            : 'border-slate-200 hover:border-slate-400'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                >
                                    {form.data.color === color.hex && (
                                        <svg className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                        {form.errors.color && <p className="text-xs text-red-600 mt-1">{form.errors.color}</p>}
                    </div>

                    {/* Deadline toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                        <div>
                            <label className="block text-sm font-medium text-slate-900">Is this a deadline?</label>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Deadlines trigger stronger notifications and cannot be silently moved.
                            </p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={form.data.is_deadline}
                                onChange={(e) => form.setData('is_deadline', e.target.checked)}
                            />
                            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div>
                            <label className="block text-sm font-medium text-slate-900">Active Status</label>
                            <p className="text-xs text-slate-500 mt-0.5">Inactive types won't appear when creating new events.</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                            />
                            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#891920]/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#891920]"></div>
                        </label>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDelete}
                title="Delete Event Type"
                message={`This will permanently delete the "${deleteTarget?.name}" event type. This action cannot be undone.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
