import React, { useRef, useEffect, memo } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Avatar } from '@chakra-ui/react';
import { useAdsUploadStore } from '../store/useAdsUploadStore';
import { FiHeart, FiMessageCircle, FiShare2, FiChevronDown } from 'react-icons/fi';
import { MdHome, MdExplore, MdSearch, MdLibraryMusic } from 'react-icons/md';

export const VideoAdsPhonePreview: React.FC = memo(() => {
    // Only subscribe to specific state slices to prevent unnecessary re-renders
    const videoFile = useAdsUploadStore((state) => state.videoFile);
    const videoTrimStart = useAdsUploadStore((state) => state.videoTrimStart);
    const videoTrimEnd = useAdsUploadStore((state) => state.videoTrimEnd);
    const videoRef = useRef<HTMLVideoElement>(null);

    const videoUrl = videoFile?.url || '';
    const trimStart = videoTrimStart || 0;
    const trimEnd = videoTrimEnd || 5;
    const duration = Math.round(trimEnd - trimStart);

    // Set video to start at trimStart when loaded
    useEffect(() => {
        if (videoRef.current && videoUrl) {
            videoRef.current.currentTime = trimStart;
            videoRef.current.play().catch(() => {
                // Auto-play might be blocked by browser, that's okay
            });
        }
    }, [videoUrl, trimStart]);

    // Handle time updates to loop within trim range
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (video.currentTime >= trimEnd) {
                video.currentTime = trimStart;
            } else if (video.currentTime < trimStart) {
                video.currentTime = trimStart;
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [trimStart, trimEnd]);

    // Update video position when trim values change in real-time
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        // If video is playing and current time is outside trim range, adjust it
        if (video.currentTime < trimStart) {
            video.currentTime = trimStart;
        } else if (video.currentTime > trimEnd) {
            video.currentTime = trimStart;
        }
    }, [trimStart, trimEnd, videoUrl]);

    return (
        <VStack align="stretch" gap={3} w="full" maxW="300px">
            <VStack align="stretch" gap={1}>
                <Text fontSize="16px" fontWeight="semibold" textAlign="center" color="black">
                    Ads Sample
                </Text>
                <Text fontSize="14px" fontWeight="medium" textAlign="center" color="gray.500">
                    This is the preview of your advert
                </Text>
            </VStack>

            {/* Phone Frame */}
            <Box
                bg="#606060"
                borderRadius="20px"
                overflow="hidden"
                position="relative"
                h="650px"
                w="full"
                boxShadow="0px 5.39px 16.17px 6.29px rgba(0,0,0,0.1)"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                {/* Top Fade Effect (Shorter) */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="100px"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                    }}
                    zIndex={2}
                    pointerEvents="none"
                />

                {/* Bottom Fade Effect (Longer) */}
                <Box
                    position="absolute"
                    bottom="50px"
                    left={0}
                    right={0}
                    h="200px"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                    }}
                    zIndex={2}
                    pointerEvents="none"
                />

                {/* Top Navigation Bar */}
                <Box position="absolute" top="12px" left="12px" right="12px" zIndex={3}>
                    <HStack justify="space-between" align="center">
                        {/* Back/Chevron Button */}
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.16)"
                            backdropFilter="blur(27px)"
                            minW="28px"
                            h="28px"
                            p={0}
                        >
                            <Icon as={FiChevronDown} boxSize={4} color="white" />
                        </Button>

                        {/* Follow Button */}
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.16)"
                            backdropFilter="blur(27px)"
                            h="28px"
                            px={3}
                            fontSize="10px"
                            color="white"
                            fontWeight="medium"
                        >
                            + Follow Me
                        </Button>
                    </HStack>
                </Box>

                {/* Video Content - Full Screen */}
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="50px"
                    w="full"
                    h="calc(100% - 50px)"
                    overflow="hidden"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1}
                >
                    {videoUrl ? (
                        <Box position="relative" w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'contain',
                                }}
                                autoPlay
                                loop
                                muted
                                playsInline
                                onLoadedMetadata={() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = trimStart;
                                    }
                                }}
                            />
                            {/* Duration Badge */}
                            <Box
                                position="absolute"
                                top="60px"
                                left="12px"
                                bg="rgba(0,0,0,0.6)"
                                backdropFilter="blur(10px)"
                                borderRadius="full"
                                w="28px"
                                h="28px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                zIndex={3}
                            >
                                <Text fontSize="11px" fontWeight="bold" color="white">
                                    {duration}
                                </Text>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            w="100%"
                            h="100%"
                            bg="rgba(255,255,255,0.1)"
                            backdropFilter="blur(10px)"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap={2}
                            border="2px dashed"
                            borderColor="rgba(255,255,255,0.3)"
                        >
                            <Text fontSize="12px" fontWeight="medium" color="rgba(255,255,255,0.8)" textAlign="center" px={4}>
                                Video Ad Preview
                            </Text>
                        </Box>
                    )}
                </Box>

                {/* Social Interaction Icons - Right Side */}
                <Box
                    position="absolute"
                    right="12px"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={3}
                >
                    <VStack gap={3}>
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.08)"
                            backdropFilter="blur(29px)"
                            minW="32px"
                            h="32px"
                            p={0}
                        >
                            <Icon as={FiHeart} boxSize={5} color="white" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.08)"
                            backdropFilter="blur(29px)"
                            minW="32px"
                            h="32px"
                            p={0}
                        >
                            <Icon as={FiMessageCircle} boxSize={5} color="white" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="xs"
                            borderRadius="20px"
                            bg="rgba(255,255,255,0.08)"
                            backdropFilter="blur(29px)"
                            minW="32px"
                            h="32px"
                            p={0}
                        >
                            <Icon as={FiShare2} boxSize={5} color="white" />
                        </Button>
                    </VStack>
                </Box>

                {/* User Profile and Action Button */}
                <Box
                    position="absolute"
                    bottom="70px"
                    left="12px"
                    right="12px"
                    zIndex={3}
                >
                    <HStack justify="space-between" align="center" mb={2}>
                        <HStack gap={2}>
                            <Avatar.Root size="xs">
                                <Avatar.Fallback bg="gray.400" color="white" fontSize="10px">
                                    MF
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <Text fontSize="12px" fontWeight="medium" color="white">
                                Mr Funny
                            </Text>
                        </HStack>
                        <Button
                            bg="rgba(249,68,68,1)"
                            color="white"
                            size="xs"
                            borderRadius="full"
                            px={4}
                            h="28px"
                            fontSize="11px"
                            fontWeight="semibold"
                            _hover={{ bg: 'rgba(249,68,68,0.9)' }}
                        >
                            Gift Me
                        </Button>
                    </HStack>

                    {/* Ad Description */}
                    <Text
                        fontSize="11px"
                        color="rgba(255,255,255,0.8)"
                        lineHeight="1.4"
                        lineClamp={2}
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Text>
                </Box>

                {/* Bottom Navigation Bar */}
                <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    h="50px"
                    bg="rgba(0,0,0,0.8)"
                    backdropFilter="blur(10px)"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-around"
                    px={4}
                    zIndex={3}
                >
                    <Icon as={MdHome} boxSize={5} color="white" opacity={0.8} />
                    <Icon as={MdExplore} boxSize={5} color="white" opacity={0.8} />
                    <Icon as={MdSearch} boxSize={5} color="white" opacity={0.8} />
                    <Icon as={MdLibraryMusic} boxSize={5} color="white" opacity={0.8} />
                </Box>
            </Box>
        </VStack>
    );
});

