/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge, Button, ConfirmModal, DataTable, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface ContactItem {
    id: number;
    name: string;
    type: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    notes: string | null;
    created_at: string;
}

interface TypeOption {
    value: string;
    label: string;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    contacts: {
        data: ContactItem[];
        links: PaginatorLink[];
        meta?: { current_page?: number; last_page?: number; total?: number };
        current_page?: number;
        last_page?: number;
        total?: number;
        per_page?: number;
    };
    filters: {
        search: string | null;
        type: string | null;
        sort: string;
        direction: string;
        per_page?: number;
    };
    types: TypeOption[];
}

type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

// Map the 11 ContactType enum values to our standard Badge colors
const typeColor: Record<string, BadgeColor> = {
    opposing_party: 'danger',
    witness: 'info',
    expert: 'info',
    court: 'neutral',
    judge: 'neutral',
    government: 'warning',
    co_counsel: 'success',
    beneficiary: 'gold',
    guarantor: 'warning',
    medical: 'success',
    other: 'neutral',
};

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const textareaClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function Index({ contacts, filters, types }: Props) {
    const { can } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<ContactItem | null>(null);

    // Delete state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ContactItem | null>(null);

    const data = contacts?.data ?? [];
    const total = contacts?.meta?.total ?? contacts?.total ?? data.length;
    const currentPage = contacts?.meta?.current_page ?? contacts?.current_page ?? 1;
    const lastPage = contacts?.meta?.last_page ?? contacts?.last_page ?? 1;
    const perPage = contacts?.per_page ?? filters.per_page ?? 25;
    const links = contacts?.links ?? [];

    const form = useForm({
        name: '',
        type: 'other',
        email: '',
        phone: '',
        company_name: '',
        notes: '',
    });

    const deleteForm = useForm({});

    const typeLabel = (value: string) =>
        types.find((t) => t.value === value)?.label ?? value;

    const buildParams = (overrides: Record<string, unknown>) => {
        const params: Record<string, unknown> = {};
        const merged = { ...filters, ...overrides };
        if (merged.search) params.search = merged.search;
        if (merged.type) params.type = merged.type;
        if (merged.sort) params.sort = merged.sort;
        if (merged.direction) params.direction = merged.direction;
        if (merged.per_page) params.per_page = merged.per_page;
        return params;
    };

    const openCreateModal = () => {
        setEditingContact(null);
        form.reset();
        form.clearErrors();
        form.setData('type', 'other');
        setModalOpen(true);
    };

    const openEditModal = (contact: ContactItem) => {
        setEditingContact(contact);
        form.clearErrors();
        form.setData({
            name: contact.name,
            type: contact.type,
            email: contact.email ?? '',
            phone: contact.phone ?? '',
            company_name: contact.company_name ?? '',
            notes: contact.notes ?? '',
        });
        setModalOpen(true);
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();
        const isEditing = editingContact !== null;
        const url = isEditing ? `/private/contacts/${editingContact.id}` : '/private/contacts';
        const method = isEditing ? 'put' : 'post';

        form.submit(method, url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Contact updated' : 'Contact created', {
                    description: isEditing
                        ? `${form.data.name}'s details have been saved.`
                        : `${form.data.name} has been added to the system.`,
                });
                setModalOpen(false);
                if (!isEditing) form.reset();
            },
            onError: (errors) => {
                toast.error(isEditing ? 'Could not update contact' : 'Could not create contact', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        deleteForm.delete(`/private/contacts/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Contact deleted', { description: `${deleteTarget.name} has been permanently removed.` });
                setDeleteModalOpen(false);
                setDeleteTarget(null);
                setModalOpen(false); // Close the edit modal too
            },
            onError: (errors) => {
                toast.error('Could not delete contact', { description: Object.values(errors).flat().join(' ') });
                setDeleteModalOpen(false);
            },
        });
    };

    const columns = [
        {
            key: 'type',
            label: 'Role / Type',
            sortable: true,
            render: (_: any, row: ContactItem) => (
                <Badge color={typeColor[row.type] ?? 'neutral'}>
                    {typeLabel(row.type)}
                </Badge>
            ),
        },
        {
            key: 'name',
            label: 'Contact Name',
            sortable: true,
            render: (_: any, row: ContactItem) => (
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
            key: 'email',
            label: 'Contact Info',
            render: (_: any, row: ContactItem) => (
                <div>
                    <div className="text-slate-600">{row.email ?? '—'}</div>
                    {row.phone && <div className="text-xs text-slate-400">{row.phone}</div>}
                </div>
            ),
        },
        {
            key: 'created_at',
            label: 'Added',
            sortable: true,
            render: (_: any, row: ContactItem) => (
                <span className="text-slate-500">{formatDate(row.created_at)}</span>
            ),
        },
    ];

    return (
        <>
            <Head title="Contacts · K&A Internal" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Contacts</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {total} contact{total === 1 ? '' : 's'} in the system.
                    </p>
                </div>
                {can('contacts.create') && (
                    <Button variant="gold" onClick={openCreateModal}>
                        + New Contact
                    </Button>
                )}
            </div>

            <DataTable
                data={data}
                columns={columns}
                searchValue={filters.search ?? ''}
                searchPlaceholder="Search by name, email, phone, or company…"
                filters={[
                    {
                        key: 'type',
                        label: 'All Types',
                        options: types.map((t) => ({ value: t.value, label: t.label })),
                    },
                ]}
                activeFilters={{
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
                    router.get('/private/contacts', buildParams({ search: value }), { preserveScroll: true });
                }}
                onFilterChange={(key, value) => {
                    router.get('/private/contacts', buildParams({ [key]: value }), { preserveScroll: true });
                }}
                onSort={(key) => {
                    const newDirection = filters.sort === key && filters.direction === 'asc' ? 'desc' : 'asc';
                    router.get('/private/contacts', buildParams({ sort: key, direction: newDirection }), { preserveScroll: true });
                }}
                onPageChange={(url) => {
                    if (url) router.visit(url);
                }}
                onPerPageChange={(value) => {
                    router.get('/private/contacts', buildParams({ per_page: value }), { preserveScroll: true });
                }}
                onRowClick={(row) => {
                    if (can('contacts.update')) {
                        openEditModal(row);
                    }
                }}
                emptyTitle="No contacts found"
                emptyDescription={
                    filters.search || filters.type
                        ? 'Try adjusting your search or filters.'
                        : 'Contacts will appear here once created manually or imported.'
                }
            />

            {/* Create / Edit Contact Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingContact ? 'Edit Contact' : 'New Contact'}
                subtitle={editingContact ? `Updating details for ${editingContact.name}` : 'Add a new witness, expert, opposing counsel, or other contact.'}
                size="md"
                footer={
                    <div className="flex w-full items-center justify-between">
                        {/* Delete button (only show when editing) */}
                        {editingContact && can('contacts.update') && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    setDeleteTarget(editingContact);
                                    setDeleteModalOpen(true);
                                }}
                            >
                                Delete Contact
                            </Button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" isLoading={form.processing} onClick={submitForm as any}>
                                {editingContact ? 'Save Changes' : 'Create Contact'}
                            </Button>
                        </div>
                    </div>
                }
            >
                <form id="contact-form" onSubmit={submitForm} className="space-y-8">
                    {/* SECTION 1: Identity */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">1</span>
                            Identity & Role
                        </h4>
                        <div className="space-y-6">
                            <FormField
                                label="Full Name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                error={form.errors.name}
                                placeholder="e.g. Hon. Lady Justice Njoki"
                            />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Role / Type</label>
                                <select
                                    className={selectClasses}
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                >
                                    {types.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                {form.errors.type && <p className="text-xs text-red-600 mt-1">{form.errors.type}</p>}
                            </div>
                            <FormField
                                label="Company / Institution / Court (optional)"
                                value={form.data.company_name}
                                onChange={(e) => form.setData('company_name', e.target.value)}
                                error={form.errors.company_name}
                                placeholder="e.g. Supreme Court of Kenya, or Equity Bank"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: Contact Info */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">2</span>
                            Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                                label="Email Address"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                error={form.errors.email}
                                leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                            <FormField
                                label="Phone Number"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                error={form.errors.phone}
                                placeholder="+254..."
                                leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                            />
                        </div>
                    </div>

                    {/* SECTION 3: Notes */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">3</span>
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

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDelete}
                title="Delete Contact"
                message={`This will permanently delete "${deleteTarget?.name}" and all their data. This action cannot be undone. Contacts currently linked to matters cannot be deleted.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
