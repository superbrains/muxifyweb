import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomMenu } from '@shared/components';
import { IdentityCell, StatusBadge } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate } from '../../lib/format';
import { useActivateUser, useSuspendUser, useUsers } from '../../hooks/useUsers';
import type { AdminUserDto, UserQuery } from '../../types';
import type { PlatformRole } from '../../config/adminRoles';

const PAGE_SIZE = 15;

export const ROLE_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Deactivated', label: 'Deactivated' },
];

export const ROLE_VERIFICATION_OPTIONS = [
    { value: 'All', label: 'Any verification' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'NotSubmitted', label: 'Not submitted' },
];

/**
 * Shared data/mutation controller for the per-role user pages. Each role page is
 * its own file (FansPage, ArtistsPage, …) composing the UI kit directly — this
 * hook only factors out the query state, columns and suspend/activate mutations
 * so the separated pages stay consistent without a shared page component.
 *
 * `extraColumns` lets a role page inject role-appropriate columns before the
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
    const suspend = useSuspendUser();
    const activate = useActivateUser();

    const columns: DataColumn<AdminUserDto>[] = [
        {
            key: 'user',
            header: 'User',
            render: (u) => <IdentityCell name={u.name} secondary={u.email} avatarUrl={u.avatarUrl} />,
        },
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
            key: 'actions',
            header: '',
            align: 'right',
            width: '56px',
            render: (u) => (
                <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                    <CustomMenu
                        options={[
                            { label: 'View profile', value: 'view', onClick: () => navigate(`/admin/users/${u.id}`) },
                            u.status === 'Suspended'
                                ? { label: 'Reactivate account', value: 'activate', onClick: () => setActivateTarget(u) }
                                : { label: 'Suspend account', value: 'suspend', color: '#C53030', onClick: () => setSuspendTarget(u) },
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
        navigate,
        suspend,
        activate,
        suspendTarget,
        setSuspendTarget,
        activateTarget,
        setActivateTarget,
        pageSize: PAGE_SIZE,
    };
};
