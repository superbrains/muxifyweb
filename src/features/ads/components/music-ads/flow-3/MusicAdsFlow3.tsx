import React, { useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon, Avatar, Spinner } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdsUploadStore } from '../../../store/useAdsUploadStore';
import { MusicViewPhonePreview } from '../MusicViewPhonePreview';
import { UploadSuccessPage } from '@upload/components';
import { UploadProgressModal } from '@shared/components';
import { useAdRates } from '../../wizard/useAdRates';
import { formatNaira } from '@/shared/lib';
import { combineDateAndTime } from '../../../utils/schedule';
import { useCampaignPublish } from '../../../hooks/useCampaignPublish';
import type { CreateCampaignRequest } from '../../../types';

export const MusicAdsFlow3: React.FC<{
    onNext: () => void;
    onBack: () => void;
    onResetFlow?: () => void;
    editCampaignId?: string | null;
}> = ({ onBack, onNext, onResetFlow, editCampaignId }) => {
    // onNext is not used - navigation handled by success page buttons
    void onNext;

    const navigate = useNavigate();

    const {
        uploadProgress,
        isModalOpen,
        isPublished,
        publishOutcome,
        publish,
        retry,
        handleModalClose,
        dismissSuccess,
    } = useCampaignPublish();

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
        photoFile,
        musicAdInfo,
        musicCallToAction,
        musicBudgetReach,
        resetMusicAds,
    } = useAdsUploadStore();
    const { card } = useAdRates('audio');
    const isEditMode = !!editCampaignId;

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount: number): string => formatNaira(amount, { compact: false });

    const handlePublish = () => {
        if (!musicAdInfo || !musicBudgetReach) {
            console.error('Missing required ad information');
            return;
        }

        void publish({
            // Audio ad: the audio is the creative (played as the interstitial); the
            // separately-uploaded album art is the cover image shown everywhere.
            creativeFile: musicFile,
            coverFile: photoFile,
            editCampaignId,
            onSaved: resetMusicAds,
            buildRequest: (creativeUrl, coverImageUrl): CreateCampaignRequest => {
                // Format schedule date to ISO string
                const scheduleDate = musicAdInfo.schedule.date
                    ? musicAdInfo.schedule.date.toISOString()
                    : new Date().toISOString();

                return {
                    name: musicAdInfo.title,
                    type: 'audio',
                    budget: musicBudgetReach.amount * 100, // Convert to smallest unit (kobo)
                    startDate: combineDateAndTime(scheduleDate, musicAdInfo.schedule.startTime) ?? scheduleDate,
                    endDate: combineDateAndTime(scheduleDate, musicAdInfo.schedule.endTime),
                    creativeUrl,
                    coverImageUrl,
                    // Primary targeted content (first selected sponsorable item).
                    targetContentId: musicAdInfo.target.media?.[0]?.id,
                    targetContentType: musicAdInfo.target.type === 'video' ? 'Video' : 'Track',
                    targetingSettings: JSON.stringify({
                        location: {
                            country: musicAdInfo.location.country,
                            state: musicAdInfo.location.state,
                        },
                        target: {
                            type: musicAdInfo.target.type,
                            genre: musicAdInfo.target.genre,
                            media: musicAdInfo.target.media || [],
                        },
                    }),
                };
            },
        });
    };

    const handleUnderstand = () => {
        // Navigate to ads dashboard
        navigate('/');
    };

    const handleCreateMore = () => {
        // Close success page and reset to flow 1
        dismissSuccess();
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
                                {musicAdInfo?.target.media && musicAdInfo.target.media.length > 0 && (
                                    <HStack flexWrap="wrap" gap={2}>
                                        {musicAdInfo.target.media.map((item) => (
                                            <Box
                                                key={item.id}
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
                                                        {item.title.charAt(0)}
                                                    </Avatar.Fallback>
                                                </Avatar.Root>
                                                <Text fontSize="xs">{item.title}</Text>
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
                                {card ? `1 click = ${formatCurrency(card.cpcDisplay)}` : ''}
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
                                {musicBudgetReach?.impressions && card ? `${musicBudgetReach.impressions.toLocaleString()} reach = ${formatCurrency(musicBudgetReach.impressions * card.cpiDisplay)}` : ''}
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
                    disabled={isModalOpen}
                >
                    {isModalOpen ? (
                        <HStack gap={2}>
                            <Spinner size="sm" color="white" />
                            <Text fontSize="12px">{isEditMode ? 'Updating...' : 'Publishing...'}</Text>
                        </HStack>
                    ) : (
                        <Text fontSize="12px">{isEditMode ? 'Update' : 'Publish'}</Text>
                    )}
                </Button>
            </Flex>

            {/* Upload Progress Modal — mirrors the audio/video track upload flow */}
            <UploadProgressModal
                isOpen={isModalOpen}
                title={musicAdInfo?.title || 'Your ad'}
                fileSize={musicFile?.file?.size ?? 0}
                progress={uploadProgress}
                onRetry={retry}
                onClose={handleModalClose}
            />

            {/* Success Page Modal */}
            {isPublished && (
                <UploadSuccessPage
                    onUnderstand={handleUnderstand}
                    onUploadMore={handleCreateMore}
                    actionType="Campaign"
                    successFor="Ads"
                    mainHeading={
                        publishOutcome === 'live'
                            ? 'Your ad is now live'
                            : publishOutcome === 'draft'
                                ? 'Your ad was saved as a draft'
                                : undefined
                    }
                    subText={
                        publishOutcome === 'live'
                            ? 'Your campaign was approved and is now serving.'
                            : publishOutcome === 'draft'
                                ? 'It is not under review yet — open it in your Ads Library and submit it again.'
                                : undefined
                    }
                />
            )}
        </VStack>
    );
};



