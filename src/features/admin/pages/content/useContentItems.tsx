import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Text, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { IdentityCell, MediaCell, StatusBadge, toneStyle } from '@shared/console';
import type { DataColumn } from '@shared/console';
import { adminDate, formatCount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    usePublishItem,
    useRemoveItem,
    useRescheduleTrack,
    useRestoreItem,
    useRestrictItem,
    useUnpublishItem,
    useUnrestrictItem,
    useContentItems as useContentItemsQuery,
} from '../../hooks/useContent';
import { adminKeys } from '../../hooks/adminKeys';
import { contentService } from '../../services/contentService';
import type { ContentItemDto, ContentItemQuery, ContentKind } from '../../types/content';

const PAGE_SIZE = 15;

export const CONTENT_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Published', label: 'Published' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Restricted', label: 'Restricted' },
    { value: 'Removed', label: 'Removed' },
    { value: 'Scheduled', label: 'Scheduled' },
];

export const CONTENT_PUBLISHED_OPTIONS = [
    { value: 'All', label: 'All' },
    { value: 'true', label: 'Published only' },
    { value: 'false', label: 'Unpublished only' },
];

export const CONTENT_OWNER_ROLE_OPTIONS = [
    { value: 'All', label: 'All owners' },
    { value: 'artist', label: 'Artists' },
    { value: 'dj', label: 'DJs' },
    { value: 'creator', label: 'Creators' },
    { value: 'podcaster', label: 'Podcasters' },
    { value: 'record_label', label: 'Record labels' },
    { value: 'contributor', label: 'Contributors' },
];

export const CONTENT_SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'popular', label: 'Most played' },
];

/** Pending action that needs a reason captured via ConfirmActionModal. */
export type ContentActionKind = 'remove' | 'restrict' | 'unrestrict';

/** Bulk verbs runnable over a row selection (client-side fan-out). */
export type BulkActionKind = 'publish' | 'unpublish' | 'restrict' | 'unrestrict' | 'remove';

export interface ContentActionTarget {
    item: ContentItemDto;
    action: ContentActionKind;
}

/**
 * Shared data/mutation controller for the content-vertical pages. Each vertical
 * page (ContentLibrary, MusicOps, Videos, …) is its own file composing the UI
 * kit directly — this hook factors out the query state, columns, the
 * publish/unpublish/restore/remove/restrict/unrestrict mutations, the
 * reason-capture modal state and the row→drawer selection so the separated
 * pages stay consistent without a shared page component.
 *
 * `baseQuery` pins the vertical's fixed filters (kind/releaseType/etc.);
 * `extraColumns` lets a page inject kind-appropriate columns before the
 * metrics/date/actions block.
 */
