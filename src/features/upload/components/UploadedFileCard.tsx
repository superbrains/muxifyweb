import React, { useState, useRef, useEffect } from 'react';
import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiVideo, FiImage } from 'react-icons/fi';
import { MdClose, MdPlayArrow, MdPause } from 'react-icons/md';

interface UploadedFileCardProps {
    fileName: string;
    fileSize: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    onRemove?: () => void;
    onPlay?: () => void;
    showIndex?: number;
    type?: 'audio' | 'video' | 'image';
    file?: File;
}

export const UploadedFileCard: React.FC<UploadedFileCardProps> = ({
    fileName,
    fileSize,
    progress,
    status,
    onRemove,
    onPlay,
    showIndex,
    type = 'audio',
    file,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement>(null);

    // Create audio URL when file is provided
    useEffect(() => {
        if (file && type === 'audio') {
            const url = URL.createObjectURL(file);
            setAudioUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file, type]);

    // Handle audio time update
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        const updateProgress = () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            setAudioProgress(progress || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setAudioProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
        onPlay?.();
    };

    const getStatusText = () => {
        if (status === 'uploading') return `${progress}% Uploading · ${fileSize}`;
        if (status === 'ready') return `Ready · ${fileSize}`;
        if (status === 'error') return 'Upload failed';
        return fileSize;
    };

    const getStatusColor = () => {
        if (status === 'uploading') return 'primary.500';
        if (status === 'ready') return 'primary.500';
        if (status === 'error') return 'red.500';
        return 'gray.500';
    };

    // Uploading state - simple UI
    if (status === 'uploading' && type === 'audio') {
        return (
            <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                <HStack justify="space-between" mb={2}>
                    <VStack align="start" gap={0} minW={0} flex="1">
                        <Text fontSize="11px" color="gray.900" fontWeight="normal" lineClamp={1}>
                            {fileName}
                        </Text>
                        <Text fontSize="10px" color={getStatusColor()} mt={0.5}>
                            {getStatusText()}
                        </Text>
                    </VStack>
                    {onRemove && (
                        <Icon
                            as={MdClose}
                            boxSize={4.5}
                            color="gray.600"
                            cursor="pointer"
                            flexShrink={0}
                            onClick={onRemove}
                            _hover={{ color: 'gray.800' }}
                        />
                    )}
                </HStack>
                <Box bg="gray.200" borderRadius="full" h="6px" overflow="hidden">
                    <Box
                        w={`${progress}%`}
                        h="6px"
                        bg="primary.500"
                        borderRadius="full"
                        transition="width 0.3s"
                    />
                </Box>
            </Box>
        );
    }

    // Ready/Error state - full UI with index and play button
    return (
        <VStack align="stretch" gap={3} w="full">
            {/* Number Badge Row (for audio tracks in album mode) */}
            {showIndex !== undefined && type === 'audio' && (
                <Box
                    bg="red.400"
                    w={9}
                    h={9}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="11px"
                    fontWeight="semibold"
                    color="primary.500"
                >
                    {showIndex}
                </Box>
            )}

            {/* File Card */}
            <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                <HStack justify="space-between" gap={3}>
                    {/* Left: File Info */}
                    <VStack flex="2" align="start" gap={0} minW={0}>
                        <Text fontSize="14px" color="gray.900" fontWeight="normal" lineClamp={1}>
                            {fileName}
                        </Text>
                        {type === 'audio' && (
                            <Text fontSize="12px" color={getStatusColor()} mt={0.5}>
                                {getStatusText()}
                            </Text>
                        )}
                        {(type === 'video') && (
                            <HStack gap={2}>
                                <Box
                                    bg="red.50"
                                    w={8}
                                    h={8}
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                >
                                    <Icon
                                        as={FiVideo}
                                        boxSize={4}
                                        color="primary.500"
                                    />
                                </Box>
                                <Text fontSize="8px" color="gray.500">
                                    {fileSize}
                                </Text>
                            </HStack>
                        )}

                        {(type === 'image') && (
                            <Box>
                                <Text fontSize="12px" color="primary.500">
                                    {fileSize}
                                </Text>


                            </Box>
                        )}
                    </VStack>

                    {/* Right: Music Player UI */}
                    <HStack flex="3" gap={2} flexShrink={0} alignItems="center" justifyContent="end">
                        {type === 'audio' && status === 'ready' && (
                            <>
                                {/* Hidden Audio Element */}
                                {audioUrl && (
                                    <audio ref={audioRef} src={audioUrl} preload="metadata" />
                                )}

                                {/* Play/Pause Button */}
                                <Box
                                    as="button"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor="pointer"
                                    onClick={togglePlayPause}
                                    border="none"
                                    bg="transparent"
                                    _focus={{ outline: 'none' }}
                                    p={0}
                                    _hover={{ opacity: 0.8 }}
                                >
                                    <Icon
                                        as={isPlaying ? MdPause : MdPlayArrow}
                                        boxSize={7}
                                        color="primary.500"
                                    />
                                </Box>

                                {/* Progress Bar */}
                                <Box
                                    position="relative"
                                    bg="gray.300"
                                    borderRadius="full"
                                    h="4px"
                                    w={{ base: '100px', md: '180px' }}
                                    overflow="hidden"
                                >
                                    <Box
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        h="100%"
                                        w={`${audioProgress}%`}
                                        bg="primary.500"
                                        borderRadius="full"
                                        transition="width 0.1s linear"
                                    />
                                </Box>
                            </>
                        )}
                        <HStack>
                            {type == "image" && <Box
                                bg="red.50"
                                w={8}
                                h={8}
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon
                                    as={FiImage}
                                    boxSize={4}
                                    color="primary.500"
                                />
                            </Box>}
                            {onRemove && (
                                <Icon
                                    as={MdClose}
                                    boxSize={4.5}
                                    color="gray.600"
                                    cursor="pointer"
                                    onClick={onRemove}
                                    _hover={{ color: 'gray.800' }}
                                />
                            )}
                        </HStack>

                    </HStack>
                </HStack>
            </Box>
        </VStack>
    );
};

