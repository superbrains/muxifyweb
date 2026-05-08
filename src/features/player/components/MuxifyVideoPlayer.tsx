import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Icon, IconButton, Spinner, Text } from '@chakra-ui/react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiVideo } from 'react-icons/fi';
import { contentService, formatDuration } from '@shared/services/contentService';
import { usePlayerStore } from '../store/usePlayerStore';

interface MuxifyVideoPlayerProps {
    videoId: string;
    thumbnail?: string;
    title?: string;
}

export const MuxifyVideoPlayer: React.FC<MuxifyVideoPlayerProps> = ({ videoId, thumbnail, title }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const pauseForVideo = usePlayerStore((s) => s.pauseForVideo);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        contentService
            .getVideoStreamUrl(videoId)
            .then((res) => {
                if (cancelled) return;
                // The backend returns a direct URL (SAS or proxy path).
                // For .m3u8 the browser must support HLS natively (Safari) — adding
                // hls.js for Chrome is left as a future enhancement.
                setStreamUrl(res.url);
                setLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                setError((err as Error).message ?? 'Failed to load video');
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            pauseForVideo();
            void v.play().catch(() => {});
        } else {
            v.pause();
        }
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const v = videoRef.current;
        if (!v || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        v.currentTime = ratio * duration;
    };

    const requestFullscreen = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.requestFullscreen) v.requestFullscreen();
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <Box
            position="relative"
            w="100%"
            aspectRatio="16 / 9"
            bg="black"
            borderRadius="2xl"
            overflow="hidden"
            shadow="md"
            role="group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            {loading && (
                <Flex position="absolute" inset={0} align="center" justify="center" zIndex={2}>
                    <Spinner size="lg" color="primary.500" />
                </Flex>
            )}

            {error && (
                <Flex
                    position="absolute"
                    inset={0}
                    align="center"
                    justify="center"
                    direction="column"
                    gap={3}
                    color="white"
                    zIndex={2}
                >
                    <Icon as={FiVideo} boxSize={10} opacity={0.5} />
                    <Text fontSize="14px" opacity={0.85}>
                        {error}
                    </Text>
                </Flex>
            )}

            {streamUrl && (
                <video
                    ref={videoRef}
                    src={streamUrl}
                    poster={thumbnail}
                    title={title}
                    onPlay={() => {
                        setPlaying(true);
                        pauseForVideo();
                    }}
                    onPause={() => setPlaying(false)}
                    onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                    onClick={togglePlay}
                    style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                />
            )}

            {/* Controls overlay */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)"
                px={4}
                py={3}
                opacity={showControls || !playing ? 1 : 0}
                transition="opacity 0.2s ease"
                pointerEvents={showControls || !playing ? 'auto' : 'none'}
            >
                {/* Scrubber */}
                <Box
                    h="4px"
                    bg="whiteAlpha.300"
                    borderRadius="full"
                    cursor="pointer"
                    onClick={handleSeek}
                    mb={2}
                >
                    <Box
                        h="100%"
                        w={`${progress}%`}
                        bg="primary.500"
                        borderRadius="full"
                        transition="width 0.15s linear"
                    />
                </Box>

                <Flex align="center" gap={2}>
                    <IconButton
                        aria-label={playing ? 'Pause' : 'Play'}
                        onClick={togglePlay}
                        size="sm"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                    >
                        <Icon as={playing ? FiPause : FiPlay} boxSize={4} />
                    </IconButton>
                    <IconButton
                        aria-label={muted ? 'Unmute' : 'Mute'}
                        onClick={toggleMute}
                        size="sm"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                    >
                        <Icon as={muted ? FiVolumeX : FiVolume2} boxSize={4} />
                    </IconButton>
                    <Text
                        fontSize="11px"
                        color="white"
                        opacity={0.85}
                        ml={2}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {formatDuration(Math.floor(position))} / {formatDuration(Math.floor(duration))}
                    </Text>
                    <Box flex={1} />
                    <IconButton
                        aria-label="Fullscreen"
                        onClick={requestFullscreen}
                        size="sm"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                    >
                        <Icon as={FiMaximize} boxSize={4} />
                    </IconButton>
                </Flex>
            </Box>
        </Box>
    );
};
