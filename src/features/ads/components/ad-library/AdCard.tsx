import React from 'react';
import { Box, HStack, Icon, Image, Text, VStack, Badge, Flex, Button } from '@chakra-ui/react';
import { FiVideo, FiEdit2, FiZap } from 'react-icons/fi';
import { CustomMenu } from '@/shared/components/CustomMenu';
import { useToast } from '@/shared/hooks/useToast';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
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
    const { toast } = useToast();
    const getStatusLabel = (campaign: AdCampaign) => {
        if (campaign.status === 'completed') {
            return 'Completed';
        }
        if (campaign.isStopped) {
            return 'Inactive';
        }
        if (campaign.isPaused) {
            return 'Paused';
        }
        switch (campaign.status) {
            case 'active':
                return 'Active';
            case 'pending':
                return 'In Review';
            case 'rejected':
                return 'Rejected';
            case 'draft':
                return 'Draft';
            default:
                return 'Draft';
        }
    };

    const getStatusColor = (campaign: AdCampaign) => {
        if (campaign.status === 'completed') {
            return '#666'; // Gray for completed
        }
        if (campaign.isStopped) {
            return '#f94444'; // Red for inactive/stopped
        }
        if (campaign.isPaused) {
            return '#ffa800'; // Yellow for paused
        }
        switch (campaign.status) {
            case 'active':
                return '#4ab58e'; // Green for active
            case 'pending':
                return '#ffa800'; // Amber for in-review
            case 'rejected':
                return '#f94444'; // Red for rejected
            default:
                return '#666'; // Gray for draft
        }
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

    const campaignLink = `${window.location.origin}/ads/view/${campaign.id}`;

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: campaign.title, url: campaignLink });
                return;
            } catch {
                // user dismissed the share sheet — fall back to copy
            }
        }
        handleCopyLink();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(campaignLink);
        toast.success('Link copied', 'Campaign link copied to clipboard');
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

    // Real campaign metrics (honest zeros until traffic is served).
    const impressions = campaign.impressions ?? 0;
    const clicks = campaign.clicks ?? 0;
    const spend = campaign.amountSpent ?? 0;

    // The visual to show: the cover image when present (audio ads carry the audio
    // in mediaData), otherwise the creative itself (photo image / video). Backend
    // URLs are JWT-gated proxy paths, so resolve them to a loadable blob URL.
    const visualSrc = campaign.coverImageUrl ?? campaign.mediaData;
    const resolvedVisual = useAuthedImageSrc(visualSrc);
    const placeholder =
        campaign.type === 'photo'
            ? 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762389746/photo-placeholder_f3yxip.png'
            : campaign.type === 'video'
                ? 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762389745/video-placeholder_puiyvz.png'
                : 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762389746/audio-placeholder_zna3bw.png';
    // For video, the creative is a video URL (no separate cover); for photo/audio it's an image.
    const hasVideoCreative = campaign.type === 'video' && !campaign.coverImageUrl;

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
                    {hasVideoCreative ? (
                        <Box w="full" h="full" overflow="hidden" position="relative">
                            {resolvedVisual ? (
                                <video
                                    src={resolvedVisual}
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
                                    <Icon as={FiVideo} boxSize={8} color="gray.400" />
                                </Box>
                            )}
                        </Box>
                    ) : (
                        // Photo and audio ads both show an image (audio uses its cover art).
                        <Image
                            src={resolvedVisual || placeholder}
                            alt={campaign.title}
                            w="full"
                            h="full"
                            objectFit="cover"
                        />
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

                        {/* Impressions */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Impressions
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                {impressions.toLocaleString()}
                            </Text>
                        </VStack>

                        {/* Clicks */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Clicks
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                {clicks.toLocaleString()}
                            </Text>
                        </VStack>

                        {/* Spend */}
                        <VStack align="start" gap={0}>
                            <Text fontSize="12px" color="black" opacity={0.5} lineHeight="1.4">
                                Spend
                            </Text>
                            <Text fontSize="12px" fontWeight="semibold" color="black" lineHeight="1.4">
                                ₦{spend.toLocaleString()}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Status Badge and Edit Button Row */}
                    <Flex justify="space-between" align="center" mt={1}>
                        {/* Status Badge — always shown so advertisers can see review/approval state */}
                        {(
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

