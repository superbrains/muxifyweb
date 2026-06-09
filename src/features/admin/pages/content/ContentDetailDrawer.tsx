import React from 'react';
import { Box, Button, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import {
    AdminError,
    AdminLoading,
    DetailDrawer,
    IdentityCell,
    StatusBadge,
    toneStyle,
} from '../../components/ui';
import { adminDate, formatCount } from '../../lib/format';
import { useContentItem } from '../../hooks/useContent';
import type { ContentActionTarget, useContentItems } from './useContentItems';
import type { ContentItemDto } from '../../types/content';

type Controller = ReturnType<typeof useContentItems>;

interface ContentDetailDrawerProps {
    selected: ContentItemDto | null;
    controller: Controller;
}

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <VStack align="start" gap={0.5}>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="0.4px">
            {label}
        </Text>
        <Box fontSize="xs" color="gray.800">
            {value}
        </Box>
    </VStack>
);

/**
 * Right-side drawer showing a content item's detail plus the moderation action
 * buttons. Destructive actions (remove/restrict) route through the controller's
 * reason-capture modal; publish/unpublish/restore fire immediately. All actions
 * are gated by the controller's `canManage` (ContentManage).
 */
export const ContentDetailDrawer: React.FC<ContentDetailDrawerProps> = ({
    selected,
    controller,
}) => {
    const { data, isLoading, error } = useContentItem(
        selected?.kind ?? null,
        selected?.id ?? null,
    );

    const close = () => controller.setSelected(null);
    const openReason = (action: ContentActionTarget['action']) => {
        if (selected) controller.setActionTarget({ item: selected, action });
    };

    const item = data?.item ?? selected;

    const footer = selected && controller.canManage ? (
        <HStack gap={2} justify="flex-end" w="100%" flexWrap="wrap">
            {selected.isPublished ? (
                <Button
                    size="sm"
                    variant="outline"
                    fontSize="xs"
                    borderRadius="10px"
                    disabled={controller.actionPending}
                    onClick={() =>
                        controller.unpublish.mutate({ kind: selected.kind, id: selected.id })
                    }
                >
                    Unpublish
                </Button>
            ) : (
                <Button
                    size="sm"
                    fontSize="xs"
                    bg="#0F7B5C"
                    color="white"
                    borderRadius="10px"
                    _hover={{ bg: '#0C6B50' }}
                    disabled={controller.actionPending}
                    onClick={() =>
                        controller.publish.mutate({ kind: selected.kind, id: selected.id })
                    }
                >
                    Publish
                </Button>
            )}
            {selected.isRestricted ? (
                <Button
                    size="sm"
                    variant="outline"
                    fontSize="xs"
                    borderRadius="10px"
                    disabled={controller.actionPending}
                    onClick={() => openReason('unrestrict')}
                >
                    Lift restriction
                </Button>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    fontSize="xs"
                    borderRadius="10px"
                    color="#92660C"
                    borderColor="#FDE68A"
                    disabled={controller.actionPending}
                    onClick={() => openReason('restrict')}
                >
                    Restrict
                </Button>
            )}
            <Button
                size="sm"
                variant="outline"
                fontSize="xs"
                borderRadius="10px"
                color="#C53030"
                borderColor="#FECACA"
                disabled={controller.actionPending}
                onClick={() => openReason('remove')}
            >
                Remove
            </Button>
            <Button
                size="sm"
                variant="outline"
                fontSize="xs"
                borderRadius="10px"
                disabled={controller.actionPending}
                onClick={() =>
                    controller.restore.mutate({ kind: selected.kind, id: selected.id })
                }
            >
                Restore
            </Button>
        </HStack>
    ) : undefined;

    return (
        <DetailDrawer
            open={selected !== null}
            onClose={close}
            title={item?.title ?? 'Content'}
            subtitle={item ? `${item.kind} · ${item.ownerName}` : undefined}
            footer={footer}
        >
            {error ? (
                <AdminError error={error} message="Could not load this content item." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : item ? (
                <VStack align="stretch" gap={5}>
                    <HStack justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                        <IdentityCell
                            name={data?.owner.name ?? item.ownerName}
                            secondary={data?.owner.role ?? item.ownerRole}
                            avatarUrl={data?.owner.avatarUrl}
                        />
                        <StatusBadge status={item.isPublished ? 'Published' : item.status} />
                    </HStack>

                    <SimpleGrid columns={2} gap={4}>
                        <Field label="Kind" value={<Text textTransform="capitalize">{item.kind}</Text>} />
                        {item.releaseType && <Field label="Release type" value={item.releaseType} />}
                        {item.videoType && <Field label="Video type" value={item.videoType} />}
                        {item.genreName && <Field label="Genre" value={item.genreName} />}
                        <Field label="Plays / Views" value={formatCount(item.metricCount)} />
                        <Field label="Likes" value={formatCount(item.likeCount)} />
                        <Field label="Released" value={adminDate(item.releaseDate ?? item.createdAt)} />
                        <Field label="Created" value={adminDate(item.createdAt)} />
                        <Field
                            label="Restricted"
                            value={item.isRestricted ? 'Yes' : 'No'}
                        />
                        {data && (
                            <Field label="Reports" value={formatCount(data.reportCount)} />
                        )}
                    </SimpleGrid>

                    {(item.heldForDuplicateReview || (data && data.duplicate.matchCount > 0)) && (
                        <Box
                            bg="#FFF9E6"
                            border="1px solid"
                            borderColor="#FDE68A"
                            borderRadius="lg"
                            p={3}
                        >
                            <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs" fontWeight="semibold" color="#92660C">
                                    Duplicate review
                                </Text>
                                {data?.duplicate.topTier && (
                                    <StatusBadge style={toneStyle('warning', data.duplicate.topTier)} />
                                )}
                            </HStack>
                            <Text fontSize="11px" color="#92660C">
                                {data
                                    ? `${formatCount(data.duplicate.matchCount)} potential match(es)` +
                                      (data.duplicate.topScore != null
                                          ? ` · top score ${(data.duplicate.topScore * 100).toFixed(0)}%`
                                          : '')
                                    : 'Held pending duplicate review.'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            ) : null}
        </DetailDrawer>
    );
};
