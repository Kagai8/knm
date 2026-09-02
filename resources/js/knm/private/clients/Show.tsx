/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { useState, type FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface StatusOption {
    value: string;
    label: string;
}

interface PracticeArea {
    id: number;
    name: string;
}

interface LeadAdvocate {
    id: number;
    name: string;
}

interface MatterItem {
    id: number;
    file_number: string;
    title: string;
    stage: string;
    status: string;
    practice_area: PracticeArea | null;
    lead_advocate: LeadAdvocate | null;
    opened_at: string | null;
}

interface EnquiryItem {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    practice_area: { id: number; name: string } | null;
    created_at: string;
}


interface StatusChange {
    id: number;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    changed_by: { id: number; name: string } | null;
    created_at: string;
}

interface ClientItem {
    id: number;
    type: string;
    name: string;
    email: string | null;
    phone: string | null;
    id_number: string | null;
    company_name: string | null;
    company_registration: string | null;
    tax_pin: string | null;
    vat_number: string | null;
    address: string | null;
    website: string | null;
    industry: string | null;
    notes: string | null;
    status: string;
    created_at: string;
    created_by: { id: number; name: string } | null;
    matters: MatterItem[];
    status_changes: StatusChange[];
}

interface Props {
    client: ClientItem;
    enquiries: EnquiryItem[];
    statuses: StatusOption[];
}

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

const statusColor: Record<string, BadgeColor> = {
    prospect: 'info',
    active: 'success',
    dormant: 'warning',
    archived: 'neutral',
};

const stageColor: Record<string, BadgeColor> = {
    instruction: 'info',
    engagement: 'info',
    active_work: 'success',
    closure: 'warning',
    archive: 'neutral',
};

const matterStatusColor: Record<string, BadgeColor> = {
    open: 'success',
    closed: 'neutral',
    archived: 'neutral',
};

const enquiryStatusColor: Record<string, BadgeColor> = {
    new: 'info',
    triage: 'warning',
    approved: 'success',
    rejected: 'danger',
    converted: 'gold',
};

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const textareaClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Show({ client, enquiries, statuses }: Props) {
    const { can } = useAuth();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Edit Form
    const editForm = useForm({
        type: client.type,
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        id_number: client.id_number ?? '',
        company_name: client.company_name ?? '',
        company_registration: client.company_registration ?? '',
        tax_pin: client.tax_pin ?? '',
        vat_number: client.vat_number ?? '',
        address: client.address ?? '',
        website: client.website ?? '',
        industry: client.industry ?? '',
        notes: client.notes ?? '',
    });

    // Status Change Form
    const statusForm = useForm({
        status: client.status,
        reason: '',
    });

    // Delete Form
    const deleteForm = useForm({});

    const displayName = client.type === 'company' && client.company_name ? client.company_name : client.name;
    const statusLabel = (value: string) => statuses.find((s) => s.value === value)?.label ?? value;

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        editForm.put(`/private/clients/${client.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated', { description: `${displayName}'s details have been saved.` });
                setEditModalOpen(false);
            },
            onError: (errors) => {
                toast.error('Could not update profile', { description: Object.values(errors).flat().join(' ') });
            },
        });
    };

    const submitStatusChange = (e: FormEvent) => {
        e.preventDefault();
        statusForm.patch(`/private/clients/${client.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status changed', {
                    description: `${displayName} is now "${statusLabel(statusForm.data.status)}".`,
                });
                setStatusModalOpen(false);
                statusForm.setData('reason', '');
            },
            onError: (errors) => {
                toast.error('Could not change status', { description: Object.values(errors).flat().join(' ') });
            },
        });
    };

    const handleDelete = () => {
        deleteForm.delete(`/private/clients/${client.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Client deleted', { description: `${displayName} has been permanently removed.` });
            },
            onError: (errors) => {
                toast.error('Could not delete client', { description: Object.values(errors).flat().join(' ') });
                setDeleteModalOpen(false);
            },
        });
    };

    return (
        <>
            <Head title={`${displayName} · Clients · K&A Internal`} />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Link
                        href="/private/clients"
                        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-serif font-bold text-slate-900">{displayName}</h1>
                            <Badge color={statusColor[client.status] ?? 'neutral'} dot>
                                {statusLabel(client.status)}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            {client.type === 'company' ? `Company · Contact: ${client.name}` : 'Individual'} · Added {formatDate(client.created_at)} by {client.created_by?.name ?? 'System'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                {can('clients.update') && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(true)}>
                            Edit Profile
                        </Button>
                        <Button
                            variant="gold"
                            size="sm"
                            onClick={() => {
                                statusForm.setData('status', client.status);
                                statusForm.setData('reason', '');
                                setStatusModalOpen(true);
                            }}
                        >
                            Change Status
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteModalOpen(true)}
                            disabled={client.matters.length > 0}
                        >
                            Delete
                        </Button>
                        {client.matters.length > 0 && (
                            <span className="text-xs text-slate-400">Cannot delete — has {client.matters.length} matter(s)</span>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile + Matters */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Details */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Profile Details</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</dt>
                                    <dd className="mt-1 text-sm text-slate-900 capitalize">{client.type}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{client.email ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{client.phone ?? '—'}</dd>
                                </div>
                                {client.type === 'individual' ? (
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">ID / Passport</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{client.id_number ?? '—'}</dd>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration No.</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{client.company_registration ?? '—'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Tax PIN</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{client.tax_pin ?? '—'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">VAT Number</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{client.vat_number ?? '—'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Website</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{client.website ?? '—'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Industry</dt>
                                            <dd className="mt-1 text-sm text-slate-900">{client.industry ?? '—'}</dd>
                                        </div>
                                    </>
                                )}
                                <div className="sm:col-span-2">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Address</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{client.address ?? '—'}</dd>
                                </div>
                            </div>
                            {client.notes && (
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Internal Notes</dt>
                                    <dd className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 border border-slate-100">{client.notes}</dd>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                                        {/* Enquiries */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">
                                Enquiries ({enquiries.length})
                            </h2>
                        </CardHeader>
                        <CardBody>
                            {enquiries.length > 0 ? (
                                <div className="space-y-3">
                                    {enquiries.map((enquiry) => (
                                        <div
                                            key={enquiry.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge color={enquiryStatusColor[enquiry.status] ?? 'neutral'}>
                                                        {enquiry.status.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">{formatDate(enquiry.created_at)}</span>
                                                </div>
                                                <div className="mt-1 font-semibold text-slate-900">{enquiry.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {enquiry.email ?? '—'} · {enquiry.practice_area?.name ?? 'No practice area'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-8">No enquiries found for this client.</p>
                            )}
                        </CardBody>
                    </Card>


                    {/* Matters */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">
                                Matters ({client.matters.length})
                            </h2>
                        </CardHeader>
                        <CardBody>
                            {client.matters.length > 0 ? (
                                <div className="space-y-3">
                                    {client.matters.map((matter) => (
                                        <Link
                                            key={matter.id}
                                            href={`/private/matters/${matter.id}`}
                                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-[#D4AF37]/50 hover:shadow-sm transition-all"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-semibold text-slate-500">{matter.file_number}</span>
                                                    <Badge color={stageColor[matter.stage] ?? 'neutral'}>
                                                        {matter.stage.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge color={matterStatusColor[matter.status] ?? 'neutral'}>
                                                        {matter.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 font-semibold text-slate-900">{matter.title}</div>
                                                <div className="text-xs text-slate-500">
                                                    {matter.practice_area?.name ?? '—'} · Lead: {matter.lead_advocate?.name ?? 'Unassigned'}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400">{formatDate(matter.opened_at)}</div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-8">No matters opened for this client yet.</p>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Status History */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Status History</h2>
                        </CardHeader>
                        <CardBody>
                            {client.status_changes.length > 0 ? (
                                <div className="space-y-0">
                                    {client.status_changes.map((change, idx) => (
                                        <motion.div
                                            key={change.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative pl-6 pb-6 last:pb-0"
                                        >
                                            {/* Timeline line */}
                                            {idx < client.status_changes.length - 1 && (
                                                <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200" />
                                            )}
                                            {/* Timeline dot */}
                                            <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[#891920] bg-white" />

                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {change.from_status && (
                                                        <>
                                                            <Badge color={statusColor[change.from_status] ?? 'neutral'}>
                                                                {statusLabel(change.from_status)}
                                                            </Badge>
                                                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                                                            </svg>
                                                        </>
                                                    )}
                                                    <Badge color={statusColor[change.to_status] ?? 'neutral'} dot>
                                                        {statusLabel(change.to_status)}
                                                    </Badge>
                                                </div>
                                                {change.reason && (
                                                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                                        "{change.reason}"
                                                    </p>
                                                )}
                                                <p className="mt-2 text-[11px] text-slate-400">
                                                    {change.changed_by?.name ?? 'System'} · {formatDateTime(change.created_at)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-8">No status changes recorded yet.</p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Financial Snapshot Placeholder */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-serif font-bold text-slate-900">Financial Summary</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="flex items-center justify-center py-8 text-slate-400">
                                <div className="text-center">
                                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm">Billing module coming soon</p>
                                    <p className="text-xs text-slate-300 mt-1">Invoices, payments & balances will appear here.</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Profile"
                subtitle={`Updating details for ${displayName}`}
                size="lg"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={editForm.processing} onClick={submitEdit as any}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                <form id="edit-form" onSubmit={submitEdit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label={client.type === 'company' ? 'Contact Person' : 'Full Name'} value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} error={editForm.errors.name} />
                        <FormField label="Email" type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} error={editForm.errors.email} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Phone" value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)} error={editForm.errors.phone} />
                        {client.type === 'individual' ? (
                            <FormField label="ID / Passport" value={editForm.data.id_number} onChange={(e) => editForm.setData('id_number', e.target.value)} error={editForm.errors.id_number} />
                        ) : (
                            <FormField label="Registration No." value={editForm.data.company_registration} onChange={(e) => editForm.setData('company_registration', e.target.value)} error={editForm.errors.company_registration} />
                        )}
                    </div>
                    {client.type === 'company' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Company Name" value={editForm.data.company_name} onChange={(e) => editForm.setData('company_name', e.target.value)} error={editForm.errors.company_name} />
                            <FormField label="Tax PIN" value={editForm.data.tax_pin} onChange={(e) => editForm.setData('tax_pin', e.target.value)} error={editForm.errors.tax_pin} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Website" value={editForm.data.website} onChange={(e) => editForm.setData('website', e.target.value)} error={editForm.errors.website} />
                        <FormField label="Industry" value={editForm.data.industry} onChange={(e) => editForm.setData('industry', e.target.value)} error={editForm.errors.industry} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                        <textarea rows={2} className={textareaClasses} value={editForm.data.address} onChange={(e) => editForm.setData('address', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                        <textarea rows={3} className={textareaClasses} value={editForm.data.notes} onChange={(e) => editForm.setData('notes', e.target.value)} />
                    </div>
                </form>
            </Modal>

            {/* Status Change Modal */}
            <Modal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                title="Change Client Status"
                subtitle={`Current status: ${statusLabel(client.status)}`}
                size="md"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={statusForm.processing} onClick={submitStatusChange as any}>
                            Confirm Change
                        </Button>
                    </>
                }
            >
                <form id="status-form" onSubmit={submitStatusChange} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Select New Status</label>
                        <div className="grid grid-cols-2 gap-3">
                            {statuses.map((s) => {
                                const isSelected = statusForm.data.status === s.value;
                                const color = statusColor[s.value] ?? 'neutral';

                                const buttonClasses = {
                                    prospect: isSelected
                                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-md ring-2 ring-blue-500/20'
                                        : 'bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300',
                                    active: isSelected
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-2 ring-emerald-500/20'
                                        : 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300',
                                    dormant: isSelected
                                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-md ring-2 ring-amber-500/20'
                                        : 'bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300',
                                    archived: isSelected
                                        ? 'bg-slate-100 border-slate-500 text-slate-900 shadow-md ring-2 ring-slate-500/20'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
                                }[color];

                                return (
                                    <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => statusForm.setData('status', s.value)}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${buttonClasses}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${
                                            color === 'prospect' ? 'bg-blue-500' :
                                            color === 'active' ? 'bg-emerald-500' :
                                            color === 'dormant' ? 'bg-amber-500' :
                                            'bg-slate-400'
                                        }`} />
                                        {s.label}
                                        {isSelected && (
                                            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (optional but recommended)</label>
                        <textarea
                            rows={3}
                            className={textareaClasses}
                            value={statusForm.data.reason}
                            onChange={(e) => statusForm.setData('reason', e.target.value)}
                            placeholder="e.g. Client requested to pause services..."
                        />
                        <p className="mt-1.5 text-xs text-slate-400">This will be recorded in the status history for audit purposes.</p>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Client"
                message={`This will permanently delete "${displayName}" and all their data. This action cannot be undone. Clients with matters cannot be deleted.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
