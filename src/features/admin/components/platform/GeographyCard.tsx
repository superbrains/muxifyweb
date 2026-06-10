import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FiGlobe } from 'react-icons/fi';
import { DataTable } from '../ui';
import type { DataColumn } from '../ui';
import { formatCount, formatMinorAmount } from '../../lib/format';
import { useGeographyAnalytics } from '../../hooks/usePlatform';
import type { DateWindow, GeographyRow } from '../../types/platform';

const TOP_N = 8;

interface GeographyCardProps {
    range: DateWindow;
    currency: string;
}

/**
 * Revenue by country for the window. Artist-side geography only — the backend
 * derives it from earnings joined to the artist's profile country, so fan
 * locations are not represented.
 */
export const GeographyCard: React.FC<GeographyCardProps> = ({ range, currency }) => {
    const { data, isLoading } = useGeographyAnalytics(range);

    const rows = (data?.byCountry ?? []).slice(0, TOP_N);
    const totalRevenue = (data?.byCountry ?? []).reduce((sum, r) => sum + r.revenueMinor, 0);

    const columns: DataColumn<GeographyRow>[] = [
        {
            key: 'country',
            header: 'Country',
            render: (r) => <Text fontWeight="medium">{r.country}</Text>,
        },
        {
            key: 'artists',
            header: 'Earning artists',
            align: 'right',
            render: (r) => formatCount(r.users),
        },
        {
            key: 'revenue',
            header: 'Revenue',
            align: 'right',
            render: (r) => (
                <Text fontWeight="semibold">{formatMinorAmount(r.revenueMinor, currency)}</Text>
            ),
        },
        {
            key: 'share',
            header: 'Share',
            align: 'right',
            width: '110px',
            render: (r) => {
                const pct = totalRevenue > 0 ? (r.revenueMinor / totalRevenue) * 100 : 0;
                return (
                    <VStack align="end" gap={1}>
                        <Text fontSize="10px" color="gray.600">
                            {pct.toFixed(1)}%
                        </Text>
                        <Box w="72px" h="4px" bg="gray.100" borderRadius="full" overflow="hidden">
                            <Box w={`${Math.min(pct, 100)}%`} h="full" bg="primary.500" />
                        </Box>
                    </VStack>
                );
            },
        },
    ];

    return (
        <VStack align="stretch" gap={2}>
            <Text fontSize="11px" fontWeight="semibold" color="gray.700" px={1}>
                Revenue by country
                <Text as="span" fontWeight="normal" color="gray.400" ml={1.5} fontSize="10px">
                    artist-side, top {TOP_N}
                </Text>
            </Text>
            <DataTable
                columns={columns}
                rows={rows}
                rowKey={(r) => r.country}
                loading={isLoading && !data}
                skeletonRows={5}
                emptyIcon={FiGlobe}
                emptyTitle="No geographic revenue"
                emptyDescription="No artist earnings were recorded in this window."
            />
        </VStack>
    );
};
