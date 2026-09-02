/* eslint-disable curly */
/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable import/order */
import { useEffect, useState, type FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, toast } from '@/knm/shared/ui';

interface DivisionHead {
    id: number;
    name: string;
}

interface PracticeAreaItem {
    id: number;
    name: string;
    code: string;
    description: string | null;
    division_head_id: number | null;
    is_active: boolean;
    enquiries_count: number;
    matters_count: number;
    division_head: DivisionHead | null;
}

interface Props {
    practiceAreas: PracticeAreaItem[];
    divisionHeads: DivisionHead[];
    filters: {
        search: string | null;
        sort: string;
        direction: string;
    };
}

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

export default function PracticeAreas({ practiceAreas, divisionHeads, filters }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(practiceAreas[0]?.id ?? null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [sortValue, setSortValue] = useState(`${filters.sort}-${filters.direction}`);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const selected = practiceAreas.find((p) => p.id === selectedId) ?? null;

    const createForm = useForm({
        name: '',
        code: '',
        description: '',
        division_head_id: '' as string | number,
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        code: '',
        description: '',
        division_head_id: '' as string | number,
        is_active: true,
    });

    const deleteForm = useForm({});

    // Keep the edit form in sync with the selected practice area and fresh server data
    useEffect(() => {
        editForm.setData({
            name: selected?.name ?? '',
            code: selected?.code ?? '',
            description: selected?.description ?? '',
            division_head_id: selected?.division_head_id ?? '',
            is_active: selected?.is_active ?? true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, practiceAreas]);

    const select = (id: number) => {
        setSelectedId(id);
        editForm.clearErrors();
    };

    const buildParams = (overrides: Record<string, unknown>) => {
        const params: Record<string, unknown> = {};
        const merged = { ...filters, ...overrides };
        if (merged.search) params.search = merged.search;
        if (merged.sort) params.sort = merged.sort;
        if (merged.direction) params.direction = merged.direction;
        return params;
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/private/admin/practice-areas', buildParams({ search: searchInput }), { preserveScroll: true });
    };

    const clearSearch = () => {
        setSearchInput('');
        router.get('/private/admin/practice-areas', buildParams({ search: null }), { preserveScroll: true });
    };

    const handleSort = (value: string) => {
        setSortValue(value);
        const [sort, direction] = value.split('-');
        router.get('/private/admin/practice-areas', buildParams({ sort, direction }), { preserveScroll: true });
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        const areaName = createForm.data.name;

        createForm.post('/private/admin/practice-areas', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Practice area created', {
                    description: `"${areaName}" is now available in enquiry and matter dropdowns.`,
                });
                createForm.reset();
                setShowCreateForm(false);
            },
            onError: (errors) => {
                toast.error('Could not create practice area', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedId === null) return;

        editForm.put(`/private/admin/practice-areas/${selectedId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Practice area updated', {
                    description: `${editForm.data.name} has been saved.`,
                });
            },
            onError: (errors) => {
                toast.error('Could not update practice area', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDelete = () => {
        if (selectedId === null) return;

        deleteForm.delete(`/private/admin/practice-areas/${selectedId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Practice area deleted', {
                    description: 'It has been permanently removed.',
                });
                setDeleteModalOpen(false);
                setSelectedId(null);
            },
            onError: (errors) => {
                toast.error('Could not delete practice area', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const isInUse = selected !== null && (selected.enquiries_count > 0 || selected.matters_count > 0);

    return (
        <>
            <Head title="Practice Areas" />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Practice Areas</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage the firm's divisions and their leadership.</p>
                </div>
                <Button variant="gold" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? 'Cancel' : '+ New Practice Area'}
                </Button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.form
                        onSubmit={submitCreate}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                    >
                        <Card>
                            <CardBody>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="Name"
                                        name="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        error={createForm.errors.name}
                                        placeholder="e.g. Intellectual Property"
                                    />
                                    <FormField
                                        label="Code"
                                        name="code"
                                        value={createForm.data.code}
                                        onChange={(e) => createForm.setData('code', e.target.value)}
                                        error={createForm.errors.code}
                                        placeholder="e.g. IP (max 10 chars)"
                                    />
                                    <FormField
                                        label="Description (optional)"
                                        name="description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        error={createForm.errors.description}
                                        placeholder="Short summary of the division"
                                    />
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-slate-700">Division Head</label>
                                        <select
                                            className={selectClasses}
                                            value={createForm.data.division_head_id}
                                            onChange={(e) => createForm.setData('division_head_id', e.target.value === '' ? '' : Number(e.target.value))}
                                        >
                                            <option value="">Unassigned</option>
                                            {divisionHeads.map((head) => (
                                                <option key={head.id} value={head.id}>
                                                    {head.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={createForm.data.is_active}
                                            onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-[#891920] focus:ring-[#891920]/50"
                                        />
                                        <span className="text-sm text-slate-700">Active (visible in dropdowns)</span>
                                    </label>
                                    <Button type="submit" variant="primary" isLoading={createForm.processing}>
                                        Create Practice Area
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Main layout: flexbox (bulletproof widths) */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Practice Area List */}
                <div className="w-full lg:w-80 shrink-0">
                    {/* Search and Sort */}
                    <div className="mb-4 space-y-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-grow">
                                <FormField
                                    placeholder="Search by name, code, or description…"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    }
                                />
                            </div>
                            {filters.search && (
                                <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                                    Clear
                                </Button>
                            )}
                        </form>
                        <select
                            value={sortValue}
                            onChange={(e) => handleSort(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="code-asc">Code (A-Z)</option>
                            <option value="code-desc">Code (Z-A)</option>
                            <option value="enquiries_count-desc">Most Enquiries</option>
                            <option value="matters_count-desc">Most Matters</option>
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                        </select>
                    </div>

                    {/* Practice Area Cards */}
                    <div className="space-y-2">
                        {practiceAreas.length > 0 ? (
                            practiceAreas.map((area) => (
                                <button
                                    key={area.id}
                                    onClick={() => select(area.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                        !area.is_active ? 'opacity-50' : ''
                                    } ${
                                        selectedId === area.id
                                            ? 'bg-[#891920] border-[#891920] text-white shadow-md'
                                            : 'bg-white border-slate-200 hover:border-[#D4AF37]/50 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-semibold truncate ${selectedId === area.id ? 'text-white' : 'text-slate-900'}`}>
                                            {area.name}
                                        </span>
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${selectedId === area.id ? 'bg-[#D4AF37] text-[#891920]' : 'bg-slate-100 text-slate-600'}`}>
                                            {area.code}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate mb-2 ${selectedId === area.id ? 'text-white/70' : 'text-slate-500'}`}>
                                        {area.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] ${selectedId === area.id ? 'text-white/70' : 'text-slate-400'}`}>
                                            {area.enquiries_count} enquiries · {area.matters_count} matters
                                        </span>
                                        {!area.is_active && <Badge color="danger">Inactive</Badge>}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No practice areas found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="w-full flex-grow min-w-0">
                    {selected ? (
                        <form onSubmit={submitEdit}>
                            <Card>
                                <CardHeader className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-serif font-bold text-slate-900">
                                            Edit: {selected.name}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            {selected.enquiries_count} enquiries · {selected.matters_count} matters currently in this division.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteModalOpen(true)}
                                            disabled={isInUse}
                                        >
                                            Delete
                                        </Button>
                                        <Button type="submit" variant="primary" size="sm" isLoading={editForm.processing}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            label="Name"
                                            name="name"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            error={editForm.errors.name}
                                        />
                                        <FormField
                                            label="Code"
                                            name="code"
                                            value={editForm.data.code}
                                            onChange={(e) => editForm.setData('code', e.target.value)}
                                            error={editForm.errors.code}
                                        />
                                        <FormField
                                            label="Description (optional)"
                                            name="description"
                                            value={editForm.data.description}
                                            onChange={(e) => editForm.setData('description', e.target.value)}
                                            error={editForm.errors.description}
                                        />
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-700">Division Head</label>
                                            <select
                                                className={selectClasses}
                                                value={editForm.data.division_head_id}
                                                onChange={(e) => editForm.setData('division_head_id', e.target.value === '' ? '' : Number(e.target.value))}
                                            >
                                                <option value="">Unassigned</option>
                                                {divisionHeads.map((head) => (
                                                    <option key={head.id} value={head.id}>
                                                        {head.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={editForm.data.is_active}
                                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-[#891920] focus:ring-[#891920]/50"
                                            />
                                            <span className="text-sm text-slate-700">
                                                Active (visible in enquiry and matter dropdowns)
                                            </span>
                                        </label>
                                        {isInUse && (
                                            <p className="mt-3 text-xs text-slate-500">
                                                This practice area is in use, so it cannot be deleted — but you can deactivate it to hide it from future dropdowns.
                                            </p>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </form>
                    ) : (
                        <Card>
                            <CardBody className="flex items-center justify-center h-64 text-slate-400">
                                Select a practice area from the left to edit it.
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Practice Area"
                message={`This will permanently delete "${selected?.name}". This action cannot be undone. Practice areas with enquiries or matters cannot be deleted.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
