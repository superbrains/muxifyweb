import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    IdentityCell,
    StatusBadge,
    toneStyle,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { useCreateExclusion, useTopGivers } from '../../hooks/useDiscovery';
import { DISCOVERY_PERIOD_OPTIONS, type AdminTopGiversDto } from '../../types/discovery';
import { LinkBtn } from './discoveryShared';

const LEADERBOARD_TYPE = 'top-gifters';

/** Top givers — ranked fans by gifting spend, with leaderboard exclusion control. */
const TopGiversPage: React.FC = () => {
    const canManage = useHasPermission('LeaderboardManage') || useHasPermission('DiscoveryManage');
    const [period, setPeriod] = React.useState('Week');
    const { data, isLoading, error } = useTopGivers({ period, take: 50 });

    const createExclusion = useCreateExclusion();
    const [excludeTarget, setExcludeTarget] = React.useState<AdminTopGiversDto | null>(null);

    const columns: DataColumn<AdminTopGiversDto>[] = [
        { key: 'rank', header: '#', width: '56px', align: 'center', render: (r) => (
            <Text fontSize="sm" fontWeight="bold" color="gray.900">{r.rank}</Text>
        ) },
        {
            key: 'who',
            header: 'Giver',
            render: (r) => <Giver row={r} />,
        },
        {
            key: 'value',
            header: 'Total gifted',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatCount(r.totalGiftValue)}
                </Text>
            ),
        },
        {
            key: 'count',
            header: 'Gifts sent',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(r.giftCount)}
                </Text>
            ),
        },
        {
            key: 'override',
            header: 'Curation',
            render: (r) =>
                r.overrideAction ? (
                    <StatusBadge style={toneStyle('info', r.overrideAction)} />
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        Organic
                    </Text>
                ),
        },
    ];

    if (canManage) {
        columns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (r) => (
                <HStack justify="flex-end">
                    <LinkBtn color="#E53E3E" onClick={() => setExcludeTarget(r)}>
                        Exclude
                    </LinkBtn>
                </HStack>
            ),
        });
    }

    return (
        <AdminPageLayout
            title="Top Givers"
            subtitle="Fans who gift the most. Exclude a user to keep them off the public leaderboard."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Top Givers' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'period',
                        value: period,
                        onChange: setPeriod,
                        options: DISCOVERY_PERIOD_OPTIONS,
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load the top-givers leaderboard." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data ?? []}
                    rowKey={(r) => r.userId}
                    loading={isLoading && !data}
                    emptyIcon={FiHeart}
                    emptyTitle="No gifting data"
                    emptyDescription="No one has sent gifts in this period yet."
                />
            )}

            <ConfirmActionModal
                isOpen={excludeTarget !== null}
                onClose={() => setExcludeTarget(null)}
                onConfirm={(reason) =>
                    excludeTarget &&
                    createExclusion.mutate(
                        {
                            leaderboardType: LEADERBOARD_TYPE,
                            entityId: excludeTarget.userId,
                            entityType: 'User',
                            reason,
                        },
                        { onSuccess: () => setExcludeTarget(null) },
                    )
                }
                title={`Exclude ${excludeTarget?.displayName ?? 'this user'}`}
                message="They will be hidden from the Top Givers leaderboard. Recorded in the audit log."
                reasonLabel="Exclusion reason"
                confirmText="Exclude"
                tone="danger"
                isLoading={createExclusion.isPending}
            />
        </AdminPageLayout>
    );
};

export default TopGiversPage;

const Giver: React.FC<{ row: AdminTopGiversDto }> = ({ row }) => {
    const avatar = useAuthedImageSrc(row.avatarUrl || undefined);
    return (
        <IdentityCell
            name={row.displayName ?? row.username ?? 'Unknown'}
            secondary={row.username ? `@${row.username}` : undefined}
            avatarUrl={avatar}
        />
    );
};
