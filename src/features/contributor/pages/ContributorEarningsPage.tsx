import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';
import { formatNaira } from '@shared/utils';
import { formatTrend } from '@/features/record-label/lib/format';
import {
    DataTable,
    KpiStrip,
    StatusBadge,
    toneStyle,
} from '@/features/admin/components/ui';
import type { DataColumn, KpiItem } from '@/features/admin/components/ui';
import {
    useContributorEarningsSummary,
    useContributorEarningsHistory,
} from '../hooks/useContributor';
import { ContributorPageShell } from '../components/ContributorPageShell';
import type { ContributorEarningDto } from '../services/contributorService';

const TYPE_LABEL: Record<string, string> = {
    gift: 'Gift',
    unlock: 'Content unlock',
    streaming: 'Streaming',
    bonus: 'Bonus',
    referral: 'Referral',
    split: 'Split',
};

const TYPE_TONE: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
    gift: 'danger',
    unlock: 'info',
    streaming: 'info',
    bonus: 'success',
    referral: 'warning',
    split: 'neutral',
};

const PAGE_SIZE = 15;

const ContributorEarningsPage: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const summaryQuery = useContributorEarningsSummary();
    const historyQuery = useContributorEarningsHistory({ page, pageSize: PAGE_SIZE });

    const summary = summaryQuery.data;
    const history = historyQuery.data;
    const earnings = history?.earnings ?? [];

    const trend = summary
        ? formatTrend(summary.earningsThisMonth ?? 0, summary.earningsLastMonth ?? 0)
        : undefined;

    const kpis: KpiItem[] = [
        {
            label: 'Total earned',
            value: formatNaira(summary?.totalEarnedDisplay ?? 0),
            trend,
            trendCaption: 'vs last month',
        },
        {
            label: 'Available to withdraw',
            value: formatNaira(summary?.availableForWithdrawalDisplay ?? 0),
            tone: 'success',
        },
        {
            label: 'Pending withdrawal',
            value: formatNaira(summary?.pendingWithdrawalDisplay ?? 0),
            tone: 'warning',
        },
        {
            label: 'Platform fees',
            value: formatNaira(summary?.platformFeesDisplay ?? 0),
            tone: 'neutral',
        },
    ];

    const columns: DataColumn<ContributorEarningDto>[] = [
        {
            key: 'type',
            header: 'Type',
            render: (e) => (
                <StatusBadge style={toneStyle(TYPE_TONE[e.type] ?? 'neutral', TYPE_LABEL[e.type] ?? e.type)} />
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (e) => (
                <Text fontSize="xs" color="gray.800" lineClamp={1} maxW="320px">
                    {e.description || '—'}
                </Text>
            ),
        },
        {
            key: 'date',
            header: 'Date',
            render: (e) => (
                <Text fontSize="xs" color="gray.600">
                    {new Date(e.earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </Text>
            ),
        },
        {
            key: 'gross',
            header: 'Gross',
            align: 'right',
            render: (e) => (
                <Text fontSize="xs" color="gray.600">
                    {formatNaira(e.amountDisplay)}
                </Text>
            ),
        },
        {
            key: 'net',
            header: 'Net',
            align: 'right',
            render: (e) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {formatNaira(e.netAmountDisplay)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            align: 'right',
            render: (e) => (
                <StatusBadge
                    style={
                        e.isWithdrawn
                            ? toneStyle('neutral', 'Withdrawn')
                            : toneStyle('success', 'Available')
                    }
                />
            ),
        },
    ];

    return (
        <ContributorPageShell
            title="Earnings"
            subtitle="Every gift, unlock, stream and split credited to you, with platform fees applied."
        >
            <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                <HStack gap={2} mb={1}>
                    <FiTrendingUp color="#16A34A" />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Earnings history
                    </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mb={4}>
                    Net amounts are what you keep after Muxify's platform fee.
                </Text>
                <DataTable
                    columns={columns}
                    rows={earnings}
                    rowKey={(e) => e.id}
                    loading={historyQuery.isLoading}
                    emptyTitle="No earnings yet"
                    emptyDescription="Your contributor earnings will appear here once they accrue."
                    pagination={{
                        page,
                        pageSize: PAGE_SIZE,
                        total: history?.totalCount ?? 0,
                        onPageChange: setPage,
                    }}
                />
            </Box>
        </ContributorPageShell>
    );
};

export default ContributorEarningsPage;
