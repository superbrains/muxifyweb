import React from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { CustomMenu, ConfirmModal } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { AdminError, AdminLoading } from '../AdminStateBlock';
import { RoleEditorModal } from './RoleEditorModal';
import { useDeleteRole, useHasPermission, useRoles } from '../../hooks/useAdminManagement';
import type { AdminRoleDto } from '../../services/adminManagementService';

/** "Roles" tab — list, create, edit and delete custom admin roles. */
export const RolesTab: React.FC = () => {
    const { data: roles, isLoading, error } = useRoles();
    const canManage = useHasPermission('ManagementManageRoles');
    const deleteRole = useDeleteRole();

    const [editorOpen, setEditorOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<AdminRoleDto | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<AdminRoleDto | null>(null);

    const openCreate = () => {
        setEditing(null);
        setEditorOpen(true);
    };
    const openEdit = (role: AdminRoleDto) => {
        setEditing(role);
        setEditorOpen(true);
    };

    const columns: AdminTableColumn<AdminRoleDto>[] = [
        {
            key: 'name',
            header: 'Role',
            render: (r) => (
                <HStack gap={2}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                        {r.name}
                    </Text>
                    {r.isSystemRole && (
                        <Text
                            fontSize="9px"
                            fontWeight="bold"
                            textTransform="uppercase"
                            color="primary.600"
                            bg="primary.50"
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                        >
                            System
                        </Text>
                    )}
                </HStack>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (r) => (
                <Text fontSize="xs" color="gray.600" lineClamp={1} maxW="280px">
                    {r.description || '—'}
                </Text>
            ),
        },
        {
            key: 'permissions',
            header: 'Permissions',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {r.isSystemRole ? 'All' : r.permissions.length}
                </Text>
            ),
        },
        {
            key: 'assigned',
            header: 'Admins',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {r.assignedUserCount}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '56px',
            render: (r) =>
                canManage && !r.isSystemRole ? (
                    <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                        <CustomMenu
                            options={[
                                { label: 'Edit role', value: 'edit', onClick: () => openEdit(r) },
                                {
                                    label: 'Delete role',
                                    value: 'delete',
                                    color: '#C53030',
                                    onClick: () => setDeleteTarget(r),
                                },
                            ]}
                        />
                    </Box>
                ) : null,
        },
    ];

    return (
        <Box>
            <HStack justify="space-between" mb={3}>
                <Text fontSize="11px" color="gray.600">
                    Roles bundle permissions you can assign to admins.
                </Text>
                {canManage && (
                    <Button
                        onClick={openCreate}
                        size="xs"
                        bg="primary.500"
                        color="white"
                        fontSize="xs"
                        borderRadius="8px"
                        _hover={{ bg: 'primary.600' }}
                    >
                        <FiPlus />
                        Create role
                    </Button>
                )}
            </HStack>

            {isLoading && !roles ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message="Could not load roles." />
            ) : (
                <AdminTable
                    columns={columns}
                    rows={roles ?? []}
                    rowKey={(r) => r.id}
                    onRowClick={canManage ? (r) => !r.isSystemRole && openEdit(r) : undefined}
                    emptyTitle="No roles yet"
                    emptyDescription="Create your first role to start scoping admin access."
                />
            )}

            <RoleEditorModal
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                role={editing}
            />

            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    deleteRole.mutate(deleteTarget.id, {
                        onSuccess: () => setDeleteTarget(null),
                    });
                }}
                title="Delete role?"
                message={`“${deleteTarget?.name ?? ''}” will be permanently removed. Admins must not be assigned to it.`}
                confirmText="Delete role"
                confirmColor="red"
                isLoading={deleteRole.isPending}
            />
        </Box>
    );
};
