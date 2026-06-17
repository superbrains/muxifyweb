import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../components/ui';
import type { DataColumn, KpiItem } from '../components/ui';
import { CustomMenu, ConfirmModal } from '@shared/components';
import { useActivateUser, useSuspendUser, useUsers, useUsersSummary } from '../hooks/useUsers';
import { useUserDeleteActions } from '../components/users/useUserDeleteActions';
import { roleLabel } from '../lib/statusColor';
import { adminDate, adminRelative, formatCount } from '../lib/format';
import { PLATFORM_ROLES } from '../config/adminRoles';
import {
    ROLE_STATUS_OPTIONS,
    ROLE_VERIFICATION_OPTIONS,
} from './users/useRoleUsers';
import type { AdminUserDto, UserQuery } from '../types';

const PAGE_SIZE = 15;

const ROLE_OPTIONS = [
    { value: 'All', label: 'All roles' },
    ...Object.values(PLATFORM_ROLES).map((m) => ({ value: m.role, label: m.plural })),
];

/** Universal user directory — every platform role in one filterable table. */
const UsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState<UserQuery>({
        role: 'All',
        status: 'All',
        verification: 'All',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [suspendTarget, setSuspendTarget] = React.useState<AdminUserDto | null>(null);
    const [activateTarget, setActivateTarget] = React.useState<AdminUserDto | null>(null);

    const { data, isLoading, error } = useUsers(query);
    const { data: summary } = useUsersSummary(
        query.role && query.role !== 'All' ? query.role : undefined,
    );
    const suspend = useSuspendUser();
    const activate = useActivateUser();
    const deleteActions = useUserDeleteActions();

    const kpiItems: KpiItem[] = [
        { label: 'Total users', value: formatCount(summary?.total) },
        { label: 'Active', value: formatCount(summary?.active) },
        { label: 'Suspended', value: formatCount(summary?.suspended) },
        { label: 'Verified', value: formatCount(summary?.verified) },
        { label: 'New (30d)', value: formatCount(summary?.newLast30Days) },
    ];

    const columns: DataColumn<AdminUserDto>[] = [
        {
            key: 'user',
            header: 'User',
            render: (u) => (
                <IdentityCell name={u.name} secondary={u.email} avatarUrl={u.avatarUrl} />
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (u) => (
                <Box
                    bg="gray.100"
                    color="gray.700"
                    fontSize="10px"
                    fontWeight="semibold"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    display="inline-block"
                >
                    {roleLabel(u.role)}
                </Box>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (u) => <StatusBadge status={u.status} />,
        },
        {
            key: 'verified',
            header: 'Verified',
            render: (u) => (
                <Text fontSize="xs" color={u.isVerified ? 'green.600' : 'gray.400'}>
                    {u.isVerified ? 'Yes' : 'No'}
                </Text>
            ),
        },
        {
            key: 'joined',
            header: 'Joined',
            render: (u) => (
                <Text fontSize="xs" color="gray.600">
                    {adminDate(u.createdAt)}
                </Text>
            ),
        },
        {
            key: 'lastActive',
            header: 'Last active',
            render: (u) => (
                <Text fontSize="xs" color="gray.500" title={u.lastActiveAt ?? undefined}>
                    {adminRelative(u.lastActiveAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '56px',
            render: (u) => (
                <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                    <CustomMenu
                        options={[
                            {
                                label: 'View profile',
                                value: 'view',
                                onClick: () => navigate(`/admin/users/${u.id}`),
                            },
                            ...(u.isDeleted
                                ? []
                                : [
                                      u.status === 'Suspended'
                                          ? {
                                                label: 'Reactivate account',
                                                value: 'activate',
                                                onClick: () => setActivateTarget(u),
                                            }
                                          : {
                                                label: 'Suspend account',
                                                value: 'suspend',
                                                color: '#C53030',
                                                onClick: () => setSuspendTarget(u),
                                            },
                                  ]),
                            ...deleteActions.menuOptions(u),
                        ]}
                    />
                </Box>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="User Management"
            subtitle="Browse and manage every account across all platform roles"
            breadcrumbs={[{ label: 'Users & Roles' }, { label: 'All Users' }]}
        >
            <KpiStrip items={kpiItems} columns={{ base: 2, md: 3, xl: 5 }} />

            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by name or email',
                }}
                filters={[
                    {
                        key: 'role',
                        value: (query.role ?? 'All') as string,
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, role: v as UserQuery['role'], page: 1 })),
                        options: ROLE_OPTIONS,
                        width: '170px',
                    },
                    {
                        key: 'status',
                        value: (query.status ?? 'All') as string,
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, status: v as UserQuery['status'], page: 1 })),
                        options: ROLE_STATUS_OPTIONS,
                    },
                    {
                        key: 'verification',
                        value: (query.verification ?? 'All') as string,
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                verification: v as UserQuery['verification'],
                                page: 1,
                            })),
                        options: ROLE_VERIFICATION_OPTIONS,
                        width: '160px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load users." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(u) => u.id}
                    onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
                    loading={isLoading && !data}
                    emptyIcon={FiUsers}
                    emptyTitle="No users found"
                    emptyDescription="Nothing matches the current filters."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            <ConfirmActionModal
                isOpen={suspendTarget !== null}
                onClose={() => setSuspendTarget(null)}
                onConfirm={(reason) =>
                    suspendTarget &&
                    suspend.mutate(
                        { userId: suspendTarget.id, reason },
                        { onSuccess: () => setSuspendTarget(null) },
                    )
                }
                title={`Suspend ${suspendTarget?.name ?? 'account'}`}
                message="The user will be signed out and blocked from signing in until reactivated."
                reasonLabel="Suspension reason"
                placeholder="e.g. Repeated violations of the content policy after warnings."
                confirmText="Suspend account"
                tone="danger"
                isLoading={suspend.isPending}
            />

            <ConfirmModal
                isOpen={activateTarget !== null}
                onClose={() => setActivateTarget(null)}
                onConfirm={() =>
                    activateTarget &&
                    activate.mutate(activateTarget.id, {
                        onSuccess: () => setActivateTarget(null),
                    })
                }
                title="Reactivate account?"
                message={`${activateTarget?.name ?? 'This user'} will be able to sign in again immediately.`}
                confirmText="Reactivate"
                confirmColor="blue"
                isLoading={activate.isPending}
            />

            {deleteActions.modals}
        </AdminPageLayout>
    );
};

export default UsersPage;
