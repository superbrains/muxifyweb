import React from 'react';
import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FiPlay, FiPause, FiLock } from 'react-icons/fi';
import { formatDuration, formatPlayCount } from '@shared/services/contentService';
import { usePlayerStore } from '@/features/player/store/usePlayerStore';

interface AlbumTrackRowProps {
    index: number;
    id: string;
    title: string;
    coverArtUrl?: string;
    durationSeconds: number;
    playCount: number;
    isUnlocked: boolean;
    onPlay?: () => void;
}

export const AlbumTrackRow: React.FC<AlbumTrackRowProps> = ({
    index,
    id,
    title,
    durationSeconds,
    playCount,
    isUnlocked,
    onPlay,
}) => {
    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const pause = usePlayerStore((s) => s.pause);
    const resume = usePlayerStore((s) => s.resume);

    const isThis = currentTrack?.id === id;
    const isThisPlaying = isThis && isPlaying;

    const handleClick = () => {
        if (isThisPlaying) return pause();
        if (isThis) return resume();
        onPlay?.();
    };

    return (
        <Flex
            role="group"
            align="center"
            px={3}
            py={2}
            borderRadius="lg"
            cursor="pointer"
            transition="background 0.12s ease"
            _hover={{ bg: 'gray.50' }}
            bg={isThis ? 'primary.25' : 'transparent'}
            onClick={handleClick}
        >
            {/* Index / play button slot */}
            <Box
                w="32px"
                h="32px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={isThis ? 'primary.500' : 'gray.blue.700'}
                fontSize="13px"
                fontWeight="medium"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            >
                <Text _groupHover={{ display: 'none' }} display={isThisPlaying ? 'none' : 'block'}>
                    {index}
                </Text>
                <Icon
                    as={isThisPlaying ? FiPause : FiPlay}
                    boxSize={4}
                    display={isThisPlaying ? 'block' : 'none'}
                    _groupHover={{ display: 'block' }}
                />
            </Box>

            {/* Title */}
            <Box flex={1} minW={0} ml={3}>
                <Text
                    fontSize="14px"
                    fontWeight="600"
                    color={isThis ? 'primary.600' : 'gray.blue.800'}
                    truncate
                >
                    {title}
                </Text>
            </Box>

            {/* Plays */}
            <HStack gap={4} ml={4}>
                {!isUnlocked && (
                    <Icon as={FiLock} color="primary.500" boxSize={3.5} />
                )}
                <Text
                    fontSize="12px"
                    color="gray.blue.700"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    display={{ base: 'none', md: 'block' }}
                    minW="60px"
                    textAlign="right"
                >
                    {formatPlayCount(playCount)}
                </Text>
                <Text
                    fontSize="12px"
                    color="gray.blue.700"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    minW="48px"
                    textAlign="right"
                >
                    {formatDuration(durationSeconds)}
                </Text>
            </HStack>
        </Flex>
    );
};
