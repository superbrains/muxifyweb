import React from 'react';
import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { FiMusic } from 'react-icons/fi';

interface MediaCellProps {
    title: string;
    subtype?: string;
    coverArtUrl?: string;
    /** Extra line below subtype (e.g. genre). */
    meta?: string;
    size?: 'xs' | 'sm';
}

const THUMB_SIZE = { xs: '32px', sm: '40px' };
const PLACEHOLDER_SIZE = { xs: '14px', sm: '16px' };

/**
 * Table first-column cell: square cover-art thumbnail + title + subtype.
 * Falls back to a tinted music-note icon when no cover art is available.
 */
export const MediaCell: React.FC<MediaCellProps> = ({
    title,
    subtype,
    coverArtUrl,
    meta,
    size = 'xs',
}) => {
    const thumbSz = THUMB_SIZE[size];

    return (
        <HStack gap={2.5} minW={0} align="center">
            <Box
                w={thumbSz}
                h={thumbSz}
                borderRadius="6px"
                overflow="hidden"
                flexShrink={0}
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {coverArtUrl ? (
                    <Image
                        src={coverArtUrl}
                        alt={title}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                    />
                ) : (
                    <Box color="gray.400" fontSize={PLACEHOLDER_SIZE[size]}>
                        <FiMusic />
                    </Box>
                )}
            </Box>

            <VStack align="start" gap={0} minW={0}>
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.900"
                    lineClamp={1}
                >
                    {title || 'Untitled'}
                </Text>
                {(subtype || meta) && (
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize" lineClamp={1}>
                        {[subtype, meta].filter(Boolean).join(' · ')}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};
