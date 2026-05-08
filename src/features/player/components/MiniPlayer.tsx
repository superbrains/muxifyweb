import React from 'react';
import { Box, Flex, HStack, Icon, IconButton, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
    FiPlay,
    FiPause,
    FiSkipForward,
    FiSkipBack,
    FiVolume2,
    FiX,
    FiMusic,
} from 'react-icons/fi';
import { AuthedImage } from '@/shared/components/AuthedImage';
import { useSidebarStore } from '@/shared/store/useSidebarStore';
import { useWindowWidth } from '@/shared/hooks/useWindowsWidth';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatDuration } from '@shared/services/contentService';

const MotionBox = motion(Box);

const sidebarWidthFor = (isMobile: boolean, isCollapsed: boolean) =>
    isMobile ? 0 : isCollapsed ? 105 : 230;

export const MiniPlayer: React.FC = () => {
    const { windowWidth } = useWindowWidth();
    const isMobile = windowWidth < 768;
    const { isCollapsed } = useSidebarStore();

    const currentTrack = usePlayerStore((s) => s.currentTrack);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const isLoading = usePlayerStore((s) => s.isLoading);
    const position = usePlayerStore((s) => s.position);
    const duration = usePlayerStore((s) => s.duration);
    const volume = usePlayerStore((s) => s.volume);
    const toggle = usePlayerStore((s) => s.toggle);
    const seek = usePlayerStore((s) => s.seek);
    const setVolume = usePlayerStore((s) => s.setVolume);
    const next = usePlayerStore((s) => s.next);
    const prev = usePlayerStore((s) => s.prev);
    const stop = usePlayerStore((s) => s.stop);

    if (!currentTrack) return null;

    const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
    const left = sidebarWidthFor(isMobile, isCollapsed);

    return (
        <MotionBox
            initial={false}
            animate={{ left, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                zIndex: 900,
            }}
        >
            <Box
                bg="white"
                borderTopWidth="1px"
                borderColor="gray.100"
                shadow="0 -8px 24px rgba(15, 54, 89, 0.08)"
                px={{ base: 3, md: 5 }}
                py={3}
            >
                {/* Progress bar (hairline at top) */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="3px"
                    bg="gray.100"
                    cursor="pointer"
                    onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const ratio = (e.clientX - rect.left) / rect.width;
                        if (duration > 0) seek(ratio * duration);
                    }}
                >
                    <Box h="100%" w={`${progress}%`} bg="primary.500" transition="width 0.2s linear" />
                </Box>

                <Flex align="center" gap={4} minH="48px">
                    {/* Track info */}
                    <HStack gap={3} flex={{ base: 1, md: '0 0 280px' }} minW={0}>
                        <Box
                            w="44px"
                            h="44px"
                            borderRadius="md"
                            overflow="hidden"
                            bg="gray.50"
                            flexShrink={0}
                        >
                            <AuthedImage
                                src={currentTrack.coverArtUrl}
                                alt={currentTrack.title}
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
                                        <Icon as={FiMusic} boxSize={5} />
                                    </Flex>
                                }
                            />
                        </Box>
                        <VStack align="stretch" gap={0} minW={0}>
                            <Text fontSize="13px" fontWeight="700" color="gray.blue.800" truncate>
                                {currentTrack.title}
                            </Text>
                            <Text fontSize="11px" color="gray.blue.700" truncate>
                                {currentTrack.artist || '—'}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Controls */}
                    <HStack gap={1} flex={{ base: '0 0 auto', md: 1 }} justify="center">
                        <IconButton
                            aria-label="Previous"
                            variant="ghost"
                            size="sm"
                            color="gray.blue.700"
                            _hover={{ color: 'primary.500', bg: 'transparent' }}
                            onClick={prev}
                        >
                            <Icon as={FiSkipBack} boxSize={4} />
                        </IconButton>
                        <IconButton
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            bg="primary.500"
                            color="white"
                            size="sm"
                            borderRadius="full"
                            w="36px"
                            h="36px"
                            minW="36px"
                            _hover={{ bg: 'primary.600' }}
                            onClick={toggle}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="xs" />
                            ) : (
                                <Icon as={isPlaying ? FiPause : FiPlay} boxSize={4} />
                            )}
                        </IconButton>
                        <IconButton
                            aria-label="Next"
                            variant="ghost"
                            size="sm"
                            color="gray.blue.700"
                            _hover={{ color: 'primary.500', bg: 'transparent' }}
                            onClick={next}
                        >
                            <Icon as={FiSkipForward} boxSize={4} />
                        </IconButton>
                        <Text
                            fontSize="11px"
                            color="gray.blue.700"
                            ml={3}
                            display={{ base: 'none', md: 'block' }}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                            minW="80px"
                            textAlign="center"
                        >
                            {formatDuration(Math.floor(position))} / {formatDuration(Math.floor(duration))}
                        </Text>
                    </HStack>

                    {/* Volume + close */}
                    <HStack
                        gap={2}
                        flex={{ base: '0 0 auto', md: '0 0 200px' }}
                        justify="flex-end"
                        display={{ base: 'none', md: 'flex' }}
                    >
                        <Icon as={FiVolume2} boxSize={4} color="gray.blue.700" />
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            style={{
                                width: '100px',
                                accentColor: '#f94444',
                            }}
                        />
                        <IconButton
                            aria-label="Close player"
                            variant="ghost"
                            size="sm"
                            color="gray.blue.700"
                            _hover={{ color: 'primary.500', bg: 'transparent' }}
                            onClick={stop}
                            ml={2}
                        >
                            <Icon as={FiX} boxSize={4} />
                        </IconButton>
                    </HStack>
                </Flex>
            </Box>
        </MotionBox>
    );
};
