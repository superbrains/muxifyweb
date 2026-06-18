import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiClock, FiDownload } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    CopyableId,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    KpiStrip,
    MetaGrid,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem, MetaField } from '../../components/ui';
import { ActionDialog } from '../../components/finance/ActionDialog';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { exportCsv } from '../../lib/exportCsv';
import { adminDateTime, formatMinorAmount } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import {
    useCancelPayout,
    usePayout,
    usePayouts,
    usePayoutSummary,
    useRetryPayout,
} from '../../hooks/useFinance';
import type { PayoutListItem, PayoutQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const ROLE_OPTIONS = [
    { value: 'All', label: 'All recipients' },
    { value: 'Artist', label: 'Artist' },
    { value: 'Label', label: 'Label' },
    { value: 'Featured', label: 'Featured' },
    { value: 'Producer', label: 'Producer' },
    { value: 'Songwriter', label: 'Songwriter' },
];

type ActionKind = 'retry' | 'cancel';

function actionsForStatus(
    p: PayoutListItem,
    onAct: (id: string, kind: ActionKind) => void,
    size: 'xs' | 'sm' = 'xs',
) {
    const btn = (label: string, kind: ActionKind, danger?: boolean) => (
        <Button
            key={kind}
            size={size}
            variant="outline"
            borderColor={danger ? '#FECACA' : 'gray.200'}
            color={danger ? '#C53030' : 'gray.700'}
            borderRadius="md"
            fontSize="11px"
            onClick={(e) => {
                e.stopPropagation();
                onAct(p.id, kind);
            }}
        >
            {label}
        </Button>
    );
    switch (p.status) {
        case 'Failed':
        case 'Cancelled':
            return [btn('Retry', 'retry')];
        case 'Pending':
        case 'Processing':
            return [btn('Cancel', 'cancel', true)];
        default:
            return [];
    }
}

/** Completed and in-flight payouts — the settled-payout ledger with re-drive / cancel controls. */
const HistoryPage: React.FC = () => {
    const [query, setQuery] = React.useState<PayoutQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [action, setAction] = React.useState<{ id: string; kind: ActionKind } | null>(null);
    const [selected, setSelected] = React.useState<PayoutListItem | null>(null);

    const { data, isLoading, error } = usePayouts(query);
    const { data: summary } = usePayoutSummary({});
    const { data: detail } = usePayout(selected?.id ?? null);

    const retry = useRetryPayout();
    const cancel = useCancelPayout();
    const pending = retry.isPending || cancel.isPending;

    const patch = (next: Partial<PayoutQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));
    const close = () => setAction(null);
    const onAct = (id: string, kind: ActionKind) => setAction({ id, kind });

    const kpis: KpiItem[] = [
        { label: 'Pending', value: summary?.pending ?? 0, tone: 'info' },
        { label: 'Processing', value: summary?.processing ?? 0, tone: 'info' },
        { label: 'Paid', value: summary?.paid ?? 0, tone: 'success' },
        { label: 'Failed', value: summary?.failed ?? 0, tone: 'danger' },
        { label: 'Cancelled', value: summary?.cancelled ?? 0, tone: 'neutral' },
        {
            label: 'Total paid value',
            value: formatMinorAmount(summary?.paidNetAmountMinor ?? 0, summary?.currency ?? 'NGN'),
        },
    ];

    const columns: DataColumn<PayoutListItem>[] = [
        {
            key: 'recipient',
            header: 'Recipient',
            render: (p) => <IdentityCell name={p.recipientName} secondary={p.recipientRole} size="xs" />,
        },
        {
            key: 'amount',
            header: 'Net amount',
            align: 'right',
            render: (p) => (
                <Text fontSize="xs" fontWeight="semibold">
                    {formatMinorAmount(p.netAmountMinor, p.currency)}
                </Text>
            ),
        },
        {
            key: 'reference',
            header: 'Reference',
            render: (p) => (
                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                    {p.reference ?? '—'}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (p) => <StatusBadge style={financeStatusStyle(p.status)} />,
        },
        {
            key: 'initiated',
            header: 'Initiated',
            render: (p) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(p.initiatedAt)}
                </Text>
            ),
        },
        {
            key: 'completed',
            header: 'Completed',
            render: (p) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(p.completedAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => (
                <HStack gap={1.5} justify="flex-end">
                    {actionsForStatus(p, onAct)}
                </HStack>
            ),
        },
    ];

    const onExport = () =>
        exportCsv<PayoutListItem>(
            'payout-history',
            [
                { header: 'Recipient', value: (p) => p.recipientName },
                { header: 'Role', value: (p) => p.recipientRole },
                { header: 'Gross', value: (p) => p.amountMinor },
                { header: 'Fee', value: (p) => p.muxifyFeeMinor },
                { header: 'Net', value: (p) => p.netAmountMinor },
                { header: 'Currency', value: (p) => p.currency },
                { header: 'Status', value: (p) => p.status },
                { header: 'Reference', value: (p) => p.reference ?? '' },
                { header: 'Initiated', value: (p) => p.initiatedAt },
                { header: 'Completed', value: (p) => p.completedAt ?? '' },
            ],
            data?.items ?? [],
        );

    const metaFields: MetaField[] = selected
        ? [
              { label: 'Recipient role', value: selected.recipientRole },
              { label: 'Label', value: detail?.labelName },
              { label: 'Gross amount', value: formatMinorAmount(selected.amountMinor, selected.currency) },
              { label: 'Platform fee', value: formatMinorAmount(selected.muxifyFeeMinor, selected.currency) },
              { label: 'Net amount', value: formatMinorAmount(selected.netAmountMinor, selected.currency) },
              { label: 'Reference', value: selected.reference },
              {
                  label: 'Provider initiated',
                  value: selected.providerInitiated ? 'Yes' : 'No',
                  hideWhenEmpty: false,
              },
              {
                  label: 'Provider executed',
                  value: selected.providerExecuted ? 'Yes' : 'No',
                  hideWhenEmpty: false,
              },
              { label: 'Failure reason', value: selected.failureReason },
              { label: 'Initiated', value: adminDateTime(selected.initiatedAt) },
              { label: 'Completed', value: adminDateTime(selected.completedAt) },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Payout History"
            subtitle="Completed and in-flight payouts across the platform."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'History' }]}
            actions={
                <Button
                    size="sm"
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.700"
                    borderRadius="lg"
                    fontSize="xs"
                    onClick={onExport}
                >
                    <FiDownload /> Export CSV
                </Button>
            }
        >
            <KpiStrip items={kpis} />

            <FilterBar
                filters={[
                    {
                        key: 'role',
                        value: query.role ?? 'All',
                        onChange: (v) => patch({ role: v === 'All' ? undefined : v }),
                        options: ROLE_OPTIONS,
                    },
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) => patch({ status: v === 'All' ? undefined : v }),
                        options: STATUS_OPTIONS,
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <DataTable<PayoutListItem>
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(p) => p.id}
                    onRowClick={setSelected}
                    loading={isLoading && !data}
                    emptyIcon={FiClock}
                    emptyTitle="No payouts"
                    emptyDescription="No payouts match the current filters."
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
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.recipientName ?? 'Payout'}
                subtitle={selected ? `${selected.recipientRole} · ${formatMinorAmount(selected.netAmountMinor, selected.currency)}` : undefined}
                footer={
                    selected && actionsForStatus(selected, onAct, 'sm').length > 0 ? (
                        <HStack gap={2} justify="flex-end" w="100%">
                            {actionsForStatus(selected, onAct, 'sm')}
                        </HStack>
                    ) : undefined
                }
            >
                {selected && (
                    <VStack align="stretch" gap={5}>
                        <HStack>
                            <StatusBadge style={financeStatusStyle(selected.status)} size="md" />
                        </HStack>
                        <MetaGrid fields={metaFields} />
                        <Box>
                            <Text
                                fontSize="10px"
                                fontWeight="600"
                                color="gray.400"
                                textTransform="uppercase"
                                letterSpacing="0.5px"
                                mb={1.5}
                            >
                                Batch
                            </Text>
                            <CopyableId value={selected.batchId} label="Batch ID" />
                        </Box>
                    </VStack>
                )}
            </DetailDrawer>

            <ActionDialog
                isOpen={action?.kind === 'retry'}
                onClose={close}
                title="Requeue payout"
                description="Re-drives a failed or cancelled payout back through the settlement worker."
                confirmLabel="Requeue"
                optionalFields={[{ key: 'note', label: 'Note (optional)' }]}
                isLoading={pending}
                onConfirm={({ fields }) =>
                    action && retry.mutate({ id: action.id, note: fields.note || undefined }, { onSuccess: close })
                }
            />
            <ActionDialog
                isOpen={action?.kind === 'cancel'}
                onClose={close}
                title="Cancel payout"
                description="Cancels a pending or processing payout."
                confirmLabel="Cancel payout"
                reasonLabel="Reason"
                danger
                isLoading={pending}
                onConfirm={({ reason }) =>
                    action && cancel.mutate({ id: action.id, reason }, { onSuccess: close })
                }
            />
        </AdminPageLayout>
    );
};

export default HistoryPage;
