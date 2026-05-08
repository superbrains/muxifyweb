import React from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Icon,
    Skeleton,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    FiArrowLeft,
    FiPlay,
    FiPause,
    FiMusic,
    FiShare2,
    FiEdit2,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthedImage } from '@/shared/components/AuthedImage';
import { LockPill } from './LockPill';
import { formatDuration, formatPlayCount } from '@shared/services/contentService';
import { usePlayerStore } from '@/features/player/store/usePlayerStore';

export type DetailKind = 'single' | 'album';

interface DetailHeroProps {
    kind: DetailKind;
    id: string;
    cover?: string;
    title: string;
    artist: string;
    description?: string;
    isLoading?: boolean;
    error?: string | null;
    meta: {
        plays: number;
        durationSeconds: number;
        releaseDate?: string;
        isUnlocked: boolean;
        unlockCostCoins: number;
    };
    onPrimary?: () => void;
    primaryLabel?: string;
}

export const DetailHero: React.FC<DetailHeroProps> = ({
    kind,
    id,
    cover,
    title,
    artist,
    description,
    isLoading = false,
    error,
    meta,
    onPrimary,
    primaryLabel,
}) => {
    const navigate = useNavigate();
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const play = usePlayerStore((s) => s.play);
    const pause = usePlayerStore((s) => s.pause);
    const resume = usePlayerStore((s) => s.resume);

    const isThisPlaying = currentTrack?.id === id && isPlaying;
    const isThisPaused = currentTrack?.id === id && !isPlaying;

    const handlePrimary = () => {
        if (onPrimary) return onPrimary();
        if (kind !== 'single') return;
        if (isThisPlaying) {
            pause();
        } else if (isThisPaused) {
            resume();
        } else {
            play({
                id,
                title,
                artist,
                coverArtUrl: cover,
                durationSeconds: meta.durationSeconds,
            });
        }
    };

    const primaryText =
        primaryLabel ?? (isThisPlaying ? 'Pause' : isThisPaused ? 'Resume' : 'Play');
    const PrimaryIcon = isThisPlaying ? FiPause : FiPlay;

    if (error) {
        return (
            <Box
                bg="white"
                borderWidth="1px"
                borderColor="gray.100"
                borderRadius="xl"
                shadow="sm"
                p={8}
                textAlign="center"
            >
                <Text color="red.500" fontSize="14px" fontWeight="medium">
                    {error}
                </Text>
            </Box>
        );
    }

    return (
        <VStack align="stretch" gap={6}>
            <Box
                as="button"
                onClick={() => navigate('/music-videos')}
                color="gray.blue.700"
                fontSize="13px"
                w="fit-content"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                _hover={{ color: 'primary.500' }}
                transition="color 0.15s"
            >
                <Icon as={FiArrowLeft} boxSize={4} />
                <Text>Back to Music & Videos</Text>
            </Box>

            <Flex
                bg="white"
                borderWidth="1px"
                borderColor="gray.100"
                borderRadius="2xl"
                shadow="sm"
                p={{ base: 5, md: 7 }}
                gap={{ base: 5, md: 8 }}
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'flex-start' }}
            >
                {/* Cover */}
                <Box
                    w={{ base: '100%', md: '240px' }}
                    h={{ base: '260px', md: '240px' }}
                    flexShrink={0}
                    borderRadius="xl"
                    overflow="hidden"
                    bg="gray.50"
                    position="relative"
                >
                    {isLoading ? (
                        <Skeleton w="100%" h="100%" />
                    ) : (
                        <AuthedImage
                            src={cover}
                            alt={title}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            fallback={
                                <Flex
                                    w="100%"
                                    h="100%"
                                    align="center"
                                    justify="center"
                                    color="gray.300"
                                >
                                    <Icon as={FiMusic} boxSize={16} />
                                </Flex>
                            }
                        />
                    )}
                </Box>

                {/* Meta */}
                <VStack align="stretch" gap={3} flex={1} minW={0}>
                    <HStack gap={2} flexWrap="wrap">
                        <Text
                            fontSize="11px"
                            fontWeight="semibold"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            color="primary.500"
                        >
                            {kind === 'single' ? 'Single' : 'Album'}
                        </Text>
                        <Text color="gray.300">·</Text>
                        <LockPill
                            isUnlocked={meta.isUnlocked}
                            costCoins={meta.unlockCostCoins}
                        />
                    </HStack>

                    {isLoading ? (
                        <Skeleton h="36px" w="60%" />
                    ) : (
                        <Heading
                            as="h1"
                            fontSize={{ base: '28px', md: '38px' }}
                            fontWeight="700"
                            letterSpacing="-0.02em"
                            color="gray.blue.800"
                            lineHeight="1.05"
                        >
                            {title}
                        </Heading>
                    )}

                    {isLoading ? (
                        <Skeleton h="20px" w="40%" />
                    ) : (
                        <Text fontSize="15px" color="gray.blue.700" fontWeight="medium">
                            {artist}
                        </Text>
                    )}

                    <HStack
                        gap={4}
                        mt={1}
                        fontSize="12px"
                        color="gray.blue.700"
                        flexWrap="wrap"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        <Text>{formatPlayCount(meta.plays)} plays</Text>
                        {meta.durationSeconds > 0 && (
                            <>
                                <Text color="gray.300">·</Text>
                                <Text>{formatDuration(meta.durationSeconds)}</Text>
                            </>
                        )}
                        {meta.releaseDate && (
                            <>
                                <Text color="gray.300">·</Text>
                                <Text>
                                    {new Date(meta.releaseDate).toLocaleDateString()}
                                </Text>
                            </>
                        )}
                    </HStack>

                    {description && (
                        <Text
                            fontSize="13px"
                            color="gray.blue.800"
                            lineHeight="1.6"
                            mt={2}
                            lineClamp={3}
                        >
                            {description}
                        </Text>
                    )}

                    <HStack gap={3} mt={4} flexWrap="wrap">
                        <Button
                            bg="primary.500"
                            color="white"
                            h="44px"
                            px={6}
                            borderRadius="full"
                            fontSize="14px"
                            fontWeight="semibold"
                            shadow="sm"
                            _hover={{ bg: 'primary.600' }}
                            onClick={handlePrimary}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <Icon as={PrimaryIcon} boxSize={4} mr={2} />
                                    {primaryText}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            borderColor="gray.200"
                            bg="white"
                            color="gray.blue.800"
                            h="44px"
                            px={5}
                            borderRadius="full"
                            fontSize="14px"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => {
                                const link = `${window.location.origin}/music-videos/${kind}/${id}`;
                                if (navigator.share) {
                                    navigator
                                        .share({ title, url: link })
                                        .catch(() => {});
                                } else {
                                    void navigator.clipboard.writeText(link);
                                }
                            }}
                        >
                            <Icon as={FiShare2} boxSize={4} mr={2} />
                            Share
                        </Button>
                        <Button
                            variant="outline"
                            borderColor="gray.200"
                            bg="white"
                            color="gray.blue.800"
                            h="44px"
                            px={5}
                            borderRadius="full"
                            fontSize="14px"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() =>
                                navigate(
                                    kind === 'single'
                                        ? `/upload?mixId=${id}`
                                        : `/upload?albumId=${id}`
                                )
                            }
                        >
                            <Icon as={FiEdit2} boxSize={4} mr={2} />
                            Edit
                        </Button>
                    </HStack>
                </VStack>
            </Flex>
        </VStack>
    );
};
