import React from 'react';
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import type { LabelReleaseSummaryDto } from '../types';

interface ReleasesKpiStripProps {
    summary?: LabelReleaseSummaryDto;
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
        minW={{ base: '140px', md: '160px' }}
        flex={{ base: '0 0 auto', md: '1 1 0' }}
    >
        <Text fontSize="10px" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="0.5px">
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

function formatCompact(n: number): string {
    if (n < 1_000) return n.toString();
    if (n < 1_000_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}K`;
    return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
}

function trendBadge(current: number, previous: number): React.ReactNode {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) {
        return (
            <HStack gap={1} color="green.600" fontSize="10px" fontWeight="semibold">
                <FiTrendingUp />
                <Text>new</Text>
            </HStack>
        );
    }
    const delta = ((current - previous) / previous) * 100;
    const positive = delta >= 0;
    const Icon = positive ? FiTrendingUp : FiTrendingDown;
    return (
        <HStack gap={1} color={positive ? 'green.600' : 'red.500'} fontSize="10px" fontWeight="semibold">
            <Icon />
            <Text>{`${positive ? '+' : ''}${delta.toFixed(0)}%`}</Text>
        </HStack>
    );
}

export const ReleasesKpiStrip: React.FC<ReleasesKpiStripProps> = ({ summary, isLoading }) => {
    if (isLoading || !summary) {
        return (
            <HStack gap={3} overflowX={{ base: 'auto', md: 'visible' }} align="stretch">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                        key={i}
                        bg="white"
                        borderRadius="20px"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        px={4}
                        py={3}
                        minW={{ base: '140px', md: '160px' }}
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

    return (
        <HStack gap={3} overflowX={{ base: 'auto', md: 'visible' }} align="stretch">
            <KpiCard label="Total" value={summary.total.toLocaleString()} />
            <KpiCard label="Live" value={summary.live.toLocaleString()} />
            <KpiCard label="Scheduled" value={summary.scheduled.toLocaleString()} />
            <KpiCard label="Drafts" value={summary.drafts.toLocaleString()} />
            <KpiCard
                label="Streams (30d)"
                value={formatCompact(summary.streamsLast30d)}
                trailing={trendBadge(summary.streamsLast30d, summary.streamsPrev30d)}
            />
        </HStack>
    );
};
