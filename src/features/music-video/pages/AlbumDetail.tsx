import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { DetailHero } from '../components/DetailHero';
import { AlbumTrackRow } from '../components/AlbumTrackRow';
import { useAlbumDetail } from '../hooks/useAlbumDetail';
import { usePlayerStore } from '@/features/player/store/usePlayerStore';

export const AlbumDetail: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const { data, isLoading, error } = useAlbumDetail(id);
    const playTrack = usePlayerStore((s) => s.play);

    const totalDuration = data?.totalDurationSeconds ?? 0;

    const handlePlayAll = () => {
        if (!data?.tracks?.length) return;
        const [first, ...rest] = data.tracks;
        playTrack(
            {
                id: first.id,
                title: first.title,
                artist: data.tracks[0]?.title ?? '',
                coverArtUrl: data.coverArtUrl,
                durationSeconds: first.durationSeconds,
            },
            rest.map((t) => ({
                id: t.id,
                title: t.title,
                artist: '',
                coverArtUrl: data.coverArtUrl,
                durationSeconds: t.durationSeconds,
            }))
        );
    };

    return (
        <Box p={{ base: 4, md: 8, lg: 10 }} maxW="1280px" mx="auto">
            <DetailHero
                kind="album"
                id={id}
                cover={data?.coverArtUrl}
                title={data?.title ?? '—'}
                artist={`${data?.totalTracks ?? 0} tracks`}
                meta={{
                    plays: data?.playCount ?? 0,
                    durationSeconds: totalDuration,
                    releaseDate: data?.releaseDate,
                    isUnlocked: true,
                    unlockCostCoins: 0,
                }}
                description={data?.description}
                isLoading={isLoading}
                error={error ? 'Failed to load album' : null}
                onPrimary={handlePlayAll}
                primaryLabel="Play all"
            />

            <VStack align="stretch" mt={10} gap={1}>
                <Text
                    fontSize="11px"
                    fontWeight="semibold"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="gray.blue.700"
                    mb={2}
                    px={3}
                >
                    Tracklist
                </Text>
                {(data?.tracks ?? []).map((t, i) => (
                    <AlbumTrackRow
                        key={t.id}
                        index={i + 1}
                        id={t.id}
                        title={t.title}
                        coverArtUrl={data?.coverArtUrl}
                        durationSeconds={t.durationSeconds}
                        playCount={t.playCount}
                        isUnlocked={t.isUnlocked}
                        onPlay={() => {
                            const queue = (data?.tracks ?? []).slice(i + 1).map((tt) => ({
                                id: tt.id,
                                title: tt.title,
                                artist: '',
                                coverArtUrl: data?.coverArtUrl,
                                durationSeconds: tt.durationSeconds,
                            }));
                            playTrack(
                                {
                                    id: t.id,
                                    title: t.title,
                                    artist: '',
                                    coverArtUrl: data?.coverArtUrl,
                                    durationSeconds: t.durationSeconds,
                                },
                                queue
                            );
                        }}
                    />
                ))}
            </VStack>
        </Box>
    );
};

export default AlbumDetail;
