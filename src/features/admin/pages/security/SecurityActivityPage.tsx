import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { CustomMenu } from '@shared/components';
import { SecurityPanelBody } from '../../components/security/SecurityPanelBody';
import { adminDateTime, adminRelative, formatCount } from '../../lib/format';
import { roleLabel } from '../../lib/statusColor';
import { PLATFORM_ROLES } from '../../config/adminRoles';
import { useLockUser, useSecurityActivity, useSecuritySummary } from '../../hooks/useSecurity';
import type {
    SecurityActivityQuery,
    SecurityActivityRowDto,
} from '../../types/security';

const PAGE_SIZE = 15;

const ROLE_OPTIONS = [
    { value: 'All', label: 'All roles' },
    ...Object.values(PLATFORM_ROLES).map((m) => ({ value: m.role, label: m.plural })),
];

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Suspended', label: 'Locked / suspended' },
];

const SecurityActivityPage: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState<SecurityActivityQuery>({
        search: undefined,
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [selected, setSelected] = React.useState<SecurityActivityRowDto | null>(null);
    const [lockTarget, setLockTarget] = React.useState<SecurityActivityRowDto | null>(null);

    const { data, isLoading, error } = useSecurityActivity(query);
    const { data: summary } = useSecuritySummary();
    const lock = useLockUser();

    const kpiItems: KpiItem[] = [
        { label: 'Active sessions', value: formatCount(summary?.activeSessions) },
        { label: 'Locked accounts', value: formatCount(summary?.lockedAccounts) },
        { label: 'Logins (24h)', value: formatCount(summary?.logins24h) },
        { label: 'Logins (7d)', value: formatCount(summary?.logins7d) },
    ];

    const columns: DataColumn<SecurityActivityRowDto>[] = [
        {
            key: 'user',
            header: 'User',
            render: (r) => (
                <IdentityCell name={r.name} secondary={r.email} avatarUrl={r.avatarUrl} />
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (r) => (
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
                    {roleLabel(r.role)}
                </Box>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
        },
        {
            key: 'lastLogin',
            header: 'Last login',
            render: (r) => (
                <Text fontSize="xs" color="gray.600" title={adminDateTime(r.lastLoginAt)}>
                    {adminRelative(r.lastLoginAt)}
                </Text>
            ),
        },
        {
            key: 'sessions',
            header: 'Active sessions',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {r.activeSessionCount}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '56px',
            render: (r) => (
                <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                    <CustomMenu
                        options={[
                            {
                                label: 'Security panel',
                                value: 'panel',
                                onClick: () => setSelected(r),
                            },
                            {
                                label: 'Open full profile',
                                value: 'profile',
                                onClick: () => navigate(`/admin/users/${r.userId}`),
                            },
                        ]}
                    />
                </Box>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Security Activity"
            subtitle="Monitor sign-in activity, sessions and devices — lock, unlock or force-logout accounts"
            breadcrumbs={[{ label: 'Users & Roles' }, { label: 'Security Activity' }]}
        >
            <KpiStrip items={kpiItems} columns={{ base: 2, md: 4, xl: 4 }} />

            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) =>
                        setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by name or email',
                }}
                filters={[
                    {
                        key: 'role',
                        value: query.role ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                role: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: ROLE_OPTIONS,
                        width: '170px',
                    },
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                status: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: STATUS_OPTIONS,
                        width: '170px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load security activity." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(u) => u.userId}
                    onRowClick={(u) => setSelected(u)}
                    loading={isLoading && !data}
                    emptyIcon={FiShield}
                    emptyTitle="No users found"
                    emptyDescription="Nothing matches the current search."
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

            <DetailDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.name ?? 'Security panel'}
                subtitle={selected?.email}
                size="md"
            >
                {selected && (
                    <SecurityPanelBody
                        userId={selected.userId}
                        onLock={() => setLockTarget(selected)}
                    />
                )}
            </DetailDrawer>

            <ConfirmActionModal
                isOpen={lockTarget !== null}
                onClose={() => setLockTarget(null)}
                onConfirm={(reason) =>
                    lockTarget &&
                    lock.mutate(
                        { userId: lockTarget.userId, reason },
                        { onSuccess: () => setLockTarget(null) },
                    )
                }
                title={`Lock ${lockTarget?.name ?? 'account'}`}
                message="The user will be signed out of every session and blocked from signing in until unlocked."
                reasonLabel="Lock reason"
                placeholder="e.g. Suspicious sign-in activity from multiple regions."
                confirmText="Lock account"
                tone="danger"
                isLoading={lock.isPending}
            />
        </AdminPageLayout>
    );
};

export default SecurityActivityPage;
