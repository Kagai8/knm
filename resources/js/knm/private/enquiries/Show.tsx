/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @stylistic/padding-line-between-statements */
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, FormField, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface NamedId {
    id: number;
    name: string;
}

interface ConflictResult {
    id: number;
    matched_type: string;
    matched_name: string;
    match_confidence: string;
    resolution: string;
}

interface EnquiryItem {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    company_registration: string | null;
    id_number: string | null;
    description: string | null;
    status: string;
    conflict_status: string | null;
    conflict_notes: string | null;
    rejection_reason: string | null;
    created_at: string;
    practice_area: NamedId | null;
    assigned_triager: NamedId | null;
    assigned_partner: NamedId | null;
    converted_to_matter: { id: number; file_number: string } | null;
    conflict_results: ConflictResult[];
}

interface Props {
    enquiry: EnquiryItem;
    practiceAreas: NamedId[];
    triagers: NamedId[];
    partners: NamedId[];
}

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

const statusColor: Record<string, BadgeColor> = {
    new: 'info',
    triaged: 'warning',
    conflict_checking: 'warning',
    conflict_cleared: 'success',
    conflict_flagged: 'danger',
    partner_reviewing: 'warning',
    approved: 'success',
    rejected: 'danger',
    converted: 'gold',
};

const confidenceColor: Record<string, BadgeColor> = {
    exact: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'neutral',
};

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Show({ enquiry, practiceAreas, triagers, partners }: Props) {
    const { can } = useAuth();
    const canOverride = can('enquiries.override_conflict');

    const assignForm = useForm({ assigned_triager_id: enquiry.assigned_triager?.id?.toString() ?? '' });
    const approveForm = useForm({
        practice_area_id: enquiry.practice_area?.id?.toString() ?? '',
        assigned_partner_id: enquiry.assigned_partner?.id?.toString() ?? '',
    });
    const rejectForm = useForm({ rejection_reason: '' });
    const conflictForm = useForm({});
    const convertForm = useForm({});
    const overrideForm = useForm({ override_reason: '' });

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assignForm.post(`/private/enquiries/${enquiry.id}/assign-triager`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Triager assigned'),
            onError: (errors) => toast.error('Assignment failed', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleConflictCheck = () => {
        conflictForm.post(`/private/enquiries/${enquiry.id}/conflict-check`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Conflict check complete'),
            onError: (errors) => toast.error('Check failed', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/private/enquiries/${enquiry.id}/approve`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Enquiry approved'),
            onError: (errors) => toast.error('Approval failed', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/private/enquiries/${enquiry.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => toast.error('Enquiry rejected', { description: 'It has been removed from the active pipeline.' }),
            onError: (errors) => toast.error('Rejection failed', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleConvert = () => {
        convertForm.post(`/private/enquiries/${enquiry.id}/convert`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Converted to Matter!'),
            onError: (errors) => toast.error('Conversion failed', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const handleOverride = (e: React.FormEvent) => {
        e.preventDefault();
        overrideForm.post(`/private/enquiries/${enquiry.id}/override-conflict`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Conflict override recorded'),
            onError: (errors) => toast.error('Override failed', { description: Object.values(errors).flat().join(' ') }),
        });
    };

    const isTerminal = ['rejected', 'converted'].includes(enquiry.status);

    return (
        <>
            <Head title={`Enquiry: ${enquiry.name}`} />

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/private/enquiries"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#891920] hover:border-[#D4AF37]/60 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">{enquiry.name}</h1>
                        <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                            Received {formatDate(enquiry.created_at)}
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <Badge color={statusColor[enquiry.status] ?? 'neutral'} dot>
                                {enquiry.status.replace('_', ' ').charAt(0).toUpperCase() + enquiry.status.replace('_', ' ').slice(1)}
                            </Badge>
                            {enquiry.conflict_status && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="text-slate-500">Conflict: </span>
                                    <Badge color={enquiry.conflict_status === 'cleared' ? 'success' : enquiry.conflict_status === 'flagged' ? 'danger' : 'neutral'}>
                                        {enquiry.conflict_status}
                                    </Badge>
                                </>
                            )}
                        </p>
                    </div>
                </div>
                {enquiry.converted_to_matter && (
                    <Link href={`/private/matters/${enquiry.converted_to_matter.id}`}>
                        <Button variant="gold">View Matter: {enquiry.converted_to_matter.file_number}</Button>
                    </Link>
                )}
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Enquiry Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-serif font-bold text-slate-900">Enquiry Details</h2>
                            </CardHeader>
                            <CardBody>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{enquiry.email ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{enquiry.phone ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Company</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{enquiry.company_name ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration / ID</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{enquiry.company_registration ?? enquiry.id_number ?? '—'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Description / Matter Details</dt>
                                        <dd className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[100px]">
                                            {enquiry.description ?? <span className="text-slate-400 italic">No description provided.</span>}
                                        </dd>
                                    </div>
                                </dl>
                            </CardBody>
                        </Card>

                        {/* Four-State Conflict Panel */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-serif font-bold text-slate-900">Conflict Check</h2>
                            </CardHeader>
                            <CardBody>
                                {/* State 1: Pending (never run) */}
                                {enquiry.conflict_status === null && !conflictForm.processing && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-serif font-bold text-slate-900 mb-2">No Conflict Check Run</h3>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                            Run a conflict check to verify this enquiry doesn't conflict with existing clients, contacts, or matters.
                                        </p>
                                    </div>
                                )}

                                {/* State 2: Checking (in progress) */}
                                {conflictForm.processing && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                                            <svg className="h-7 w-7 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="font-serif font-bold text-slate-900 mb-2">Scanning for Conflicts</h3>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                            Checking clients, contacts, and matters for potential conflicts of interest...
                                        </p>
                                    </div>
                                )}

                                {/* State 3: Cleared (no conflicts found) */}
                                {enquiry.conflict_status === 'cleared' && !conflictForm.processing && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-serif font-bold text-emerald-900 mb-2">No Conflicts Found</h3>
                                        <p className="text-sm text-emerald-700 max-w-sm mx-auto">
                                            This enquiry has been cleared. No conflicts with existing clients, contacts, or matters were detected.
                                        </p>
                                        {enquiry.conflict_notes && enquiry.conflict_notes.includes('CONFLICT OVERRIDE') && (
                                            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 max-w-md mx-auto text-left">
                                                <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Previous conflict was overridden:</p>
                                                <p className="text-xs text-amber-800 whitespace-pre-wrap">{enquiry.conflict_notes.replace('CONFLICT OVERRIDE by ', '')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* State 4: Flagged (conflicts found) */}
                                {enquiry.conflict_status === 'flagged' && !conflictForm.processing && enquiry.conflict_results && enquiry.conflict_results.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                                            <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <div>
                                                <h3 className="font-semibold text-red-900">{enquiry.conflict_results.length} Conflict{enquiry.conflict_results.length === 1 ? '' : 's'} Detected</h3>
                                                <p className="text-xs text-red-700">Review these matches before approving. Mark as false positives if they do not apply.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {enquiry.conflict_results.map((match) => (
                                                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{match.matched_name}</div>
                                                        <div className="text-xs text-slate-500">{match.matched_type.split('\\').pop()}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge color={confidenceColor[match.match_confidence?.toLowerCase()] ?? 'neutral'}>
                                                            {match.match_confidence} Match
                                                        </Badge>
                                                        <Badge color={match.resolution === 'resolved' ? 'success' : 'warning'}>
                                                            {match.resolution}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Override action — visible only to users with the override permission */}
                                        {canOverride && (
                                            <div className="mt-4 pt-4 border-t border-red-100">
                                                <form onSubmit={handleOverride} className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-red-900 mb-1.5">
                                                            Override Reason (required — permanently recorded)
                                                        </label>
                                                        <textarea
                                                            rows={3}
                                                            className="block w-full rounded-lg border border-red-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-red-300 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                            placeholder="e.g. Client has provided written waiver. Both parties have consented to representation on this narrow matter."
                                                            value={overrideForm.data.override_reason}
                                                            onChange={(e) => overrideForm.setData('override_reason', e.target.value)}
                                                        />
                                                        {overrideForm.errors.override_reason && (
                                                            <p className="text-xs text-red-600 mt-1">{overrideForm.errors.override_reason}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                                        <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <p className="text-xs text-amber-900">
                                                            This action will be permanently recorded in the enquiry's audit trail and cannot be undone.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        variant="gold"
                                                        size="sm"
                                                        className="w-full"
                                                        isLoading={overrideForm.processing}
                                                        disabled={overrideForm.data.override_reason.length < 10}
                                                    >
                                                        Override Conflict & Clear
                                                    </Button>
                                                </form>
                                            </div>
                                        )}

                                        {/* No-override message for users without the permission */}
                                        {!canOverride && (
                                            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                                <p className="text-xs text-slate-600">
                                                    Only senior advocates with override authority can clear flagged conflicts.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {enquiry.rejection_reason && (
                            <Card>
                                <CardHeader className="bg-red-50/50 border-red-100">
                                    <h2 className="text-lg font-serif font-bold text-red-900">Rejection Reason</h2>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-sm text-slate-700">{enquiry.rejection_reason}</p>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Triage Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {!isTerminal && (
                            <>
                                {/* 1. Assign Triager */}
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-sm font-bold text-slate-900">1. Assign Triager</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <form onSubmit={handleAssign} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-medium text-slate-700">Intake Officer</label>
                                                <select
                                                    className={selectClasses}
                                                    value={assignForm.data.assigned_triager_id}
                                                    onChange={(e) => assignForm.setData('assigned_triager_id', e.target.value)}
                                                >
                                                    <option value="">Select triager...</option>
                                                    {triagers.map((t) => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Button type="submit" variant="secondary" size="sm" className="w-full" isLoading={assignForm.processing}>
                                                {enquiry.assigned_triager ? 'Update Assignment' : 'Assign'}
                                            </Button>
                                        </form>
                                    </CardBody>
                                </Card>

                                {/* 2. Conflict Check */}
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-sm font-bold text-slate-900">2. Run Conflict Check</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Scans existing clients, contacts, and matters for potential conflicts of interest.
                                        </p>
                                        <Button
                                            variant={enquiry.conflict_status === 'cleared' ? 'secondary' : 'primary'}
                                            size="sm"
                                            className="w-full"
                                            onClick={handleConflictCheck}
                                            isLoading={conflictForm.processing}
                                        >
                                            {enquiry.conflict_status === 'cleared' ? 'Re-run Check' : 'Run Check'}
                                        </Button>
                                    </CardBody>
                                </Card>

                                {/* 3. Decision */}
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-sm font-bold text-slate-900">3. Make Decision</h3>
                                    </CardHeader>
                                    <CardBody className="space-y-6">
                                        {/* Approve */}
                                        <form onSubmit={handleApprove} className="space-y-4 pb-6 border-b border-slate-100">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-medium text-slate-700">Practice Area</label>
                                                <select
                                                    className={selectClasses}
                                                    value={approveForm.data.practice_area_id}
                                                    onChange={(e) => approveForm.setData('practice_area_id', e.target.value)}
                                                >
                                                    <option value="">Select area...</option>
                                                    {practiceAreas.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-medium text-slate-700">Assign Partner (Optional)</label>
                                                <select
                                                    className={selectClasses}
                                                    value={approveForm.data.assigned_partner_id}
                                                    onChange={(e) => approveForm.setData('assigned_partner_id', e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {partners.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="sm"
                                                className="w-full"
                                                isLoading={approveForm.processing}
                                                disabled={!approveForm.data.practice_area_id}
                                            >
                                                Approve Enquiry
                                            </Button>
                                        </form>

                                        {/* Reject */}
                                        <form onSubmit={handleReject} className="space-y-4">
                                            <FormField
                                                label="Rejection Reason"
                                                name="rejection_reason"
                                                value={rejectForm.data.rejection_reason}
                                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                                placeholder="Why are we declining this?"
                                            />
                                            <Button
                                                type="submit"
                                                variant="danger"
                                                size="sm"
                                                className="w-full"
                                                isLoading={rejectForm.processing}
                                            >
                                                Reject Enquiry
                                            </Button>
                                        </form>
                                    </CardBody>
                                </Card>

                                {/* 4. Convert (Only if approved) */}
                                {enquiry.status === 'approved' && (
                                    <Card className="ring-2 ring-[#D4AF37]/30">
                                        <CardHeader className="bg-[#D4AF37]/5">
                                            <h3 className="text-sm font-bold text-[#891920]">4. Convert to Matter</h3>
                                        </CardHeader>
                                        <CardBody>
                                            <p className="text-xs text-slate-600 mb-4">
                                                Approved and cleared. Create the formal case file and generate the unique file number.
                                            </p>
                                            <Button
                                                variant="gold"
                                                size="sm"
                                                className="w-full"
                                                onClick={handleConvert}
                                                isLoading={convertForm.processing}
                                            >
                                                Open Matter
                                            </Button>
                                        </CardBody>
                                    </Card>
                                )}
                            </>
                        )}

                        {isTerminal && (
                            <Card>
                                <CardBody className="text-center py-8">
                                    <h3 className="font-serif font-bold text-slate-900 mb-2">Pipeline Closed</h3>
                                    <p className="text-sm text-slate-500">
                                        This enquiry has been {enquiry.status} and requires no further action.
                                    </p>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
