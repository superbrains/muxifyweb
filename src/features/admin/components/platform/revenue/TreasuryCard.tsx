import React from 'react';
import { Box, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react';
import { formatCount, formatMinorAmount } from '@shared/console/lib/format';
import type { FinanceOverview } from '../../../types/finance';

interface StatTileProps {
    bg: string;
    dot: string;
    label: string;
    value: string;
    sub?: string;
}

const StatTile: React.FC<StatTileProps> = ({ bg, dot, label, value, sub }) => (
    <Box bg={bg} p={4} borderRadius="xl">
        <VStack align="start" gap={1}>
            <Box w={2} h={2} borderRadius="full" bg={dot} />
            <Text fontSize="9px" color="gray.600" fontWeight="medium">
                {label}
            </Text>
            <Text fontSize="md" fontWeight="bold" color="gray.900">
                {value}
            </Text>
            {sub && (
                <Text fontSize="8px" color="gray.500">
                    {sub}
                </Text>
            )}
        </VStack>
    </Box>
);

interface TreasuryCardProps {
    data?: FinanceOverview;
    loading: boolean;
}

/**
 * The platform's money position — coin float in circulation, cash already paid
 * out, and the standing liabilities/operational backlog (unwithdrawn creator
 * earnings, pending withdrawals/payouts, failed payouts). Pulls from the same
 * finance overview the Finance hub uses so the figures reconcile.
 */
export const TreasuryCard: React.FC<TreasuryCardProps> = ({ data, loading }) => {
    const currency = data?.currency ?? 'NGN';
    const hasFailures = (data?.failedPayoutsCount ?? 0) > 0;

    const tiles: StatTileProps[] = data
        ? [
              {
                  bg: '#ECF7FF',
                  dot: '#3B82F6',
                  label: 'Coins in circulation',
                  value: formatCount(data.coinsInCirculation),
                  sub: `${formatCount(data.grossCoinVolume)} gross volume`,
              },
              {
                  bg: '#E7FFF7',
                  dot: '#16A34A',
                  label: 'Total paid out',
                  value: formatMinorAmount(data.totalPaidOutMinor, currency),
                  sub: 'Settled payouts + withdrawals',
              },
              {
                  bg: '#FFF9E6',
                  dot: '#D97706',
                  label: 'Unwithdrawn earnings',
                  value: formatMinorAmount(data.unwithdrawnEarningsMinor, currency),
                  sub: 'Creator liability owed',
              },
              {
                  bg: '#F6F1FF',
                  dot: '#7C3AED',
                  label: 'Pending withdrawals',
                  value: formatMinorAmount(data.pendingWithdrawalsMinor, currency),
                  sub: `${formatCount(data.pendingWithdrawalsCount)} awaiting`,
              },
              {
                  bg: '#FFF5F6',
                  dot: 'var(--chakra-colors-primary-500, #f94444)',
                  label: 'Pending payouts',
                  value: formatMinorAmount(data.pendingPayoutsMinor, currency),
                  sub: `${formatCount(data.pendingPayoutsCount)} awaiting`,
              },
              {
                  bg: hasFailures ? '#FEF2F2' : '#F1F5F9',
                  dot: hasFailures ? '#E53E3E' : '#94A3B8',
                  label: 'Failed payouts',
                  value: formatCount(data.failedPayoutsCount),
                  sub: hasFailures ? 'Need attention' : 'All clear',
              },
          ]
        : [];

    return (
        <VStack align="stretch" gap={2}>
            <Text fontSize="11px" fontWeight="semibold" color="gray.700" px={1}>
                Treasury &amp; liabilities
                <Text as="span" fontWeight="normal" color="gray.400" ml={1.5} fontSize="10px">
                    platform-wide position, all time
                </Text>
            </Text>
            <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
                <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={3}>
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <Skeleton key={`sk-${i}`} height="92px" borderRadius="xl" />
                          ))
                        : tiles.map((t) => <StatTile key={t.label} {...t} />)}
                </SimpleGrid>
            </Box>
        </VStack>
    );
};
