import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { formatCount } from '@shared/console/lib/format';
import type { PlatformActiveRow } from '../../../types/platform';
import { ChartCard } from '../ChartCard';

const PLATFORM_COLORS: Record<string, string> = {
    Mobile: '#f94444',
    Web: '#3B82F6',
};

interface PlatformSplitCardProps {
    byPlatform: PlatformActiveRow[];
    loading: boolean;
}

/** Distinct active listeners in the window split by playback platform. */
export const PlatformSplitCard: React.FC<PlatformSplitCardProps> = ({ byPlatform, loading }) => {
    const rows = [...byPlatform].sort((a, b) => b.activeUsers - a.activeUsers);
    const max = rows.length > 0 ? rows[0].activeUsers : 0;
    const total = rows.reduce((sum, r) => sum + r.activeUsers, 0);
    const hasData = total > 0;

    return (
        <ChartCard
            title="Actives by platform"
            subtitle="Where the window's listeners played from"
            headline={hasData ? formatCount(total) : undefined}
            headlineCaption={hasData ? 'Platform-attributed actives' : undefined}
            loading={loading}
            empty={!hasData}
            emptyText="No listening activity recorded in this window yet."
            minH="280px"
        >
            <VStack align="stretch" gap={3} pt={1}>
                {rows.map((row) => {
                    const widthPct = max === 0 ? 0 : (row.activeUsers / max) * 100;
                    const sharePct = total === 0 ? 0 : (row.activeUsers / total) * 100;
                    const color = PLATFORM_COLORS[row.platform] ?? '#CBD5E1';
                    return (
                        <Box key={row.platform}>
                            <HStack justify="space-between" mb={1}>
                                <HStack gap={1.5}>
                                    <Box w={2} h={2} borderRadius="full" bg={color} />
                                    <Text fontSize="10px" fontWeight="medium" color="gray.700">
                                        {row.platform}
                                    </Text>
                                </HStack>
                                <Text fontSize="10px" color="gray.600">
                                    <Text as="span" fontWeight="semibold" color="gray.900">
                                        {formatCount(row.activeUsers)}
                                    </Text>
                                    {' · '}
                                    {sharePct.toFixed(1)}%
                                </Text>
                            </HStack>
                            <Box bg="gray.100" h="8px" borderRadius="full" overflow="hidden">
                                <Box
                                    h="full"
                                    w={`${widthPct}%`}
                                    minW={row.activeUsers > 0 ? '4px' : 0}
                                    bg={color}
                                    borderRadius="full"
                                    transition="width 0.4s ease"
                                />
                            </Box>
                        </Box>
                    );
                })}
            </VStack>
            <Text fontSize="8px" color="gray.400" mt={3}>
                A listener active on several platforms is counted once per platform.
            </Text>
        </ChartCard>
    );
};
