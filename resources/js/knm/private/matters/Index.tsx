/* eslint-disable curly */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @stylistic/padding-line-between-statements */
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge, Button, DataTable, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface NamedId {
    id: number;
    name: string;
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
    client: NamedId | null;
    practice_area: NamedId | null;
    lead_advocate: NamedId | null;
}

interface StatusOption {
    value: string;
    label: string;
}

interface StageOption {
    value: string;
    label: string;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    matters: {
        data: MatterItem[];
        links: PaginatorLink[];
        meta?: { current_page?: number; last_page?: number; total?: number };
        current_page?: number;
        last_page?: number;
        total?: number;
        per_page?: number;
    };
    filters: {
        search: string | null;
        status: string | null;
        stage: string | null;
        practice_area_id: string | null;
        sort: string;
        direction: string;
        per_page?: number;
    };
    statuses: StatusOption[];
    stages: StageOption[];
    practiceAreas: NamedId[];
    clients: NamedId[];
    advocates: NamedId[];
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

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function Index({ matters, filters, statuses, stages, practiceAreas, clients, advocates }: Props) {
    const { can } = useAuth();
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({
        title: '',
        description: '',
        client_id: '',
        practice_area_id: '',
        lead_advocate_id: '',
    });

    const data = matters?.data ?? [];
    const total = matters?.meta?.total ?? matters?.total ?? data.length;
    const currentPage = matters?.meta?.current_page ?? matters?.current_page ?? 1;
    const lastPage = matters?.meta?.last_page ?? matters?.last_page ?? 1;
    const perPage = matters?.per_page ?? filters.per_page ?? 25;
    const links = matters?.links ?? [];

    const statusLabel = (value: string) =>
        statuses.find((s) => s.value === value)?.label ?? value;

    const stageLabel = (value: string) =>
        stages.find((s) => s.value === value)?.label ?? value;

    const buildParams = (overrides: Record<string, unknown>) => {
        const params: Record<string, unknown> = {};
        const merged = { ...filters, ...overrides };
        if (merged.search) params.search = merged.search;
        if (merged.status) params.status = merged.status;
        if (merged.stage) params.stage = merged.stage;
        if (merged.practice_area_id) params.practice_area_id = merged.practice_area_id;
        if (merged.sort) params.sort = merged.sort;
        if (merged.direction) params.direction = merged.direction;
        if (merged.per_page) params.per_page = merged.per_page;
        return params;
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/private/matters', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Matter opened', {
                    description: 'The matter file has been created with its file number.',
                });
                setCreateOpen(false);
                createForm.reset();
            },
            onError: (errors) => {
                toast.error('Could not open matter', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const columns = [
        {
            key: 'file_number',
            label: 'File Number',
            sortable: true,
            render: (_: any, row: MatterItem) => (
                <span className="font-mono text-xs font-semibold text-slate-900">{row.file_number}</span>
            ),
        },
        {
            key: 'title',
            label: 'Matter',
            sortable: true,
            render: (_: any, row: MatterItem) => (
                <div>
                    <div className="font-semibold text-slate-900 group-hover:text-[#891920] transition-colors">
                        {row.title}
                    </div>
                    {row.client && (
                        <div className="text-xs text-slate-500">{row.client.name}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'practice_area',
            label: 'Practice Area',
            render: (_: any, row: MatterItem) => (
                <span className="text-slate-600">{row.practice_area?.name ?? '—'}</span>
            ),
        },
        {
            key: 'stage',
            label: 'Stage',
            sortable: true,
            render: (_: any, row: MatterItem) => (
                <Badge color={stageColor[row.stage] ?? 'neutral'} dot>
                    {stageLabel(row.stage)}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (_: any, row: MatterItem) => (
                <Badge color={statusColor[row.status] ?? 'neutral'}>
                    {statusLabel(row.status)}
                </Badge>
            ),
        },
        {
            key: 'lead_advocate',
            label: 'Lead Advocate',
            render: (_: any, row: MatterItem) => (
                <span className="text-slate-600">{row.lead_advocate?.name ?? '—'}</span>
            ),
        },
        {
            key: 'opened_at',
            label: 'Opened',
            sortable: true,
            render: (_: any, row: MatterItem) => (
                <span className="text-slate-500">{formatDate(row.opened_at)}</span>
            ),
        },
    ];

    return (
        <>
            <Head title="Matters · K&A Internal" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Matters</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {total} matter{total === 1 ? '' : 's'} in the system.
                    </p>
                </div>
                {can('matters.create') && (
                    <Button variant="gold" onClick={() => setCreateOpen(true)}>
                        + New Matter
                    </Button>
                )}
            </div>

            <DataTable
                data={data}
                columns={columns}
                searchValue={filters.search ?? ''}
                searchPlaceholder="Search by file number, title, client, practice area, or advocate…"
                filters={[
                    {
                        key: 'status',
                        label: 'All Statuses',
                        options: statuses.map((s) => ({ value: s.value, label: s.label })),
                    },
                    {
                        key: 'stage',
                        label: 'All Stages',
                        options: stages.map((s) => ({ value: s.value, label: s.label })),
                    },
                    {
                        key: 'practice_area_id',
                        label: 'All Practice Areas',
                        options: practiceAreas.map((p) => ({ value: String(p.id), label: p.name })),
                    },
                ]}
                activeFilters={{
                    status: filters.status,
                    stage: filters.stage,
                    practice_area_id: filters.practice_area_id,
                }}
                sortKey={filters.sort}
                sortDirection={filters.direction as 'asc' | 'desc'}
                currentPage={currentPage}
                lastPage={lastPage}
                total={total}
                perPage={perPage}
                paginationLinks={links}
                onSearch={(value) => {
                    router.get('/private/matters', buildParams({ search: value }), { preserveScroll: true });
                }}
                onFilterChange={(key, value) => {
                    router.get('/private/matters', buildParams({ [key]: value }), { preserveScroll: true });
                }}
                onSort={(key) => {
                    const newDirection = filters.sort === key && filters.direction === 'asc' ? 'desc' : 'asc';
                    router.get('/private/matters', buildParams({ sort: key, direction: newDirection }), { preserveScroll: true });
                }}
                onPageChange={(url) => {
                    if (url) router.visit(url);
                }}
                onPerPageChange={(value) => {
                    router.get('/private/matters', buildParams({ per_page: value }), { preserveScroll: true });
                }}
                onRowClick={(row) => {
                    router.visit(`/private/matters/${row.id}`);
                }}
                emptyTitle="No matters found"
                emptyDescription={
                    filters.search || filters.status || filters.stage || filters.practice_area_id
                        ? 'Try adjusting your search or filters.'
                        : 'New matters will appear here after conversion from enquiries or manual creation.'
                }
            />

            {/* Create Matter Modal */}
            <Modal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Open New Matter"
                subtitle="Creates the matter file and generates the file number automatically."
                size="md"
            >
                <form onSubmit={submitCreate} className="space-y-4">
                    <FormField
                        label="Matter Title"
                        value={createForm.data.title}
                        onChange={(e) => createForm.setData('title', e.target.value)}
                        error={createForm.errors.title}
                        placeholder="e.g. Kamau v Equity Bank — Commercial Litigation"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Client</label>
                            <select
                                className={selectClasses}
                                value={createForm.data.client_id}
                                onChange={(e) => createForm.setData('client_id', e.target.value)}
                            >
                                <option value="">Select client…</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {createForm.errors.client_id && (
                                <p className="text-xs text-red-600 mt-1">{createForm.errors.client_id}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Practice Area</label>
                            <select
                                className={selectClasses}
                                value={createForm.data.practice_area_id}
                                onChange={(e) => createForm.setData('practice_area_id', e.target.value)}
                            >
                                <option value="">Select area…</option>
                                {practiceAreas.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {createForm.errors.practice_area_id && (
                                <p className="text-xs text-red-600 mt-1">{createForm.errors.practice_area_id}</p>
                            )}
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Lead Advocate (optional)</label>
                            <select
                                className={selectClasses}
                                value={createForm.data.lead_advocate_id}
                                onChange={(e) => createForm.setData('lead_advocate_id', e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {advocates.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Description (optional)</label>
                        <textarea
                            rows={3}
                            className={selectClasses}
                            value={createForm.data.description}
                            onChange={(e) => createForm.setData('description', e.target.value)}
                            placeholder="Brief summary of the matter…"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={createForm.processing}>
                            Open Matter
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
