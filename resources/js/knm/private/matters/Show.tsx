/* eslint-disable import/order */
/* eslint-disable curly */
/* eslint-disable @stylistic/padding-line-between-statements */
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';
import UpcomingEventsWidget from './UpcomingEventsWidget';

interface NamedId {
    id: number;
    name: string;
}

interface TeamMember {
    id: number;
    name: string;
    pivot: {
        matter_role_id: number;
        assigned_at: string;
    };
    matter_role?: {
        id: number;
        name: string;
        code: string;
    };
}

interface Contact {
    id: number;
    name: string;
    type: string;
    company_name: string | null;
    email: string | null;
    pivot: {
        role: string;
    };
}

interface StatusHistory {
    id: number;
    stage_from: string | null;
    stage_to: string;
    notes: string | null;
    created_at: string;
    changed_by?: NamedId;
}

interface MatterRole {
    id: number;
    name: string;
    code: string;
}

interface MatterItem {
    id: number;
    file_number: string;
    title: string;
    description: string | null;
    stage: string;
    status: string;
    opened_at: string | null;
    closed_at: string | null;
    archived_at: string | null;
    created_at: string;
    client: NamedId | null;
    practice_area: NamedId | null;
    lead_advocate: NamedId | null;
    team: TeamMember[];
    contacts: Contact[];
    status_history: StatusHistory[];
}

interface Props {
    matter: MatterItem;
    practiceAreas: NamedId[];
    advocates: NamedId[];
    matterRoles: MatterRole[];
    allContacts: Contact[];
    upcomingEvents: Array<{
        id: number;
        title: string;
        starts_at: string;
        ends_at: string | null;
        is_all_day: boolean;
        location: string | null;
        color: string;
        is_deadline: boolean;
        attendees: Array<{ id: number; name: string }>;
        notify_client: boolean;
    }>;
}

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

const statusColor: Record<string, BadgeColor> = {
    open: 'success',
    closed: 'neutral',
    archived: 'neutral',
};

const stageColor: Record<string, BadgeColor> = {
    instruction: 'info',
    engagement: 'info',
    active_work: 'success',
    closure: 'warning',
    archive: 'neutral',
};

