import React from 'react';
import { Button, Text } from '@chakra-ui/react';
import { FiCreditCard, FiDownload } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar, StatusBadge } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { IdentityCell } from '../../components/ui';
import { adminDateTime, formatCount } from '../../lib/format';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { useFinanceTransactions } from '../../hooks/useFinance';
import { monetizationService } from '../../services/monetizationService';
import type { FinanceTransaction, TransactionQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Gift', label: 'Gift' },
    { value: 'Unlock', label: 'Unlock' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Reversal', label: 'Reversal' },
    { value: 'Withdrawal', label: 'Withdrawal' },
    { value: 'Payout', label: 'Payout' },
];

/** Coin transactions ledger — reuses the finance transactions feed + CSV export. */
const CoinTransactionsPage: React.FC = () => {
    const toast = useChakraToast();
    const [query, setQuery] = React.useState<TransactionQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [exporting, setExporting] = React.useState(false);
    const { data, isLoading, error } = useFinanceTransactions(query);

    const handleExport = async () => {
        setExporting(true);
        try {
            await monetizationService.downloadCoinReport({ from: query.from, to: query.to });
        } catch (err) {
            toast.error('Export failed', getApiErrorMessage(err, 'Could not download the coin report.'));
        } finally {
            setExporting(false);
        }
    };

    const columns: DataColumn<FinanceTransaction>[] = [
        {
            key: 'user',
            header: 'User',
            render: (t) => <IdentityCell name={t.userDisplayName} secondary={t.userEmail ?? undefined} />,
        },
        {
            key: 'type',
            header: 'Type',
            render: (t) => (
                <Text fontSize="xs" color="gray.700">
                    {t.type}
                </Text>
            ),
        },
        {
            key: 'amount',
            header: 'Coins',
            align: 'right',
            render: (t) => (
                <Text fontSize="xs" fontWeight="semibold" color={t.isCredit ? '#16A34A' : '#E53E3E'}>
                    {t.isCredit ? '+' : '-'}
                    {formatCount(t.amount)}
                </Text>
            ),
        },
        {
            key: 'balance',
            header: 'Balance after',
            align: 'right',
            render: (t) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(t.balanceAfter)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (t) => (t.status ? <StatusBadge status={t.status} /> : <Text fontSize="11px" color="gray.400">—</Text>),
        },
        {
            key: 'date',
            header: 'Date',
            render: (t) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(t.transactionDate)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Coin Transactions"
            subtitle="Platform-wide coin ledger across purchases, gifts, unlocks and payouts."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Coin Transactions' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'type',
                        value: query.type ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, type: v === 'All' ? undefined : v, page: 1 })),
                        options: TYPE_OPTIONS,
                        width: '170px',
                    },
                ]}
                right={
                    <Button
                        size="sm"
                        fontSize="xs"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        borderRadius="10px"
                        onClick={handleExport}
                        loading={exporting}
                    >
                        <FiDownload /> Export coin report
                    </Button>
                }
            />

            {error ? (
                <AdminError error={error} message="Could not load coin transactions." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(t) => t.id}
                    loading={isLoading && !data}
                    emptyIcon={FiCreditCard}
                    emptyTitle="No transactions"
                    emptyDescription="No coin movements match the current filters."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}
        </AdminPageLayout>
    );
};

export default CoinTransactionsPage;
