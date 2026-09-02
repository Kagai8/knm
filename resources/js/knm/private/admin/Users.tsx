/* eslint-disable import/order */
/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable curly */
/* eslint-disable @stylistic/padding-line-between-statements */
import { useEffect, useState, type FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardBody, CardHeader, FormField, Badge, ConfirmModal, toast } from '@/knm/shared/ui';

interface RoleItem {
    id: number;
    name: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    is_super_admin: boolean;
    is_disabled: boolean;
    assigned_role: RoleItem | null;
}

interface Props {
    users: UserItem[];
    roles: RoleItem[];
    currentUserId: number;
    filters: {
        search: string | null;
        sort: string;
        direction: string;
    };
}

const selectClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 hover:border-slate-400 focus:border-[#891920] focus:outline-none focus:ring-2 focus:ring-[#891920]/20';

const initials = (name: string) =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export default function Users({ users, roles, currentUserId, filters }: Props) {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(users[0]?.id ?? null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [sortValue, setSortValue] = useState(`${filters.sort}-${filters.direction}`);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [disableModalOpen, setDisableModalOpen] = useState(false);

    const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '' as string | number,
        is_super_admin: false,
    });

    const editForm = useForm({
        name: '',
        email: '',
        role_id: '' as string | number,
        is_super_admin: false,
        password: '',
    });

    const disableForm = useForm({});
    const deleteForm = useForm({});

    // Keep the edit form in sync with the selected user and fresh server data
    useEffect(() => {
        editForm.setData({
            name: selectedUser?.name ?? '',
            email: selectedUser?.email ?? '',
            role_id: selectedUser?.role_id ?? '',
            is_super_admin: selectedUser?.is_super_admin ?? false,
            password: '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserId, users]);

    const selectUser = (id: number) => {
        setSelectedUserId(id);
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
        router.get('/private/admin/users', buildParams({ search: searchInput }), { preserveScroll: true });
    };

    const clearSearch = () => {
        setSearchInput('');
        router.get('/private/admin/users', buildParams({ search: null }), { preserveScroll: true });
    };

    const handleSort = (value: string) => {
        setSortValue(value);
        const [sort, direction] = value.split('-');
        router.get('/private/admin/users', buildParams({ sort, direction }), { preserveScroll: true });
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        const userName = createForm.data.name;

        createForm.post('/private/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User created', {
                    description: `${userName} can now sign in with their assigned role.`,
                });
                createForm.reset();
                setShowCreateForm(false);
            },
            onError: (errors) => {
                toast.error('Could not create user', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedUserId === null) return;

        editForm.put(`/private/admin/users/${selectedUserId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User updated', {
                    description: `${editForm.data.name}'s profile has been saved.`,
                });
            },
            onError: (errors) => {
                toast.error('Could not update user', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDisable = () => {
        if (selectedUserId === null) return;
        disableForm.post(`/private/admin/users/${selectedUserId}/disable`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User disabled', {
                    description: `${selectedUser?.name} can no longer sign in.`,
                });
                setDisableModalOpen(false);
            },
            onError: (errors) => {
                toast.error('Could not disable user', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleEnable = () => {
        if (selectedUserId === null) return;
        disableForm.post(`/private/admin/users/${selectedUserId}/enable`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User enabled', {
                    description: `${selectedUser?.name} can now sign in.`,
                });
            },
            onError: (errors) => {
                toast.error('Could not enable user', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDelete = () => {
        if (selectedUserId === null) return;
        deleteForm.delete(`/private/admin/users/${selectedUserId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User deleted', {
                    description: 'The account has been permanently removed.',
                });
                setDeleteModalOpen(false);
                setSelectedUserId(users[0]?.id ?? null);
            },
            onError: (errors) => {
                toast.error('Could not delete user', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    return (
        <>
            <Head title="User Management" />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">User Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Create staff accounts and assign dynamic roles.</p>
                </div>
                <Button variant="gold" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? 'Cancel' : '+ New User'}
                </Button>
            </div>

            {/* Create User Form */}
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
                                        label="Full Name"
                                        name="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        error={createForm.errors.name}
                                        placeholder="e.g. Grace Wanjiru"
                                    />
                                    <FormField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        error={createForm.errors.email}
                                        placeholder="e.g. grace@knmadvocates.co.ke"
                                    />
                                    <FormField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        error={createForm.errors.password}
                                        placeholder="Minimum 8 characters"
                                    />
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-slate-700">Role</label>
                                        <select
                                            className={selectClasses}
                                            value={createForm.data.role_id}
                                            onChange={(e) => createForm.setData('role_id', Number(e.target.value))}
                                        >
                                            <option value="">Select a role…</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        {createForm.errors.role_id && (
                                            <p className="text-xs text-red-600 mt-1">{createForm.errors.role_id}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={createForm.data.is_super_admin}
                                            onChange={(e) => createForm.setData('is_super_admin', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-[#891920] focus:ring-[#891920]/50"
                                        />
                                        <span className="text-sm text-slate-700">Grant super admin bypass</span>
                                    </label>
                                    <Button type="submit" variant="primary" isLoading={createForm.processing}>
                                        Create User
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Main layout: flexbox (bulletproof widths) */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: User List */}
                <div className="w-full lg:w-80 shrink-0">
                    {/* Search and Sort */}
                    <div className="mb-4 space-y-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-grow">
                                <FormField
                                    placeholder="Search by name or email…"
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
                            <option value="email-asc">Email (A-Z)</option>
                            <option value="email-desc">Email (Z-A)</option>
                            <option value="role-asc">Role (A-Z)</option>
                            <option value="role-desc">Role (Z-A)</option>
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                        </select>
                    </div>

                    {/* User Cards */}
                    <div className="space-y-2">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                        user.is_disabled ? 'opacity-50' : ''
                                    } ${
                                        selectedUserId === user.id
                                            ? 'bg-[#891920] border-[#891920] text-white shadow-md'
                                            : 'bg-white border-slate-200 hover:border-[#D4AF37]/50 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0 ${
                                                selectedUserId === user.id
                                                    ? 'bg-[#D4AF37] text-[#891920]'
                                                    : 'bg-[#891920]/10 text-[#891920]'
                                            }`}
                                        >
                                            {initials(user.name)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold truncate ${selectedUserId === user.id ? 'text-white' : 'text-slate-900'}`}>
                                                    {user.name}
                                                </span>
                                                {user.id === currentUserId && (
                                                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${selectedUserId === user.id ? 'bg-white/20 text-white' : 'bg-[#D4AF37]/10 text-[#891920] border border-[#D4AF37]/30'}`}>
                                                        You
                                                    </span>
                                                )}
                                                {user.is_super_admin && (
                                                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${selectedUserId === user.id ? 'bg-[#D4AF37] text-[#891920]' : 'bg-[#891920] text-white'}`}>
                                                        SA
                                                    </span>
                                                )}
                                                {user.is_disabled && (
                                                    <Badge color="danger">Disabled</Badge>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate ${selectedUserId === user.id ? 'text-white/70' : 'text-slate-500'}`}>
                                                {user.assigned_role?.name ?? 'No role'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No users found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="w-full flex-grow min-w-0">
                    {selectedUser ? (
                        <form onSubmit={submitEdit}>
                            <Card>
                                <CardHeader className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-serif font-bold text-slate-900">
                                            Edit: {selectedUser.name}
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Update profile details, role assignment, and access level.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedUser.is_disabled ? (
                                            <Button type="button" variant="secondary" size="sm" onClick={handleEnable} isLoading={disableForm.processing}>
                                                Enable
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setDisableModalOpen(true)}
                                                disabled={selectedUser.id === currentUserId}
                                            >
                                                Disable
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteModalOpen(true)}
                                            disabled={selectedUser.id === currentUserId}
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
                                            label="Full Name"
                                            name="name"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            error={editForm.errors.name}
                                        />
                                        <FormField
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            error={editForm.errors.email}
                                        />
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-700">Role</label>
                                            <select
                                                className={selectClasses}
                                                value={editForm.data.role_id}
                                                onChange={(e) => editForm.setData('role_id', Number(e.target.value))}
                                            >
                                                <option value="">Select a role…</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {editForm.errors.role_id && (
                                                <p className="text-xs text-red-600 mt-1">{editForm.errors.role_id}</p>
                                            )}
                                        </div>
                                        <FormField
                                            label="New Password (optional)"
                                            name="password"
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            error={editForm.errors.password}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={editForm.data.is_super_admin}
                                                onChange={(e) => editForm.setData('is_super_admin', e.target.checked)}
                                                disabled={selectedUser.id === currentUserId}
                                                className="h-4 w-4 rounded border-slate-300 text-[#891920] focus:ring-[#891920]/50 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-slate-700">
                                                Grant super admin bypass
                                                {selectedUser.id === currentUserId && (
                                                    <span className="text-xs text-slate-400 ml-2">(cannot be removed from your own account)</span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </CardBody>
                            </Card>
                        </form>
                    ) : (
                        <Card>
                            <CardBody className="flex items-center justify-center h-64 text-slate-400">
                                Select a user from the left to edit their profile.
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Disable Confirmation Modal */}
            <ConfirmModal
                isOpen={disableModalOpen}
                onClose={() => setDisableModalOpen(false)}
                onConfirm={handleDisable}
                title="Disable User"
                message={`${selectedUser?.name} will be unable to sign in. Their history and assignments will be preserved. You can re-enable them later.`}
                confirmLabel="Disable User"
                variant="warning"
                isLoading={disableForm.processing}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`This will permanently delete ${selectedUser?.name}'s account. This action cannot be undone. Users with assigned enquiries or matters cannot be deleted.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
