import React from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { StatusBadge, toneStyle } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useCreateOverride } from '../../hooks/useDiscovery';
import type {
    AdminTrendingItemDto,
    CurationAction,
    DiscoverySurface,
    UpsertCurationOverrideRequest,
} from '../../types/discovery';

const PAGE_SIZE = 15;

/** Shared query shape for the four TrendingContent-backed lists. */
export interface DiscoveryItemsQuery {
    period: string;
    contentType?: string;
    genreId?: string;
    page: number;
    pageSize: number;
}

/** A pending curation action awaiting a captured reason. */
export interface DiscoveryActionTarget {
    item: AdminTrendingItemDto;
    action: CurationAction;
}

const RANK_CHANGE = (n: number) => {
    if (n > 0) return { tone: 'success' as const, label: `▲ ${n}` };
    if (n < 0) return { tone: 'danger' as const, label: `▼ ${Math.abs(n)}` };
    return { tone: 'neutral' as const, label: '—' };
};

/**
 * Shared data/mutation controller for the trending-family Discovery pages
 * (Trending / TopCharts / HotReleases / NewReleases). Each page is its own file
 * composing the UI kit directly — this hook factors out the query state, the
 * ranked `AdminTrendingItemDto` columns, the period/contentType filter wiring,
 * and the Pin/Boost/Suppress/Exclude curation actions (reason-captured via
 * ConfirmActionModal, dispatched as a create-override). `surface` pins which
 * curation surface new overrides target.
 *
 * Pages drive the actual list query themselves (Trending vs TopCharts vs … take
 * different params) and pass the resulting page back via `setData`-style props;
 * here we own the cross-cutting state only.
 */
export const useDiscoveryItems = (surface: DiscoverySurface) => {
    const canManage = useHasPermission('DiscoveryManage');

    const [query, setQuery] = React.useState<DiscoveryItemsQuery>({
        period: 'Week',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [actionTarget, setActionTarget] = React.useState<DiscoveryActionTarget | null>(null);

    const createOverride = useCreateOverride();
    const actionPending = createOverride.isPending;

    /** Maps a curation action verb → override request `action` value. */
    const dispatchAction = (target: DiscoveryActionTarget, reason: string, onDone: () => void) => {
        const action: CurationAction = target.action;
        const payload: UpsertCurationOverrideRequest = {
            surface,
            contentType: target.item.contentType,
            contentId: target.item.contentId,
            action,
            reason,
            // Pin captures the existing rank as the pinned position; others leave it null.
            pinnedRank: action === 'Pin' ? target.item.rank : null,
            isActive: true,
        };
        createOverride.mutate(payload, { onSuccess: onDone });
    };

    const columns: DataColumn<AdminTrendingItemDto>[] = [
        {
            key: 'rank',
            header: '#',
            width: '64px',
            align: 'center',
            render: (it) => {
                const rc = RANK_CHANGE(it.rankChange);
                return (
                    <VStack gap={0.5} align="center">
                        <Text fontSize="sm" fontWeight="bold" color="gray.900">
                            {it.rank}
                        </Text>
                        <Text
                            fontSize="9px"
                            fontWeight="semibold"
                            color={
                                rc.tone === 'success'
                                    ? '#16A34A'
                                    : rc.tone === 'danger'
                                      ? '#E53E3E'
                                      : 'gray.400'
                            }
                        >
                            {rc.label}
                        </Text>
                    </VStack>
                );
            },
        },
        {
            key: 'content',
            header: 'Content',
            render: (it) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {it.title || it.contentId}
                    </Text>
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                        {it.contentType}
                        {it.ownerName ? ` · ${it.ownerName}` : ''}
                        {it.genreName ? ` · ${it.genreName}` : ''}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'score',
            header: 'Score',
            align: 'right',
            render: (it) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {it.trendingScore.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </Text>
            ),
        },
        {
            key: 'metrics',
            header: 'Plays / Likes / Shares',
            render: (it) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(it.playCount)} / {formatCount(it.likeCount)} / {formatCount(it.shareCount)}
                </Text>
            ),
        },
        {
            key: 'gifts',
            header: 'Gift coins',
            align: 'right',
            render: (it) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(it.giftCoins)}
                </Text>
            ),
        },
        {
            key: 'override',
            header: 'Curation',
            render: (it) =>
                it.overrideAction ? (
                    <StatusBadge style={toneStyle('info', it.overrideAction)} />
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        Organic
                    </Text>
                ),
        },
    ];

    return {
        surface,
        canManage,
        query,
        setQuery,
        columns,
        actionTarget,
        setActionTarget,
        actionPending,
        dispatchAction,
        pageSize: PAGE_SIZE,
    };
};

export type DiscoveryItemsController = ReturnType<typeof useDiscoveryItems>;
