import React from 'react';
import { Box, Button, Flex, HStack, Icon, Text, VStack, Spinner } from '@chakra-ui/react';
import { Edit2Icon } from '@shared/icons/CustomIcons';
import { CustomMenu } from '@/shared/components/CustomMenu';
import { AuthedImage } from '@/shared/components/AuthedImage';

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
    isDeleting?: boolean;
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
    onDelete,
    type,
    isDeleting = false,
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

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            onDelete?.();
        }
    };

    const menuOptions = [
        { label: 'Share', value: 'share', onClick: handleShare },
        { label: 'Copy Link', value: 'copy-link', onClick: handleCopyLink },
        { label: 'Delete', value: 'delete', color: 'red.500', onClick: handleDelete },
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
            position="relative"
            opacity={isDeleting ? 0.6 : 1}
            pointerEvents={isDeleting ? 'none' : 'auto'}
        >
            {isDeleting && (
                <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="whiteAlpha.800"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    zIndex={1}
                >
                    <Spinner size="md" color="red.500" />
                </Flex>
            )}
            <Flex gap={4} align="start">
                {/* Thumbnail */}
                <AuthedImage
                    src={thumbnail}
                    alt={title}
                    w={'170px'}
                    h={'170px'}
                    width={170}
                    height={170}
                    loading="lazy"
                    decoding="async"
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                    fallback={
                        <Box w={'170px'} h={'170px'} borderRadius="md" bg="gray.100" flexShrink={0} />
                    }
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

