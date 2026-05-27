import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { DetailHero } from '../components/DetailHero';
import { useTrackDetail } from '../hooks/useTrackDetail';
import { useOwnerTrack } from '@/features/moderation/hooks/useOwnerContent';
import { HeldContentBanner } from '@/features/moderation/components/HeldContentBanner';

export const SingleDetail: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const { data, isLoading, error } = useTrackDetail(id);

    // Owner-side fetch runs in parallel. Non-owners get a 403 here (suppressed by
    // retry: false in the hook), so the banner only renders for the artist whose
    // upload was held.
    const ownerTrack = useOwnerTrack(id);
    const showHeldBanner = !!ownerTrack.data?.heldForDuplicateReview;
    const hasDispute = !!ownerTrack.data?.duplicateMatch?.disputedAtUtc;

    return (
        <Box p={{ base: 4, md: 8, lg: 10 }} maxW="1280px" mx="auto">
            <VStack align="stretch" gap={4}>
                {showHeldBanner && (
                    <HeldContentBanner
                        contentType="track"
                        contentId={id}
                        hasDispute={hasDispute}
                    />
                )}
                <DetailHero
                    kind="single"
                    id={id}
                    cover={data?.coverArtUrl}
                    title={data?.title ?? '—'}
                    artist={data?.artistName ?? ''}
                    meta={{
                        plays: data?.playCount ?? 0,
                        durationSeconds: data?.durationSeconds ?? 0,
                        releaseDate: data?.releaseDate,
                        isUnlocked: data?.isUnlocked ?? true,
                        unlockCostCoins: data?.unlockCostCoins ?? 0,
                    }}
                    description={data?.description}
                    isLoading={isLoading}
                    error={error ? 'Failed to load track' : null}
                />
            </VStack>
        </Box>
    );
};

export default SingleDetail;
