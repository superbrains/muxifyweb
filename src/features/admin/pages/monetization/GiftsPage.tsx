import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiGift } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, StatusBadge } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { IdentityCell } from '../../components/ui';
import { adminDateTime, formatCount } from '../../lib/format';
import { useFinanceGifts } from '../../hooks/useFinance';
import type { FinanceGift, GiftQuery } from '../../types/finance';

const PAGE_SIZE = 20;

/** Gifts ledger — reuses the finance gifts feed. */
const GiftsPage: React.FC = () => {
    const [query, setQuery] = React.useState<GiftQuery>({ page: 1, pageSize: PAGE_SIZE });
    const { data, isLoading, error } = useFinanceGifts(query);

    const columns: DataColumn<FinanceGift>[] = [
        {
            key: 'sender',
            header: 'Sender',
            render: (g) => <IdentityCell name={g.senderName} />,
        },
        {
            key: 'recipient',
            header: 'Recipient',
            render: (g) => (
                <IdentityCell
                    name={g.recipientName ?? '—'}
                    secondary={g.recipientKind}
                />
            ),
        },
        {
            key: 'gift',
            header: 'Gift',
            render: (g) => (
                <Text fontSize="xs" color="gray.700">
                    {g.giftType}
                </Text>
            ),
        },
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
        {
            key: 'state',
            header: 'State',
            render: (g) => (
                <StatusBadge status={g.reversed ? 'Reversed' : g.acknowledged ? 'Acknowledged' : 'Sent'} />
            ),
        },
        {
            key: 'sent',
            header: 'Sent',
            render: (g) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(g.sentAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Gifts"
            subtitle="Coin gifts sent across the platform — fan-to-creator and fan-to-fan."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Gifts' }]}
        >
            {error ? (
                <AdminError error={error} message="Could not load gifts." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(g) => g.id}
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
        </AdminPageLayout>
    );
};

export default GiftsPage;
