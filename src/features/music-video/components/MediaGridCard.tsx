import React from 'react';
import { Box, Button, Flex, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiPlay, FiMusic, FiVideo } from 'react-icons/fi';
import { Edit2Icon } from '@shared/icons/CustomIcons';
import { CustomMenu } from '@/shared/components/CustomMenu';
import { AuthedImage } from '@/shared/components/AuthedImage';

export type MediaKind = 'single' | 'album' | 'video';

interface MediaGridCardProps {
    id: string;
    thumbnail: string;
    title: string;
    artist: string;
    album?: string;
    releaseDate: string;
    plays: number;
    kind: MediaKind;
    isDeleting?: boolean;
    /** When false on an album, render a "Draft" badge so artists can spot unpublished work. */
    isPublished?: boolean;
    onEdit: () => void;
    onPlay?: () => void;
    onOpen?: () => void;
    onDelete?: () => void;
}

const kindLabel: Record<MediaKind, string> = {
    single: 'Single',
    album: 'Album',
    video: 'Video',
};

export const MediaGridCard: React.FC<MediaGridCardProps> = ({
    id,
    thumbnail,
    title,
    artist,
    album,
    releaseDate,
    plays,
    kind,
    isDeleting = false,
    isPublished,
    onEdit,
    onPlay,
    onOpen,
    onDelete,
}) => {
    const showDraftBadge = kind === 'album' && isPublished === false;
    const handleShare = () => {
        const link = `${window.location.origin}/music-videos/${kind}/${id}`;
        if (navigator.share) {
            navigator.share({ title, text: `Check out ${title} by ${artist}`, url: link }).catch(() => {});
        } else {
            void navigator.clipboard.writeText(link);
        }
    };
    const handleCopyLink = () => {
        const link = `${window.location.origin}/music-videos/${kind}/${id}`;
        void navigator.clipboard.writeText(link);
    };
    const handleDelete = () => {
        if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
            onDelete?.();
        }
    };

    const menuOptions = [
        { label: 'Open', value: 'open', onClick: onOpen },
        { label: 'Share', value: 'share', onClick: handleShare },
        { label: 'Copy link', value: 'copy-link', onClick: handleCopyLink },
        { label: 'Delete', value: 'delete', color: 'red.500', onClick: handleDelete },
    ];

    const FallbackIcon = kind === 'video' ? FiVideo : FiMusic;

    return (
        <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="xl"
            shadow="sm"
            overflow="hidden"
            transition="all 0.2s ease"
            _hover={{ shadow: 'md', transform: 'translateY(-2px)', borderColor: 'gray.200' }}
            position="relative"
            opacity={isDeleting ? 0.55 : 1}
            pointerEvents={isDeleting ? 'none' : 'auto'}
            display="flex"
            flexDirection="column"
        >
            {isDeleting && (
                <Flex
                    position="absolute"
                    inset={0}
                    bg="whiteAlpha.800"
                    align="center"
                    justify="center"
                    zIndex={3}
                >
                    <Spinner size="md" color="primary.500" />
                </Flex>
            )}

            {/* Cover */}
            <Box
                position="relative"
                w="100%"
                aspectRatio="1 / 1"
                bg="gray.50"
                cursor="pointer"
                onClick={onOpen}
                role="group"
            >
                <AuthedImage
                    src={thumbnail}
                    alt={title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    fallback={
                        <Flex
                            w="100%"
                            h="100%"
                            align="center"
                            justify="center"
                            color="gray.300"
                        >
                            <Icon as={FallbackIcon} boxSize={10} />
                        </Flex>
                    }
                />

                {/* Hover dim + play */}
                <Box
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.0"
                    transition="background 0.2s ease"
                    _groupHover={{ bg: 'blackAlpha.300' }}
                />
                <Flex
                    position="absolute"
                    inset={0}
                    align="center"
                    justify="center"
                    opacity={0}
                    transition="opacity 0.2s ease"
                    _groupHover={{ opacity: 1 }}
                    pointerEvents="none"
                >
                    <Box
                        as="button"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onPlay?.();
                        }}
                        bg="primary.500"
                        color="white"
                        borderRadius="full"
                        w="56px"
                        h="56px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        shadow="lg"
                        pointerEvents="auto"
                        cursor="pointer"
                        transition="transform 0.15s ease"
                        _hover={{ transform: 'scale(1.06)', bg: 'primary.600' }}
                    >
                        <Icon as={FiPlay} boxSize={6} ml="2px" />
                    </Box>
                </Flex>

                {/* Top-right menu */}
                <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="whiteAlpha.900"
                    borderRadius="md"
                    backdropFilter="blur(6px)"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CustomMenu options={menuOptions} />
                </Box>

                {/* Kind chip */}
                <Box
                    position="absolute"
                    bottom={2}
                    left={2}
                    bg="whiteAlpha.900"
                    borderRadius="md"
                    px={2}
                    py={0.5}
                >
                    <Text
                        fontSize="10px"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        color="gray.blue.800"
                    >
                        {kindLabel[kind]}
                    </Text>
                </Box>

                {/* Draft badge — only shown for unpublished albums */}
                {showDraftBadge && (
                    <Box
                        position="absolute"
                        top={2}
                        left={2}
                        bg="orange.500"
                        color="white"
                        borderRadius="md"
                        px={2}
                        py={0.5}
                        shadow="sm"
                    >
                        <Text
                            fontSize="10px"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                        >
                            Draft
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Body */}
            <VStack align="stretch" gap={1} px={4} pt={3} pb={2}>
                <Text
                    fontSize="14px"
                    fontWeight="700"
                    color="gray.blue.800"
                    letterSpacing="-0.01em"
                    lineHeight="1.25"
                    truncate
                >
                    {title}
                </Text>
                <Text fontSize="12px" color="gray.blue.700" truncate>
                    {artist}{album ? ` · ${album}` : ''}
                </Text>
            </VStack>

            {/* Metrics + edit */}
            <HStack
                px={4}
                pb={3}
                pt={1}
                justify="space-between"
                align="center"
                mt="auto"
            >
                <HStack gap={3} fontSize="11px" color="gray.blue.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <Text>{plays.toLocaleString()} plays</Text>
                    <Text color="gray.300">·</Text>
                    <Text>{releaseDate}</Text>
                </HStack>
                <Button
                    variant="ghost"
                    size="xs"
                    color="primary.500"
                    fontSize="11px"
                    h="26px"
                    px={2}
                    minW="auto"
                    _hover={{ bg: 'primary.50' }}
                    onClick={onEdit}
                >
                    <Icon as={Edit2Icon} boxSize={3} mr={1} />
                    Edit
                </Button>
            </HStack>
        </Box>
    );
};
