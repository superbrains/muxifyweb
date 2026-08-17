import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { formatMinorAmount } from '@shared/console/lib/format';
import type { RevenueBySourceDto } from '../../../types/monetization';
import { ChartCard } from '../ChartCard';

const COLORS = ['#3B82F6', '#16A34A', '#D97706', '#7C3AED', '#0EA5E9', '#E53E3E'];

/** "paystack" → "Paystack"; leaves multi-word/branded names alone. */
const humanizeSource = (source: string): string =>
    source ? source.charAt(0).toUpperCase() + source.slice(1) : 'Unknown';

interface RevenueBySourceCardProps {
    bySource: RevenueBySourceDto[];
    currency: string;
    loading: boolean;
}

/**
 * Where the window's gross funding came from, by payment provider. A ranked bar
 * list (rather than a chart) keeps a handful of providers legible and shows the
 * exact amount + share for each.
 */
export const RevenueBySourceCard: React.FC<RevenueBySourceCardProps> = ({
    bySource,
    currency,
    loading,
}) => {
    const sorted = [...bySource].filter((s) => s.amountMinor > 0).sort((a, b) => b.amountMinor - a.amountMinor);
    const total = sorted.reduce((sum, s) => sum + s.amountMinor, 0);
    const max = sorted.length > 0 ? sorted[0].amountMinor : 0;
    const hasData = total > 0;

    return (
        <ChartCard
            title="Funding by source"
            subtitle="Gross coin funding by payment provider"
            headline={hasData ? formatMinorAmount(total, currency) : undefined}
            headlineCaption={hasData ? `${sorted.length} ${sorted.length === 1 ? 'provider' : 'providers'}` : undefined}
            loading={loading}
            empty={!hasData}
            emptyText="No funding recorded in this window yet."
            minH="220px"
        >
            <VStack align="stretch" gap={3} pt={1}>
                {sorted.map((row, i) => {
                    const widthPct = max === 0 ? 0 : (row.amountMinor / max) * 100;
                    const sharePct = total === 0 ? 0 : (row.amountMinor / total) * 100;
                    const color = COLORS[i % COLORS.length];
                    return (
                        <Box key={row.source}>
                            <HStack justify="space-between" mb={1}>
                                <Text fontSize="11px" fontWeight="medium" color="gray.700">
                                    {humanizeSource(row.source)}
                                </Text>
                                <Text fontSize="11px" color="gray.600">
                                    <Text as="span" fontWeight="semibold" color="gray.900">
                                        {formatMinorAmount(row.amountMinor, currency)}
                                    </Text>
                                    {' · '}
                                    {sharePct.toFixed(1)}%
                                </Text>
                            </HStack>
                            <Box bg="gray.100" h="8px" borderRadius="full" overflow="hidden">
                                <Box
                                    h="full"
                                    w={`${widthPct}%`}
                                    minW={row.amountMinor > 0 ? '6px' : 0}
                                    bg={color}
                                    borderRadius="full"
                                    transition="width 0.4s ease"
                                />
                            </Box>
                        </Box>
                    );
                })}
            </VStack>
        </ChartCard>
    );
};
