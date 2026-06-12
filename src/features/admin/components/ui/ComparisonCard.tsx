import React from 'react';
import { Box, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react';
import { FiMusic } from 'react-icons/fi';

export interface ComparisonSide {
    label: string;
    title?: string;
    ownerName?: string;
    coverArtUrl?: string;
    fields?: Array<{ key: string; value?: string | number }>;
}

interface ComparisonCardProps {
    left: ComparisonSide;
    right: ComparisonSide;
    /** Optional centre strip content (score, method, tier badge, etc.). */
    centre?: React.ReactNode;
}

const Side: React.FC<ComparisonSide & { accent: string }> = ({
    label,
    title,
    ownerName,
    coverArtUrl,
    fields,
    accent,
}) => (
    <VStack
        flex="1"
        align="stretch"
        bg="white"
        border="1px solid"
        borderColor={`${accent}.100`}
        borderRadius="14px"
        p={4}
        gap={3}
    >
        <Text
            fontSize="10px"
            fontWeight="700"
            color={`${accent}.600`}
            textTransform="uppercase"
            letterSpacing="0.5px"
        >
            {label}
        </Text>

        <HStack gap={3} align="flex-start">
            <Box
                w="52px"
                h="52px"
                borderRadius="10px"
                overflow="hidden"
                flexShrink={0}
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {coverArtUrl ? (
                    <Image src={coverArtUrl} alt={title} w="100%" h="100%" objectFit="cover" />
                ) : (
                    <Box color="gray.400" fontSize="20px">
                        <FiMusic />
                    </Box>
                )}
            </Box>
            <VStack align="start" gap={0.5} minW={0}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" lineClamp={2}>
                    {title ?? '—'}
                </Text>
                <Text fontSize="11px" color="gray.500" lineClamp={1}>
                    {ownerName ?? '—'}
                </Text>
            </VStack>
        </HStack>

        {fields && fields.length > 0 && (
            <VStack align="stretch" gap={1.5}>
                {fields.map((f) => f.value != null && (
                    <HStack key={f.key} justify="space-between" gap={2}>
                        <Text fontSize="11px" color="gray.500">{f.key}</Text>
                        <Text fontSize="11px" fontWeight="500" color="gray.800" textAlign="right">
                            {f.value}
                        </Text>
                    </HStack>
                ))}
            </VStack>
        )}
    </VStack>
);

/**
 * Side-by-side comparison card for duplicate match detail pages.
 * Left is the suspect (orange), right is the matched content (blue).
 */
export const ComparisonCard: React.FC<ComparisonCardProps> = ({ left, right, centre }) => (
    <VStack align="stretch" gap={3}>
        <Stack
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            align="stretch"
        >
            <Side {...left} accent="orange" />

            {centre && (
                <VStack
                    justify="center"
                    align="center"
                    gap={2}
                    px={2}
                    display={{ base: 'none', md: 'flex' }}
                    flexShrink={0}
                    minW="80px"
                >
                    {centre}
                </VStack>
            )}

            <Side {...right} accent="blue" />
        </Stack>

        {centre && (
            <Box display={{ base: 'block', md: 'none' }}>
                <HStack justify="center" gap={3}>
                    {centre}
                </HStack>
            </Box>
        )}
    </VStack>
);
