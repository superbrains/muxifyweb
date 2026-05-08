import React from 'react';
import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { DetailHero } from '../components/DetailHero';
import { useTrackDetail } from '../hooks/useTrackDetail';

export const SingleDetail: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const { data, isLoading, error } = useTrackDetail(id);

    return (
        <Box p={{ base: 4, md: 8, lg: 10 }} maxW="1280px" mx="auto">
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
        </Box>
    );
};

export default SingleDetail;
