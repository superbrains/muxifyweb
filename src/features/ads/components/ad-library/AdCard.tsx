import React from 'react';
import { Box, HStack, Icon, Image, Text, VStack, Badge, Flex, Button } from '@chakra-ui/react';
import { FiVideo, FiMusic, FiEdit2, FiZap } from 'react-icons/fi';
import { CustomMenu } from '@/shared/components/CustomMenu';
import { useAdsStore } from '../../store/useAdsStore';
import type { AdCampaign } from '../../types';

interface AdCardProps {
    campaign: AdCampaign;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onSuspend?: () => void;
}

export const AdCard: React.FC<AdCardProps> = ({
    campaign,
    onEdit,
    onDelete,
    onView,
    onSuspend,
}) => {
    const { pauseCampaign } = useAdsStore();
    const getStatusLabel = (campaign: AdCampaign) => {
        if (campaign.isStopped) {
            return 'Inactive';
        }
        if (campaign.isPaused) {
            return 'Paused';
        }
        if (campaign.status === 'active') {
            return 'Active';
        }
        return campaign.status === 'draft' ? 'Draft' : 'Completed';
    };

    const getStatusColor = (campaign: AdCampaign) => {
        if (campaign.isStopped) {
            return '#f94444'; // Red for inactive/stopped
        }
        if (campaign.isPaused) {
            return '#ffa800'; // Yellow for paused
        }
        if (campaign.status === 'active') {
            return '#4ab58e'; // Green for active
        }
        return '#666'; // Gray for draft/completed
    };

    const shouldShowStatusBadge = (campaign: AdCampaign) => {
        return campaign.isStopped || campaign.isPaused || campaign.status === 'active';
    };

    const getTypeLabel = (type: AdCampaign['type']) => {
        switch (type) {
            case 'photo':
                return 'Photo Ad';
            case 'video':
                return 'Video Ad';
            case 'audio':
                return 'Audio Ad';
            default:
                return 'Ad';
        }
    };

    const handleShare = () => {
        // TODO: Implement share functionality
        console.log('Share campaign:', campaign.id);
    };

    const handleCopyLink = () => {
        // TODO: Implement copy link functionality
        const link = `${window.location.origin}/ads/campaign/${campaign.id}`;
        navigator.clipboard.writeText(link);
        console.log('Link copied:', link);
    };

    const handleSuspend = () => {
        if (onSuspend) {
            onSuspend();
        } else {
            // Default behavior: pause the campaign
            pauseCampaign(campaign.id);
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger view if clicking on menu or edit button
        if (
            (e.target as HTMLElement).closest('[data-menu-trigger]') ||
            (e.target as HTMLElement).closest('[data-edit-button]')
        ) {
            return;
        }
        if (onView) {
            onView();
        }
    };

    const menuOptions = [
        { label: 'Share', value: 'share', onClick: handleShare },
        { label: 'Copy Link', value: 'copy-link', onClick: handleCopyLink },
        { label: 'Suspend', value: 'suspend', onClick: handleSuspend },
        { label: 'Delete', value: 'delete', color: 'red.500', onClick: onDelete },
    ];

    // Format date as "12, August 2025"
    const formatPublishDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${day}, ${month} ${year}`;
    };

    // Mock metrics - in real app, these would come from the campaign data or analytics API
    // Using consistent values based on campaign ID for better UX
    const views = Math.floor(((campaign.id.charCodeAt(0) || 0) * 1000000) % 9000000) + 1000000; // 1M - 10M
    const clicks = Math.floor(views * 0.05); // ~5% click rate (shown as currency in design)
    const impressions = Math.floor(views * 50); // ~50x impressions

    // Helper function to get media preview URL
    const getMediaPreview = () => {
        if (!campaign.mediaData) {
            // Return placeholder based on type
            if (campaign.type === 'photo') {
                return 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762389746/photo-placeholder_f3yxip.png';
            } else if (campaign.type === 'video') {
                return 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762389745/video-placeholder_puiyvz.png';
            } else {
                return 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762389746/audio-placeholder_zna3bw.png';
            }
        }

        // Check if mediaData already has data URL prefix
        if (campaign.mediaData.startsWith('data:')) {
            // Already a complete data URL, use as-is
            return campaign.mediaData;
        }

        // Determine MIME type based on file extension or default to image/jpeg for photos
        let mimeType = 'image/jpeg';
        if (campaign.mediaName) {
            const extension = campaign.mediaName.split('.').pop()?.toLowerCase();
            if (extension === 'png') {
                mimeType = 'image/png';
            } else if (extension === 'gif') {
                mimeType = 'image/gif';
            } else if (extension === 'mp4' || extension === 'mov') {
                mimeType = 'video/mp4';
            } else if (extension === 'mp3' || extension === 'wav') {
                mimeType = 'audio/mpeg';
            }
        } else if (campaign.type === 'video') {
            mimeType = 'video/mp4';
        } else if (campaign.type === 'audio') {
            mimeType = 'audio/mpeg';
        }

        // Add data URL prefix if it's just base64 string
        return `data:${mimeType};base64,${campaign.mediaData}`;
    };

    const mediaPreview = getMediaPreview();

    return (
        <Box
            bg="white"
            border="1px solid"
            borderColor="rgba(0,0,0,0.15)"
            borderRadius="16px"
            p={3}
            position="relative"
            h="full"
            display="flex"
            flexDirection="column"
            _hover={{ shadow: 'md', borderColor: 'gray.300', cursor: 'pointer' }}
            transition="all 0.2s"
            onClick={handleCardClick}
            cursor="pointer"
        >
            {/* Three dots menu at top right */}
            <Box
                position="absolute"
                top={3}
                right={3}
                zIndex={1}
                data-menu-trigger
                onClick={(e) => e.stopPropagation()}
            >
                <CustomMenu options={menuOptions} />
            </Box>

            <Flex gap={3} align="stretch" flex="1" h="full">
                {/* Square Image on Left */}
                <Box
                    w="150px"
                    h="auto !important"
                    minH="170px"
                    borderRadius="12px"
                    overflow="hidden"
                    flexShrink={0}
                    bg="gray.100"
                    position="relative"
                >
                    {campaign.type === 'photo' ? (
                        <Image
                            src={mediaPreview}
                            alt={campaign.title}
                            w="full"
                            h="full"
                            objectFit="cover"
                        />
                    ) : campaign.type === 'video' ? (
                        <Box w="full" h="full" overflow="hidden" position="relative">
                            {campaign.mediaData ? (
                                <video
                                    src={mediaPreview}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                    controls={false}
                                    muted
                                    playsInline
                                />
                            ) : (
                                <Box
                                    w="full"
                                    h="full"
                                    bg="gray.200"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon
                                        as={FiVideo}
                                        boxSize={8}
                                        color="gray.400"
                                    />
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box
                            w="full"
                            h="full"
                            bg="gray.200"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                as={FiMusic}
                                boxSize={8}
                                color="gray.400"
                            />
                        </Box>
                    )}
                </Box>

                {/* Content on Right */}
                <Box flex="1" display="flex" p={3} className='!h-auto' flexDirection="column" justifyContent="space-between" position="relative">
                    {/* Title */}
                    <Text
                        fontSize="20px"
                        fontWeight="extrabold"
                        color="black"
                        lineHeight="1.4"
                    >
                        {campaign.title}
                    </Text>

                    {/* Info Row: Ad Type, Publish Date, Views, Clicks, Impression */}
                    <HStack gap={10} align="flex-start" flexWrap="wrap">
                        {/* Ad Type */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Ad Type
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                {getTypeLabel(campaign.type)}
                            </Text>
                        </VStack>

                        {/* Publish Date */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Publish Date
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                {formatPublishDate(campaign.schedule.date || campaign.createdAt)}
                            </Text>
                        </VStack>

                        {/* Views */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Views
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                {views.toLocaleString()}
                            </Text>
                        </VStack>

                        {/* Clicks */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Clicks
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                N{clicks.toLocaleString()}
                            </Text>
                        </VStack>

                        {/* Impression */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Impression
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                {impressions.toLocaleString()}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Status Badge and Edit Button Row */}
                    <Flex justify="space-between" align="center" mt={1}>
                        {/* Status Badge */}
                        {shouldShowStatusBadge(campaign) && (
                            <Badge
                                bg={getStatusColor(campaign)}
                                color="white"
                                fontSize="12px"
                                fontWeight="medium"
                                px={2}
                                py={1}
                                borderRadius="100px"
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                                lineHeight="1.4"
                            >
                                <Icon as={FiZap} boxSize={3.5} />
                                <Text>{getStatusLabel(campaign)}</Text>
                            </Badge>
                        )}

                        {/* Edit Button */}
                        <Button
                            bg="#ffefef"
                            color="#f94444"
                            fontSize="12px"
                            fontWeight="bold"
                            px={3}
                            py={1.5}
                            borderRadius="8px"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) {
                                    onEdit();
                                }
                            }}
                            _hover={{ bg: '#ffe5e5' }}
                            lineHeight="1.4"
                            size="sm"
                            data-edit-button
                        >
                            <Icon as={FiEdit2} boxSize={4} mr={1.5} />
                            Edit Ad
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
};

