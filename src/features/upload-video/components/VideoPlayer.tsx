import React, { useState, useRef, useEffect } from 'react';
import { Box, HStack, VStack, Text, Icon } from '@chakra-ui/react';
import { MdPlayArrow, MdPause, MdClose } from 'react-icons/md';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file: File;
    url?: string;
}

interface VideoPlayerProps {
    videoFile: UploadFile;
    onRemove?: () => void;
    showRemove?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoFile, onRemove, showRemove = true }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoFile.file) {
            const url = URL.createObjectURL(videoFile.file);
            if (videoRef.current) {
                videoRef.current.src = url;
            }
            return () => URL.revokeObjectURL(url);
        }
    }, [videoFile.file]);

    const togglePlayPause = () => {
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
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress || 0);
        }
    };

    return (
        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg">
            <Box
                w="full"
                h="200px"
                bg="gray.100"
                borderRadius="md"
                overflow="hidden"
                position="relative"
            >
                <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                />
            </Box>
            <HStack justify="space-between" p={5}>
                <VStack align="start" gap={0} flex="1">
                    <Text fontSize="14px" color="gray.900" fontWeight="normal">
                        {videoFile.name}
                    </Text>
                    <Text fontSize="12px" color="primary.500">
                        Ready · {videoFile.size}
                    </Text>
                </VStack>
                <HStack gap={2}>
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
                            boxSize={6}
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
                            w={`${progress}%`}
                            bg="primary.500"
                            borderRadius="full"
                            transition="width 0.1s linear"
                        />
                    </Box>

                    {/* Remove Button */}
                    {showRemove && onRemove && (
                        <Icon
                            as={MdClose}
                            boxSize={4}
                            color="gray.600"
                            cursor="pointer"
                            onClick={onRemove}
                            _hover={{ color: 'gray.800' }}
                        />
                    )}
                </HStack>
            </HStack>
        </Box>
    );
};

