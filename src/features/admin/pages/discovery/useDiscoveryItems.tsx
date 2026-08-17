import React from 'react';
import type { DataColumn } from '@shared/console';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useCreateOverride,
    useCreateOverridesBatch,
    useOverrides,
} from '../../hooks/useDiscovery';
import type {
    AdminTrendingItemDto,
    BatchCurationOverrideRequest,
    CurationAction,
    DiscoverySurface,
    UpsertCurationOverrideRequest,
} from '../../types/discovery';
import { ContentCell, CurationStatusBadge, MetricChips, RankBadge } from './discoveryShared';
import type { CurationOverrideDraft } from './CurationOverrideModal';

const PAGE_SIZE = 15;

/**
 * Shared query shape for the four feed-backed lists. Mirrors the mobile feed params: `vertical`
 * (music tracks vs videos), `category` (creator role), `period`, `videoType` (video segment),
 * `genre` (genre name, music vertical).
 */
export interface DiscoveryItemsQuery {
    vertical: string;
    category?: string;
    period: string;
    videoType?: string;
    genre?: string;
    page: number;
    pageSize: number;
}

/** A pending single-row curation action awaiting its captured detail. */
export interface DiscoveryActionTarget {
    item: AdminTrendingItemDto;
    action: CurationAction;
}

const rowKeyOf = (it: AdminTrendingItemDto) => `${it.contentType}-${it.contentId}`;

/** Split a `${ContentType}-${guid}` row key back into its parts (content type has no hyphen). */
const parseRowKey = (key: string): { contentType: string; contentId: string } => {
    const idx = key.indexOf('-');
    return { contentType: key.slice(0, idx), contentId: key.slice(idx + 1) };
};

/**
 * Shared data/mutation controller for the trending-family Discovery pages
 * (Trending / TopCharts / HotReleases / NewReleases). It owns the cross-cutting
 * state every one of those pages needs: query/filters, the ranked columns
 * (cover art + metrics + curation badge), multi-select for bulk curation, the
 * single-row + batch promote/demote dispatch (weight/rank/schedule via the rich
 * modal), the row detail drawer target, and the surface-global active-override
 * count for the KPI strip. Each page drives its own list query (Trending vs
 * TopCharts vs … take different params) and passes the page back into the view.
 */
export const useDiscoveryItems = (surface: DiscoverySurface) => {
    const canManage = useHasPermission('DiscoveryManage');

    const [query, setQuery] = React.useState<DiscoveryItemsQuery>({
        vertical: 'music',
        period: 'Week',
        page: 1,
        pageSize: PAGE_SIZE,
    });

    // Surface-global active override count (KPI strip + situational awareness).
    const { data: activeOverrides } = useOverrides({ surface, activeOnly: true });
    const activeOverridesCount = activeOverrides?.length ?? 0;

    /* ----------------------------- selection ----------------------------- */
    const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
    const toggleRow = (key: string) =>
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    const toggleAll = (keys: string[]) =>
        setSelectedKeys((prev) => {
            const allSelected = keys.length > 0 && keys.every((k) => prev.has(k));
            return allSelected ? new Set() : new Set(keys);
        });
    const clearSelection = () => setSelectedKeys(new Set());

    /* --------------------------- single action --------------------------- */
    const [actionTarget, setActionTarget] = React.useState<DiscoveryActionTarget | null>(null);
    const createOverride = useCreateOverride();

    const dispatchSingle = (draft: CurationOverrideDraft, onDone: () => void) => {
        if (!actionTarget) return;
        const payload: UpsertCurationOverrideRequest = {
            surface,
            contentType: actionTarget.item.contentType,
            contentId: actionTarget.item.contentId,
            action: draft.action,
            weight: draft.weight,
            pinnedRank: draft.pinnedRank,
            reason: draft.reason,
            startDate: draft.startDate,
            endDate: draft.endDate,
            isActive: true,
        };
        createOverride.mutate(payload, { onSuccess: onDone });
    };

    /* ----------------------------- bulk action --------------------------- */
    const [bulkAction, setBulkAction] = React.useState<CurationAction | null>(null);
    const createBatch = useCreateOverridesBatch();

    const dispatchBulk = (draft: CurationOverrideDraft, onDone: () => void) => {
        const items = Array.from(selectedKeys).map(parseRowKey);
        if (items.length === 0) return;
        const payload: BatchCurationOverrideRequest = {
            surface,
            action: draft.action,
            weight: draft.weight,
            pinnedRank: draft.pinnedRank,
            reason: draft.reason,
            startDate: draft.startDate,
            endDate: draft.endDate,
            items,
        };
        createBatch.mutate(payload, {
            onSuccess: () => {
                clearSelection();
                onDone();
            },
        });
    };

    /* ---------------------------- detail drawer -------------------------- */
    const [detailRow, setDetailRow] = React.useState<AdminTrendingItemDto | null>(null);

    /* ------------------------------- columns ----------------------------- */
    // These lists mirror the live mobile feed (the same `/feed/*` query the app calls), so there is no
    // organic trending score / rank-delta to show — the rank is just the position the user sees.
    const columns: DataColumn<AdminTrendingItemDto>[] = [
        {
            key: 'rank',
            header: '#',
            width: '64px',
            align: 'center',
            render: (it) => <RankBadge rank={it.rank} />,
        },
        {
            key: 'content',
            header: 'Content',
            render: (it) => (
                <ContentCell
                    title={it.title}
                    contentType={it.contentType}
                    contentId={it.contentId}
                    ownerName={it.ownerName}
                    genreName={it.genreName}
                    coverArtUrl={it.coverArtUrl}
                />
            ),
        },
        {
            key: 'metrics',
            header: 'Engagement',
            render: (it) => <MetricChips plays={it.playCount} likes={it.likeCount} />,
        },
        {
            key: 'override',
            header: 'Curation',
            render: (it) => <CurationStatusBadge action={it.overrideAction} />,
        },
    ];

    return {
        surface,
        canManage,
        query,
        setQuery,
        pageSize: PAGE_SIZE,
        columns,
        rowKey: rowKeyOf,
        activeOverridesCount,
        // selection
        selectedKeys,
        toggleRow,
        toggleAll,
        clearSelection,
        selectedCount: selectedKeys.size,
        // single
        actionTarget,
        openAction: (item: AdminTrendingItemDto, action: CurationAction) =>
            setActionTarget({ item, action }),
        closeAction: () => setActionTarget(null),
        dispatchSingle,
        singlePending: createOverride.isPending,
        // bulk
        bulkAction,
        openBulk: (action: CurationAction) => setBulkAction(action),
        closeBulk: () => setBulkAction(null),
        dispatchBulk,
        bulkPending: createBatch.isPending,
        // detail
        detailRow,
        openDetail: (item: AdminTrendingItemDto) => setDetailRow(item),
        closeDetail: () => setDetailRow(null),
    };
};

export type DiscoveryItemsController = ReturnType<typeof useDiscoveryItems>;
