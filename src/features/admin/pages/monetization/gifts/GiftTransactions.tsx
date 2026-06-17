import React from 'react';
import { Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { FiGift } from 'react-icons/fi';
import {
    AdminError,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../../../components/ui';
import type { DataColumn, KpiItem } from '../../../components/ui';
import { DateRangeFilter, ExportButton, ToolbarCard } from '../../../components/finance/FinanceFilters';
import { Select } from '@shared/components';
import { adminDateTime, formatCount } from '../../../lib/format';
import { exportCsv } from '../../../lib/exportCsv';
import { useFinanceGifts, useFinanceGiftSummary, useReverseGift } from '../../../hooks/useFinance';
import type { FinanceGift, GiftQuery } from '../../../types/finance';

const PAGE_SIZE = 20;

const GIFT_TYPES = ['All', 'Heart', 'Rose', 'Star', 'Crown', 'Diamond', 'Fire', 'MusicNote', 'Trophy', 'Special'];
const GIFT_OPTIONS = GIFT_TYPES.map((g) => ({ value: g, label: g === 'All' ? 'All gifts' : g }));

const giftState = (g: FinanceGift) => (g.reversed ? 'Reversed' : g.acknowledged ? 'Acknowledged' : 'Sent');

/** Gifts ledger — KPI strip, filters, CSV export and per-row reversal. */
const GiftTransactions: React.FC = () => {
    const [query, setQuery] = React.useState<GiftQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [reverseTarget, setReverseTarget] = React.useState<FinanceGift | null>(null);
    const [detail, setDetail] = React.useState<FinanceGift | null>(null);

    const { data, isLoading, error } = useFinanceGifts(query);
    const { data: summary } = useFinanceGiftSummary({ from: query.from, to: query.to });
    const reverse = useReverseGift();

    const patch = (next: Partial<GiftQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const kpis: KpiItem[] = summary
        ? [
              { label: 'Total gifts', value: summary.totalGifts },
              { label: 'Coin value', value: `${formatCount(summary.totalCoinValue)} coins`, tone: 'info' },
              { label: 'To creators', value: summary.toArtistsCount, tone: 'success' },
              { label: 'Fan-to-fan', value: summary.toFansCount, tone: 'neutral' },
              { label: 'Reversed', value: summary.reversedCount, tone: 'danger' },
          ]
        : [];

    const columns: DataColumn<FinanceGift>[] = [
        { key: 'sender', header: 'Sender', render: (g) => <IdentityCell name={g.senderName} size="xs" /> },
        {
            key: 'recipient',
            header: 'Recipient',
            render: (g) => (
                <IdentityCell name={g.recipientName ?? '—'} secondary={g.recipientKind} size="xs" />
            ),
        },
        { key: 'gift', header: 'Gift', render: (g) => <Text fontSize="xs" color="gray.700">{g.giftType}</Text> },
        {
            key: 'value',
            header: 'Coins',
            align: 'right',
            render: (g) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatCount(g.coinValue)}
                </Text>
            ),
        },
        { key: 'state', header: 'State', render: (g) => <StatusBadge status={giftState(g)} /> },
        {
            key: 'sent',
            header: 'Sent',
            render: (g) => <Text fontSize="xs" color="gray.500">{adminDateTime(g.sentAt)}</Text>,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (g) =>
                g.reversed ? null : (
                    <Text
                        as="button"
                        fontSize="xs"
                        fontWeight="medium"
                        color="#C53030"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setReverseTarget(g);
                        }}
                    >
                        Reverse
                    </Text>
                ),
        },
    ];

    const handleExport = () =>
        exportCsv<FinanceGift>('gifts', [
            { header: 'Date', value: (g) => adminDateTime(g.sentAt) },
            { header: 'Sender', value: (g) => g.senderName },
            { header: 'Recipient', value: (g) => g.recipientName ?? '' },
            { header: 'Recipient type', value: (g) => g.recipientKind },
            { header: 'Gift', value: (g) => g.giftType },
            { header: 'Coins', value: (g) => g.coinValue },
            { header: 'State', value: (g) => giftState(g) },
        ], data?.items ?? []);

    return (
        <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
            {kpis.length > 0 && <KpiStrip items={kpis} columns={{ base: 2, md: 3, xl: 5 }} />}

            {summary && summary.byType.length > 0 && <TopGiftTypes summary={summary} />}

            <ToolbarCard>
                <Select
                    options={GIFT_OPTIONS}
                    value={query.type ?? 'All'}
                    onChange={(v) => patch({ type: v === 'All' ? undefined : (v as string) })}
                    width="150px"
                    fontSize="xs"
                />
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {error ? (
                <AdminError error={error} message="Could not load gifts." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(g) => g.id}
                    onRowClick={(g) => setDetail(g)}
                    loading={isLoading && !data}
                    emptyIcon={FiGift}
                    emptyTitle="No gifts"
                    emptyDescription="No gifts match the current filters."
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

            <ConfirmActionModal
                isOpen={reverseTarget !== null}
                onClose={() => setReverseTarget(null)}
                title="Reverse gift"
                message="Refunds the sender and claws back the recipient's coins or earning. This cannot be undone."
                reasonLabel="Reason"
                confirmText="Reverse gift"
                tone="danger"
                isLoading={reverse.isPending}
                onConfirm={(reason) =>
                    reverseTarget &&
                    reverse.mutate(
                        { id: reverseTarget.id, reason },
                        { onSuccess: () => setReverseTarget(null) },
                    )
                }
            />

            <DetailDrawer
                open={detail !== null}
                onClose={() => setDetail(null)}
                title={detail ? `${detail.giftType} gift` : ''}
                subtitle={detail ? adminDateTime(detail.sentAt) : undefined}
                size="sm"
            >
                {detail && (
                    <VStack align="stretch" gap={4}>
                        <DetailRow label="Sender" value={detail.senderName} />
                        <DetailRow
                            label="Recipient"
                            value={`${detail.recipientName ?? '—'} (${detail.recipientKind})`}
                        />
                        <DetailRow label="Gift" value={detail.giftType} />
                        <DetailRow label="Coin value" value={`${formatCount(detail.coinValue)} coins`} />
                        <Box>
                            <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.4px" mb={1}>
                                State
                            </Text>
                            <StatusBadge status={giftState(detail)} />
                        </Box>
                        {detail.message && (
                            <Box>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.4px" mb={1}>
                                    Message
                                </Text>
                                <Box bg="gray.50" borderRadius="lg" p={3}>
                                    <Text fontSize="xs" color="gray.700">{detail.message}</Text>
                                </Box>
                            </Box>
                        )}
                        <DetailRow label="Acknowledged" value={detail.acknowledged ? 'Yes' : 'No'} />
                    </VStack>
                )}
            </DetailDrawer>
        </VStack>
    );
};

export default GiftTransactions;

/** Compact "top gift types by coin value" breakdown card. */
const TopGiftTypes: React.FC<{ summary: NonNullable<ReturnType<typeof useFinanceGiftSummary>['data']> }> = ({
    summary,
}) => {
    const top = summary.byType.slice(0, 6);
    const max = Math.max(...top.map((t) => t.coinTotal), 1);
    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={{ base: 4, md: 5 }}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.800" mb={3}>
                Top gift types
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
                {top.map((t) => (
                    <Box key={t.giftType}>
                        <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.700">{t.giftType}</Text>
                            <Text fontSize="11px" color="gray.500">
                                {formatCount(t.coinTotal)} · {formatCount(t.count)}×
                            </Text>
                        </HStack>
                        <Box h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                            <Box h="full" w={`${(t.coinTotal / max) * 100}%`} bg="#f94444" borderRadius="full" />
                        </Box>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <Box>
        <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.4px" mb={1}>
            {label}
        </Text>
        <Text fontSize="xs" color="gray.800" fontWeight="medium">
            {value}
        </Text>
    </Box>
);
