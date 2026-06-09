import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiPieChart } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    FilterBar,
    KpiStrip,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { formatCount, formatMinorAmount } from '../../lib/format';
import { useRevenue } from '../../hooks/useMonetization';
import type { DateRangeQuery, RevenueBySourceDto } from '../../types/monetization';
import { RANGE_OPTIONS, rangeFor } from './rangeFilter';

/** Revenue summary — gross funding / fees / net + per-source breakdown. */
const RevenuePage: React.FC = () => {
    const [preset, setPreset] = React.useState('30d');
    const range: DateRangeQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data, isLoading, error } = useRevenue(range);

    const currency = data?.currency ?? 'NGN';

    const kpis: KpiItem[] = [
        { label: 'Gross funding', value: formatMinorAmount(data?.grossFundingMinor, currency) },
        { label: 'Coins sold', value: formatCount(data?.coinsSold) },
        { label: 'Fees collected', value: formatMinorAmount(data?.feesCollectedMinor, currency) },
        { label: 'Net revenue', value: formatMinorAmount(data?.netRevenueMinor, currency) },
        { label: 'Purchases', value: formatCount(data?.purchaseCount) },
    ];

    const columns: DataColumn<RevenueBySourceDto>[] = [
        {
            key: 'source',
            header: 'Source',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {r.source}
                </Text>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(r.amountMinor, currency)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Revenue"
            subtitle="Platform revenue from coin purchases — gross funding, fees and net, by source."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Revenue' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'range',
                        value: preset,
                        onChange: setPreset,
                        options: RANGE_OPTIONS,
                        width: '170px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load revenue." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={kpis} />
                    <DataTable
                        columns={columns}
                        rows={data?.bySource ?? []}
                        rowKey={(r) => r.source}
                        emptyIcon={FiPieChart}
                        emptyTitle="No revenue"
                        emptyDescription="No coin purchases in the selected window."
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default RevenuePage;
