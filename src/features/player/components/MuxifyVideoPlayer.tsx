import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Icon, IconButton, Spinner, Text } from '@chakra-ui/react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiVideo } from 'react-icons/fi';
import Hls from 'hls.js';
import { contentService, formatDuration } from '@shared/services/contentService';
import { axiosInstance, ensureFreshAccessToken, tokenStorage } from '@app/lib/axiosInstance';
import { usePlayerStore } from '../store/usePlayerStore';

interface MuxifyVideoPlayerProps {
    videoId: string;
    thumbnail?: string;
    title?: string;
}

/**
 * Resolve a backend-relative API path (e.g. `/api/v1/video/stream/{id}/master.m3u8`)
 * to an absolute URL on the API origin. The path already carries the `/api/v1` prefix,
 * so we only need the scheme+host from the axios baseURL.
 */
const toAbsoluteApiUrl = (path: string): string => {
    const baseURL = axiosInstance.defaults.baseURL ?? '';
    try {
        return new URL(baseURL).origin + path;
    } catch {
        return path;
    }
};

export const MuxifyVideoPlayer: React.FC<MuxifyVideoPlayerProps> = ({ videoId, thumbnail, title }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    // Progressive MP4 (SAS) source — used for browsers without MSE (iOS Safari) and as a
    // fallback when hls.js can't recover. HLS playback attaches via hls.js and leaves this null.
    const [progressiveSrc, setProgressiveSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const pauseForVideo = usePlayerStore((s) => s.pauseForVideo);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let cancelled = false;
        let hls: Hls | null = null;
        // Cap forced token refreshes triggered by 401 segment errors so a dead refresh
        // token can't spin the player in an infinite refresh→retry loop.
        let tokenRetries = 0;

        setLoading(true);
        setError(null);
        setProgressiveSrc(null);

        const fallbackToProgressive = (url: string) => {
            if (cancelled) return;
            hls?.destroy();
            hls = null;
            hlsRef.current = null;
            setProgressiveSrc(url);
            setLoading(false);
        };

        const attach = async () => {
            let res;
            try {
                res = await contentService.getVideoStreamUrl(videoId);
            } catch (err) {
                if (!cancelled) {
                    setError((err as Error).message ?? 'Failed to load video');
                    setLoading(false);
                }
                return;
            }
            if (cancelled) return;

            const masterUrl = res.hlsUrl ? toAbsoluteApiUrl(res.hlsUrl) : null;

            // hls.js drives adaptive playback everywhere MSE exists (Chrome/Firefox/Edge and
            // Safari on desktop). We deliberately do NOT use the browser's native HLS for the
            // proxy URL: native players can't attach our Authorization header, so every
            // segment would 401. iOS Safari (no MSE) therefore falls back to the progressive
            // SAS MP4, which needs no header.
            if (masterUrl && Hls.isSupported()) {
                // Make sure the first playlist/segment requests carry a valid token.
                await ensureFreshAccessToken();
                if (cancelled) return;

                hls = new Hls({
                    // Attach the JWT to every request (master, variant playlists, .ts segments)
                    // — they all resolve back through the authenticated proxy endpoint.
                    xhrSetup: (xhr) => {
                        const token = tokenStorage.getAccessToken();
                        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    },
                });
                hlsRef.current = hls;

                hls.on(Hls.Events.ERROR, (_evt, data) => {
                    // Mid-playback token expiry (access tokens are short-lived): force a refresh
                    // and resume loading. Bounded by tokenRetries to avoid a loop on a dead session.
                    if (data.response?.code === 401 && tokenRetries < 2) {
                        tokenRetries += 1;
                        void ensureFreshAccessToken(Number.MAX_SAFE_INTEGER).then(() => {
                            if (!cancelled) hls?.startLoad();
                        });
                        return;
                    }

                    if (!data.fatal) return;

                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls?.recoverMediaError();
                            break;
                        default:
                            // Unrecoverable — drop to the progressive MP4 so the user still plays.
                            fallbackToProgressive(res!.url);
                    }
                });

                hls.loadSource(masterUrl);
                hls.attachMedia(video);
                setLoading(false);
            } else {
                fallbackToProgressive(res.url);
            }
        };

        void attach();

        return () => {
            cancelled = true;
            hls?.destroy();
            hlsRef.current = null;
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

            {/* Always mounted so hls.js can attach to the element via the ref. The src is
                only set for the progressive (non-HLS) path; in HLS mode hls.js feeds buffers. */}
            <video
                ref={videoRef}
                src={progressiveSrc ?? undefined}
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
