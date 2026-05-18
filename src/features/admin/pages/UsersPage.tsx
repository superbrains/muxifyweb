import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminError, AdminLoading } from '../components/AdminStateBlock';
import { AdminTable, type AdminTableColumn } from '../components/AdminTable';
import { Paginator } from '../components/Paginator';
import { StatusBadge } from '../components/StatusBadge';
import { IdentityCell } from '../components/IdentityCell';
import { ReasonDialog } from '../components/ReasonDialog';
import { UsersFilterBar } from '../components/users/UsersFilterBar';
import { CustomMenu, ConfirmModal } from '@shared/components';
import { useActivateUser, useSuspendUser, useUsers } from '../hooks/useUsers';
import { accountStatusStyle, roleLabel } from '../lib/statusColor';
import { adminDate } from '../lib/format';
import type { AdminUserDto, UserQuery } from '../types';

const PAGE_SIZE = 15;

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
    const suspend = useSuspendUser();
    const activate = useActivateUser();

    const columns: AdminTableColumn<AdminUserDto>[] = [
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
                <Text fontSize="xs" color="gray.600">
                    {roleLabel(u.role)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (u) => <StatusBadge style={accountStatusStyle(u.status)} />,
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
            key: 'verified',
            header: 'Verified',
            render: (u) => (
                <Text fontSize="xs" color={u.isVerified ? 'green.600' : 'gray.400'}>
                    {u.isVerified ? 'Yes' : 'No'}
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
                        ]}
                    />
                </Box>
            ),
        },
    ];

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="User Management"
                subtitle="Browse and manage every artist, record label, fan and ad manager"
            />

            <UsersFilterBar query={query} onChange={setQuery} />

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message="Could not load users." />
            ) : (
                <>
                    <AdminTable
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(u) => u.id}
                        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
                        emptyTitle="No users found"
                        emptyDescription="Nothing matches the current filters."
                    />
                    {data && (
                        <Paginator
                            page={data.page}
                            pageSize={data.pageSize}
                            total={data.total}
                            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                        />
                    )}
                </>
            )}

            <ReasonDialog
                isOpen={suspendTarget !== null}
                onClose={() => setSuspendTarget(null)}
                onConfirm={(reason) => {
                    if (!suspendTarget) return;
                    suspend.mutate(
                        { userId: suspendTarget.id, reason },
                        { onSuccess: () => setSuspendTarget(null) },
                    );
                }}
                title={`Suspend ${suspendTarget?.name ?? 'account'}`}
                message="The user will be signed out and blocked from signing in until reactivated."
                reasonLabel="Suspension reason"
                placeholder="e.g. Repeated violations of the content policy after warnings."
                confirmText="Suspend account"
                confirmColor="red"
                isLoading={suspend.isPending}
            />

            <ConfirmModal
                isOpen={activateTarget !== null}
                onClose={() => setActivateTarget(null)}
                onConfirm={() => {
                    if (!activateTarget) return;
                    activate.mutate(activateTarget.id, {
                        onSuccess: () => setActivateTarget(null),
                    });
                }}
                title="Reactivate account?"
                message={`${activateTarget?.name ?? 'This user'} will be able to sign in again immediately.`}
                confirmText="Reactivate"
                confirmColor="blue"
                isLoading={activate.isPending}
            />
        </VStack>
    );
};

export default UsersPage;
