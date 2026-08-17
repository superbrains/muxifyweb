import React from 'react';
import { Badge, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { Select } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '@shared/console/components/Paginator';
import { AdminLoading, AdminError } from '@shared/console/components/AdminStateBlock';
import { IdentityCell } from '@shared/console/components/IdentityCell';
import { StatusBadge } from '../StatusBadge';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDate, formatMinorAmount } from '@shared/console/lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import { exportCsv } from '@shared/console/lib/exportCsv';
import { useCancelPayout, usePayouts, useRetryPayout } from '../../hooks/useFinance';
import type { PayoutListItem, PayoutQuery } from '../../types/finance';
import { DateRangeFilter, ExportButton, ToolbarCard } from './FinanceFilters';
import { ActionDialog } from './ActionDialog';

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Cancelled', label: 'Cancelled' },
];
const ROLE_OPTIONS = [
    { value: 'All', label: 'All roles' },
    { value: 'Artist', label: 'Artist' },
    { value: 'Label', label: 'Label' },
    { value: 'Featured', label: 'Featured' },
    { value: 'Producer', label: 'Producer' },
    { value: 'Songwriter', label: 'Songwriter' },
];

export function PayoutsTab() {
    const [query, setQuery] = React.useState<PayoutQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [action, setAction] = React.useState<{ id: string; kind: 'retry' | 'cancel' } | null>(null);
    const { data, isLoading, error } = usePayouts(query);
    const retry = useRetryPayout();
    const cancel = useCancelPayout();
    const pending = retry.isPending || cancel.isPending;

    const patch = (next: Partial<PayoutQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));
    const close = () => setAction(null);

    const columns: AdminTableColumn<PayoutListItem>[] = [
        {
            key: 'recipient',
            header: 'Recipient',
            render: (p) => (
                <HStack gap={1.5}>
                    <IdentityCell name={p.recipientName} size="xs" />
                    <Badge fontSize="9px" variant="subtle">{p.recipientRole}</Badge>
                </HStack>
            ),
        },
        { key: 'net', header: 'Net amount', align: 'right', render: (p) => <Text fontSize="xs" fontWeight="semibold">{formatMinorAmount(p.netAmountMinor, p.currency)}</Text> },
        { key: 'fee', header: 'Fee', align: 'right', render: (p) => <Text fontSize="xs" color="gray.500">{formatMinorAmount(p.muxifyFeeMinor, p.currency)}</Text> },
        { key: 'status', header: 'Status', render: (p) => <StatusBadge style={financeStatusStyle(p.status)} /> },
        { key: 'date', header: 'Initiated', render: (p) => <Text fontSize="xs" color="gray.500">{adminDate(p.initiatedAt)}</Text> },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => {
                const canRetry = p.status === 'Failed' || p.status === 'Cancelled';
                const canCancel = p.status === 'Pending' || p.status === 'Processing';
                if (!canRetry && !canCancel) return null;
                return (
                    <HStack gap={1.5} justify="flex-end">
                        {canRetry && (
                            <Button size="xs" variant="outline" borderColor="gray.200" borderRadius="md" fontSize="11px"
                                onClick={(e) => { e.stopPropagation(); setAction({ id: p.id, kind: 'retry' }); }}>
                                Retry
                            </Button>
                        )}
                        {canCancel && (
                            <Button size="xs" variant="outline" borderColor="#FECACA" color="#C53030" borderRadius="md" fontSize="11px"
                                onClick={(e) => { e.stopPropagation(); setAction({ id: p.id, kind: 'cancel' }); }}>
                                Cancel
                            </Button>
                        )}
                    </HStack>
                );
            },
        },
    ];

    const handleExport = () =>
        exportCsv<PayoutListItem>('payouts', [
            { header: 'Initiated', value: (p) => adminDate(p.initiatedAt) },
            { header: 'Recipient', value: (p) => p.recipientName },
            { header: 'Role', value: (p) => p.recipientRole },
            { header: 'Amount (minor)', value: (p) => p.amountMinor },
            { header: 'Fee (minor)', value: (p) => p.muxifyFeeMinor },
            { header: 'Net (minor)', value: (p) => p.netAmountMinor },
            { header: 'Status', value: (p) => p.status },
            { header: 'Reference', value: (p) => p.reference ?? '' },
        ], data?.items ?? []);

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <Select options={STATUS_OPTIONS} value={query.status ?? 'All'} onChange={(v) => patch({ status: v === 'All' ? undefined : v })} width="150px" fontSize="xs" />
                <Select options={ROLE_OPTIONS} value={query.role ?? 'All'} onChange={(v) => patch({ role: v === 'All' ? undefined : v })} width="140px" fontSize="xs" />
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <AdminTable<PayoutListItem> columns={columns} rows={data?.items ?? []} rowKey={(p) => p.id} emptyTitle="No payouts" />
                    <Paginator page={data?.page ?? 1} pageSize={data?.pageSize ?? PAGE_SIZE} total={data?.total ?? 0} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
                </>
            )}

            <ActionDialog
                isOpen={action?.kind === 'retry'}
                onClose={close}
                title="Retry payout"
                description="Requeues the payout so the settlement worker re-drives it through the provider."
                confirmLabel="Retry"
                optionalFields={[{ key: 'note', label: 'Note (optional)' }]}
                isLoading={pending}
                onConfirm={({ fields }) => action && retry.mutate({ id: action.id, note: fields.note || undefined }, { onSuccess: close })}
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
                onConfirm={({ reason }) => action && cancel.mutate({ id: action.id, reason }, { onSuccess: close })}
            />
        </VStack>
    );
}
