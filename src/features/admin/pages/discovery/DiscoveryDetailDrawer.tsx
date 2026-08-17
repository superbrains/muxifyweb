import React from 'react';
import { Box, Button, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { FiInfo, FiSliders, FiTrash2 } from 'react-icons/fi';
import {
    ConfirmActionModal,
    CopyableId,
    CoverThumb,
    DetailDrawer,
    DetailTabs,
    MetaGrid,
    StatusBadge,
    toneStyle,
} from '@shared/console';
import type { MetaField } from '@shared/console';
import { adminDateTime, formatCount } from '@shared/console/lib/format';
import {
    useDeactivateOverride,
    useDeleteOverride,
    useOverrides,
} from '../../hooks/useDiscovery';
import type { AdminTrendingItemDto, CurationAction } from '../../types/discovery';
import { CURATION_ACTIONS } from '../../types/discovery';
import { CURATION_TONE, rankChangeStyle } from './discoveryUtils';

const ACTION_COLOR: Record<CurationAction, string> = {
    Pin: '#3B82F6',
    Boost: '#16A34A',
    Suppress: '#D97706',
    Exclude: '#E53E3E',
};

interface DiscoveryDetailDrawerProps {
    row: AdminTrendingItemDto | null;
    surface: string;
    canManage: boolean;
    onClose: () => void;
    /** Open the rich promote/demote modal for this row + action. */
    onCurate: (item: AdminTrendingItemDto, action: CurationAction) => void;
}

/**
 * Right-side detail drawer for a trending-family row: an Overview tab (cover +
 * full metric/owner/genre metadata) and a Curation tab (the active override's
 * resolved detail + quick promote/demote actions and deactivate/delete). The
 * override detail is resolved from the surface's override list by `overrideId`.
 */
export const DiscoveryDetailDrawer: React.FC<DiscoveryDetailDrawerProps> = ({
    row,
    surface,
    canManage,
    onClose,
    onCurate,
}) => {
    const { data: overrides } = useOverrides({ surface });
    const deactivate = useDeactivateOverride();
    const del = useDeleteOverride();
    const [confirmDelete, setConfirmDelete] = React.useState(false);

    const override = row?.overrideId
        ? overrides?.find((o) => o.id === row.overrideId)
        : undefined;

    const rc = row ? rankChangeStyle(row.rankChange) : null;

    const overviewFields: MetaField[] = row
        ? [
              { label: 'Content ID', value: <CopyableId value={row.contentId} label="Content ID" />, hideWhenEmpty: false },
              { label: 'Type', value: row.contentType },
              { label: 'Owner', value: row.ownerName },
              { label: 'Genre', value: row.genreName },
              {
                  label: 'Rank',
                  value: (
                      <HStack gap={1.5}>
                          <Text>{row.rank}</Text>
                          {row.rankChange !== 0 && rc && (
                              <Text fontSize="10px" fontWeight="semibold" color={rc.color}>
                                  {rc.label}
                              </Text>
                          )}
                      </HStack>
                  ),
                  hideWhenEmpty: false,
              },
              {
                  label: 'Trending score',
                  value: row.trendingScore.toLocaleString(undefined, { maximumFractionDigits: 1 }),
                  hideWhenEmpty: false,
              },
              { label: 'Plays', value: formatCount(row.playCount), hideWhenEmpty: false },
              { label: 'Likes', value: formatCount(row.likeCount), hideWhenEmpty: false },
              { label: 'Shares', value: formatCount(row.shareCount), hideWhenEmpty: false },
              { label: 'Gift coins', value: formatCount(row.giftCoins), hideWhenEmpty: false },
              { label: 'Calculated', value: adminDateTime(row.calculatedAt) },
          ]
        : [];

    const curationContent = row && (
        <VStack align="stretch" gap={4}>
            {override ? (
                <Box bg="gray.50" borderRadius="lg" p={3}>
                    <HStack justify="space-between" mb={2}>
                        <StatusBadge
                            style={toneStyle(CURATION_TONE[override.action] ?? 'info', override.action)}
                        />
                        <StatusBadge status={override.isCurrentlyActive ? 'Active' : 'Inactive'} />
                    </HStack>
                    <MetaGrid
                        columns={2}
                        fields={[
                            { label: 'Weight', value: override.weight ?? '—', hideWhenEmpty: false },
                            { label: 'Pinned rank', value: override.pinnedRank ?? '—', hideWhenEmpty: false },
                            { label: 'Starts', value: override.startDate ? adminDateTime(override.startDate) : '—', hideWhenEmpty: false },
                            { label: 'Ends', value: override.endDate ? adminDateTime(override.endDate) : '—', hideWhenEmpty: false },
                            { label: 'Reason', value: override.reason, hideWhenEmpty: false },
                        ]}
                    />
                    {canManage && (
                        <HStack gap={2} mt={3}>
                            <Button
                                size="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="8px"
                                disabled={deactivate.isPending || !override.isActive}
                                onClick={() => deactivate.mutate(override.id)}
                            >
                                Deactivate
                            </Button>
                            <Button
                                size="xs"
                                variant="outline"
                                borderColor="#FECACA"
                                color="#C53030"
                                borderRadius="8px"
                                disabled={del.isPending}
                                onClick={() => setConfirmDelete(true)}
                            >
                                <Icon as={FiTrash2} /> Delete
                            </Button>
                        </HStack>
                    )}
                </Box>
            ) : (
                <Text fontSize="xs" color="gray.500">
                    This item is ranked organically — no curation override is active.
                </Text>
            )}

            {canManage && (
                <Box>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={2}>
                        {override ? 'Re-curate' : 'Promote / demote'}
                    </Text>
                    <SimpleGrid columns={2} gap={2}>
                        {CURATION_ACTIONS.map((action) => (
                            <Button
                                key={action}
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.200"
                                color={ACTION_COLOR[action]}
                                borderRadius="10px"
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => onCurate(row, action)}
                            >
                                {action}
                            </Button>
                        ))}
                    </SimpleGrid>
                </Box>
            )}
        </VStack>
    );

    return (
        <>
            <DetailDrawer
                open={row !== null}
                onClose={onClose}
                title={row?.title || row?.contentId || 'Content'}
                subtitle={row ? `${row.contentType}${row.ownerName ? ` · ${row.ownerName}` : ''}` : undefined}
                size="md"
            >
                {row && (
                    <VStack align="stretch" gap={4}>
                        <HStack gap={3}>
                            <CoverThumb src={row.coverArtUrl} size="64px" radius="12px" />
                            <VStack align="start" gap={0.5} minW={0}>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.900" lineClamp={2}>
                                    {row.title || row.contentId}
                                </Text>
                                <Text fontSize="11px" color="gray.500">
                                    {row.contentType}
                                    {row.genreName ? ` · ${row.genreName}` : ''}
                                </Text>
                            </VStack>
                        </HStack>

                        <DetailTabs
                            tabs={[
                                {
                                    id: 'overview',
                                    label: 'Overview',
                                    icon: FiInfo,
                                    content: <MetaGrid columns={2} fields={overviewFields} />,
                                },
                                {
                                    id: 'curation',
                                    label: 'Curation',
                                    icon: FiSliders,
                                    content: curationContent,
                                },
                            ]}
                        />
                    </VStack>
                )}
            </DetailDrawer>

            <ConfirmActionModal
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={() => {
                    if (!override) return;
                    del.mutate(override.id, {
                        onSuccess: () => {
                            setConfirmDelete(false);
                            onClose();
                        },
                    });
                }}
                title="Delete curation override"
                message="Remove this override so the item ranks organically again."
                requireReason={false}
                confirmText="Delete"
                tone="danger"
                isLoading={del.isPending}
            />
        </>
    );
};
