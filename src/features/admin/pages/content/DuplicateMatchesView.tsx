import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiCopy } from 'react-icons/fi';
import {
    AdminError,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    StatusBadge,
    toneStyle,
} from '../../components/ui';
import type { DataColumn, SelectFilter } from '../../components/ui';
import { adminDate } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useConfirmMatch,
    useDismissMatch,
    useDuplicateMatches,
} from '../../hooks/useContent';
import type { DuplicateMatchDto, DuplicateMatchQuery } from '../../types/content';

const PAGE_SIZE = 15;

export const DUPLICATE_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Dismissed', label: 'Dismissed' },
];

export const DUPLICATE_TIER_OPTIONS = [
    { value: 'All', label: 'All tiers' },
    { value: 'Exact', label: 'Exact' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
];

export const DUPLICATE_MEDIA_OPTIONS = [
    { value: 'All', label: 'All media' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Video', label: 'Video' },
];

const tierTone = (tier: string) => {
    switch (tier.toLowerCase()) {
        case 'exact':
            return 'danger' as const;
        case 'high':
            return 'warning' as const;
        case 'medium':
            return 'info' as const;
        default:
            return 'neutral' as const;
    }
};

interface DuplicateMatchesViewProps {
    /** Fixed query (e.g. copyright pins tier=High + a disputedOnly toggle). */
    baseQuery: Partial<DuplicateMatchQuery>;
    /** Extra select filters prepended to the standard status/tier/media set. */
    leadingFilters?: (
        query: DuplicateMatchQuery,
        setQuery: React.Dispatch<React.SetStateAction<DuplicateMatchQuery>>,
    ) => SelectFilter[];
    /** Hide the tier select (copyright already pins tiers). */
    hideTierFilter?: boolean;
}

/**
 * Shared duplicate-match table + confirm/dismiss actions, gated by
 * CopyrightReview. Used by both the Duplicate Detection page (all matches) and
 * the Copyright Review page (High/Exact + disputed). Each page stays a thin file
 * configuring this via `baseQuery`/`leadingFilters`.
 */
export const DuplicateMatchesView: React.FC<DuplicateMatchesViewProps> = ({
    baseQuery,
    leadingFilters,
    hideTierFilter,
}) => {
    const canReview = useHasPermission('CopyrightReview');
    const [query, setQuery] = React.useState<DuplicateMatchQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        ...baseQuery,
    });
    const [confirmTarget, setConfirmTarget] = React.useState<DuplicateMatchDto | null>(null);
    const [dismissTarget, setDismissTarget] = React.useState<DuplicateMatchDto | null>(null);

    const { data, isLoading, error } = useDuplicateMatches(query);
    const confirm = useConfirmMatch();
    const dismiss = useDismissMatch();
    const pending = confirm.isPending || dismiss.isPending;

    const isPending = (m: DuplicateMatchDto) => m.status.toLowerCase() === 'pending';

    const columns: DataColumn<DuplicateMatchDto>[] = [
        {
            key: 'suspect',
            header: 'Suspect',
            render: (m) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {m.suspectTitle}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {m.suspectOwnerName}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'matched',
            header: 'Matched against',
            render: (m) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" color="gray.800" lineClamp={1}>
                        {m.matchedTitle}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {m.matchedOwnerName}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'tier',
            header: 'Tier / Score',
            render: (m) => (
                <VStack align="start" gap={1}>
                    <StatusBadge style={toneStyle(tierTone(m.tier), m.tier)} />
                    <Text fontSize="10px" color="gray.500">
                        {(m.score * 100).toFixed(0)}% · {m.matchMethod}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (m) => (
                <VStack align="start" gap={1}>
                    <StatusBadge status={m.status} />
                    {m.isDisputed && <StatusBadge style={toneStyle('warning', 'Disputed')} />}
                </VStack>
            ),
        },
        {
            key: 'created',
            header: 'Detected',
            render: (m) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(m.createdAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (m) => {
                if (!canReview || !isPending(m)) return null;
                return (
                    <HStack gap={1.5} justify="flex-end">
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="#FECACA"
                            color="#C53030"
                            borderRadius="md"
                            fontSize="11px"
                            disabled={pending}
                            onClick={() => setConfirmTarget(m)}
                        >
                            Confirm
                        </Button>
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.200"
                            color="gray.700"
                            borderRadius="md"
                            fontSize="11px"
                            disabled={pending}
                            onClick={() => setDismissTarget(m)}
                        >
                            Dismiss
                        </Button>
                    </HStack>
                );
            },
        },
    ];

    const tierFilter: SelectFilter[] = hideTierFilter
        ? []
        : [
              {
                  key: 'tier',
                  value: query.tier ?? 'All',
                  onChange: (v) => setQuery((q) => ({ ...q, tier: v === 'All' ? undefined : v, page: 1 })),
                  options: DUPLICATE_TIER_OPTIONS,
              },
          ];

    return (
        <VStack align="stretch" gap={3}>
            <FilterBar
                filters={[
                    ...(leadingFilters?.(query, setQuery) ?? []),
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, status: v === 'All' ? undefined : v, page: 1 })),
                        options: DUPLICATE_STATUS_OPTIONS,
                    },
                    ...tierFilter,
                    {
                        key: 'mediaType',
                        value: query.mediaType ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, mediaType: v === 'All' ? undefined : v, page: 1 })),
                        options: DUPLICATE_MEDIA_OPTIONS,
                        width: '140px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load duplicate matches." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(m) => m.id}
                    loading={isLoading && !data}
                    emptyIcon={FiCopy}
                    emptyTitle="No matches found"
                    emptyDescription="Nothing matches the current filters."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            {(confirmTarget?.artistDisputeNote || dismissTarget?.artistDisputeNote) && (
                <Box bg="#FFF9E6" border="1px solid" borderColor="#FDE68A" borderRadius="lg" p={3}>
                    <Text fontSize="11px" fontWeight="semibold" color="#92660C">
                        Artist dispute note
                    </Text>
                    <Text fontSize="11px" color="#92660C">
                        {(confirmTarget ?? dismissTarget)?.artistDisputeNote}
                    </Text>
                </Box>
            )}

            <ConfirmActionModal
                isOpen={confirmTarget !== null}
                onClose={() => setConfirmTarget(null)}
                onConfirm={(reason) =>
                    confirmTarget &&
                    confirm.mutate(
                        { id: confirmTarget.id, reason },
                        { onSuccess: () => setConfirmTarget(null) },
                    )
                }
                title="Confirm this match"
                message={
                    confirmTarget
                        ? `Confirm “${confirmTarget.suspectTitle}” duplicates “${confirmTarget.matchedTitle}”. The flagged content will be actioned.`
                        : undefined
                }
                reasonLabel="Confirmation note"
                confirmText="Confirm match"
                tone="danger"
                isLoading={confirm.isPending}
            />

            <ConfirmActionModal
                isOpen={dismissTarget !== null}
                onClose={() => setDismissTarget(null)}
                onConfirm={(reason) =>
                    dismissTarget &&
                    dismiss.mutate(
                        { id: dismissTarget.id, reason },
                        { onSuccess: () => setDismissTarget(null) },
                    )
                }
                title="Dismiss this match"
                message={
                    dismissTarget
                        ? `Dismiss the match for “${dismissTarget.suspectTitle}”. No action will be taken.`
                        : undefined
                }
                reasonLabel="Dismissal reason"
                confirmText="Dismiss match"
                tone="primary"
                isLoading={dismiss.isPending}
            />
        </VStack>
    );
};
