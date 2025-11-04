import React, { useState } from 'react';
import { Box, Button, Flex, Icon, Text, VStack, Image, Spinner } from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUploadVideoStore } from '../../upload-video/store/useUploadVideoStore';
import { VideoPlayer } from '../../upload-video/components';
import { UploadSuccessPage, ReleaseScheduler } from './';

interface VideoReviewProps {
    onPublish: () => void;
}

export const VideoReview: React.FC<VideoReviewProps> = ({ onPublish }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const {
        videoFile,
        thumbnails,
        trackLinks,
        releaseType,
        unlockCost,
        allowSponsorship,
        resetVideoUpload,
    } = useUploadVideoStore();

    const selectedThumbnail = thumbnails[0]; // For demo, using first thumbnail

    const releaseTypeLabels: Record<string, string> = {
        'new-release': 'New Release',
        're-release': 'Re-release',
        'remix': 'Remix',
    };

    const handlePublish = async () => {
        setIsPublishing(true);

        try {
            // Simulate API call
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 2000);
            });

            onPublish();
            resetVideoUpload();
            setIsPublished(true);
        } catch (error) {
            console.error('Publish failed:', error);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleBackToUpload = () => {
        const videoId = searchParams.get('videoId');
        const uploadUrl = videoId ? `/upload?videoId=${videoId}` : '/upload';
        navigate(uploadUrl);
    };

    const handleDone = () => {
        navigate('/');
    };

    const handleUploadMore = () => {
        navigate('/upload');
    };

    if (isPublished) {
        return <UploadSuccessPage onUnderstand={handleDone} onUploadMore={handleUploadMore} />;
    }

    return (
        <>
            {/* Header with Back and Publish buttons */}
            <Flex justify="space-between" align="center" mb={6}>
                <Button
                    variant="ghost"
                    size="sm"
                    fontSize="12px"
                    fontWeight="medium"
                    color="gray.700"
                    onClick={handleBackToUpload}
                    _hover={{ bg: 'gray.100' }}
                >
                    <Icon as={FiArrowLeft} boxSize={4} mr={2} />
                    Review
                </Button>

                <Button
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="12px"
                    fontWeight="semibold"
                    px={6}
                    h="38px"
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={handlePublish}
                    loadingText="Publishing..."
                    loading={isPublishing}
                >
                    {isPublishing ? <Spinner size="sm" color="white" /> : (
                        <>
                            Publish
                            <Icon as={FiArrowRight} boxSize={4} ml={2} />
                        </>
                    )}
                </Button>
            </Flex>

            {/* Video Title */}
            <Text fontSize="20px" fontWeight="semibold" color="gray.900" mb={6}>
                {videoFile?.name.replace(/\.[^/.]+$/, '') || 'Untitled Video'}
            </Text>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                {/* Left Section - Video Player and Form Fields */}
                <Box flex="1" minW={0}>
                    <VStack align="stretch" gap={5}>
                        {/* Video Player */}
                        {videoFile && (
                            <VideoPlayer videoFile={videoFile} showRemove={false} />
                        )}

                        {/* Release Type */}
                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Release Type
                            </Text>
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                fontSize="11px"
                                color="gray.700"
                            >
                                {releaseTypeLabels[releaseType[0]] || releaseType[0]}
                            </Box>
                        </Box>

                        {/* Unlock Cost */}
                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Unlock Cost
                            </Text>
                            <Flex
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                justify="space-between"
                                align="center"
                            >
                                <Text fontSize="11px" color="gray.700">
                                    ₦{unlockCost[0] || '100.00'}
                                </Text>
                                <Text fontSize="11px" color="gray.400">
                                    m{unlockCost[0] || '100.00'}
                                </Text>
                            </Flex>
                        </Box>

                        {/* Allow Sponsorship */}
                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Allow Sponsorship?
                            </Text>
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                fontSize="11px"
                                color="gray.700"
                            >
                                {allowSponsorship[0] || 'yes'}
                            </Box>
                        </Box>

                        {/* Song Credits */}
                        {trackLinks.length > 0 && trackLinks.some(link => link.trim() !== '') && (
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Song Credits
                                </Text>
                                <VStack align="stretch" gap={2}>
                                    {trackLinks
                                        .filter(link => link.trim() !== '')
                                        .map((link, index) => (
                                            <Box
                                                key={index}
                                                bg="gray.50"
                                                border="1px solid"
                                                borderColor="gray.200"
                                                borderRadius="md"
                                                p={3}
                                                fontSize="11px"
                                                color="gray.700"
                                            >
                                                {link}
                                            </Box>
                                        ))}
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </Box>

                {/* Right Section - Thumbnail and Release */}
                <Box flex="1" w={{ base: 'full', lg: '400px' }} flexShrink={0}>
                    <VStack align="stretch" gap={5}>
                        {/* Thumbnail Preview */}
                        {selectedThumbnail && (
                            <Box>
                                <Image
                                    src={selectedThumbnail.url}
                                    alt="Video thumbnail"
                                    w="full"
                                    h="400px"
                                    objectFit="cover"
                                    borderRadius="lg"
                                />
                            </Box>
                        )}

                        {/* Video Title */}
                        <Text
                            fontSize="20px"
                            fontWeight="bold"
                            color="gray.900"
                            textAlign="center"
                        >
                            {videoFile?.name.replace(/\.[^/.]+$/, '') || 'Untitled Video'}
                        </Text>

                        {/* Release Scheduler */}
                        <ReleaseScheduler />
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};
