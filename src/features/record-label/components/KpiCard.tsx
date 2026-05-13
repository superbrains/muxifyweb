import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FiArrowDownRight, FiArrowUpRight } from 'react-icons/fi';
import type { TrendValue } from '../lib/format';

interface KpiCardProps {
    bg: string;
    iconColor: string;
    label: string;
    value: string;
    sub?: string;
    trend?: TrendValue;
    trendCaption?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
    bg,
    iconColor,
    label,
    value,
    sub,
    trend,
    trendCaption,
}) => (
    <Box bg={bg} p={4} borderRadius="xl">
        <VStack align="start" gap={1}>
            <Box w={2} h={2} borderRadius="full" bg={iconColor} />
            <Text fontSize="9px" color="gray.600" fontWeight="medium">
                {label}
            </Text>
            <Text fontSize="md" fontWeight="bold" color="gray.900">
                {value}
            </Text>
            {trend && (
                <HStack
                    gap={1}
                    px={1.5}
                    py={0.5}
                    borderRadius="full"
                    bg={trend.isPositive ? 'green.50' : 'red.50'}
                    color={trend.isPositive ? 'green.600' : 'red.500'}
                >
                    {trend.isPositive ? (
                        <FiArrowUpRight size={10} />
                    ) : (
                        <FiArrowDownRight size={10} />
                    )}
                    <Text fontSize="9px" fontWeight="semibold">
                        {trend.isPositive ? '+' : '-'}
                        {trend.deltaPct.toFixed(1)}%
                    </Text>
                    {trendCaption && (
                        <Text fontSize="9px" color="gray.500" fontWeight="medium">
                            {trendCaption}
                        </Text>
                    )}
                </HStack>
            )}
            {sub && (
                <Text fontSize="8px" color="gray.500">
                    {sub}
                </Text>
            )}
        </VStack>
    </Box>
);
