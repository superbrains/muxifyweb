import React from 'react';
import { Box, Button, Flex, HStack, Spinner, Text } from '@chakra-ui/react';
import { FiUserCheck } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    IdentityCell,
    type DataColumn,
} from '@shared/console';
import { ManagementDialog } from '../../components/management/ManagementDialog';
import {
    useAdmins,
    useChangeAdminRole,
    useHasPermission,
    useRoles,
} from '../../hooks/useAdminManagement';
import { PLATFORM_ROLES, type PlatformRole } from '../../config/adminRoles';
import type {
    AdminListItemDto,
    AdminRoleDto,
} from '../../services/adminManagementService';

const selectStyles = {
    width: '100%',
    fontSize: '12px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--chakra-colors-gray-200)',
    background: 'white',
    color: 'var(--chakra-colors-gray-800)',
} as const;

const ScopePills: React.FC<{ scopedRoles: string[] }> = ({ scopedRoles }) => {
    if (scopedRoles.length === 0) {
        return (
            <Text fontSize="10px" color="gray.500" fontStyle="italic">
                All roles
            </Text>
        );
    }
    return (
        <Flex flexWrap="wrap" gap={1} maxW="320px">
            {scopedRoles.map((r) => {
                const meta = PLATFORM_ROLES[r as PlatformRole];
                return (
                    <Text
                        key={r}
                        fontSize="10px"
                        fontWeight="medium"
                        color="gray.700"
                        bg="gray.100"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                    >
                        {meta?.plural ?? r}
                    </Text>
                );
            })}
        </Flex>
    );
};

interface AssignDialogProps {
    admin: AdminListItemDto | null;
    roles: AdminRoleDto[];
    onClose: () => void;
}

const AssignRoleDialog: React.FC<AssignDialogProps> = ({ admin, roles, onClose }) => {
    const changeRole = useChangeAdminRole();
    const [roleId, setRoleId] = React.useState('');

    React.useEffect(() => {
        setRoleId(admin?.roleId ?? '');
    }, [admin]);

    const assignableRoles = roles.filter((r) => r.isActive);
    const canSave = !!admin && !!roleId && roleId !== admin.roleId && !changeRole.isPending;

    const handleSave = () => {
        if (!admin || !canSave) return;
        changeRole.mutate({ userId: admin.userId, roleId }, { onSuccess: onClose });
    };

    return (
        <ManagementDialog
            isOpen={admin !== null}
            onClose={onClose}
            title="Assign to a role"
            subtitle={admin ? `Choose the role for ${admin.name}.` : undefined}
            footer={
                <>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        size="sm"
                        fontSize="xs"
                        borderRadius="10px"
                        disabled={changeRole.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        bg="primary.500"
                        color="white"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="10px"
                        disabled={!canSave}
                        _hover={{ bg: 'primary.600' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        {changeRole.isPending ? <Spinner size="xs" /> : 'Assign role'}
                    </Button>
                </>
            }
        >
            <Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                    Role
                </Text>
                <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    style={selectStyles}
                >
                    <option value="">Select a role…</option>
                    {assignableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                            {role.isSystemRole ? ' (full access)' : ''}
                        </option>
                    ))}
                </select>
                <Text fontSize="10px" color="gray.500" mt={1.5}>
                    The assigned role decides this staff member's permissions and which platform
                    roles they operate on.
                </Text>
            </Box>
        </ManagementDialog>
    );
};

/**
 * Staff Assignment — assign a staff member to a role and see, at a glance, the
 * role each admin holds plus the platform roles that role is scoped to. Split
 * out of the legacy tabbed Admin Management page into its own route.
 */
const StaffAssignmentPage: React.FC = () => {
    const admins = useAdmins();
    const roles = useRoles();
    const canManage = useHasPermission('ManagementManageAdmins');

    const [assignTarget, setAssignTarget] = React.useState<AdminListItemDto | null>(null);

    const roleById = React.useMemo(() => {
        const map = new Map<string, AdminRoleDto>();
        (roles.data ?? []).forEach((r) => map.set(r.id, r));
        return map;
    }, [roles.data]);

    const columns: DataColumn<AdminListItemDto>[] = [
        {
            key: 'admin',
            header: 'Admin',
            render: (a) => (
                <IdentityCell name={a.name} secondary={a.email} avatarUrl={a.avatarUrl ?? undefined} />
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (a) => (
                <Text
                    fontSize="10px"
                    fontWeight="semibold"
                    color={a.isSuperAdmin ? 'primary.600' : 'gray.700'}
                    bg={a.isSuperAdmin ? 'primary.50' : 'gray.100'}
                    px={2}
                    py={1}
                    borderRadius="full"
                    w="fit-content"
                >
                    {a.isSuperAdmin ? 'Super Admin' : a.roleName ?? 'No role'}
                </Text>
            ),
        },
        {
            key: 'scope',
            header: 'Operates on',
            render: (a) => {
                if (a.isSuperAdmin) {
                    return (
                        <Text fontSize="10px" color="gray.500" fontStyle="italic">
                            All roles
                        </Text>
                    );
                }
                const role = a.roleId ? roleById.get(a.roleId) : undefined;
                return <ScopePills scopedRoles={role?.scopedRoles ?? []} />;
            },
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '120px',
            render: (a) =>
                canManage && !a.isSuperAdmin ? (
                    <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            fontSize="11px"
                            borderRadius="8px"
                            onClick={() => setAssignTarget(a)}
                        >
                            Assign role
                        </Button>
                    </Box>
                ) : null,
        },
    ];

    return (
        <AdminPageLayout
            title="Staff Assignment"
            subtitle="Assign staff to roles and review the platform roles each one operates on"
            breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Staff Assignment' }]}
        >
            <HStack justify="flex-start" mb={1}>
                <Text fontSize="11px" color="gray.600">
                    A staff member's assigned role determines their permissions and role scope.
                </Text>
            </HStack>

            {admins.error ? (
                <AdminError error={admins.error} message="Could not load admins." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={admins.data ?? []}
                    rowKey={(a) => a.userId}
                    onRowClick={canManage ? (a) => !a.isSuperAdmin && setAssignTarget(a) : undefined}
                    loading={admins.isLoading && !admins.data}
                    emptyIcon={FiUserCheck}
                    emptyTitle="No admins yet"
                    emptyDescription="Invite staff from the Admin Team page to start assigning roles."
                />
            )}

            <AssignRoleDialog
                admin={assignTarget}
                roles={roles.data ?? []}
                onClose={() => setAssignTarget(null)}
            />
        </AdminPageLayout>
    );
};

export default StaffAssignmentPage;
