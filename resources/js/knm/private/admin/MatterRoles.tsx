/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable import/order */
/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable curly */
import { useState, type FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, FormField, Modal, toast } from '@/knm/shared/ui';
import { useAuth } from '@/knm/shared/hooks/useAuth';

interface MatterRole {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    matters_count: number;
}

interface Props {
    roles: MatterRole[];
}

export default function MatterRoles({ roles }: Props) {
    const { can } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<MatterRole | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<MatterRole | null>(null);

    const form = useForm({
        name: '',
        is_active: true,
    });

    const deleteForm = useForm({});

    const openCreateModal = () => {
        setEditingRole(null);
        form.reset();
        form.clearErrors();
        form.setData('name', '');
        form.setData('is_active', true);
        setModalOpen(true);
    };

    const openEditModal = (role: MatterRole) => {
        setEditingRole(role);
        form.clearErrors();
        form.setData({
            name: role.name,
            is_active: role.is_active,
        });
        setModalOpen(true);
    };

    const openDeleteModal = (role: MatterRole) => {
        setDeleteTarget(role);
        setDeleteModalOpen(true);
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();
        const isEditing = editingRole !== null;
        const url = isEditing ? `/private/admin/matter-roles/${editingRole.id}` : '/private/admin/matter-roles';
        const method = isEditing ? 'put' : 'post';

        form.submit(method, url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? 'Role updated' : 'Role created', {
                    description: `${form.data.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
                });
                setModalOpen(false);
                if (!isEditing) form.reset();
            },
            onError: (errors) => {
                toast.error(isEditing ? 'Could not update role' : 'Could not create role', {
                    description: Object.values(errors).flat().join(' '),
                });
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        deleteForm.delete(`/private/admin/matter-roles/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role deleted', { description: `${deleteTarget.name} has been permanently removed.` });
                setDeleteModalOpen(false);
                setDeleteTarget(null);
            },
            onError: (errors) => {
                toast.error('Could not delete role', { description: Object.values(errors).flat().join(' ') });
                setDeleteModalOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Matter Roles · Admin · K&A Internal" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Matter Roles</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Define the specific hats staff wear when assigned to a matter (e.g., Lead Advocate, Paralegal).
                    </p>
                </div>
                {can('matter_roles.manage') && (
                    <Button variant="gold" onClick={openCreateModal}>
                        + New Role
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-serif font-bold text-slate-900">Defined Roles</h2>
                    <p className="text-xs text-slate-500">{roles.length} role{roles.length === 1 ? '' : 's'} configured.</p>
                </CardHeader>
                <CardBody className="p-0">
                    {roles.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {roles.map((role, idx) => (
                                <motion.div
                                    key={role.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2.5 h-2.5 rounded-full ${role.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-300'}`} />
                                        <div>
                                            <div className="font-semibold text-slate-900">{role.name}</div>
                                            <div className="font-mono text-xs text-slate-400 mt-0.5">{role.code}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge color={role.is_active ? 'success' : 'neutral'} dot>
                                            {role.is_active ? 'Active' : 'Inactive'}
                                        </Badge>

                                        {role.matters_count > 0 && (
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                                {role.matters_count} assigned
                                            </span>
                                        )}

                                        {can('matter_roles.manage') && (
                                            <div className="flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(role)}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => openDeleteModal(role)}
                                                    disabled={role.matters_count > 0}
                                                    title={role.matters_count > 0 ? "Cannot delete: role is in use" : "Delete role"}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-serif font-bold text-slate-900">No roles defined yet</h3>
                            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                                Create your first matter role to start assigning team members to specific responsibilities.
                            </p>
                            {can('matter_roles.manage') && (
                                <div className="mt-6">
                                    <Button variant="primary" onClick={openCreateModal}>
                                        + Create First Role
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Create / Edit Role Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingRole ? 'Edit Matter Role' : 'New Matter Role'}
                subtitle={editingRole ? `Updating details for ${editingRole.name}` : 'Define a new role that staff can hold on a matter.'}
                size="sm"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={form.processing} onClick={submitForm as any}>
                            {editingRole ? 'Save Changes' : 'Create Role'}
                        </Button>
                    </>
                }
            >
                <form id="role-form" onSubmit={submitForm} className="space-y-6">
                    <FormField
                        label="Role Name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                        placeholder="e.g. Supervising Partner"
                        hint="The machine code (e.g., supervising_partner) will be generated automatically."
                    />

                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div>
                            <label className="block text-sm font-medium text-slate-900">Active Status</label>
                            <p className="text-xs text-slate-500 mt-0.5">Inactive roles won't appear when assigning new team members.</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                            />
                            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#891920]/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#891920]"></div>
                        </label>
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
                title="Delete Matter Role"
                message={`This will permanently delete the "${deleteTarget?.name}" role. This action cannot be undone. Roles currently assigned to team members cannot be deleted.`}
                confirmLabel="Delete Permanently"
                variant="danger"
                isLoading={deleteForm.processing}
            />
        </>
    );
}
