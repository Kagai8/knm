/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge, Button, DataTable, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface CreatedBy {
    id: number;
    name: string;
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
    created_by: CreatedBy | null;
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
    clients: {
        data: ClientItem[];
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
        type: string | null;
        sort: string;
        direction: string;
        per_page?: number;
    };
    statuses: StatusOption[];
}

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

const statusColor: Record<string, BadgeColor> = {
    prospect: 'info',
    active: 'success',
    dormant: 'warning',
    archived: 'neutral',
};

const typeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
];

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const textareaClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const PersonIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const BuildingIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

export default function Index({ clients, filters, statuses }: Props) {
    const { can } = useAuth();

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);

    const data = clients?.data ?? [];
    const total = clients?.meta?.total ?? clients?.total ?? data.length;
    const currentPage = clients?.meta?.current_page ?? clients?.current_page ?? 1;
    const lastPage = clients?.meta?.last_page ?? clients?.last_page ?? 1;
    const perPage = clients?.per_page ?? filters.per_page ?? 25;
    const links = clients?.links ?? [];

    const form = useForm({
        type: 'individual',
        name: '',
        email: '',
        phone: '',
        id_number: '',
        company_name: '',
        company_registration: '',
        tax_pin: '',
        vat_number: '',
        address: '',
        website: '',
        industry: '',
        notes: '',
        status: 'prospect',
    });

    const statusLabel = (value: string) =>
        statuses.find((s) => s.value === value)?.label ?? value;

    const buildParams = (overrides: Record<string, unknown>) => {
        const params: Record<string, unknown> = {};
        const merged = { ...filters, ...overrides };
        if (merged.search) params.search = merged.search;
        if (merged.status) params.status = merged.status;
        if (merged.type) params.type = merged.type;
        if (merged.sort) params.sort = merged.sort;
        if (merged.direction) params.direction = merged.direction;
        if (merged.per_page) params.per_page = merged.per_page;
        return params;
    };

    const openCreateModal = () => {
        form.reset();
        form.clearErrors();
        form.setData('type', 'individual');
        form.setData('status', 'prospect');
        setModalOpen(true);
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();

        form.post('/private/clients', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Client created', {
                    description: `${form.data.name} has been added to the system.`,
                });
                setModalOpen(false);
                form.reset();
            },
            onError: (errors) => {
                toast.error('Could not create client', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const columns = [
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (_: any, row: ClientItem) => (
                <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs">
                    {row.type === 'company' ? <BuildingIcon /> : <PersonIcon />}
                    {row.type === 'company' ? 'Company' : 'Individual'}
                </span>
            ),
        },
        {
            key: 'name',
            label: 'Client',
            sortable: true,
            render: (_: any, row: ClientItem) => (
                <div>
                    <div className="font-semibold text-slate-900 group-hover:text-[#891920] transition-colors">
                        {row.type === 'company' && row.company_name ? row.company_name : row.name}
                    </div>
                    {row.type === 'company' && row.name && (
                        <div className="text-xs text-slate-500">Contact: {row.name}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Contact',
            render: (_: any, row: ClientItem) => (
                <div>
                    <div className="text-slate-600">{row.email ?? '—'}</div>
                    {row.phone && <div className="text-xs text-slate-400">{row.phone}</div>}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (_: any, row: ClientItem) => (
                <Badge color={statusColor[row.status] ?? 'neutral'} dot>
                    {statusLabel(row.status)}
                </Badge>
            ),
        },
        {
            key: 'created_by',
            label: 'Added By',
            render: (_: any, row: ClientItem) => (
                <span className="text-slate-600">{row.created_by?.name ?? '—'}</span>
            ),
        },
        {
            key: 'created_at',
            label: 'Added',
            sortable: true,
            render: (_: any, row: ClientItem) => (
                <span className="text-slate-500">{formatDate(row.created_at)}</span>
            ),
        },
    ];

    return (
        <>
            <Head title="Clients · K&A Internal" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Clients</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {total} client{total === 1 ? '' : 's'} in the system.
                    </p>
                </div>
                {can('clients.create') && (
                    <Button variant="gold" onClick={openCreateModal}>
                        + New Client
                    </Button>
                )}
            </div>

            <DataTable
                data={data}
                columns={columns}
                searchValue={filters.search ?? ''}
                searchPlaceholder="Search by name, email, phone, company, ID, or registration…"
                filters={[
                    {
                        key: 'status',
                        label: 'All Statuses',
                        options: statuses.map((s) => ({ value: s.value, label: s.label })),
                    },
                    {
                        key: 'type',
                        label: 'All Types',
                        options: typeOptions,
                    },
                ]}
                activeFilters={{
                    status: filters.status,
                    type: filters.type,
                }}
                sortKey={filters.sort}
                sortDirection={filters.direction as 'asc' | 'desc'}
                currentPage={currentPage}
                lastPage={lastPage}
                total={total}
                perPage={perPage}
                paginationLinks={links}
                onSearch={(value) => {
                    router.get('/private/clients', buildParams({ search: value }), { preserveScroll: true });
                }}
                onFilterChange={(key, value) => {
                    router.get('/private/clients', buildParams({ [key]: value }), { preserveScroll: true });
                }}
                onSort={(key) => {
                    const newDirection = filters.sort === key && filters.direction === 'asc' ? 'desc' : 'asc';
                    router.get('/private/clients', buildParams({ sort: key, direction: newDirection }), { preserveScroll: true });
                }}
                onPageChange={(url) => {
                    if (url) router.visit(url);
                }}
                onPerPageChange={(value) => {
                    router.get('/private/clients', buildParams({ per_page: value }), { preserveScroll: true });
                }}
                onRowClick={(row) => {
                    router.visit(`/private/clients/${row.id}`);
                }}
                emptyTitle="No clients found"
                emptyDescription={
                    filters.search || filters.status || filters.type
                        ? 'Try adjusting your search or filters.'
                        : 'New clients will appear here once created manually or converted from enquiries.'
                }
            />

            {/* Create Client Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="New Client"
                subtitle="Add a new individual or company to the CRM."
                size="lg"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={form.processing} onClick={submitForm as any}>
                            Create Client
                        </Button>
                    </>
                }
            >
                <form id="client-form" onSubmit={submitForm} className="space-y-8">
                    {/* SECTION 1: Identity */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">1</span>
                            Identity & Status
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Client Type</label>
                                <div className="relative">
                                    <select
                                        className={selectClasses}
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value)}
                                    >
                                        <option value="individual">Individual</option>
                                        <option value="company">Company</option>
                                    </select>
                                </div>
                                {form.errors.type && <p className="text-xs text-red-600 mt-1">{form.errors.type}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Status</label>
                                <select
                                    className={selectClasses}
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                >
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                {form.errors.status && <p className="text-xs text-red-600 mt-1">{form.errors.status}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Dynamic Details */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">2</span>
                            {form.data.type === 'company' ? 'Corporate Details' : 'Personal Details'}
                        </h4>

                        {form.data.type === 'company' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField label="Company Name" value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} error={form.errors.company_name} placeholder="e.g. Acme Corp Ltd" />
                                    <FormField label="Registration No." value={form.data.company_registration} onChange={(e) => form.setData('company_registration', e.target.value)} error={form.errors.company_registration} />
                                </div>
                                <FormField label="Primary Contact Person" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} placeholder="Who should we address correspondence to?" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField label="Tax PIN" value={form.data.tax_pin} onChange={(e) => form.setData('tax_pin', e.target.value)} error={form.errors.tax_pin} />
                                    <FormField label="VAT Number" value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} error={form.errors.vat_number} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField label="Website" value={form.data.website} onChange={(e) => form.setData('website', e.target.value)} error={form.errors.website} placeholder="https://" />
                                    <FormField label="Industry" value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)} error={form.errors.industry} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField label="Full Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} placeholder="e.g. John Kamau" />
                                <FormField label="ID / Passport Number" value={form.data.id_number} onChange={(e) => form.setData('id_number', e.target.value)} error={form.errors.id_number} />
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: Contact */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">3</span>
                            Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField label="Email Address" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                            <FormField label="Phone Number" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} error={form.errors.phone} placeholder="+254..." leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Physical Address</label>
                            <textarea
                                rows={2}
                                className={textareaClasses}
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                placeholder="Building, Street, City"
                            />
                        </div>
                    </div>

                    {/* SECTION 4: Internal */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">4</span>
                            Internal Notes
                        </h4>
                        <textarea
                            rows={3}
                            className={textareaClasses}
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Any context, preferences, or background info..."
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
}
