import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FiGift } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    IdentityCell,
    KpiStrip,
} from '@shared/console';
import type { DataColumn, KpiItem } from '@shared/console';
import { formatCount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useCreateExclusion, useCreateOverride, useMostGifted } from '../../hooks/useDiscovery';
import {
    CREATOR_CATEGORY_OPTIONS,
    GIFT_PERIOD_OPTIONS,
    MOST_GIFTED_VARIANT_OPTIONS,
    type AdminMostGiftedRowDto,
    type CurationAction,
} from '../../types/discovery';
import {
    ContentCell,
    CurateActions,
    CurationStatusBadge,
    LeaderboardPodium,
    LinkBtn,
    RankBadge,
} from './discoveryShared';
import type { PodiumEntry } from './discoveryShared';
import { CurationOverrideModal, type CurationOverrideDraft } from './CurationOverrideModal';

/** Whether a most-gifted variant is an entity leaderboard (artists/creators) vs content (tracks/videos). */
const isEntityVariant = (variant: string) => variant === 'artists' || variant === 'creators';

/**
 * Most Gifted — mirrors the mobile spotlight's four most-gifted dimensions (tracks / artists /
 * videos / creators) with the same week/all window. Content variants (tracks/videos) are curated
 * via pin/boost/suppress/exclude overrides; entity variants (artists/creators) are managed via
 * leaderboard exclusions (excluded entities are already hidden, exactly as the app shows them).
 */
