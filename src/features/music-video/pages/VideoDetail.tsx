import React from 'react';
import { Box, Flex, HStack, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useVideoDetail } from '../hooks/useVideoDetail';
import { LockPill } from '../components/LockPill';
import { MuxifyVideoPlayer } from '@/features/player/components/MuxifyVideoPlayer';
import { formatPlayCount } from '@shared/services/contentService';

export const VideoDetail: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const { data, isLoading, error } = useVideoDetail(id);

    return (
        <Box p={{ base: 4, md: 8, lg: 10 }} maxW="1280px" mx="auto">
            {isLoading ? (
                <Flex justify="center" py={20}>
                    <Spinner size="lg" color="primary.500" />
                </Flex>
            ) : error ? (
                <Text color="red.500">Failed to load video.</Text>
            ) : data ? (
                <VStack align="stretch" gap={6}>
                    <MuxifyVideoPlayer
                        videoId={data.id}
                        thumbnail={data.thumbnailUrl}
                        title={data.title}
                    />
                    <VStack align="stretch" gap={3}>
                        <HStack gap={3} align="center">
                            <LockPill isUnlocked={data.isUnlocked} costCoins={data.unlockCostCoins} />
                            <Text fontSize="13px" color="gray.blue.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatPlayCount(data.viewCount)} views
                            </Text>
                            {data.createdAt && (
                                <Text fontSize="13px" color="gray.blue.700">
                                    · {new Date(data.createdAt).toLocaleDateString()}
                                </Text>
                            )}
                        </HStack>
                        <Heading
                            as="h1"
                            fontSize={{ base: '24px', md: '32px' }}
                            fontWeight="700"
                            letterSpacing="-0.02em"
                            color="gray.blue.800"
                            lineHeight="1.15"
                        >
                            {data.title}
                        </Heading>
                        <Text fontSize="15px" color="gray.blue.700" fontWeight="medium">
                            {data.artistName}
                        </Text>
                        {data.description && (
                            <Box
                                bg="white"
                                borderWidth="1px"
                                borderColor="gray.100"
                                borderRadius="xl"
                                p={5}
                                shadow="sm"
                                mt={2}
                            >
                                <Text fontSize="13px" color="gray.blue.800" whiteSpace="pre-wrap">
                                    {data.description}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </VStack>
            ) : null}
        </Box>
    );
};

export default VideoDetail;
