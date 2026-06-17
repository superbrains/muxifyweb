import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useCreateExclusion, useTopGivers } from '../../hooks/useDiscovery';
import {
    DISCOVERY_VERTICAL_OPTIONS,
    GIFT_PERIOD_OPTIONS,
    type AdminTopGiversDto,
} from '../../types/discovery';
import { CurationStatusBadge, LeaderboardPodium, RankBadge } from './discoveryShared';
import type { PodiumEntry } from './discoveryShared';
import { LinkBtn } from './discoveryShared';

/** Top givers — ranked fans by gifting spend (music or video scope), with leaderboard exclusion control. */
const TopGiversPage: React.FC = () => {
    const canManageLeaderboard = useHasPermission('LeaderboardManage');
    const canManageDiscovery = useHasPermission('DiscoveryManage');
    const canManage = canManageLeaderboard || canManageDiscovery;
    const [vertical, setVertical] = React.useState('music');
    const [period, setPeriod] = React.useState('Week');
    const { data, isLoading, error } = useTopGivers({ vertical, period, take: 50 });

    // Mobile splits top-givers by gift scope; each vertical has its own exclusion list.
    const leaderboardType = vertical === 'video' ? 'top-givers-video' : 'top-gifters';

    const createExclusion = useCreateExclusion();
    const [excludeTarget, setExcludeTarget] = React.useState<AdminTopGiversDto | null>(null);

    const rows = data ?? [];
    const kpis: KpiItem[] = [
        { label: 'Givers', value: rows.length, tone: 'info' },
        { label: 'Total gifted', value: formatCount(rows.reduce((s, r) => s + (r.totalGiftValue ?? 0), 0)), tone: 'success' },
        { label: 'Gifts sent', value: formatCount(rows.reduce((s, r) => s + (r.giftCount ?? 0), 0)), tone: 'neutral' },
        { label: 'Curated', value: rows.filter((r) => r.overrideAction).length, tone: 'warning' },
    ];

    const podium: PodiumEntry[] = rows.slice(0, 3).map((r) => ({
        rank: r.rank,
        name: r.displayName ?? r.username ?? 'Unknown',
        avatarUrl: r.avatarUrl,
        value: `${formatCount(r.totalGiftValue)} coins`,
        sub: r.currentMedal ?? `${formatCount(r.giftCount)} gifts`,
    }));

    const columns: DataColumn<AdminTopGiversDto>[] = [
        { key: 'rank', header: '#', width: '64px', align: 'center', render: (r) => <RankBadge rank={r.rank} /> },
        { key: 'who', header: 'Giver', render: (r) => <Giver row={r} /> },
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
            key: 'medal',
            header: 'Medal',
            render: (r) =>
                r.currentMedal ? (
                    <StatusBadge status="Active" label={r.currentMedal} />
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        —
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
            title="Top Givers"
            subtitle="Fans who gift the most. Exclude a user to keep them off the public leaderboard."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Top Givers' }]}
        >
            <VStack align="stretch" gap={4}>
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                {podium.length > 0 && <LeaderboardPodium entries={podium} />}

                <FilterBar
                    filters={[
                        { key: 'vertical', value: vertical, onChange: setVertical, options: DISCOVERY_VERTICAL_OPTIONS, width: '130px' },
                        { key: 'period', value: period, onChange: setPeriod, options: GIFT_PERIOD_OPTIONS, width: '140px' },
                    ]}
                />

                {error ? (
                    <AdminError error={error} message="Could not load the top-givers leaderboard." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={rows}
                        rowKey={(r) => r.userId}
                        loading={isLoading && !data}
                        emptyIcon={FiHeart}
                        emptyTitle="No gifting data"
                        emptyDescription="No one has sent gifts in this period yet."
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
                            leaderboardType,
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

const Giver: React.FC<{ row: AdminTopGiversDto }> = ({ row }) => (
    <IdentityCell
        name={row.displayName ?? row.username ?? 'Unknown'}
        secondary={row.username ? `@${row.username}` : undefined}
        avatarUrl={row.avatarUrl}
    />
);
