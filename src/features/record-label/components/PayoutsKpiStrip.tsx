import React from 'react';
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import type { LabelSummaryDto, PayoutDto } from '../types';
import { formatMinorAmount } from '../lib/format';

interface PayoutsKpiStripProps {
    summary?: LabelSummaryDto;
    payouts?: PayoutDto[];
    isLoading?: boolean;
}

const KpiCard: React.FC<{
    label: string;
    value: React.ReactNode;
    trailing?: React.ReactNode;
}> = ({ label, value, trailing }) => (
    <Box
        bg="white"
        borderRadius="20px"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        px={4}
        py={3}
        minW={{ base: '160px', md: '180px' }}
        flex={{ base: '0 0 auto', md: '1 1 0' }}
    >
        <Text
            fontSize="10px"
            color="gray.500"
            fontWeight="medium"
            textTransform="uppercase"
            letterSpacing="0.5px"
        >
            {label}
        </Text>
        <HStack gap={2} align="baseline" mt={1}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                {value}
            </Text>
            {trailing}
        </HStack>
    </Box>
);

function relativeTime(iso?: string): string {
    if (!iso) return '—';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return '—';
    const diffMs = Date.now() - t;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diffMs < minute) return 'just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    if (diffMs < 30 * day) return `${Math.floor(diffMs / day)}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const PayoutsKpiStrip: React.FC<PayoutsKpiStripProps> = ({
    summary,
    payouts,
    isLoading,
}) => {
    if (isLoading || !summary) {
        return (
            <HStack gap={3} overflowX={{ base: 'auto', md: 'visible' }} align="stretch">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Box
                        key={i}
                        bg="white"
                        borderRadius="20px"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        px={4}
                        py={3}
                        minW={{ base: '160px', md: '180px' }}
                        flex={{ base: '0 0 auto', md: '1 1 0' }}
                    >
                        <VStack align="stretch" gap={2}>
                            <Skeleton height="10px" width="60%" />
                            <Skeleton height="20px" width="50%" />
                        </VStack>
                    </Box>
                ))}
            </HStack>
        );
    }

    const list = payouts ?? [];
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const paidThisMonth = list.filter(
        (p) => p.status === 'Paid' && p.completedAt && new Date(p.completedAt) >= monthStart,
    );
    const paidThisMonthMinor = paidThisMonth.reduce((sum, p) => sum + p.amountMinor, 0);
    const paidCurrency = paidThisMonth[0]?.currency ?? summary.currency ?? 'NGN';

    const mostRecent = [...list].sort(
        (a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
    )[0];

    return (
        <HStack gap={3} overflowX={{ base: 'auto', md: 'visible' }} align="stretch">
            <KpiCard
                label="Pending balance"
                value={formatMinorAmount(summary.pendingPayoutsAmountMinor, summary.currency)}
            />
            <KpiCard
                label="Pending payouts"
                value={summary.pendingPayoutsCount.toLocaleString()}
            />
            <KpiCard
                label="Paid this month"
                value={formatMinorAmount(paidThisMonthMinor, paidCurrency)}
            />
            <KpiCard
                label="Last payout"
                value={relativeTime(mostRecent?.initiatedAt)}
            />
        </HStack>
    );
};
