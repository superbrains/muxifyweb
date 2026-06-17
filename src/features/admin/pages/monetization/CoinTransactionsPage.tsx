import React from 'react';
import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiCreditCard, FiDownload, FiRotateCcw } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    CopyableId,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    KpiStrip,
    MetaGrid,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem, MetaField, SortState } from '../../components/ui';
import { adminDateTime, formatCount, formatMinorAmount } from '../../lib/format';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import {
    useFinanceOverview,
    useFinanceTransaction,
    useFinanceTransactions,
    useRefundPurchase,
} from '../../hooks/useFinance';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { monetizationService } from '../../services/monetizationService';
import type { FinanceTransaction, TransactionQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const CREDIT_GREEN = '#16A34A';
const DEBIT_RED = '#E53E3E';

/** TransactionType enum values (backend) → human label for the filter + cells. */
const TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Purchase', label: 'Purchase' },
    { value: 'ContentUnlock', label: 'Content unlock' },
    { value: 'GiftSent', label: 'Gift sent' },
    { value: 'GiftReceived', label: 'Gift received' },
    { value: 'TransferIn', label: 'Transfer in' },
    { value: 'TransferOut', label: 'Transfer out' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Bonus', label: 'Bonus' },
    { value: 'AdminCredit', label: 'Admin credit' },
    { value: 'AdminDebit', label: 'Admin debit' },
];

const DIRECTION_OPTIONS = [
    { value: 'All', label: 'All directions' },
    { value: 'credit', label: 'Credit (in)' },
    { value: 'debit', label: 'Debit (out)' },
];

/** PurchaseStatus enum values — only meaningful for purchase-linked rows. */
const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Expired', label: 'Expired' },
];

