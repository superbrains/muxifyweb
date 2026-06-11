import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FiPercent } from 'react-icons/fi';
import { DataTable } from '../../ui';
import type { DataColumn } from '../../ui';
import { formatCount, formatMinorAmount } from '../../../lib/format';
import type { CommissionByTypeDto, CommissionSummaryDto } from '../../../types/monetization';

const TYPE_LABELS: Record<string, string> = {
    Gift: 'Gifts',
    ContentUnlock: 'Content unlocks',
    Streaming: 'Streaming',
    Bonus: 'Bonuses',
    Referral: 'Referrals',
    Other: 'Other',
};

const humanizeType = (type: string): string =>
    TYPE_LABELS[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2');

interface CommissionByTypeCardProps {
    data?: CommissionSummaryDto;
    loading: boolean;
}

/**
 * Platform commission (the take it keeps before paying creators) broken down by
 * the earning type it was charged on, with a share bar for at-a-glance weighting.
 */
export const CommissionByTypeCard: React.FC<CommissionByTypeCardProps> = ({ data, loading }) => {
    const currency = data?.currency ?? 'NGN';
    const rows = [...(data?.byType ?? [])]
        .filter((r) => r.commissionMinor > 0 || r.commissionCoins > 0)
        .sort((a, b) => b.commissionMinor - a.commissionMinor);
    const total = data?.totalCommissionMinor ?? rows.reduce((s, r) => s + r.commissionMinor, 0);

    const columns: DataColumn<CommissionByTypeDto>[] = [
        {
            key: 'type',
            header: 'Earning type',
            render: (r) => (
                <Text fontWeight="medium" color="gray.900">
                    {humanizeType(r.earningType)}
                </Text>
            ),
        },
        {
            key: 'coins',
            header: 'Coins',
            align: 'right',
            render: (r) => formatCount(r.commissionCoins),
        },
        {
            key: 'amount',
            header: 'Commission',
            align: 'right',
            render: (r) => (
                <Text fontWeight="semibold">{formatMinorAmount(r.commissionMinor, currency)}</Text>
            ),
        },
        {
            key: 'share',
            header: 'Share',
            align: 'right',
            width: '110px',
            render: (r) => {
                const pct = total > 0 ? (r.commissionMinor / total) * 100 : 0;
                return (
                    <VStack align="end" gap={1}>
                        <Text fontSize="10px" color="gray.600">
                            {pct.toFixed(1)}%
                        </Text>
                        <Box w="72px" h="4px" bg="gray.100" borderRadius="full" overflow="hidden">
                            <Box w={`${Math.min(pct, 100)}%`} h="full" bg="#16A34A" />
                        </Box>
                    </VStack>
                );
            },
        },
    ];

    return (
        <VStack align="stretch" gap={2}>
            <Text fontSize="11px" fontWeight="semibold" color="gray.700" px={1}>
                Platform commission by type
                {data && (
                    <Text as="span" fontWeight="normal" color="gray.400" ml={1.5} fontSize="10px">
                        {formatMinorAmount(total, currency)} from {formatCount(data.earningCount)} earnings
                    </Text>
                )}
            </Text>
            <DataTable
                columns={columns}
                rows={rows}
                rowKey={(r) => r.earningType}
                loading={loading}
                skeletonRows={5}
                emptyIcon={FiPercent}
                emptyTitle="No commission"
                emptyDescription="No platform commission was charged in this window."
            />
        </VStack>
    );
};
