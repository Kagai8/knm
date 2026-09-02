/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable import/order */
import { useEffect, useState, type FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Button, Card, CardBody, CardHeader, FormField, ConfirmModal } from '@/knm/shared/ui';

interface Role {
    id: number;
    name: string;
    description: string | null;
    users_count: number;
}

interface PermissionItem {
    value: string;
    label: string;
}

interface Props {
    roles: Role[];
    groupedPermissions: Record<string, PermissionItem[]>;
    rolePermissions: Record<number, string[]>;
    filters: {
        search: string | null;
        sort: string;
        direction: string;
    };
}

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

export default function Roles({ roles, groupedPermissions, rolePermissions, filters }: Props) {
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(roles[0]?.id ?? null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [sortValue, setSortValue] = useState(`${filters.sort}-${filters.direction}`);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

    // Form for updating permissions
    const permForm = useForm({
        permissions: (selectedRoleId !== null ? rolePermissions[selectedRoleId] : undefined) ?? [],
    });

    // Form for creating a new role
    const createForm = useForm({
        name: '',
        description: '',
    });

    const deleteForm = useForm({});

    // Keep the checkbox form in sync with the selection and fresh server data
    useEffect(() => {
        permForm.setData(
            'permissions',
            (selectedRoleId !== null ? rolePermissions[selectedRoleId] : undefined) ?? []
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoleId, rolePermissions]);

    const selectRole = (id: number) => {
        setSelectedRoleId(id);
        permForm.clearErrors();
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
        router.get('/private/admin/roles', buildParams({ search: searchInput }), { preserveScroll: true });
    };

    const clearSearch = () => {
        setSearchInput('');
        router.get('/private/admin/roles', buildParams({ search: null }), { preserveScroll: true });
    };

    const handleSort = (value: string) => {
        setSortValue(value);
        const [sort, direction] = value.split('-');
        router.get('/private/admin/roles', buildParams({ sort, direction }), { preserveScroll: true });
    };

    const handlePermissionToggle = (permValue: string) => {
        const current = permForm.data.permissions;
        permForm.setData(
            'permissions',
            current.includes(permValue)
                ? current.filter((p) => p !== permValue)
                : [...current, permValue]
        );
    };

    const submitPermissions = (e: FormEvent) => {
        e.preventDefault();
        if (selectedRoleId === null) return;

        permForm.put(`/private/admin/roles/${selectedRoleId}/permissions`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permissions updated', {
                    description: `${selectedRole?.name ?? 'Role'} now has ${permForm.data.permissions.length} permission${permForm.data.permissions.length === 1 ? '' : 's'}.`,
                });
            },
            onError: (errors) => {
                toast.error('Could not update permissions', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const submitCreateRole = (e: FormEvent) => {
        e.preventDefault();
        const roleName = createForm.data.name;

        createForm.post('/private/admin/roles', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role created', {
                    description: `"${roleName}" has been added to the role list.`,
                });
                createForm.reset();
                setShowCreateForm(false);
            },
            onError: (errors) => {
                toast.error('Could not create role', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDelete = () => {
        if (selectedRoleId === null) return;
        deleteForm.delete(`/private/admin/roles/${selectedRoleId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role deleted', {
                    description: `${selectedRole?.name} has been permanently removed.`,
                });
                setDeleteModalOpen(false);
                setSelectedRoleId(roles[0]?.id ?? null);
            },
            onError: (errors) => {
                toast.error('Could not delete role', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    return (
        <>
            <Head title="Role Management" />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Role Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage dynamic roles and assign technical permissions.</p>
                </div>
                <Button variant="gold" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? 'Cancel' : '+ New Role'}
                </Button>
            </div>

            {/* Create Role Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.form
                        onSubmit={submitCreateRole}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                    >
                        <Card>
                            <CardBody>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="Role Name"
                                        name="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        error={createForm.errors.name}
                                        placeholder="e.g. Paralegal"
                                    />
                                    <FormField
                                        label="Description"
                                        name="description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder="Optional description"
                                    />
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <span />
                                    <Button type="submit" variant="primary" isLoading={createForm.processing}>
                                        Create Role
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Main layout: flexbox (bulletproof widths) */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Role List */}
                <div className="w-full lg:w-80 shrink-0">
                    {/* Search and Sort */}
                    <div className="mb-4 space-y-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-grow">
                                <FormField
                                    placeholder="Search roles…"
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
                            <option value="users_count-desc">Most Users</option>
                            <option value="users_count-asc">Fewest Users</option>
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                        </select>
                    </div>

                    {/* Role Cards */}
                    <div className="space-y-2">
                        {roles.length > 0 ? (
                            roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => selectRole(role.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                        selectedRoleId === role.id
                                            ? 'bg-[#891920] border-[#891920] text-white shadow-md'
                                            : 'bg-white border-slate-200 hover:border-[#D4AF37]/50 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-semibold ${selectedRoleId === role.id ? 'text-white' : 'text-slate-900'}`}>
                                            {role.name}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedRoleId === role.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {role.users_count} users
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${selectedRoleId === role.id ? 'text-white/70' : 'text-slate-500'}`}>
                                        {role.description || 'No description'}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No roles found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Permission Matrix */}
                <div className="w-full flex-grow min-w-0">
                    {selectedRole ? (
                        <form onSubmit={submitPermissions}>
                            <Card>
                                <CardHeader className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-serif font-bold text-slate-900">
                                            Permissions: {selectedRole.name}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Select the capabilities this role is allowed to perform.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteModalOpen(true)}
                                            disabled={selectedRole.users_count > 0}
                                        >
                                            Delete Role
                                        </Button>
                                        <Button type="submit" variant="primary" size="sm" isLoading={permForm.processing}>
                                            Save Permissions
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-6">
                                        {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                            <div key={group}>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-1">
                                                    {group}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {permissions.map((perm) => {
                                                        const isChecked = permForm.data.permissions.includes(perm.value);
                                                        return (
                                                            <label
                                                                key={perm.value}
                                                                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                                                    isChecked
                                                                        ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                                                                        : 'hover:bg-slate-50 border border-transparent'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handlePermissionToggle(perm.value)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-[#891920] focus:ring-[#891920]/50"
                                                                />
                                                                <span className={`text-sm ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                                                    {perm.label}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        </form>
                    ) : (
                        <Card>
                            <CardBody className="flex items-center justify-center h-64 text-slate-400">
                                Select a role from the left to manage its permissions.
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
                title="Delete Role"
                message={`This will permanently delete "${selectedRole?.name}" and all its permission assignments. This action cannot be undone. Roles with assigned users cannot be deleted.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
