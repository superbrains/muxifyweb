import React from 'react';
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    /** Right-aligned headline value (e.g. the window total). */
    headline?: string;
    headlineCaption?: string;
    loading?: boolean;
    /** When true (and not loading) the empty message replaces the chart. */
    empty?: boolean;
    emptyText?: string;
    /** Height reserved for the loading/empty states so the layout doesn't jump. */
    minH?: string;
    children: React.ReactNode;
}

/**
 * White-card chrome shared by every chart on the Business Analytics dashboard —
 * title/subtitle on the left, optional headline figure on the right, and the
 * same spinner/empty treatment as the sibling Growth/Revenue towers.
 */
export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    headline,
    headlineCaption,
    loading = false,
    empty = false,
    emptyText = 'Nothing recorded in this window yet.',
    minH = '260px',
    children,
}) => (
    <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
        <HStack justify="space-between" align="flex-start" mb={3} gap={3}>
            <VStack align="start" gap={0.5} minW={0}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                    {title}
                </Text>
                {subtitle && (
                    <Text fontSize="9px" color="gray.500">
                        {subtitle}
                    </Text>
                )}
            </VStack>
            {headline && (
                <VStack align="end" gap={0} flexShrink={0}>
                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                        {headline}
                    </Text>
                    {headlineCaption && (
                        <Text fontSize="9px" color="gray.500">
                            {headlineCaption}
                        </Text>
                    )}
                </VStack>
            )}
        </HStack>

        {loading ? (
            <Center h={minH}>
                <Spinner size="sm" color="primary.500" />
            </Center>
        ) : empty ? (
            <Center h={minH}>
                <Text fontSize="xs" color="gray.500">
                    {emptyText}
                </Text>
            </Center>
        ) : (
            children
        )}
    </Box>
);
