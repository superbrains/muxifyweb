import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FiCopy } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ComparisonCard,
    ConfirmActionModal,
    StatusBadge,
    toneStyle,
} from '../../components/ui';
import { adminDate } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useMatch, useConfirmMatch, useDismissMatch } from '../../hooks/useContent';
import type { ComparisonSide } from '../../components/ui';

const tierTone = (tier: string) => {
    switch (tier.toLowerCase()) {
        case 'exact': return 'danger' as const;
        case 'high': return 'warning' as const;
        case 'medium': return 'info' as const;
        default: return 'neutral' as const;
    }
};

/** Dedicated detail page for a single duplicate match (/admin/content/duplicates/:id). */
const DuplicateMatchDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const canReview = useHasPermission('CopyrightReview');

    const { data: match, isLoading, error } = useMatch(id ?? null);
    const confirm = useConfirmMatch();
    const dismiss = useDismissMatch();

    const [modal, setModal] = React.useState<'confirm' | 'dismiss' | null>(null);
    const pending = confirm.isPending || dismiss.isPending;

    if (error) {
        return (
            <AdminPageLayout
                title="Duplicate Match"
                breadcrumbs={[
                    { label: 'Content', to: '/admin/content' },
                    { label: 'Duplicate Detection', to: '/admin/content/duplicates' },
                    { label: 'Match' },
                ]}
            >
                <AdminError error={error} message="Could not load this duplicate match." />
            </AdminPageLayout>
        );
    }

    if (isLoading || !match) {
        return (
            <AdminPageLayout
                title="Duplicate Match"
                breadcrumbs={[
                    { label: 'Content', to: '/admin/content' },
                    { label: 'Duplicate Detection', to: '/admin/content/duplicates' },
                    { label: 'Match' },
                ]}
            >
                <VStack align="stretch" gap={4}>
                    <Skeleton h="80px" borderRadius="16px" />
                    <Skeleton h="240px" borderRadius="16px" />
                </VStack>
            </AdminPageLayout>
        );
    }

    const isPending = match.status.toLowerCase() === 'pending';

    const leftSide: ComparisonSide = {
        label: 'Suspect content',
        title: match.suspectTitle ?? '(unknown)',
        ownerName: match.suspectOwnerName,
        coverArtUrl: match.suspectCoverArtUrl,
        fields: [
            { key: 'Content ID', value: match.suspectContentId?.toString() },
        ],
    };

    const rightSide: ComparisonSide = {
        label: 'Matched against',
        title: match.matchedTitle ?? '(unknown)',
        ownerName: match.matchedOwnerName,
        coverArtUrl: match.matchedCoverArtUrl,
        fields: [
            { key: 'Content ID', value: match.matchedContentId?.toString() },
        ],
    };

    const headerActions = canReview && isPending ? (
        <HStack gap={2}>
            <Button
                size="sm"
                fontSize="xs"
                borderRadius="10px"
                variant="outline"
                borderColor="gray.200"
                color="gray.700"
                disabled={pending}
                onClick={() => setModal('dismiss')}
            >
                Dismiss
            </Button>
            <Button
                size="sm"
                fontSize="xs"
                borderRadius="10px"
                variant="outline"
                borderColor="#FECACA"
                color="#C53030"
                disabled={pending}
                onClick={() => setModal('confirm')}
            >
                Confirm duplicate
            </Button>
        </HStack>
    ) : undefined;

    return (
        <>
            <AdminPageLayout
                title="Duplicate Match"
                breadcrumbs={[
                    { label: 'Content', to: '/admin/content' },
                    { label: 'Duplicate Detection', to: '/admin/content/duplicates' },
                    { label: 'Match detail' },
                ]}
                actions={headerActions}
            >
                {/* Summary header */}
                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="16px"
                    p={{ base: 4, md: 5 }}
                    shadow="xs"
                    mb={4}
                >
                    <HStack gap={3} flexWrap="wrap" justify="space-between">
                        <HStack gap={2} flexWrap="wrap">
                            <FiCopy color="#64748B" />
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                Duplicate match
                            </Text>
                            <StatusBadge style={toneStyle(tierTone(match.tier), match.tier)} />
                            <StatusBadge status={match.status} />
                            {match.isDisputed && (
                                <StatusBadge style={toneStyle('warning', 'Disputed')} />
                            )}
                        </HStack>
                        <HStack gap={4}>
                            <VStack align="start" gap={0}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                    {(match.score * 100).toFixed(0)}%
                                </Text>
                                <Text fontSize="10px" color="gray.500">Similarity</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                    {match.matchMethod}
                                </Text>
                                <Text fontSize="10px" color="gray.500">Method</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                    {match.mediaType}
                                </Text>
                                <Text fontSize="10px" color="gray.500">Media type</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                    {adminDate(match.createdAt)}
                                </Text>
                                <Text fontSize="10px" color="gray.500">Detected</Text>
                            </VStack>
                        </HStack>
                    </HStack>
                </Box>

                <ComparisonCard left={leftSide} right={rightSide} />

                {match.artistDisputeNote && (
                    <Box
                        bg="#FFF9E6"
                        border="1px solid"
                        borderColor="#FDE68A"
                        borderRadius="xl"
                        p={4}
                        mt={4}
                    >
                        <Text fontSize="11px" fontWeight="semibold" color="#92660C" mb={1}>
                            Artist dispute note
                        </Text>
                        <Text fontSize="xs" color="#92660C">
                            {match.artistDisputeNote}
                        </Text>
                    </Box>
                )}
            </AdminPageLayout>

            <ConfirmActionModal
                isOpen={modal === 'confirm'}
                onClose={() => setModal(null)}
                onConfirm={(reason) =>
                    id &&
                    confirm.mutate(
                        { id, reason },
                        {
                            onSuccess: () => {
                                setModal(null);
                                navigate('/admin/content/duplicates');
                            },
                        },
                    )
                }
                title="Confirm this duplicate match"
                message={`Confirm "${match.suspectTitle}" duplicates "${match.matchedTitle}". The suspect content will be taken down.`}
                reasonLabel="Confirmation note"
                confirmText="Confirm duplicate"
                tone="danger"
                isLoading={confirm.isPending}
            />

            <ConfirmActionModal
                isOpen={modal === 'dismiss'}
                onClose={() => setModal(null)}
                onConfirm={(reason) =>
                    id &&
                    dismiss.mutate(
                        { id, reason },
                        {
                            onSuccess: () => {
                                setModal(null);
                                navigate('/admin/content/duplicates');
                            },
                        },
                    )
                }
                title="Dismiss this match"
                message={`Dismiss the match for "${match.suspectTitle}". No action will be taken.`}
                reasonLabel="Dismissal reason"
                confirmText="Dismiss match"
                tone="primary"
                isLoading={dismiss.isPending}
            />
        </>
    );
};

export default DuplicateMatchDetailPage;