const MostGiftedPage: React.FC = () => {
    const canManageLeaderboard = useHasPermission('LeaderboardManage');
    const canManageDiscovery = useHasPermission('DiscoveryManage');

    const [variant, setVariant] = React.useState('tracks');
    const [category, setCategory] = React.useState('All');
    const [period, setPeriod] = React.useState('Week');

    const entity = isEntityVariant(variant);
    // Content variants curate via discovery overrides; entity variants via leaderboard exclusions.
    const canManage = entity ? canManageLeaderboard || canManageDiscovery : canManageDiscovery;

    const { data, isLoading, error } = useMostGifted({
        variant,
        category: category === 'All' ? undefined : category,
        period,
        take: 50,
    });

    const createExclusion = useCreateExclusion();
    const createOverride = useCreateOverride();
    const [excludeTarget, setExcludeTarget] = React.useState<AdminMostGiftedRowDto | null>(null);
    const [actionTarget, setActionTarget] = React.useState<{ row: AdminMostGiftedRowDto; action: CurationAction } | null>(null);

    const rows = data ?? [];
    const kpis: KpiItem[] = [
        { label: 'Ranked', value: rows.length, tone: 'info' },
        { label: 'Gift value', value: formatCount(rows.reduce((s, r) => s + (r.totalGiftValue ?? 0), 0)), tone: 'success' },
        { label: 'Gifts received', value: formatCount(rows.reduce((s, r) => s + (r.totalGiftsReceived ?? 0), 0)), tone: 'neutral' },
        { label: 'Curated', value: rows.filter((r) => r.overrideAction).length, tone: 'warning' },
    ];

    const podium: PodiumEntry[] = rows.slice(0, 3).map((r) => ({
        rank: r.rank,
        name: r.name,
        avatarUrl: r.imageUrl,
        value: `${formatCount(r.totalGiftValue)} coins`,
        sub: `${formatCount(r.totalGiftsReceived)} gifts`,
    }));

    const columns: DataColumn<AdminMostGiftedRowDto>[] = [
        { key: 'rank', header: '#', width: '64px', align: 'center', render: (r) => <RankBadge rank={r.rank} /> },
        {
            key: 'subject',
            header: entity ? 'Recipient' : 'Content',
            render: (r) =>
                entity ? (
                    <IdentityCell name={r.name} avatarUrl={r.imageUrl} />
                ) : (
                    <ContentCell
                        title={r.name}
                        contentType={r.contentType ?? 'Track'}
                        contentId={r.id}
                        ownerName={r.artistName}
                        coverArtUrl={r.imageUrl}
                    />
                ),
        },
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
    ];

    if (entity) {
        columns.push({
            key: 'followers',
            header: 'Followers',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {r.followerCount != null ? formatCount(r.followerCount) : '—'}
                </Text>
            ),
        });
    } else {
        columns.push({
            key: 'override',
            header: 'Curation',
            render: (r) => <CurationStatusBadge action={r.overrideAction} />,
        });
    }

    if (canManage) {
        columns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (r) =>
                entity ? (
                    <HStack justify="flex-end">
                        <LinkBtn color="#E53E3E" onClick={() => setExcludeTarget(r)}>
                            Exclude
                        </LinkBtn>
                    </HStack>
                ) : (
                    <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <CurateActions onAction={(action) => setActionTarget({ row: r, action })} />
                    </Box>
                ),
        });
    }

    const exclusionType = variant === 'creators' ? 'most-gifted-creators' : 'most-gifted-artists';

    const dispatchOverride = (draft: CurationOverrideDraft) => {
        if (!actionTarget) return;
        createOverride.mutate(
            {
                surface: 'MostGifted',
                contentType: actionTarget.row.contentType ?? 'Track',
                contentId: actionTarget.row.id,
                action: draft.action,
                weight: draft.weight,
                pinnedRank: draft.pinnedRank,
                reason: draft.reason,
                startDate: draft.startDate,
                endDate: draft.endDate,
                isActive: true,
            },
            { onSuccess: () => setActionTarget(null) },
        );
    };

    return (
        <AdminPageLayout
            title="Most Gifted"
            subtitle="Exactly what the mobile Most Gifted spotlight shows — tracks, artists, videos or creators. Curate content or exclude an entity to override the public list."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Most Gifted' }]}
        >
            <VStack align="stretch" gap={4}>
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                {podium.length > 0 && <LeaderboardPodium entries={podium} />}

                <FilterBar
                    filters={[
                        { key: 'variant', value: variant, onChange: setVariant, options: MOST_GIFTED_VARIANT_OPTIONS, width: '140px' },
                        { key: 'category', value: category, onChange: setCategory, options: CREATOR_CATEGORY_OPTIONS, width: '160px' },
                        { key: 'period', value: period, onChange: setPeriod, options: GIFT_PERIOD_OPTIONS, width: '140px' },
                    ]}
                />

                {error ? (
                    <AdminError error={error} message="Could not load the most-gifted leaderboard." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={rows}
                        rowKey={(r) => r.id}
                        loading={isLoading && !data}
                        emptyIcon={FiGift}
                        emptyTitle="No gifting data"
                        emptyDescription="Nothing has been gifted in this period yet."
                    />
                )}
            </VStack>

            {/* Entity variants — leaderboard exclusion */}
            <ConfirmActionModal
                isOpen={excludeTarget !== null}
                onClose={() => setExcludeTarget(null)}
                onConfirm={(reason) =>
                    excludeTarget &&
                    createExclusion.mutate(
                        {
                            leaderboardType: exclusionType,
                            entityId: excludeTarget.id,
                            entityType: 'Artist',
                            reason,
                        },
                        { onSuccess: () => setExcludeTarget(null) },
                    )
                }
                title={`Exclude ${excludeTarget?.name ?? 'this entity'}`}
                message="They will be hidden from the Most Gifted leaderboard. Recorded in the audit log."
                reasonLabel="Exclusion reason"
                confirmText="Exclude"
                tone="danger"
                isLoading={createExclusion.isPending}
            />

            {/* Content variants — pin / boost / suppress / exclude override */}
            <CurationOverrideModal
                open={actionTarget !== null}
                onClose={() => setActionTarget(null)}
                action={actionTarget?.action ?? 'Pin'}
                contextLabel={actionTarget?.row.name}
                confirmText={actionTarget ? `${actionTarget.action} item` : undefined}
                loading={createOverride.isPending}
                onConfirm={dispatchOverride}
            />
        </AdminPageLayout>
    );
};

export default MostGiftedPage;
