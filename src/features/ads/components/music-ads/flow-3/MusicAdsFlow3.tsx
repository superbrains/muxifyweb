import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon, Avatar, Spinner } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdsUploadStore } from '../../../store/useAdsUploadStore';
import { useAdsStore } from '../../../store/useAdsStore';
import { MusicViewPhonePreview } from '../MusicViewPhonePreview';
import { UploadSuccessPage } from '@upload/components';
import { fileToBase64 } from '@shared/lib/fileUtils';

export const MusicAdsFlow3: React.FC<{
    onNext: () => void;
    onBack: () => void;
    onResetFlow?: () => void;
    editCampaignId?: string | null;
}> = ({ onBack, onNext, onResetFlow, editCampaignId }) => {
    // onNext is not used - navigation handled by success page buttons
    void onNext;

    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const navigate = useNavigate();

    // Hide overflow and scroll to top when success page is shown
    useEffect(() => {
        if (isPublished) {
            document.body.style.overflow = 'hidden';
            // Scroll to top of the page
            window.scrollTo({ top: 0, behavior: 'instant' });
            // Also scroll the main container if it exists
            const mainContainer = document.querySelector('main') || document.documentElement;
            mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            document.body.style.overflow = '';
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isPublished]);

    const {
        musicFile,
        musicAdInfo,
        musicCallToAction,
        musicBudgetReach,
        resetMusicAds,
    } = useAdsUploadStore();
    const { addCampaign, updateCampaign } = useAdsStore();
    const isEditMode = !!editCampaignId;

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount: number): string => {
        return `NGN${amount.toLocaleString()}`;
    };

    const handlePublish = async () => {
        if (!musicAdInfo || !musicBudgetReach) {
            console.error('Missing required ad information');
            return;
        }

        setIsPublishing(true);

        try {
            // Convert music file to base64 if it exists
            let mediaData: string | undefined;
            let mediaName: string | undefined;
            let mediaSize: string | undefined;

            if (musicFile) {
                mediaName = musicFile.name;

                if (musicFile.file) {
                    // File exists, convert to base64
                    mediaData = await fileToBase64(musicFile.file);
                    mediaSize = musicFile.size || `${(musicFile.file.size / (1024 * 1024)).toFixed(2)} MB`;
                } else if (musicFile.url && musicFile.url.startsWith('data:')) {
                    // URL is a data URL (base64), extract base64 part
                    mediaData = musicFile.url.split(',')[1];
                    mediaSize = musicFile.size || '0 MB';
                } else {
                    // Blob URL or no file - cannot convert to base64
                    console.warn('Music file not available for base64 conversion');
                }
            }

            // Format schedule date to ISO string
            const scheduleDate = musicAdInfo.schedule.date
                ? musicAdInfo.schedule.date.toISOString()
                : new Date().toISOString();

            // Create campaign object
            const campaign = {
                title: musicAdInfo.title,
                type: 'audio' as const,
                location: {
                    country: musicAdInfo.location.country,
                    state: musicAdInfo.location.state,
                },
                target: {
                    type: musicAdInfo.target.type === 'photo' ? 'music' : musicAdInfo.target.type,
                    genre: musicAdInfo.target.genre,
                    artists: musicAdInfo.target.artists || [],
                },
                schedule: {
                    date: scheduleDate,
                    startTime: musicAdInfo.schedule.startTime,
                    endTime: musicAdInfo.schedule.endTime,
                },
                budget: musicBudgetReach.amount,
                status: 'active' as const,
                mediaData,
                mediaName,
                mediaSize,
            };

            // Add or update campaign in ads store
            if (isEditMode && editCampaignId) {
                updateCampaign(editCampaignId, campaign);
            } else {
                addCampaign(campaign);
            }

            // Simulate API call with async promise
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 2000); // 2 second delay to simulate API call
            });

            // Show success page first
            setIsPublished(true);

            // Clear the upload store state after showing success
            resetMusicAds();
        } catch (error) {
            console.error('Publish failed:', error);
            // Handle error if needed
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnderstand = () => {
        // Navigate to ads dashboard
        navigate('/');
    };

    const handleCreateMore = () => {
        // Close success page and reset to flow 1
        setIsPublished(false);
        if (onResetFlow) {
            onResetFlow();
        } else {
            // Fallback: navigate with tab param
            navigate('/ads/create-campaign?tab=audio');
        }
    };

    return (
        <VStack align="stretch" gap={0}>
            {/* Top Bar with Title */}
            <Box
                w="full"
                py={3}
                borderBottom="1px solid"
                borderColor="gray.200"
                mb={0}
            >
                <Flex justify="space-between" align="center" px={4}>
                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                        Music Ads
                    </Text>
                </Flex>
            </Box>

            {/* Main Content */}
            <Flex gap={4} direction={{ base: 'column', lg: 'row' }} mt={4} px={4}>
                {/* Left Form Section */}
                <Box flex="1">
                    <VStack align="stretch" gap={3}>
                        {/* Review Header */}
                        <HStack gap={2} mb={2}>
                            <Icon as={FiArrowLeft} color="gray.600" />
                            <Text fontSize="sm" fontWeight="bold" color="gray.900">
                                Review
                            </Text>
                        </HStack>
                        {musicAdInfo && (
                            <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                {musicAdInfo.title}
                            </Text>
                        )}

                        {/* Ad Title */}
                        <Box>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                                Ad Title
                            </Text>
                            <Input
                                value={musicAdInfo?.title || ''}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                                readOnly
                                bg="gray.50"
                            />
                        </Box>

                        {/* Location */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Location
                            </Text>
                            <VStack align="stretch" gap={2}>
                                <Box>
                                    <Input
                                        placeholder="Country"
                                        value={musicAdInfo?.location.country || ''}
                                        size="xs"
                                        h="40px"
                                        borderRadius="10px"
                                        readOnly
                                        bg="gray.50"
                                    />
                                </Box>
                                <Box>
                                    <Input
                                        placeholder="State"
                                        value={musicAdInfo?.location.state || ''}
                                        size="xs"
                                        h="40px"
                                        borderRadius="10px"
                                        readOnly
                                        bg="gray.50"
                                    />
                                </Box>
                            </VStack>
                        </Box>

                        {/* Target */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Target
                            </Text>
                            <VStack align="stretch" gap={2}>
                                <Box>
                                    <Input
                                        placeholder="Target Type"
                                        value={musicAdInfo?.target.type.toUpperCase() || ''}
                                        size="xs"
                                        h="40px"
                                        borderRadius="10px"
                                        readOnly
                                        bg="gray.50"
                                    />
                                </Box>
                                <Box>
                                    <Input
                                        placeholder="Genre"
                                        value={musicAdInfo?.target.genre || ''}
                                        size="xs"
                                        h="40px"
                                        borderRadius="10px"
                                        readOnly
                                        bg="gray.50"
                                    />
                                </Box>
                                {musicAdInfo?.target.artists && musicAdInfo.target.artists.length > 0 && (
                                    <HStack flexWrap="wrap" gap={2}>
                                        {musicAdInfo.target.artists.map((artist, index) => (
                                            <Box
                                                key={index}
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                                bg="white"
                                                border="1px solid"
                                                borderColor="gray.200"
                                                borderRadius="full"
                                                px={2}
                                                py={1}
                                            >
                                                <Avatar.Root size="xs">
                                                    <Avatar.Fallback fontSize="10px" bg="primary.100" color="primary.500">
                                                        {artist.charAt(0)}
                                                    </Avatar.Fallback>
                                                </Avatar.Root>
                                                <Text fontSize="xs">{artist}</Text>
                                            </Box>
                                        ))}
                                    </HStack>
                                )}
                            </VStack>
                        </Box>

                        {/* Ad Schedule */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Ad Schedule
                            </Text>
                            <VStack align="stretch" gap={2}>
                                <Box>
                                    <Input
                                        placeholder="Schedule Date"
                                        value={formatDate(musicAdInfo?.schedule.date || null)}
                                        size="xs"
                                        h="40px"
                                        borderRadius="10px"
                                        readOnly
                                        bg="gray.50"
                                    />
                                </Box>
                                <HStack gap={3}>
                                    <Box flex="1">
                                        <Input
                                            placeholder="Start Time"
                                            value={musicAdInfo?.schedule.startTime || ''}
                                            size="xs"
                                            h="40px"
                                            borderRadius="10px"
                                            readOnly
                                            bg="gray.50"
                                        />
                                    </Box>
                                    <Box flex="1">
                                        <Input
                                            placeholder="End Time"
                                            value={musicAdInfo?.schedule.endTime || ''}
                                            size="xs"
                                            h="40px"
                                            borderRadius="10px"
                                            readOnly
                                            bg="gray.50"
                                        />
                                    </Box>
                                </HStack>
                            </VStack>
                        </Box>

                        {/* Call To Action */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Call To Action
                            </Text>
                            <Text fontSize="xs" color="gray.600" mb={2}>
                                What should your add do?
                            </Text>
                            <Input
                                value={musicCallToAction?.action.toUpperCase() || ''}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                                readOnly
                                bg="gray.50"
                            />
                        </Box>

                        {/* Link */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Link
                            </Text>
                            <Input
                                value={musicCallToAction?.link || ''}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                                readOnly
                                bg="gray.50"
                            />
                            <Text fontSize="xs" color="rgba(249,68,68,1)" mt={1}>
                                1 click = 2 Naira
                            </Text>
                        </Box>

                        {/* Budget */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Budget
                            </Text>
                            <Text fontSize="xs" color="gray.600" mb={1}>
                                Amount
                            </Text>
                            <Input
                                value={musicBudgetReach ? formatCurrency(musicBudgetReach.amount) : ''}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                                readOnly
                                bg="gray.50"
                            />
                        </Box>

                        {/* Reach */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Reach
                            </Text>
                            <Text fontSize="xs" color="gray.600" mb={2}>
                                How many impression do you want to reach?
                            </Text>
                            <Input
                                value={musicBudgetReach?.impressions.toLocaleString() || ''}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                                readOnly
                                bg="gray.50"
                            />
                            <Text fontSize="xs" color="rgba(249,68,68,1)" mt={1}>
                                {musicBudgetReach?.impressions ? `${musicBudgetReach.impressions.toLocaleString()} reach = ${(musicBudgetReach.impressions * 2).toLocaleString()} NGN` : ''}
                            </Text>
                        </Box>
                    </VStack>
                </Box>

                {/* Right Preview Section */}
                <Box flex="1" display="flex" justifyContent="center">
                    <MusicViewPhonePreview />
                </Box>
            </Flex>

            {/* Bottom Navigation Buttons */}
            <Flex justify="space-between" align="center" px={4} py={4} borderTop="1px solid" borderColor="gray.200" mt={4}>
                <Button
                    variant="ghost"
                    onClick={onBack}
                    bg="rgba(249,68,68,0.05)"
                    border="1px solid"
                    borderColor="rgba(249,68,68,0.3)"
                    borderRadius="10px"
                    size="xs"
                    px={3}
                    fontSize="12px"
                    color="rgba(249,68,68,1)"
                    _hover={{ bg: 'rgba(249,68,68,0.1)', borderColor: 'rgba(249,68,68,0.5)' }}
                >
                    <Icon as={FiArrowLeft} mr={1} />
                    Back
                </Button>
                <Button
                    bg="primary.500"
                    color="white"
                    onClick={handlePublish}
                    borderRadius="10px"
                    size="xs"
                    w="200px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px={3}
                    _hover={{ bg: 'primary.600' }}
                    disabled={isPublishing}
                >
                    {isPublishing ? (
                        <HStack gap={2}>
                            <Spinner size="sm" color="white" />
                            <Text fontSize="12px">{isEditMode ? 'Updating...' : 'Publishing...'}</Text>
                        </HStack>
                    ) : (
                        <Text fontSize="12px">{isEditMode ? 'Update' : 'Publish'}</Text>
                    )}
                </Button>
            </Flex>

            {/* Success Page Modal */}
            {isPublished && (
                <UploadSuccessPage
                    onUnderstand={handleUnderstand}
                    onUploadMore={handleCreateMore}
                    actionType="Campaign"
                    successFor="Ads"
                />
            )}
        </VStack>
    );
};



