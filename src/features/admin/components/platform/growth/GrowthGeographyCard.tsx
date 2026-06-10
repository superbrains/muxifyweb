import React from 'react';
import { Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { formatCount } from '../../../lib/format';
import type { GrowthCountryRow } from '../../../types/platform';
import { ChartCard } from '../ChartCard';

const TOP_N = 10;

interface GrowthGeographyCardProps {
    byCountry: GrowthCountryRow[];
    loading: boolean;
}

/**
 * Signup geography for the window, from the signup's fan/artist profile
 * country. Props-driven — the data arrives with the enriched /growth payload.
 */
export const GrowthGeographyCard: React.FC<GrowthGeographyCardProps> = ({
    byCountry,
    loading,
}) => {
    const rows = byCountry.slice(0, TOP_N);
    const remaining = byCountry.length - rows.length;
    const max = rows.length > 0 ? rows[0].count : 0;
    const total = byCountry.reduce((sum, r) => sum + r.count, 0);
    const hasData = total > 0;

    return (
        <ChartCard
            title="Signups by country"
            subtitle="From the new account's profile country"
            headline={hasData ? formatCount(total) : undefined}
            headlineCaption={hasData ? 'Signups in window' : undefined}
            loading={loading}
            empty={!hasData}
            emptyText="No signups recorded in this window yet."
            minH="180px"
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap={8} rowGap={3} pt={1}>
                {rows.map((row) => {
                    const widthPct = max === 0 ? 0 : (row.count / max) * 100;
                    const sharePct = total === 0 ? 0 : (row.count / total) * 100;
                    return (
                        <Box key={row.country}>
                            <HStack justify="space-between" mb={1}>
                                <Text
                                    fontSize="10px"
                                    fontWeight="medium"
                                    color={row.country === 'Unknown' ? 'gray.400' : 'gray.700'}
                                >
                                    {row.country}
                                </Text>
                                <Text fontSize="10px" color="gray.600">
                                    <Text as="span" fontWeight="semibold" color="gray.900">
                                        {formatCount(row.count)}
                                    </Text>
                                    {' · '}
                                    {sharePct.toFixed(1)}%
                                </Text>
                            </HStack>
                            <Box bg="gray.100" h="6px" borderRadius="full" overflow="hidden">
                                <Box
                                    h="full"
                                    w={`${widthPct}%`}
                                    minW={row.count > 0 ? '4px' : 0}
                                    bg={row.country === 'Unknown' ? 'gray.300' : 'primary.500'}
                                    borderRadius="full"
                                    transition="width 0.4s ease"
                                />
                            </Box>
                        </Box>
                    );
                })}
            </SimpleGrid>
            {remaining > 0 && (
                <VStack align="start" mt={3}>
                    <Text fontSize="9px" color="gray.400">
                        +{remaining} more {remaining === 1 ? 'country' : 'countries'}
                    </Text>
                </VStack>
            )}
        </ChartCard>
    );
};
