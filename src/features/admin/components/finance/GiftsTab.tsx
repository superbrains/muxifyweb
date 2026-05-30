import React from 'react';
import { Badge, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { Select } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '../Paginator';
import { AdminLoading, AdminError } from '../AdminStateBlock';
import { IdentityCell } from '../IdentityCell';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime, formatCount } from '../../lib/format';
import { exportCsv } from '../../lib/exportCsv';
import { useFinanceGifts, useReverseGift } from '../../hooks/useFinance';
import type { FinanceGift, GiftQuery } from '../../types/finance';
import { DateRangeFilter, ExportButton, ToolbarCard } from './FinanceFilters';
import { ActionDialog } from './ActionDialog';

const PAGE_SIZE = 15;

const GIFT_TYPES = ['All', 'Heart', 'Rose', 'Star', 'Crown', 'Diamond', 'Fire', 'MusicNote', 'Trophy', 'Special'];
const GIFT_OPTIONS = GIFT_TYPES.map((g) => ({ value: g, label: g === 'All' ? 'All gifts' : g }));

export function GiftsTab() {
    const [query, setQuery] = React.useState<GiftQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [reverseId, setReverseId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useFinanceGifts(query);
    const reverse = useReverseGift();

    const patch = (next: Partial<GiftQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const columns: AdminTableColumn<FinanceGift>[] = [
        { key: 'sender', header: 'Sender', render: (g) => <IdentityCell name={g.senderName} size="xs" /> },
        {
            key: 'recipient',
            header: 'Recipient',
            render: (g) => (
                <HStack gap={1.5}>
                    <Text fontSize="xs" color="gray.800">{g.recipientName ?? '—'}</Text>
                    <Badge fontSize="9px" colorPalette={g.recipientKind === 'Artist' ? 'purple' : 'blue'} variant="subtle">
                        {g.recipientKind}
                    </Badge>
                </HStack>
            ),
        },
        { key: 'type', header: 'Gift', render: (g) => <Text fontSize="xs">{g.giftType}</Text> },
        {
            key: 'value',
            header: 'Value',
            align: 'right',
            render: (g) => <Text fontSize="xs" fontWeight="semibold">{formatCount(g.coinValue)} coins</Text>,
        },
        {
            key: 'state',
            header: 'State',
            render: (g) =>
                g.reversed ? (
                    <Badge fontSize="9px" colorPalette="red" variant="subtle">Reversed</Badge>
                ) : g.acknowledged ? (
                    <Badge fontSize="9px" colorPalette="green" variant="subtle">Acknowledged</Badge>
                ) : (
                    <Text fontSize="xs" color="gray.400">Sent</Text>
                ),
        },
        { key: 'date', header: 'Date', render: (g) => <Text fontSize="xs" color="gray.500">{adminDateTime(g.sentAt)}</Text> },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (g) =>
                g.reversed ? null : (
                    <Button
                        size="xs"
                        variant="outline"
                        borderColor="gray.200"
                        borderRadius="md"
                        fontSize="11px"
                        onClick={(e) => {
                            e.stopPropagation();
                            setReverseId(g.id);
                        }}
                    >
                        Reverse
                    </Button>
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
            { header: 'Reversed', value: (g) => (g.reversed ? 'Yes' : 'No') },
        ], data?.items ?? []);

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <Select options={GIFT_OPTIONS} value={query.type ?? 'All'} onChange={(v) => patch({ type: v === 'All' ? undefined : v })} width="150px" fontSize="xs" />
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <AdminTable<FinanceGift>
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(g) => g.id}
                        emptyTitle="No gifts"
                    />
                    <Paginator page={data?.page ?? 1} pageSize={data?.pageSize ?? PAGE_SIZE} total={data?.total ?? 0} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
                </>
            )}

            <ActionDialog
                isOpen={reverseId !== null}
                onClose={() => setReverseId(null)}
                title="Reverse gift"
                description="Refunds the sender and claws back the recipient's coins or earning. This cannot be undone."
                confirmLabel="Reverse gift"
                reasonLabel="Reason"
                danger
                isLoading={reverse.isPending}
                onConfirm={({ reason }) =>
                    reverseId &&
                    reverse.mutate({ id: reverseId, reason }, { onSuccess: () => setReverseId(null) })
                }
            />
        </VStack>
    );
}
