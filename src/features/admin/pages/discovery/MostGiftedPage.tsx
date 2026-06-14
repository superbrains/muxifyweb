import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { FiGift } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    IdentityCell,
    KpiStrip,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useCreateExclusion, useMostGifted } from '../../hooks/useDiscovery';
import { DISCOVERY_PERIOD_OPTIONS, type AdminMostGiftedDto } from '../../types/discovery';
import { CurationStatusBadge, LeaderboardPodium, RankBadge } from './discoveryShared';
import type { PodiumEntry } from './discoveryShared';
import { LinkBtn } from './discoveryShared';

const LEADERBOARD_TYPE = 'most-gifted-artists';

/** Most gifted — ranked recipients of gifting, with leaderboard exclusion control. */
const MostGiftedPage: React.FC = () => {
    const canManageLeaderboard = useHasPermission('LeaderboardManage');
    const canManageDiscovery = useHasPermission('DiscoveryManage');
    const canManage = canManageLeaderboard || canManageDiscovery;
    const [period, setPeriod] = React.useState('Week');
    const { data, isLoading, error } = useMostGifted({ period, take: 50 });

    const createExclusion = useCreateExclusion();
    const [excludeTarget, setExcludeTarget] = React.useState<AdminMostGiftedDto | null>(null);

    const rows = data ?? [];
    const kpis: KpiItem[] = [
        { label: 'Recipients', value: rows.length, tone: 'info' },
        { label: 'Gift value', value: formatCount(rows.reduce((s, r) => s + (r.totalGiftValue ?? 0), 0)), tone: 'success' },
        { label: 'Gifts received', value: formatCount(rows.reduce((s, r) => s + (r.totalGiftsReceived ?? 0), 0)), tone: 'neutral' },
        { label: 'Curated', value: rows.filter((r) => r.overrideAction).length, tone: 'warning' },
    ];

    const podium: PodiumEntry[] = rows.slice(0, 3).map((r) => ({
        rank: r.rank,
        name: r.artistName,
        avatarUrl: r.avatarUrl,
        value: `${formatCount(r.totalGiftValue)} coins`,
        sub: `${formatCount(r.totalGiftsReceived)} gifts`,
    }));

    const columns: DataColumn<AdminMostGiftedDto>[] = [
        { key: 'rank', header: '#', width: '64px', align: 'center', render: (r) => <RankBadge rank={r.rank} /> },
        { key: 'who', header: 'Recipient', render: (r) => <Recipient row={r} /> },
        {
            key: 'value',
            header: 'Gift value',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatCount(r.totalGiftValue)}
                </Text>
            ),
        },
        {
            key: 'gifts',
            header: 'Gifts received',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(r.totalGiftsReceived)}
                </Text>
            ),
        },
        {
            key: 'followers',
            header: 'Followers',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {r.followerCount != null ? formatCount(r.followerCount) : '—'}
                </Text>
            ),
        },
        { key: 'override', header: 'Curation', render: (r) => <CurationStatusBadge action={r.overrideAction} /> },
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
            title="Most Gifted"
            subtitle="Top recipients of fan gifting. Exclude an entity to keep them off the public leaderboard."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Most Gifted' }]}
        >
            <VStack align="stretch" gap={4}>
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                {podium.length > 0 && <LeaderboardPodium entries={podium} />}

                <FilterBar
                    filters={[{ key: 'period', value: period, onChange: setPeriod, options: DISCOVERY_PERIOD_OPTIONS }]}
                />

                {error ? (
                    <AdminError error={error} message="Could not load the most-gifted leaderboard." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={rows}
                        rowKey={(r) => r.artistId}
                        loading={isLoading && !data}
                        emptyIcon={FiGift}
                        emptyTitle="No gifting data"
                        emptyDescription="No one has received gifts in this period yet."
                    />
                )}
            </VStack>

            <ConfirmActionModal
                isOpen={excludeTarget !== null}
                onClose={() => setExcludeTarget(null)}
                onConfirm={(reason) =>
                    excludeTarget &&
                    createExclusion.mutate(
                        {
                            leaderboardType: LEADERBOARD_TYPE,
                            entityId: excludeTarget.artistId,
                            entityType: 'Artist',
                            reason,
                        },
                        { onSuccess: () => setExcludeTarget(null) },
                    )
                }
                title={`Exclude ${excludeTarget?.artistName ?? 'this entity'}`}
                message="They will be hidden from the Most Gifted leaderboard. Recorded in the audit log."
                reasonLabel="Exclusion reason"
                confirmText="Exclude"
                tone="danger"
                isLoading={createExclusion.isPending}
            />
        </AdminPageLayout>
    );
};

export default MostGiftedPage;

const Recipient: React.FC<{ row: AdminMostGiftedDto }> = ({ row }) => (
    <IdentityCell name={row.artistName} avatarUrl={row.avatarUrl} />
);
