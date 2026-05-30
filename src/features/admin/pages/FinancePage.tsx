import React from 'react';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminLoading, AdminError } from '../components/AdminStateBlock';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { isoDaysAgo, todayIso } from '../lib/format';
import { useFinanceOverview } from '../hooks/useFinance';
import { FinanceKpiStrip } from '../components/finance/FinanceKpiStrip';
import { FinanceOverviewCharts } from '../components/finance/FinanceOverviewCharts';
import { DateRangeFilter, ToolbarCard } from '../components/finance/FinanceFilters';
import { TransactionsTab } from '../components/finance/TransactionsTab';
import { GiftsTab } from '../components/finance/GiftsTab';
import { UnlocksTab } from '../components/finance/UnlocksTab';
import { EarningsTab } from '../components/finance/EarningsTab';
import { WithdrawalsTab } from '../components/finance/WithdrawalsTab';
import { PayoutsTab } from '../components/finance/PayoutsTab';
import { ReconciliationTab } from '../components/finance/ReconciliationTab';
import type { DateRange } from '../types/finance';

const ACCENT = '#f94444';

type TabKey =
    | 'overview'
    | 'transactions'
    | 'gifts'
    | 'unlocks'
    | 'earnings'
    | 'withdrawals'
    | 'payouts'
    | 'reconciliation';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'gifts', label: 'Gifts' },
    { key: 'unlocks', label: 'Unlocks' },
    { key: 'earnings', label: 'Earnings' },
    { key: 'withdrawals', label: 'Withdrawals' },
    { key: 'payouts', label: 'Payouts' },
    { key: 'reconciliation', label: 'Reconciliation' },
];

function OverviewTab() {
    const [range, setRange] = React.useState<DateRange>({ from: isoDaysAgo(30), to: todayIso() });
    const { data, isLoading, error } = useFinanceOverview(range);

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <DateRangeFilter range={range} onChange={setRange} />
            </ToolbarCard>
            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : data ? (
                <>
                    <FinanceKpiStrip overview={data} />
                    <FinanceOverviewCharts overview={data} />
                </>
            ) : null}
        </VStack>
    );
}

export default function FinancePage() {
    const [tab, setTab] = React.useState<TabKey>('overview');

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            align="stretch"
            bg="gray.50"
            minH="100vh"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader title="Finance" subtitle="Every money movement: funding, unlocks, gifts, earnings, payouts" />

            <Box overflowX="auto">
                <HStack gap={2} minW="max-content">
                    {TABS.map(({ key, label }) => (
                        <Button
                            key={key}
                            onClick={() => setTab(key)}
                            size="sm"
                            borderRadius="999px"
                            px={4}
                            fontSize="xs"
                            fontWeight="semibold"
                            bg={tab === key ? ACCENT : 'white'}
                            color={tab === key ? 'white' : 'gray.600'}
                            border="1px solid"
                            borderColor={tab === key ? ACCENT : 'gray.200'}
                            _hover={{ bg: tab === key ? ACCENT : 'gray.50' }}
                        >
                            {label}
                        </Button>
                    ))}
                </HStack>
            </Box>

            {tab === 'overview' && <OverviewTab />}
            {tab === 'transactions' && <TransactionsTab />}
            {tab === 'gifts' && <GiftsTab />}
            {tab === 'unlocks' && <UnlocksTab />}
            {tab === 'earnings' && <EarningsTab />}
            {tab === 'withdrawals' && <WithdrawalsTab />}
            {tab === 'payouts' && <PayoutsTab />}
            {tab === 'reconciliation' && <ReconciliationTab />}
        </VStack>
    );
}
