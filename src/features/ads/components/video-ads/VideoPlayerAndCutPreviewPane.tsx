import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Image } from '@chakra-ui/react';
import { FiPlay, FiPause } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { useAdsUploadStore } from '../../store/useAdsUploadStore';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file?: File;
    url?: string;
}

interface VideoPlayerAndCutPreviewPaneProps {
    videoFile: UploadFile | null;
    duration: number; // Duration in seconds (5, 7.5, or 10)
    onDurationChange?: (duration: number) => void;
    onRemove: () => void;
}

export const VideoPlayerAndCutPreviewPane: React.FC<VideoPlayerAndCutPreviewPaneProps> = ({
    videoFile,
    duration,
    onDurationChange,
    onRemove,
}) => {
    // Use selectors to only subscribe to specific actions, not the entire store
    const videoSetTrimStart = useAdsUploadStore((state) => state.videoSetTrimStart);
    const videoSetTrimEnd = useAdsUploadStore((state) => state.videoSetTrimEnd);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrubberRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [trimStart, setTrimStart] = useState(0); // Start time in seconds
    const [trimEnd, setTrimEnd] = useState(duration); // End time in seconds
    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);
    const previewProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const durationOptions = [
        { label: '5 Seconds', value: 5 },
        { label: '7.5 Seconds', value: 7.5 },
        { label: '10 Seconds', value: 10 },
    ];

    // Format time as HH:MM:SS
    const formatTimeFull = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Get video duration when loaded
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                const duration = video.duration;
                setVideoDuration(duration);
                // Set initial trim end to selected duration or max 30 seconds
                const initialEnd = Math.min(duration, 30);
                setTrimEnd(initialEnd);
                videoSetTrimEnd(initialEnd);
                if (onDurationChange) {
                    onDurationChange(Math.min(duration, initialEnd));
                }
            };
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [videoFile, onDurationChange, videoSetTrimEnd]);

    // Generate thumbnails from video
    useEffect(() => {
        if (videoFile && videoFile.url && videoDuration > 0) {
            const video = document.createElement('video');
            video.src = videoFile.url;
            video.crossOrigin = 'anonymous';
            video.preload = 'metadata';

            const generateThumbnails = async () => {
                try {
                    await new Promise((resolve) => {
                        video.onloadedmetadata = () => resolve(null);
                        video.onerror = () => resolve(null);
                        setTimeout(() => resolve(null), 5000);
                    });

                    if (video.readyState < 2) return;

                    const thumbnailCount = Math.min(20, Math.floor(videoDuration)); // More thumbnails for better scrubber
                    const maxDuration = Math.min(videoDuration, 30);
                    const interval = maxDuration / thumbnailCount;
                    const newThumbnails: string[] = [];

                    for (let i = 0; i < thumbnailCount; i++) {
                        const seekTime = Math.min(i * interval, maxDuration - 0.1);
                        video.currentTime = seekTime;

                        await new Promise((resolve) => {
                            const timeout = setTimeout(() => resolve(null), 500);
                            video.onseeked = () => {
                                clearTimeout(timeout);
                                try {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = video.videoWidth || 320;
                                    canvas.height = video.videoHeight || 240;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                        newThumbnails.push(canvas.toDataURL('image/jpeg'));
                                    }
                                } catch (err) {
                                    console.warn('Error capturing thumbnail:', err);
                                }
                                resolve(null);
                            };
                        });
                    }

                    if (newThumbnails.length > 0) {
                        setThumbnails(newThumbnails);
                    }
                } catch (error) {
                    console.error('Error generating thumbnails:', error);
                }
            };

            generateThumbnails();

            return () => {
                video.src = '';
            };
        }
    }, [videoFile, videoDuration]);

    // Update trim end when duration changes
    useEffect(() => {
        if (videoDuration > 0) {
            const maxDuration = Math.min(videoDuration, 30);
            const newEnd = Math.min(duration, maxDuration);
            setTrimEnd(newEnd);
            videoSetTrimEnd(newEnd);
            if (trimStart >= newEnd) {
                const newStart = Math.max(0, newEnd - duration);
                setTrimStart(newStart);
                videoSetTrimStart(newStart);
            }
        }
    }, [duration, videoDuration, trimStart, videoSetTrimStart, videoSetTrimEnd]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);

            // Loop within trim range
            if (time >= trimEnd) {
                videoRef.current.currentTime = trimStart;
            }
        }
    };

    // Convert time to percentage for scrubber
    const timeToPercent = (time: number): number => {
        if (videoDuration === 0) return 0;
        const maxDuration = Math.min(videoDuration, 30);
        return Math.min(100, Math.max(0, (time / maxDuration) * 100));
    };

    // Convert percentage to time
    const percentToTime = useCallback((percent: number): number => {
        const maxDuration = Math.min(videoDuration, 30);
        return (percent / 100) * maxDuration;
    }, [videoDuration]);

    // Handle scrubber click
    const handleScrubberClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrubberRef.current || isDraggingLeft || isDraggingRight) return;

        const rect = scrubberRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = (x / rect.width) * 100;
        const newTime = percentToTime(percent);

        if (newTime >= trimStart && newTime <= trimEnd && videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, [isDraggingLeft, isDraggingRight, trimStart, trimEnd, percentToTime]);

    // Handle drag for left handle
    const handleLeftDrag = useCallback((e: MouseEvent) => {
        if (!scrubberRef.current) return;

        const rect = scrubberRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newStart = percentToTime(percent);
        const maxDuration = Math.min(videoDuration, 30);

        if (newStart < trimEnd && newStart >= 0 && newStart <= maxDuration) {
            setTrimStart(newStart);
            videoSetTrimStart(newStart);
            if (videoRef.current && currentTime < newStart) {
                videoRef.current.currentTime = newStart;
                setCurrentTime(newStart);
            }
        }
    }, [trimEnd, videoDuration, currentTime, percentToTime, videoSetTrimStart]);

    // Handle drag for right handle
    const handleRightDrag = useCallback((e: MouseEvent) => {
        if (!scrubberRef.current) return;

        const rect = scrubberRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newEnd = percentToTime(percent);
        const maxDuration = Math.min(videoDuration, 30);

        if (newEnd > trimStart && newEnd >= 0 && newEnd <= maxDuration) {
            setTrimEnd(newEnd);
            videoSetTrimEnd(newEnd);
            if (onDurationChange) {
                onDurationChange(newEnd - trimStart);
            }
            if (videoRef.current && currentTime > newEnd) {
                videoRef.current.currentTime = newEnd;
                setCurrentTime(newEnd);
            }
        }
    }, [trimStart, videoDuration, currentTime, onDurationChange, percentToTime, videoSetTrimEnd]);

    // Setup drag listeners
    useEffect(() => {
        if (isDraggingLeft) {
            const handleMouseMove = (e: MouseEvent) => handleLeftDrag(e);
            const handleMouseUp = () => setIsDraggingLeft(false);

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDraggingLeft, handleLeftDrag]);

    useEffect(() => {
        if (isDraggingRight) {
            const handleMouseMove = (e: MouseEvent) => handleRightDrag(e);
            const handleMouseUp = () => setIsDraggingRight(false);

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDraggingRight, handleRightDrag]);

    // Calculate preview progress based on current time within trim range
    const getPreviewProgress = (): number => {
        if (trimEnd <= trimStart) return 0;
        const trimDuration = trimEnd - trimStart;
        const progressTime = Math.max(0, Math.min(trimDuration, currentTime - trimStart));
        return (progressTime / trimDuration) * 100;
    };

    // Preview play/pause - controls the main video player
    const handlePreviewPlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                // Ensure video starts from trimStart if it's before or after trim range
                if (currentTime < trimStart || currentTime > trimEnd) {
                    videoRef.current.currentTime = trimStart;
                    setCurrentTime(trimStart);
                }
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Cleanup interval on unmount
    useEffect(() => {
        const intervalRef = previewProgressIntervalRef.current;
        return () => {
            if (intervalRef) {
                clearInterval(intervalRef);
            }
        };
    }, []);

    if (!videoFile) {
        return null;
    }

    const videoUrl = videoFile.url || '';
    const trimStartPercent = timeToPercent(trimStart);
    const trimEndPercent = timeToPercent(trimEnd);
    const trimWidth = trimEndPercent - trimStartPercent;
    const currentTimePercent = timeToPercent(currentTime);

    return (
        <VStack align="stretch" gap={3} mt={4}>
            {/* Duration Selection Buttons */}
            <HStack gap={2} w="full">
                {durationOptions.map((option) => (
                    <Button
                        key={option.value}
                        flex={1}
                        variant={duration === option.value ? 'solid' : 'outline'}
                        bg={duration === option.value ? 'primary.500' : 'transparent'}
                        color={duration === option.value ? 'white' : 'gray.700'}
                        borderColor={duration === option.value ? 'primary.500' : 'gray.300'}
                        borderRadius="10px"
                        size="xs"
                        h="32px"
                        px={4}
                        fontSize="11px"
                        fontWeight="medium"
                        onClick={() => {
                            if (onDurationChange) {
                                onDurationChange(option.value);
                            }
                        }}
                        _hover={{
                            bg: duration === option.value ? 'primary.600' : 'gray.50',
                            borderColor: duration === option.value ? 'primary.600' : 'gray.400',
                        }}
                    >
                        {option.label}
                    </Button>
                ))}
            </HStack>

<Box display="flex" flexDirection="column">
      <Box
                position="relative"
                w="full"
                h="300px"
                bg="black"
                borderTopRadius="10px"
                overflow="hidden"
            >
                <video
                    ref={videoRef}
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />

                {/* Dark Overlay at Bottom */}
                <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="50px"
                    bgGradient="linear(to top, rgba(0,0,0,0.8) 0%, transparent 100%)"
                    display="flex"
                    alignItems="center"
                    px={4}
                    zIndex={2}
                >
                    <HStack justify="space-between" w="full">
                        <Text fontSize="12px" color="white" fontWeight="medium">
                            {formatTimeFull(trimStart)}
                        </Text>
                        <Text fontSize="12px" color="white" fontWeight="medium">
                            {formatTimeFull(trimEnd)}
                        </Text>
                    </HStack>
                </Box>

                {/* Play/Pause Overlay Button */}
                <Button
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    variant="ghost"
                    size="lg"
                    borderRadius="full"
                    bg="rgba(0,0,0,0.6)"
                    backdropFilter="blur(10px)"
                    color="white"
                    _hover={{ bg: 'rgba(0,0,0,0.8)' }}
                    onClick={handlePlayPause}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w="60px"
                    h="60px"
                    zIndex={3}
                >
                    <Icon as={isPlaying ? FiPause : FiPlay} boxSize={6} />
                </Button>
            </Box>

            {/* Video Scrubber Bar with Thumbnails */}
            <Box position="relative" w="full" px={2} pb={2} bg="black" borderBottomRadius="10px">
                <Box
                    ref={scrubberRef}
                    position="relative"
                    w="full"
                    h="60px"
                    bg="gray.100"
                    borderRadius="5px"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={handleScrubberClick}
                >
                    {/* Thumbnails */}
                    {thumbnails.length > 0 && (
                        <HStack gap={0} h="full" position="absolute" top={0} left={0} right={0}>
                            {thumbnails.map((thumbnail, index) => (
                                <Box
                                    key={index}
                                    flexShrink={0}
                                    w={`${100 / thumbnails.length}%`}
                                    h="full"
                                    overflow="hidden"
                                    userSelect="none"
                                    style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                                >
                                    <Image
                                        src={thumbnail}
                                        alt={`Thumbnail ${index + 1}`}
                                        w="full"
                                        h="full"
                                        objectFit="cover"
                                        draggable={false}
                                        style={{
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            MozUserSelect: 'none',
                                            pointerEvents: 'none',
                                            // @ts-expect-error - WebkitUserDrag is a valid CSS property
                                            WebkitUserDrag: 'none',
                                        }}
                                    />
                                </Box>
                            ))}
                        </HStack>
                    )}

                    {/* Transparent Black Overlay on Thumbnails */}
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        h="full"
                        bg="rgba(0, 0, 0, 0.3)"
                        pointerEvents="none"
                        zIndex={1}
                    />

                    {/* Active Trim Section Highlight */}
                    <Box
                        position="absolute"
                        top={0}
                        left={`${trimStartPercent}%`}
                        w={`${trimWidth}%`}
                        h="full"
                        border="2px solid white"
                        borderRadius="md"
                        pointerEvents="none"
                        zIndex={2}
                    />

                    {/* Left Drag Handle */}
                    <Box
                        position="absolute"
                        left={`${trimStartPercent}%`}
                        top="50%"
                        transform="translate(-50%, -50%)"
                        w="16px"
                        h="16px"
                        borderRadius="full"
                        bg="white"
                        border="2px solid"
                        borderColor="white"
                        cursor="ew-resize"
                        zIndex={3}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDraggingLeft(true);
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="white"
                        />
                    </Box>

                    {/* Right Drag Handle */}
                    <Box
                        position="absolute"
                        left={`${trimEndPercent}%`}
                        top="50%"
                        transform="translate(-50%, -50%)"
                        w="16px"
                        h="16px"
                        borderRadius="full"
                        bg="white"
                        border="2px solid"
                        borderColor="white"
                        cursor="ew-resize"
                        zIndex={3}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDraggingRight(true);
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="white"
                        />
                    </Box>

                    {/* Current Playback Position Indicator */}
                    <Box
                        position="absolute"
                        left={`${currentTimePercent}%`}
                        top={0}
                        bottom={0}
                        w="2px"
                        bg="white"
                        zIndex={3}
                        pointerEvents="none"
                    >
                        <Box
                            position="absolute"
                            top={-4}
                            left="50%"
                            transform="translateX(-50%)"
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg="white"
                            border="2px solid"
                            borderColor="primary.500"
                        />
                    </Box>
                </Box>
            </Box>

</Box>
            {/* Main Video Player */}
          


            {/* File Info Section */}
            <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                <HStack justify="space-between" gap={3}>
                    {/* Left: File Info */}
                    <VStack flex="2" align="start" gap={0} minW={0}>
                        <Text fontSize="14px" color="gray.900" fontWeight="normal" lineClamp={1}>
                            {videoFile.name}
                        </Text>
                        <HStack gap={2} mt={1}>
                            <Text fontSize="12px" color="primary.500" fontWeight="medium">
                                Ready
                            </Text>
                            <Text fontSize="12px" color="gray.500">
                                • {videoFile.size}
                            </Text>
                        </HStack>
                    </VStack>

                    {/* Right: Preview Controls */}
                    <HStack gap={2} flexShrink={0} alignItems="center">
                        {/* Play/Pause Button */}
                        <Box
                            as="button"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            onClick={handlePreviewPlayPause}
                            border="none"
                            bg="transparent"
                            _focus={{ outline: 'none' }}
                            p={0}
                            _hover={{ opacity: 0.8 }}
                        >
                            <Icon
                                as={isPlaying ? FiPause : FiPlay}
                                boxSize={5}
                                color="primary.500"
                            />
                        </Box>

                        {/* Progress Bar */}
                        <Box
                            position="relative"
                            bg="gray.300"
                            borderRadius="full"
                            h="4px"
                            w="120px"
                            overflow="hidden"
                        >
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                h="100%"
                                w={`${getPreviewProgress()}%`}
                                bg="primary.500"
                                borderRadius="full"
                                transition="width 0.1s linear"
                            />
                            <Box
                                position="absolute"
                                top="50%"
                                left={`${getPreviewProgress()}%`}
                                transform="translate(-50%, -50%)"
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg="primary.500"
                                border="1px solid white"
                            />
                        </Box>

                        {/* Remove Button */}
                        <Icon
                            as={MdClose}
                            boxSize={4.5}
                            color="gray.600"
                            cursor="pointer"
                            onClick={onRemove}
                            _hover={{ color: 'gray.800' }}
                        />
                    </HStack>
                </HStack>
            </Box>
        </VStack>
    );
};
