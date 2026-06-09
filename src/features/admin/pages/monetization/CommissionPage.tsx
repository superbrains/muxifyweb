import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiPercent } from 'react-icons/fi';
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
import { useCommission } from '../../hooks/useMonetization';
import type { CommissionByTypeDto, DateRangeQuery } from '../../types/monetization';
import { RANGE_OPTIONS, rangeFor } from './rangeFilter';

/** Commission summary — platform commission taken from creator earnings, by type. */
const CommissionPage: React.FC = () => {
    const [preset, setPreset] = React.useState('30d');
    const range: DateRangeQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data, isLoading, error } = useCommission(range);

    const currency = data?.currency ?? 'NGN';

    const kpis: KpiItem[] = [
        { label: 'Commission coins', value: formatCount(data?.totalCommissionCoins) },
        { label: 'Commission value', value: formatMinorAmount(data?.totalCommissionMinor, currency) },
        { label: 'Earnings counted', value: formatCount(data?.earningCount) },
    ];

    const columns: DataColumn<CommissionByTypeDto>[] = [
        {
            key: 'type',
            header: 'Earning type',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {r.earningType}
                </Text>
            ),
        },
        {
            key: 'coins',
            header: 'Commission coins',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(r.commissionCoins)}
                </Text>
            ),
        },
        {
            key: 'value',
            header: 'Commission value',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(r.commissionMinor, currency)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Commission"
            subtitle="Platform commission earned from creator earnings, broken down by earning type."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Commission' }]}
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
                <AdminError error={error} message="Could not load commission." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={kpis} />
                    <DataTable
                        columns={columns}
                        rows={data?.byType ?? []}
                        rowKey={(r) => r.earningType}
                        emptyIcon={FiPercent}
                        emptyTitle="No commission"
                        emptyDescription="No commissionable earnings in the selected window."
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default CommissionPage;