export const useContentItems = (
    baseQuery: Partial<ContentItemQuery>,
    extraColumns: DataColumn<ContentItemDto>[] = [],
) => {
    const canManage = useHasPermission('ContentManage');
    const navigate = useNavigate();
    const qc = useQueryClient();
    const toast = useChakraToast();

    const [query, setQuery] = React.useState<ContentItemQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        ...baseQuery,
    });
    const [selected, setSelected] = React.useState<ContentItemDto | null>(null);
    const [actionTarget, setActionTarget] = React.useState<ContentActionTarget | null>(null);

    const { data, isLoading, error } = useContentItemsQuery(query);

    /* ── Row multi-select + bulk fan-out ── */
    const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
    const [bulkBusy, setBulkBusy] = React.useState(false);

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
            const next = new Set(prev);
            if (allSelected) keys.forEach((k) => next.delete(k));
            else keys.forEach((k) => next.add(k));
            return next;
        });

    const clearSelection = () => setSelectedKeys(new Set());

    /**
     * Runs a bulk verb over the currently-selected rows (current page) by
     * fanning out the existing single-item endpoints. Toasts one aggregate
     * result, clears the selection and refreshes the content namespace. There
     * are no native bulk endpoints, so partial failures are reported, not hidden.
     */
    const runBulk = async (action: BulkActionKind, reason = '') => {
        const items = (data?.items ?? []).filter((it) => selectedKeys.has(it.id));
        if (items.length === 0) return;
        setBulkBusy(true);
        const calls = items.map((it) => {
            switch (action) {
                case 'publish':
                    return contentService.publish(it.kind, it.id);
                case 'unpublish':
                    return contentService.unpublish(it.kind, it.id);
                case 'restrict':
                    return contentService.restrict(it.kind, it.id, reason);
                case 'unrestrict':
                    return contentService.unrestrict(it.kind, it.id, reason);
                case 'remove':
                    return contentService.remove(it.kind, it.id, reason);
            }
        });
        const results = await Promise.allSettled(calls);
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.length - ok;
        setBulkBusy(false);
        clearSelection();
        qc.invalidateQueries({ queryKey: adminKeys.content.root });
        if (failed === 0) {
            toast.success(`${ok} ${ok === 1 ? 'item' : 'items'} updated`);
        } else {
            const firstError = results.find((r) => r.status === 'rejected') as
                | PromiseRejectedResult
                | undefined;
            toast.warning(
                `${ok} updated, ${failed} failed`,
                firstError ? getApiErrorMessage(firstError.reason, 'Some items could not be updated.') : undefined,
            );
        }
    };

    const publish = usePublishItem();
    const unpublish = useUnpublishItem();
    const restore = useRestoreItem();
    const remove = useRemoveItem();
    const restrict = useRestrictItem();
    const unrestrict = useUnrestrictItem();
    const reschedule = useRescheduleTrack();

    const actionPending =
        publish.isPending ||
        unpublish.isPending ||
        restore.isPending ||
        remove.isPending ||
        restrict.isPending ||
        unrestrict.isPending;

    const navigateToDetail = (it: ContentItemDto) =>
        navigate(`/admin/content/${it.kind}/${it.id}`);

    const columns: DataColumn<ContentItemDto>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (it) => (
                <MediaCell
                    title={it.title || 'Untitled'}
                    subtype={it.releaseType ?? it.videoType ?? it.kind}
                    meta={it.genreName}
                    coverArtUrl={it.coverArtUrl}
                />
            ),
        },
        {
            key: 'owner',
            header: 'Owner',
            render: (it) => (
                <IdentityCell
                    name={it.ownerName}
                    secondary={it.ownerRole}
                    avatarUrl={it.ownerAvatarUrl}
                    size="xs"
                />
            ),
        },
        ...extraColumns,
        {
            key: 'status',
            header: 'Status',
            render: (it) => (
                <VStack align="start" gap={1}>
                    <StatusBadge status={it.isPublished ? 'Published' : it.status} />
                    {it.heldForDuplicateReview && (
                        <StatusBadge style={toneStyle('warning', 'Duplicate review')} />
                    )}
                </VStack>
            ),
        },
        {
            key: 'metrics',
            header: 'Plays / Likes',
            render: (it) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(it.metricCount)} / {formatCount(it.likeCount)}
                </Text>
            ),
        },
        {
            key: 'released',
            header: 'Released',
            render: (it) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(it.releaseDate ?? it.createdAt)}
                </Text>
            ),
        },
    ];

    return {
        canManage,
        query,
        setQuery,
        data,
        isLoading,
        error,
        columns,
        selected,
        setSelected,
        navigateToDetail,
        actionTarget,
        setActionTarget,
        actionPending,
        publish,
        unpublish,
        restore,
        remove,
        restrict,
        unrestrict,
        reschedule,
        pageSize: PAGE_SIZE,
        // selection + bulk
        selectedKeys,
        toggleRow,
        toggleAll,
        clearSelection,
        runBulk,
        bulkBusy,
    };
};

/** Convenience: kind label for empty states / subtitles. */
export const kindLabel = (kind?: ContentKind): string => {
    switch (kind) {
        case 'track':
            return 'tracks';
        case 'video':
            return 'videos';
        case 'album':
            return 'albums';
        case 'playlist':
            return 'playlists';
        default:
            return 'content';
    }
};
