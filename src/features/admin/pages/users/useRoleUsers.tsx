import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomMenu } from '@shared/components';
import { IdentityCell, StatusBadge } from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { adminDate, adminRelative, formatCount, formatMinorAmount } from '../../lib/format';
import { medalStyle } from '../../lib/statusColor';
import { useActivateUser, useSuspendUser, useUsers, useUsersSummary } from '../../hooks/useUsers';
import { useUserDeleteActions } from '../../components/users/useUserDeleteActions';
import type { AdminUserDto, UserQuery } from '../../types';
import { PLATFORM_ROLES, type PlatformRole } from '../../config/adminRoles';

const PAGE_SIZE = 15;

export const ROLE_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Deactivated', label: 'Deactivated' },
    { value: 'Deleted', label: 'Deleted' },
];

export const ROLE_VERIFICATION_OPTIONS = [
    { value: 'All', label: 'Any verification' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'NotSubmitted', label: 'Not submitted' },
];

const numCell = (value?: string) => (
    <Text fontSize="xs" color="gray.700" fontWeight="medium" fontVariantNumeric="tabular-nums">
        {value ?? '—'}
    </Text>
);

const textCell = (value?: string | null) => (
    <Text fontSize="xs" color="gray.600" lineClamp={1}>
        {value || '—'}
    </Text>
);

/**
 * The role-appropriate metric columns rendered between the identity and status
 * columns. Driven by `AdminUserDto.metrics`, which the backend populates from
 * the matching profile table.
 */
const metricColumns = (role: PlatformRole): DataColumn<AdminUserDto>[] => {
    switch (role) {
        case 'artist':
        case 'dj':
        case 'creator':
        case 'podcaster':
            return [
                {
                    key: 'followers',
                    header: 'Followers',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.followers) : undefined),
                },
                {
                    key: 'tracks',
                    header: 'Tracks',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.tracks) : undefined),
                },
                {
                    key: 'earnings',
                    header: 'Earnings',
                    align: 'right',
                    render: (u) =>
                        numCell(
                            u.metrics?.earningsMinor !== undefined
                                ? formatMinorAmount(u.metrics.earningsMinor, u.metrics.currency)
                                : undefined,
                        ),
                },
            ];
        case 'fan':
            return [
                {
                    key: 'coins',
                    header: 'Coin balance',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.coinBalance) : undefined),
                },
                {
                    key: 'medal',
                    header: 'Medal',
                    render: (u) =>
                        u.metrics?.medal && u.metrics.medal !== 'None' ? (
                            <StatusBadge style={medalStyle(u.metrics.medal)} />
                        ) : (
                            textCell(undefined)
                        ),
                },
                {
                    key: 'gifts',
                    header: 'Gifts sent',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.giftsSentCount) : undefined),
                },
            ];
        case 'record_label':
            return [
                {
                    key: 'tradingName',
                    header: 'Trading name',
                    render: (u) => textCell(u.metrics?.tradingName),
                },
                {
                    key: 'roster',
                    header: 'Roster',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.rosterCount) : undefined),
                },
            ];
        case 'ad_manager':
            return [
                {
                    key: 'company',
                    header: 'Company',
                    render: (u) => textCell(u.metrics?.companyName),
                },
                {
                    key: 'campaigns',
                    header: 'Active campaigns',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.activeCampaigns) : undefined),
                },
                {
                    key: 'adSpend',
                    header: 'Ad spend',
                    align: 'right',
                    render: (u) =>
                        numCell(
                            u.metrics?.adSpendMinor !== undefined
                                ? formatMinorAmount(u.metrics.adSpendMinor, u.metrics.currency)
                                : undefined,
                        ),
                },
            ];
        case 'contributor':
            return [
                {
                    key: 'splits',
                    header: 'Active splits',
                    align: 'right',
                    render: (u) => numCell(u.metrics ? formatCount(u.metrics.activeSplits) : undefined),
                },
            ];
        default:
            return [];
    }
};

/**
 * Shared data/mutation controller for the per-role user pages. Each role page is
 * its own file (FansPage, ArtistsPage, …) composing the UI kit directly — this
 * hook factors out the query state, KPI summary, columns (identity +
 * role-appropriate metrics + lifecycle) and suspend/activate mutations so the
 * separated pages stay consistent without a shared page component.
 *
 * `extraColumns` lets a role page inject additional columns before the
 * status/joined/actions block.
 */
export const useRoleUsers = (
    role: PlatformRole,
    extraColumns: DataColumn<AdminUserDto>[] = [],
) => {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState<UserQuery>({
        role: role as UserQuery['role'],
        status: 'All',
        verification: 'All',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [suspendTarget, setSuspendTarget] = React.useState<AdminUserDto | null>(null);
    const [activateTarget, setActivateTarget] = React.useState<AdminUserDto | null>(null);

    const { data, isLoading, error } = useUsers(query);
    const { data: summary } = useUsersSummary(role);
    const suspend = useSuspendUser();
    const activate = useActivateUser();
    const deleteActions = useUserDeleteActions();

    const plural = PLATFORM_ROLES[role].plural;
    const kpiItems: KpiItem[] = [
        { label: `Total ${plural}`, value: formatCount(summary?.total) },
        { label: 'Active', value: formatCount(summary?.active) },
        { label: 'Suspended', value: formatCount(summary?.suspended) },
        { label: 'Verified', value: formatCount(summary?.verified) },
        { label: 'New (30d)', value: formatCount(summary?.newLast30Days) },
    ];

    const columns: DataColumn<AdminUserDto>[] = [
        {
            key: 'user',
            header: 'User',
            render: (u) => <IdentityCell name={u.name} secondary={u.email} avatarUrl={u.avatarUrl} />,
        },
        ...metricColumns(role),
        ...extraColumns,
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
            sortKey: 'joined',
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
                            { label: 'View profile', value: 'view', onClick: () => navigate(`/admin/users/${u.id}`) },
                            ...(u.isDeleted
                                ? []
                                : [
                                      u.status === 'Suspended'
                                          ? { label: 'Reactivate account', value: 'activate', onClick: () => setActivateTarget(u) }
                                          : { label: 'Suspend account', value: 'suspend', color: '#C53030', onClick: () => setSuspendTarget(u) },
                                  ]),
                            ...deleteActions.menuOptions(u),
                        ]}
                    />
                </Box>
            ),
        },
    ];

    return {
        query,
        setQuery,
        data,
        isLoading,
        error,
        columns,
        kpiItems,
        summary,
        navigate,
        suspend,
        activate,
        suspendTarget,
        setSuspendTarget,
        activateTarget,
        setActivateTarget,
        deleteActions,
        pageSize: PAGE_SIZE,
    };
};
