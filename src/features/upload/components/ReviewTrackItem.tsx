import React, { useState, useRef, useEffect } from 'react';
import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { MdPlayArrow, MdPause } from 'react-icons/md';

interface ReviewTrackItemProps {
    index: number;
    trackTitle: string;
    duration: string;
    file?: File;
}

export const ReviewTrackItem: React.FC<ReviewTrackItemProps> = ({
    index,
    trackTitle,
    duration,
    file,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement>(null);

    // Create audio URL when file is provided
    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

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
    };

    return (
        <HStack gap={3} align="center">
            {/* Track Index Circle */}
            <Box
                w="32px"
                h="32px"
                borderRadius="full"
                bg="red.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                boxShadow="sm"
            >
                <Text
                    fontSize="14px"
                    fontWeight="semibold"
                    color="red.600"
                >
                    {index}
                </Text>
            </Box>

            {/* Music Card */}
            <Box
                flex="1"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
                bg="white"
            >
                <VStack align="start" gap={1}>
                    <Text
                        fontSize="14px"
                        fontWeight="medium"
                        color="gray.900"
                        lineHeight="1.2"
                    >
                        {trackTitle}
                    </Text>

                    {/* Player Controls */}
                    <HStack gap={2} align="center" justify="space-between" w="full">
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
                                boxSize={4}
                                color="red.500"
                            />
                        </Box>

                        {/* Progress Bar */}
                        <Box
                            position="relative"
                            bg="gray.300"
                            borderRadius="full"
                            h="4px"
                            flex="1"
                            minW="100px"
                            overflow="hidden"
                        >
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                h="100%"
                                w={`${audioProgress}%`}
                                bg="red.500"
                                borderRadius="full"
                                transition="width 0.1s linear"
                            />
                        </Box>

                        <Text
                            fontSize="14px"
                            fontWeight="medium"
                            color="gray.700"
                            flexShrink={0}
                            ml={3}
                        >
                            {duration}
                        </Text>
                    </HStack>


                    {/* Right Section - Duration */}

                </VStack>
            </Box>
        </HStack>
    );
};