/** `ContentUnlock` → `Content unlock`, `AdminCredit` → `Admin credit`. */
const humanizeType = (type: string): string => {
    const spaced = type
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const SignedCoins: React.FC<{ tx: Pick<FinanceTransaction, 'isCredit' | 'amount'>; size?: string }> = ({
    tx,
    size = 'xs',
}) => (
    <Text fontSize={size} fontWeight="semibold" color={tx.isCredit ? CREDIT_GREEN : DEBIT_RED}>
        {tx.isCredit ? '+' : '-'}
        {formatCount(tx.amount)}
    </Text>
);

/**
 * Coin Transactions — the platform-wide coin ledger. Surfaces the full finance
 * transaction feed (`/api/v1/admin/finance/transactions`) with overview KPIs,
 * rich server-side filtering/search, a transaction detail drawer and a
 * permission-gated purchase refund. Composes the shared admin UI kit so it
 * stays visually identical to the rest of the console.
 */
const CoinTransactionsPage: React.FC = () => {
    const toast = useChakraToast();
    const canManage = useHasPermission('FinanceManage');

    const [query, setQuery] = React.useState<TransactionQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [selectedRow, setSelectedRow] = React.useState<FinanceTransaction | null>(null);
    const [refundOpen, setRefundOpen] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);

    const range = React.useMemo(() => ({ from: query.from, to: query.to }), [query.from, query.to]);
    const { data, isLoading, error } = useFinanceTransactions(query);
    const { data: overview } = useFinanceOverview(range);
    const { data: detail, isLoading: detailLoading } = useFinanceTransaction(selectedId);
    const refund = useRefundPurchase();

    const currency = overview?.currency ?? 'NGN';

    const kpis: KpiItem[] = [
        {
            label: 'Coins in circulation',
            value: formatCount(overview?.coinsInCirculation),
            tone: 'info',
            sub: 'Unspent balances across all wallets',
        },
        {
            label: 'Gross coin volume',
            value: formatCount(overview?.grossCoinVolume),
            tone: 'neutral',
            sub: 'Coins moved in the selected window',
        },
        {
            label: 'Gross funding',
            value: formatMinorAmount(overview?.grossFundingMinor, currency),
            tone: 'success',
            sub: 'Money paid in for coins',
        },
        {
            label: 'Fees collected',
            value: formatMinorAmount(overview?.feesCollectedMinor, currency),
            tone: 'warning',
            sub: 'Platform fee on earnings',
        },
    ];

    // Backend only sorts the ledger by date (oldest vs newest), so Date is the
    // single sortable column. asc → `sort: 'oldest'`, desc → default (newest).
    const sort: SortState = { key: 'date', dir: query.sort === 'oldest' ? 'asc' : 'desc' };
    const handleSortChange = (next: SortState) =>
        setQuery((q) => ({ ...q, sort: next.dir === 'asc' ? 'oldest' : undefined, page: 1 }));

    const patch = (changes: Partial<TransactionQuery>) =>
        setQuery((q) => ({ ...q, ...changes, page: 1 }));

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

    const openDetail = (t: FinanceTransaction) => {
        setSelectedRow(t);
        setSelectedId(t.id);
    };

    const closeDetail = () => {
        setSelectedId(null);
        setSelectedRow(null);
    };

    // A purchase that actually completed is the only refundable row.
    const canRefund = (t: FinanceTransaction | null): boolean =>
        canManage && !!t && t.type === 'Purchase' && t.status === 'Completed';

    const handleRefund = (reason: string) => {
        if (!selectedRow) return;
        refund.mutate(
            { id: selectedRow.id, reason },
            {
                onSuccess: () => {
                    setRefundOpen(false);
                    closeDetail();
                },
            },
        );
    };

    const columns: DataColumn<FinanceTransaction>[] = [
        {
            key: 'user',
            header: 'User',
            render: (t) => <IdentityCell name={t.userDisplayName} secondary={t.userEmail ?? undefined} size="xs" />,
        },
        {
            key: 'type',
            header: 'Type',
            render: (t) => (
                <Text fontSize="xs" color="gray.700" whiteSpace="nowrap">
                    {humanizeType(t.type)}
                </Text>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (t) => (
                <VStack align="start" gap={0.5} maxW="260px">
                    <Text fontSize="xs" color="gray.700" lineClamp={1}>
                        {t.description || '—'}
                    </Text>
                    {t.counterpartyName && (
                        <Text fontSize="10px" color="gray.400" lineClamp={1}>
                            {t.isCredit ? 'from' : 'to'} {t.counterpartyName}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'amount',
            header: 'Coins',
            align: 'right',
            render: (t) => <SignedCoins tx={t} />,
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
            render: (t) =>
                t.status ? (
                    <StatusBadge status={t.status} />
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        —
                    </Text>
                ),
        },
        {
            key: 'date',
            header: 'Date',
            sortKey: 'date',
            render: (t) => (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {adminDateTime(t.transactionDate)}
                </Text>
            ),
        },
    ];

    const detailFields = (t: FinanceTransaction): MetaField[] => [
        { label: 'User', value: <IdentityCell name={t.userDisplayName} secondary={t.userEmail ?? undefined} size="xs" /> },
        { label: 'Type', value: humanizeType(t.type) },
        { label: 'Direction', value: t.isCredit ? 'Credit (in)' : 'Debit (out)' },
        { label: 'Coins', value: <SignedCoins tx={t} size="sm" /> },
        { label: 'Balance after', value: formatCount(t.balanceAfter) },
        { label: 'Status', value: t.status ? <StatusBadge status={t.status} /> : null },
        { label: 'Description', value: t.description },
        { label: 'Date', value: adminDateTime(t.transactionDate) },
        { label: 'Counterparty', value: t.counterpartyName },
        { label: 'Reference type', value: t.referenceType },
        {
            label: 'Reference id',
            value: t.referenceId ? <CopyableId value={t.referenceId} label="Reference id" /> : null,
        },
        { label: 'Transaction id', value: <CopyableId value={t.id} label="Transaction id" /> },
    ];

    const fundingFields = (): MetaField[] =>
        detail
            ? [
                  {
                      label: 'Funding amount',
                      value:
                          detail.fundingAmountMinor != null
                              ? formatMinorAmount(detail.fundingAmountMinor, detail.fundingCurrency ?? currency)
                              : null,
                  },
                  { label: 'Provider', value: detail.fundingProvider },
                  {
                      label: 'Payment reference',
                      value: detail.fundingPaymentReference ? (
                          <CopyableId value={detail.fundingPaymentReference} label="Payment reference" />
                      ) : null,
                  },
                  {
                      label: 'Gateway transaction id',
                      value: detail.fundingGatewayTransactionId ? (
                          <CopyableId value={detail.fundingGatewayTransactionId} label="Gateway transaction id" />
                      ) : null,
                  },
                  { label: 'Gift type', value: detail.giftType },
                  { label: 'Gift message', value: detail.giftMessage },
              ]
            : [];

    const hasExtra = fundingFields().some((f) => Boolean(f.value));

    return (
        <AdminPageLayout
            title="Coin Transactions"
            subtitle="Platform-wide coin ledger across purchases, gifts, unlocks, transfers and payouts."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Coin Transactions' }]}
        >
            <KpiStrip items={kpis} columns={{ base: 2, md: 2, xl: 4 }} />

            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => patch({ search: v || undefined }),
                    placeholder: 'Search by user, email or description',
                }}
                filters={[
                    {
                        key: 'type',
                        value: query.type ?? 'All',
                        onChange: (v) => patch({ type: v === 'All' ? undefined : v }),
                        options: TYPE_OPTIONS,
                        width: '170px',
                    },
                    {
                        key: 'direction',
                        value: query.direction ?? 'All',
                        onChange: (v) => patch({ direction: v === 'All' ? undefined : v }),
                        options: DIRECTION_OPTIONS,
                        width: '150px',
                    },
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) => patch({ status: v === 'All' ? undefined : v }),
                        options: STATUS_OPTIONS,
                        width: '150px',
                    },
                ]}
                right={
                    <HStack gap={2} flexWrap="wrap" justify={{ base: 'flex-start', lg: 'flex-end' }}>
                        <Input
                            type="date"
                            size="sm"
                            fontSize="xs"
                            width="148px"
                            borderColor="gray.200"
                            borderRadius="10px"
                            aria-label="From date"
                            value={query.from ?? ''}
                            max={query.to ?? undefined}
                            onChange={(e) => patch({ from: e.target.value || undefined })}
                        />
                        <Text fontSize="xs" color="gray.400">
                            →
                        </Text>
                        <Input
                            type="date"
                            size="sm"
                            fontSize="xs"
                            width="148px"
                            borderColor="gray.200"
                            borderRadius="10px"
                            aria-label="To date"
                            value={query.to ?? ''}
                            min={query.from ?? undefined}
                            onChange={(e) => patch({ to: e.target.value || undefined })}
                        />
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
                            <FiDownload /> Export
                        </Button>
                    </HStack>
                }
            />

            {error ? (
                <AdminError error={error} message="Could not load coin transactions." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(t) => t.id}
                    onRowClick={openDetail}
                    loading={isLoading && !data}
                    sort={sort}
                    onSortChange={handleSortChange}
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

            <DetailDrawer
                open={selectedRow !== null}
                onClose={closeDetail}
                title={selectedRow ? humanizeType(selectedRow.type) : ''}
                subtitle={selectedRow ? selectedRow.userDisplayName : undefined}
                footer={
                    canRefund(selectedRow) ? (
                        <HStack justify="flex-end" w="100%">
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="#FECACA"
                                color="#C53030"
                                borderRadius="10px"
                                fontSize="xs"
                                disabled={refund.isPending}
                                onClick={() => setRefundOpen(true)}
                            >
                                <FiRotateCcw /> Refund purchase
                            </Button>
                        </HStack>
                    ) : undefined
                }
            >
                {selectedRow && (
                    <VStack align="stretch" gap={5}>
                        <MetaGrid fields={detailFields(selectedRow)} columns={2} />
                        {(hasExtra || detailLoading) && (
                            <Box>
                                <Text
                                    fontSize="10px"
                                    fontWeight="600"
                                    color="gray.400"
                                    textTransform="uppercase"
                                    letterSpacing="0.5px"
                                    mb={2}
                                >
                                    {selectedRow.type === 'Purchase' ? 'Funding' : 'Linked detail'}
                                </Text>
                                {detailLoading ? (
                                    <Text fontSize="xs" color="gray.400">
                                        Loading…
                                    </Text>
                                ) : (
                                    <MetaGrid fields={fundingFields()} columns={2} />
                                )}
                            </Box>
                        )}
                    </VStack>
                )}
            </DetailDrawer>

            <ConfirmActionModal
                isOpen={refundOpen}
                onClose={() => setRefundOpen(false)}
                onConfirm={handleRefund}
                title="Refund this purchase"
                message={
                    selectedRow
                        ? `Refund ${formatCount(selectedRow.amount)} coins purchased by ${selectedRow.userDisplayName}. The coins will be debited and the payment reversed.`
                        : undefined
                }
                reasonLabel="Refund reason"
                placeholder="Explain why this purchase is being refunded — recorded in the audit log."
                confirmText="Refund purchase"
                tone="danger"
                isLoading={refund.isPending}
            />
        </AdminPageLayout>
    );
};

export default CoinTransactionsPage;