const stageOrder = ['instruction', 'engagement', 'active_work', 'closure', 'archive'];

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Show({ matter, practiceAreas, advocates, matterRoles, allContacts, upcomingEvents }: Props) {
    const { can } = useAuth();
    const advanceForm = useForm({ notes: '' });
    const moveForm = useForm({ stage: '', notes: '' });

    const handleAdvance = () => {
        advanceForm.post(`/private/matters/${matter.id}/advance`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Matter advanced'),
            onError: (errors) => toast.error('Could not advance', { description: Object.values(errors).flat().join(' ') }),
        });
    };

        // --- Team Management ---
    const [addTeamOpen, setAddTeamOpen] = useState(false);
    const [deleteTeamTarget, setDeleteTeamTarget] = useState<{ userId: number; roleId: number; name: string } | null>(null);

    const addTeamForm = useForm({ user_id: '', matter_role_id: '' });
    const removeTeamForm = useForm({});

    const getRoleName = (roleId: number) => matterRoles.find((r) => r.id === roleId)?.name ?? 'Unknown Role';

    const handleAddTeam = () => {
        addTeamForm.post(`/private/matters/${matter.id}/team`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Team member added');
                setAddTeamOpen(false);
                addTeamForm.reset();
            },
            onError: (errors) => toast.error('Could not add member', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleRemoveTeam = () => {
        if (!deleteTeamTarget) return;
        removeTeamForm.delete(`/private/matters/${matter.id}/team/${deleteTeamTarget.userId}/${deleteTeamTarget.roleId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Team member removed');
                setDeleteTeamTarget(null);
            },
        });
    };

        // --- Contact Management ---
    const [addContactOpen, setAddContactOpen] = useState(false);
    const [removeContactTarget, setRemoveContactTarget] = useState<Contact | null>(null);

    const addContactForm = useForm({ contact_id: '', role: '' });
    const removeContactForm = useForm({});

    const handleAddContact = () => {
        addContactForm.post(`/private/matters/${matter.id}/contacts`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Contact linked');
                setAddContactOpen(false);
                addContactForm.reset();
            },
            onError: (errors) => toast.error('Could not link contact', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleRemoveContact = () => {
        if (!removeContactTarget) return;
        removeContactForm.delete(`/private/matters/${matter.id}/contacts/${removeContactTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Contact removed');
                setRemoveContactTarget(null);
            },
        });
    };

        // --- Detail Editing ---
    const [editDetailsOpen, setEditDetailsOpen] = useState(false);
    const editDetailsForm = useForm({
        title: matter.title,
        description: matter.description ?? '',
        lead_advocate_id: matter.lead_advocate?.id ?? '',
    });

    const handleEditDetails = (e: React.FormEvent) => {
        e.preventDefault();
        editDetailsForm.put(`/private/matters/${matter.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Matter details updated');
                setEditDetailsOpen(false);
            },
            onError: (errors) => toast.error('Could not update details', { description: Object.values(errors).flat().join(' ') }),
        });
    };

        // --- Archive Management ---
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const archiveForm = useForm({});

    const handleArchive = () => {
        archiveForm.post(`/private/matters/${matter.id}/archive`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Matter archived');
                setArchiveModalOpen(false);
            },
        });
    };

    const handleUnarchive = () => {
        archiveForm.post(`/private/matters/${matter.id}/unarchive`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Matter reopened');
                setArchiveModalOpen(false);
            },
        });
    };


    const handleMoveTo = () => {
        if (!moveForm.data.stage) return;
        moveForm.post(`/private/matters/${matter.id}/move-to`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Matter moved');
                moveForm.reset();
            },
            onError: (errors) => toast.error('Could not move', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const currentStageIndex = stageOrder.indexOf(matter.stage);
    const isArchived = matter.status === 'archived';

    return (
        <>
            <Head title={`Matter: ${matter.file_number}`} />

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/private/matters"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#891920] hover:border-[#D4AF37]/60 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">{matter.title}</h1>
                        <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold">{matter.file_number}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            {matter.client?.name ?? 'No client'}
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <Badge color={statusColor[matter.status] ?? 'neutral'} dot>
                                {matter.status}
                            </Badge>
                            <Badge color={stageColor[matter.stage] ?? 'neutral'}>
                                {matter.stage.replace('_', ' ')}
                            </Badge>
                        </p>
                    </div>
                </div>
                {matter.lead_advocate && (
                    <Badge color="neutral">
                        Lead: {matter.lead_advocate.name}
                    </Badge>
                )}
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Details + Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Matter Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="text-lg font-serif font-bold text-slate-900">Matter Details</h2>
                                    {can('matters.update') && (
                                        <Button variant="secondary" size="sm" onClick={() => setEditDetailsOpen(true)}>
                                            Edit Details
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardBody>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Practice Area</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{matter.practice_area?.name ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Opened</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{formatDate(matter.opened_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Closed</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{formatDate(matter.closed_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Archived</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{formatDate(matter.archived_at)}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</dt>
                                        <dd className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[80px]">
                                            {matter.description ?? <span className="text-slate-400 italic">No description provided.</span>}
                                        </dd>
                                    </div>
                                </dl>
                            </CardBody>
                        </Card>

                        {/* Stage Progression */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-serif font-bold text-slate-900">Stage Progression</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="flex items-center gap-2 mb-6">
                                    {stageOrder.map((stage, idx) => {
                                        const isCurrent = stage === matter.stage;
                                        const isPast = idx < currentStageIndex;
                                        const isActive = isPast || isCurrent;

                                        return (
                                            <div key={stage} className="flex items-center flex-1">
                                                <div className={`flex-1 h-1 rounded ${isActive ? 'bg-[#891920]' : 'bg-slate-200'}`} />
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                                                        isCurrent
                                                            ? 'bg-[#891920] text-white ring-4 ring-[#891920]/20'
                                                            : isActive
                                                            ? 'bg-[#891920] text-white'
                                                            : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                    title={stage.replace('_', ' ')}
                                                >
                                                    {idx + 1}
                                                </div>
                                                {idx < stageOrder.length - 1 && (
                                                    <div className={`flex-1 h-1 rounded ${isActive ? 'bg-[#891920]' : 'bg-slate-200'}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="grid grid-cols-5 gap-2 text-center">
                                    {stageOrder.map((stage) => (
                                        <span key={stage} className="text-[10px] text-slate-500 uppercase tracking-wider">
                                            {stage.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Upcoming Events & Deadlines */}
                        <UpcomingEventsWidget
                            events={upcomingEvents}
                            matterId={matter.id}
                            matterTitle={matter.title}
                        />

                        {/* Team */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="text-lg font-serif font-bold text-slate-900">Team ({matter.team.length})</h2>
                                    {can('matters.assign_team') && (
                                        <Button variant="secondary" size="sm" onClick={() => setAddTeamOpen(true)}>
                                            + Add Member
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardBody>
                                {matter.team.length > 0 ? (
                                    <div className="space-y-3">
                                        {matter.team.map((member) => (
                                            <div key={`${member.id}-${member.pivot.matter_role_id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white group hover:border-slate-300 transition-colors">
                                                <div>
                                                    <div className="font-semibold text-slate-900">{member.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        <span className="font-medium text-[#891920]">{getRoleName(member.pivot.matter_role_id)}</span>
                                                        <span className="mx-1.5">·</span>
                                                        Assigned {formatDate(member.pivot.assigned_at)}
                                                    </div>
                                                </div>
                                                {can('matters.assign_team') && (
                                                    <button
                                                        onClick={() => setDeleteTeamTarget({ userId: member.id, roleId: member.pivot.matter_role_id, name: member.name })}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Remove from team"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        <p className="text-sm">No team members assigned yet.</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                                                {/* Contacts */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="text-lg font-serif font-bold text-slate-900">Contacts ({matter.contacts.length})</h2>
                                    {can('matters.update') && (
                                        <Button variant="secondary" size="sm" onClick={() => setAddContactOpen(true)}>
                                            + Link Contact
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardBody>
                                {matter.contacts.length > 0 ? (
                                    <div className="space-y-3">
                                        {matter.contacts.map((contact) => (
                                            <div key={`${contact.id}-${contact.pivot.role}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white group hover:border-slate-300 transition-colors">
                                                <div>
                                                    <div className="font-semibold text-slate-900">{contact.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        <span className="font-medium text-[#891920]">{contact.pivot.role}</span>
                                                        {contact.company_name && (
                                                            <>
                                                                <span className="mx-1.5">·</span>
                                                                <span>{contact.company_name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {can('matters.update') && (
                                                    <button
                                                        onClick={() => setRemoveContactTarget(contact)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Remove from matter"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        <p className="text-sm">No contacts linked to this matter yet.</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                        {/* Status History */}
                        {matter.status_history.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-serif font-bold text-slate-900">Stage History</h2>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-3">
                                        {matter.status_history.map((entry) => (
                                            <div key={entry.id} className="flex gap-3 text-sm">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-[#891920] mt-1.5" />
                                                    <div className="w-0.5 flex-1 bg-slate-200" />
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="font-medium text-slate-900">
                                                        {entry.stage_from ? (
                                                            <>
                                                                {entry.stage_from.replace('_', ' ')} → {entry.stage_to.replace('_', ' ')}
                                                            </>
                                                        ) : (
                                                            <>Created at {entry.stage_to.replace('_', ' ')}</>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {entry.changed_by?.name ?? 'System'} · {formatDate(entry.created_at)}
                                                    </div>
                                                    {entry.notes && (
                                                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                            {entry.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Advance Stage */}
                        {!isArchived && (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-bold text-slate-900">Advance Stage</h3>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Move this matter to the next lifecycle stage.
                                    </p>
                                    <textarea
                                        rows={2}
                                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-3 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                                        placeholder="Optional notes..."
                                        value={advanceForm.data.notes}
                                        onChange={(e) => advanceForm.setData('notes', e.target.value)}
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="w-full"
                                        onClick={handleAdvance}
                                        isLoading={advanceForm.processing}
                                    >
                                        Advance to Next Stage
                                    </Button>
                                </CardBody>
                            </Card>
                        )}

                        {/* Move to Specific Stage */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-sm font-bold text-slate-900">Move to Stage</h3>
                            </CardHeader>
                            <CardBody>
                                <p className="text-xs text-slate-500 mb-4">
                                    Jump to a specific stage (for corrections or reopening).
                                </p>
                                <select
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-3 focus:border-[#891920] focus:outline-none"
                                    value={moveForm.data.stage}
                                    onChange={(e) => moveForm.setData('stage', e.target.value)}
                                >
                                    <option value="">Select stage...</option>
                                    {stageOrder.map((stage) => (
                                        <option key={stage} value={stage}>
                                            {stage.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    rows={2}
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm mb-3 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                                    placeholder="Reason for move..."
                                    value={moveForm.data.notes}
                                    onChange={(e) => moveForm.setData('notes', e.target.value)}
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleMoveTo}
                                    isLoading={moveForm.processing}
                                    disabled={!moveForm.data.stage}
                                >
                                    Move to Stage
                                </Button>
                            </CardBody>
                        </Card>

                        {/* Archive / Reopen */}
                        {can('matters.archive') && (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {isArchived ? 'Reopen Matter' : 'Archive Matter'}
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-xs text-slate-500 mb-4">
                                        {isArchived
                                            ? 'Restore this matter to an active state. It will reappear in open matter lists.'
                                            : 'Remove this matter from active workflows. It will be hidden from open lists but fully preserved.'}
                                    </p>
                                    <Button
                                        variant={isArchived ? 'secondary' : 'danger'}
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setArchiveModalOpen(true)}
                                    >
                                        {isArchived ? 'Reopen Matter' : 'Archive Matter'}
                                    </Button>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </motion.div>
                        {/* Add Team Member Modal */}
            <Modal
                isOpen={addTeamOpen}
                onClose={() => setAddTeamOpen(false)}
                title="Add Team Member"
                subtitle={`Assign a staff member to ${matter.title}`}
                size="sm"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setAddTeamOpen(false)}>Cancel</Button>
                        <Button type="button" variant="primary" isLoading={addTeamForm.processing} onClick={handleAddTeam}>
                            Assign to Team
                        </Button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Staff Member</label>
                        <select
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                            value={addTeamForm.data.user_id}
                            onChange={(e) => addTeamForm.setData('user_id', e.target.value)}
                        >
                            <option value="">Select staff member...</option>
                            {advocates.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        {addTeamForm.errors.user_id && <p className="text-xs text-red-600 mt-1">{addTeamForm.errors.user_id}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Role on this Matter</label>
                        <select
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                            value={addTeamForm.data.matter_role_id}
                            onChange={(e) => addTeamForm.setData('matter_role_id', e.target.value)}
                        >
                            <option value="">Select role...</option>
                            {matterRoles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        {addTeamForm.errors.matter_role_id && <p className="text-xs text-red-600 mt-1">{addTeamForm.errors.matter_role_id}</p>}
                    </div>
                </div>
            </Modal>

            {/* Remove Team Member Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTeamTarget}
                onClose={() => setDeleteTeamTarget(null)}
                onConfirm={handleRemoveTeam}
                title="Remove Team Member"
                message={`Are you sure you want to remove ${deleteTeamTarget?.name} from the "${deleteTeamTarget ? getRoleName(deleteTeamTarget.roleId) : ''}" role on this matter?`}
                confirmLabel="Remove"
                variant="danger"
                isLoading={removeTeamForm.processing}
            />

            {/* Link Contact Modal */}
            <Modal
                isOpen={addContactOpen}
                onClose={() => setAddContactOpen(false)}
                title="Link Contact"
                subtitle={`Attach a contact to ${matter.title}`}
                size="sm"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setAddContactOpen(false)}>Cancel</Button>
                        <Button type="button" variant="primary" isLoading={addContactForm.processing} onClick={handleAddContact}>
                            Link Contact
                        </Button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Select Contact</label>
                        <select
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                            value={addContactForm.data.contact_id}
                            onChange={(e) => addContactForm.setData('contact_id', e.target.value)}
                        >
                            <option value="">Select contact...</option>
                            {allContacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}{c.company_name ? ` (${c.company_name})` : ''}
                                </option>
                            ))}
                        </select>
                        {addContactForm.errors.contact_id && <p className="text-xs text-red-600 mt-1">{addContactForm.errors.contact_id}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Role on this Matter</label>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                            value={addContactForm.data.role}
                            onChange={(e) => addContactForm.setData('role', e.target.value)}
                            placeholder="e.g. Opposing Counsel, Expert Witness, Co-Defendant"
                        />
                        {addContactForm.errors.role && <p className="text-xs text-red-600 mt-1">{addContactForm.errors.role}</p>}
                    </div>
                </div>
            </Modal>

            {/* Remove Contact Confirmation */}
            <ConfirmModal
                isOpen={!!removeContactTarget}
                onClose={() => setRemoveContactTarget(null)}
                onConfirm={handleRemoveContact}
                title="Remove Contact"
                message={`Are you sure you want to remove ${removeContactTarget?.name} from this matter? This will detach them from all roles they hold on it.`}
                confirmLabel="Remove"
                variant="danger"
                isLoading={removeContactForm.processing}
            />

                        {/* Archive Confirmation */}
            <ConfirmModal
                isOpen={archiveModalOpen}
                onClose={() => setArchiveModalOpen(false)}
                onConfirm={isArchived ? handleUnarchive : handleArchive}
                title={isArchived ? 'Reopen Matter' : 'Archive Matter'}
                message={
                    isArchived
                        ? `Are you sure you want to reopen "${matter.title}"? It will be restored to an active state and reappear in open matter lists.`
                        : `Are you sure you want to archive "${matter.title}"? It will be hidden from open matter lists but fully preserved. You can reopen it at any time.`
                }
                confirmLabel={isArchived ? 'Reopen' : 'Archive'}
                variant={isArchived ? 'warning' : 'danger'}
                isLoading={archiveForm.processing}
            />


            {/* Edit Matter Details Modal */}
            <Modal
                isOpen={editDetailsOpen}
                onClose={() => setEditDetailsOpen(false)}
                title="Edit Matter Details"
                subtitle={`Updating core details for ${matter.file_number}`}
                size="md"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setEditDetailsOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={editDetailsForm.processing} onClick={handleEditDetails as any}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                <form id="edit-details-form" onSubmit={handleEditDetails} className="space-y-5">
                    <FormField
                        label="Matter Title"
                        value={editDetailsForm.data.title}
                        onChange={(e) => editDetailsForm.setData('title', e.target.value)}
                        error={editDetailsForm.errors.title}
                        placeholder="e.g. Kamau v Equity Bank"
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Lead Advocate</label>
                        <select
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                            value={editDetailsForm.data.lead_advocate_id}
                            onChange={(e) => editDetailsForm.setData('lead_advocate_id', e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {advocates.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        {editDetailsForm.errors.lead_advocate_id && (
                            <p className="text-xs text-red-600 mt-1">{editDetailsForm.errors.lead_advocate_id}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            rows={4}
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20"
                            value={editDetailsForm.data.description}
                            onChange={(e) => editDetailsForm.setData('description', e.target.value)}
                            placeholder="Brief summary of the matter..."
                        />
                        {editDetailsForm.errors.description && (
                            <p className="text-xs text-red-600 mt-1">{editDetailsForm.errors.description}</p>
                        )}
                    </div>
                </form>
            </Modal>
        </>
    );
}
