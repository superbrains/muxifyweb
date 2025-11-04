import React from 'react';
import { Box, Button, Flex, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { Edit2Icon } from '@shared/icons/CustomIcons';
import { CustomMenu } from '@/shared/components/CustomMenu';

interface MediaItemCardProps {
    id: string;
    thumbnail: string;
    title: string;
    artist: string;
    album?: string;
    releaseDate: string;
    plays: number;
    unlocks: number;
    gifts: number;
    onEdit: () => void;
    onView?: () => void;
    onDownload?: () => void;
    onDelete?: () => void;
    type: 'single' | 'album' | 'video';
}

export const MediaItemCard: React.FC<MediaItemCardProps> = ({
    id,
    thumbnail,
    title,
    artist,
    album,
    releaseDate,
    plays,
    unlocks,
    gifts,
    onEdit,
    type,
}) => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: `Check out ${title} by ${artist}`,
                url: window.location.href,
            }).catch((err) => console.log('Error sharing', err));
        } else {
            // Fallback: copy link to clipboard
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/view/${type}/${id}`;
        navigator.clipboard.writeText(link).then(() => {
            // You might want to show a toast here
            console.log('Link copied to clipboard');
        });
    };

    const handleSuspend = () => {
        if (window.confirm(`Are you sure you want to suspend "${title}"?`)) {
            console.log('Suspend', id);
            // Add suspend logic here
        }
    };

    const menuOptions = [
        { label: 'Share', value: 'share', onClick: handleShare },
        { label: 'Copy Link', value: 'copy-link', onClick: handleCopyLink },
        { label: 'Suspend', value: 'suspend', color: 'red.500', onClick: handleSuspend },
    ];

    return (
        <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
            _hover={{ shadow: 'sm', borderColor: 'gray.300' }}
            transition="all 0.2s"
        >
            <Flex gap={4} align="start">
                {/* Thumbnail */}
                <Image
                    src={thumbnail}
                    alt={title}
                    w={'170px'}
                    h={'170px'}
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                />

                {/* Content */}
                <Flex flex="1" direction="column" gap={2}>
                    {/* Title */}
                    <Text fontSize="16px" fontWeight="bold" color="gray.900" lineHeight="1.2">
                        {title}
                    </Text>

                    {/* Stats */}
                    <HStack gap={6} flexWrap="wrap">
                        <VStack align="start" gap={0}>
                            <Text fontSize="9px" color="gray.500" textTransform="uppercase" fontWeight="medium">
                                Artist
                            </Text>
                            <Text fontSize="11px" color="gray.900" fontWeight="medium">
                                {artist}
                            </Text>
                        </VStack>

                        {album && (
                            <VStack align="start" gap={0}>
                                <Text fontSize="9px" color="gray.500" textTransform="uppercase" fontWeight="medium">
                                    Album
                                </Text>
                                <Text fontSize="11px" color="gray.900" fontWeight="medium">
                                    {album}
                                </Text>
                            </VStack>
                        )}

                        <VStack align="start" gap={0}>
                            <Text fontSize="9px" color="gray.500" textTransform="uppercase" fontWeight="medium">
                                Release Date
                            </Text>
                            <Text fontSize="11px" color="gray.900" fontWeight="medium">
                                {releaseDate}
                            </Text>
                        </VStack>

                        <VStack align="start" gap={0}>
                            <Text fontSize="9px" color="gray.500" textTransform="uppercase" fontWeight="medium">
                                Plays
                            </Text>
                            <Text fontSize="11px" color="gray.900" fontWeight="medium">
                                {plays.toLocaleString()}
                            </Text>
                        </VStack>

                        <VStack align="start" gap={0}>
                            <Text fontSize="9px" color="gray.500" textTransform="uppercase" fontWeight="medium">
                                Unlocks
                            </Text>
                            <Text fontSize="11px" color="gray.900" fontWeight="medium">
                                N{unlocks.toLocaleString()}.000
                            </Text>
                        </VStack>

                        <VStack align="start" gap={0}>
                            <Text fontSize="9px" color="gray.500" textTransform="uppercase" fontWeight="medium">
                                Gifts
                            </Text>
                            <Text fontSize="11px" color="gray.900" fontWeight="medium">
                                {gifts.toLocaleString()}.000
                            </Text>
                        </VStack>
                    </HStack>
                </Flex>

                {/* Actions */}
                <VStack gap={2} alignSelf="stretch" align="end" justify="space-between">
                    <CustomMenu options={menuOptions} />
                    <Button
                        variant="ghost"
                        size="sm"
                        color="primary.500"
                        fontSize="10px"
                        h="28px"
                        px={2}
                        minW="auto"
                        _hover={{ bg: 'red.50' }}
                        onClick={onEdit}
                    >
                        <Icon as={Edit2Icon} boxSize={3.5} mr={1} />
                        Edit {type === 'video' ? 'Video' : type === 'album' ? 'Album' : 'Single'}
                    </Button>
                </VStack>
            </Flex>
        </Box>
    );
};

