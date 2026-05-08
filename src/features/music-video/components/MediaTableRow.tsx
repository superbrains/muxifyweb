import React from 'react';
import { Box, Flex, HStack, Icon, Spinner, Table, Text } from '@chakra-ui/react';
import { FiPlay, FiMusic, FiVideo } from 'react-icons/fi';
import { Edit2Icon } from '@shared/icons/CustomIcons';
import { CustomMenu } from '@/shared/components/CustomMenu';
import { AuthedImage } from '@/shared/components/AuthedImage';
import type { MediaKind } from './MediaGridCard';

interface MediaTableRowProps {
    id: string;
    thumbnail: string;
    title: string;
    artist: string;
    album?: string;
    releaseDate: string;
    plays: number;
    unlocks: number;
    gifts: number;
    kind: MediaKind;
    showAlbumColumn: boolean;
    isDeleting?: boolean;
    onEdit: () => void;
    onPlay?: () => void;
    onOpen?: () => void;
    onDelete?: () => void;
}

const num = (n: number) => n.toLocaleString();

export const MediaTableRow: React.FC<MediaTableRowProps> = ({
    id,
    thumbnail,
    title,
    artist,
    album,
    releaseDate,
    plays,
    unlocks,
    gifts,
    kind,
    showAlbumColumn,
    isDeleting = false,
    onEdit,
    onPlay,
    onOpen,
    onDelete,
}) => {
    const handleShare = () => {
        const link = `${window.location.origin}/music-videos/${kind}/${id}`;
        if (navigator.share) navigator.share({ title, url: link }).catch(() => {});
        else void navigator.clipboard.writeText(link);
    };
    const handleCopyLink = () => {
        const link = `${window.location.origin}/music-videos/${kind}/${id}`;
        void navigator.clipboard.writeText(link);
    };
    const handleDelete = () => {
        if (window.confirm(`Delete "${title}"? This cannot be undone.`)) onDelete?.();
    };

    const menuOptions = [
        { label: 'Open', value: 'open', onClick: onOpen },
        { label: 'Edit', value: 'edit', onClick: onEdit },
        { label: 'Share', value: 'share', onClick: handleShare },
        { label: 'Copy link', value: 'copy-link', onClick: handleCopyLink },
        { label: 'Delete', value: 'delete', color: 'red.500', onClick: handleDelete },
    ];

    const FallbackIcon = kind === 'video' ? FiVideo : FiMusic;

    return (
        <Table.Row
            _hover={{ bg: 'gray.50' }}
            transition="background 0.12s ease"
            opacity={isDeleting ? 0.55 : 1}
        >
            {/* Cover + hover-play */}
            <Table.Cell py={3}>
                <Box
                    position="relative"
                    w="44px"
                    h="44px"
                    borderRadius="md"
                    overflow="hidden"
                    bg="gray.50"
                    role="group"
                    cursor="pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay?.();
                    }}
                >
                    <AuthedImage
                        src={thumbnail}
                        alt={title}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        fallback={
                            <Flex w="100%" h="100%" align="center" justify="center" color="gray.300">
                                <Icon as={FallbackIcon} boxSize={5} />
                            </Flex>
                        }
                    />
                    {isDeleting ? (
                        <Flex position="absolute" inset={0} align="center" justify="center" bg="whiteAlpha.800">
                            <Spinner size="sm" color="primary.500" />
                        </Flex>
                    ) : (
                        <Flex
                            position="absolute"
                            inset={0}
                            align="center"
                            justify="center"
                            bg="blackAlpha.500"
                            color="white"
                            opacity={0}
                            transition="opacity 0.15s ease"
                            _groupHover={{ opacity: 1 }}
                        >
                            <Icon as={FiPlay} boxSize={4} ml="1px" />
                        </Flex>
                    )}
                </Box>
            </Table.Cell>

            {/* Title */}
            <Table.Cell py={3} cursor="pointer" onClick={onOpen}>
                <Text fontSize="13px" fontWeight="600" color="gray.blue.800" truncate>
                    {title}
                </Text>
            </Table.Cell>

            {/* Artist */}
            <Table.Cell py={3} cursor="pointer" onClick={onOpen}>
                <Text fontSize="13px" color="gray.blue.700" truncate>
                    {artist}
                </Text>
            </Table.Cell>

            {/* Album */}
            {showAlbumColumn && (
                <Table.Cell py={3} cursor="pointer" onClick={onOpen}>
                    <Text fontSize="13px" color="gray.blue.700" truncate>
                        {album ?? '—'}
                    </Text>
                </Table.Cell>
            )}

            {/* Release date */}
            <Table.Cell py={3} cursor="pointer" onClick={onOpen}>
                <Text fontSize="13px" color="gray.blue.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {releaseDate}
                </Text>
            </Table.Cell>

            {/* Plays */}
            <Table.Cell py={3} textAlign="right" cursor="pointer" onClick={onOpen}>
                <Text
                    fontSize="13px"
                    color="gray.blue.800"
                    fontWeight="medium"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {num(plays)}
                </Text>
            </Table.Cell>

            {/* Unlocks */}
            <Table.Cell py={3} textAlign="right" cursor="pointer" onClick={onOpen}>
                <Text fontSize="13px" color="gray.blue.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₦{num(unlocks)}
                </Text>
            </Table.Cell>

            {/* Gifts */}
            <Table.Cell py={3} textAlign="right" cursor="pointer" onClick={onOpen}>
                <Text fontSize="13px" color="gray.blue.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {num(gifts)}
                </Text>
            </Table.Cell>

            {/* Actions */}
            <Table.Cell py={3} textAlign="right">
                <HStack justify="flex-end" gap={1}>
                    <Box
                        as="button"
                        onClick={onEdit}
                        color="primary.500"
                        fontSize="12px"
                        fontWeight="medium"
                        h="28px"
                        px={2}
                        borderRadius="md"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        _hover={{ bg: 'primary.50' }}
                    >
                        <Icon as={Edit2Icon} boxSize={3.5} />
                        Edit
                    </Box>
                    <CustomMenu options={menuOptions} />
                </HStack>
            </Table.Cell>
        </Table.Row>
    );
};
