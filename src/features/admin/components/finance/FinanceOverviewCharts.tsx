import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatMinorAmount } from '../../lib/format';
import type { FinanceOverview } from '../../types/finance';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={4}>
            <Text fontSize="sm" fontWeight="semibold" fontFamily="Poppins" color="gray.900" mb={2}>
                {title}
            </Text>
            {children}
        </Box>
    );
}

export function FinanceOverviewCharts({ overview }: { overview: FinanceOverview }) {
    const cur = overview.currency || 'NGN';

    const donutSeries = [
        overview.totalPaidOutMinor,
        overview.pendingPayoutsMinor,
        overview.pendingWithdrawalsMinor,
        overview.unwithdrawnEarningsMinor,
    ];
    const donutOptions: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        labels: ['Paid out', 'Pending payouts', 'Pending withdrawals', 'Unwithdrawn'],
        colors: ['#16A34A', '#D97706', '#3B82F6', '#E53E3E'],
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#7B91B0' } },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v: number) => formatMinorAmount(v, cur) } },
        plotOptions: { pie: { donut: { size: '68%' } } },
    };

    const feeRate =
        overview.grossFundingMinor > 0
            ? Math.round((overview.feesCollectedMinor / overview.grossFundingMinor) * 1000) / 10
            : 0;
    const radialOptions: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        colors: ['#f94444'],
        labels: ['Fees / funding'],
        plotOptions: {
            radialBar: {
                hollow: { size: '62%' },
                dataLabels: {
                    name: { fontSize: '12px', color: '#7B91B0' },
                    value: { fontSize: '22px', fontWeight: 700, color: '#0F3659', formatter: (v: number) => `${v}%` },
                },
            },
        },
    };

    const hasMoney = donutSeries.some((v) => v > 0);

    return (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={3}>
            <ChartCard title="Where the money is">
                {hasMoney ? (
                    <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={260} />
                ) : (
                    <Text fontSize="xs" color="gray.500" py={20} textAlign="center">
                        No settlement activity in this period.
                    </Text>
                )}
            </ChartCard>
            <ChartCard title="Platform fee rate">
                <ReactApexChart options={radialOptions} series={[feeRate]} type="radialBar" height={260} />
                <Text fontSize="xs" color="gray.500" textAlign="center">
                    {formatMinorAmount(overview.feesCollectedMinor, cur)} collected on{' '}
                    {formatMinorAmount(overview.grossFundingMinor, cur)} funded
                </Text>
            </ChartCard>
        </SimpleGrid>
    );
}
