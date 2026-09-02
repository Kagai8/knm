/* eslint-disable curly */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @stylistic/padding-line-between-statements */
import { Head, router } from '@inertiajs/react';
import { Badge, DataTable } from '@/knm/shared/ui';

interface NamedId {
    id: number;
    name: string;
}

interface EnquiryItem {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    status: string;
    conflict_status: string | null;
    created_at: string;
    practice_area: NamedId | null;
    assigned_triager: NamedId | null;
}

interface StatusOption {
    value: string;
    label: string;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    enquiries: {
        data: EnquiryItem[];
        links: PaginatorLink[];
        meta?: { current_page?: number; last_page?: number; total?: number };
        current_page?: number;
        last_page?: number;
        total?: number;
        per_page?: number;
    };
    filters: {
        status: string | null;
        search: string | null;
        sort: string;
        direction: string;
        per_page?: number;
    };
    statuses: StatusOption[];
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

const conflictColor: Record<string, BadgeColor> = {
    pending: 'neutral',
    cleared: 'success',
    flagged: 'danger',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Index({ enquiries, filters, statuses }: Props) {
    const data = enquiries?.data ?? [];
    const total = enquiries?.meta?.total ?? enquiries?.total ?? data.length;
    const currentPage = enquiries?.meta?.current_page ?? enquiries?.current_page ?? 1;
    const lastPage = enquiries?.meta?.last_page ?? enquiries?.last_page ?? 1;
    const perPage = enquiries?.per_page ?? filters.per_page ?? 25;
    const links = enquiries?.links ?? [];

    const statusLabel = (value: string) =>
        statuses.find((s) => s.value === value)?.label ?? value;

    const buildParams = (overrides: Record<string, unknown>) => {
        const params: Record<string, unknown> = {};
        const merged = { ...filters, ...overrides };
        if (merged.status) params.status = merged.status;
        if (merged.search) params.search = merged.search;
        if (merged.sort) params.sort = merged.sort;
        if (merged.direction) params.direction = merged.direction;
        if (merged.per_page) params.per_page = merged.per_page;
        return params;
    };

    const columns = [
        {
            key: 'name',
            label: 'Enquiry',
            sortable: true,
            render: (_: any, row: EnquiryItem) => (
                <div>
                    <div className="font-semibold text-slate-900 group-hover:text-[#891920] transition-colors">
                        {row.name}
                    </div>
                    {row.company_name && (
                        <div className="text-xs text-slate-500">{row.company_name}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'contact',
            label: 'Contact',
            render: (_: any, row: EnquiryItem) => (
                <div>
                    <div className="text-slate-600">{row.email ?? '—'}</div>
                    {row.phone && <div className="text-xs text-slate-400">{row.phone}</div>}
                </div>
            ),
        },
        {
            key: 'practice_area',
            label: 'Practice Area',
            render: (_: any, row: EnquiryItem) => (
                <span className="text-slate-600">{row.practice_area?.name ?? '—'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (_: any, row: EnquiryItem) => (
                <Badge color={statusColor[row.status] ?? 'neutral'} dot>
                    {statusLabel(row.status)}
                </Badge>
            ),
        },
        {
            key: 'conflict_status',
            label: 'Conflict',
            sortable: true,
            render: (_: any, row: EnquiryItem) => (
                <Badge color={conflictColor[row.conflict_status ?? 'pending'] ?? 'neutral'}>
                    {(row.conflict_status ?? 'pending').charAt(0).toUpperCase() + (row.conflict_status ?? 'pending').slice(1)}
                </Badge>
            ),
        },
        {
            key: 'assigned_triager',
            label: 'Assigned To',
            render: (_: any, row: EnquiryItem) => (
                <span className="text-slate-600">{row.assigned_triager?.name ?? '—'}</span>
            ),
        },
        {
            key: 'created_at',
            label: 'Received',
            sortable: true,
            render: (_: any, row: EnquiryItem) => (
                <span className="text-slate-500">{formatDate(row.created_at)}</span>
            ),
        },
    ];

    return (
        <>
            <Head title="Enquiries · K&A Internal" />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-slate-900">Enquiries</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {total} intake{total === 1 ? '' : 's'} in the pipeline.
                </p>
            </div>

            <DataTable
                data={data}
                columns={columns}
                searchValue={filters.search ?? ''}
                searchPlaceholder="Search by name, email, phone, company, status, practice area, or triager…"
                filters={[
                    {
                        key: 'status',
                        label: 'All',
                        options: statuses.map((s) => ({ value: s.value, label: s.label })),
                    },
                ]}
                activeFilters={{ status: filters.status }}
                sortKey={filters.sort}
                sortDirection={filters.direction as 'asc' | 'desc'}
                currentPage={currentPage}
                lastPage={lastPage}
                total={total}
                perPage={perPage}
                paginationLinks={links}
                onSearch={(value) => {
                    router.get('/private/enquiries', buildParams({ search: value }), { preserveScroll: true });
                }}
                onFilterChange={(key, value) => {
                    router.get('/private/enquiries', buildParams({ [key]: value }), { preserveScroll: true });
                }}
                onSort={(key) => {
                    const newDirection = filters.sort === key && filters.direction === 'asc' ? 'desc' : 'asc';
                    router.get('/private/enquiries', buildParams({ sort: key, direction: newDirection }), { preserveScroll: true });
                }}
                onPageChange={(url) => {
                    if (url) router.visit(url);
                }}
                onPerPageChange={(value) => {
                    router.get('/private/enquiries', buildParams({ per_page: value }), { preserveScroll: true });
                }}
                onRowClick={(row) => {
                    router.visit(`/private/enquiries/${row.id}`);
                }}
                emptyTitle="No enquiries found"
                emptyDescription={
                    filters.search || filters.status
                        ? 'Try adjusting your search or filters.'
                        : 'New enquiries from the public contact form will appear here, ready for triage.'
                }
            />
        </>
    );
}
