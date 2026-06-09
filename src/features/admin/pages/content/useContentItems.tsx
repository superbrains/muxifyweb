import React from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { IdentityCell, StatusBadge, toneStyle } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate, formatCount } from '../../lib/format';
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

/** Pending action that needs a reason captured via ConfirmActionModal. */
export type ContentActionKind = 'remove' | 'restrict' | 'unrestrict';

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

    const [query, setQuery] = React.useState<ContentItemQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        ...baseQuery,
    });
    const [selected, setSelected] = React.useState<ContentItemDto | null>(null);
    const [actionTarget, setActionTarget] = React.useState<ContentActionTarget | null>(null);

    const { data, isLoading, error } = useContentItemsQuery(query);

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

    const columns: DataColumn<ContentItemDto>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (it) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {it.title || 'Untitled'}
                    </Text>
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                        {it.releaseType ?? it.videoType ?? it.kind}
                        {it.genreName ? ` · ${it.genreName}` : ''}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'owner',
            header: 'Owner',
            render: (it) => <IdentityCell name={it.ownerName} secondary={it.ownerRole} size="xs" />,
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
