import React from 'react';
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import { Select } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '../Paginator';
import { AdminLoading, AdminError } from '../AdminStateBlock';
import { IdentityCell } from '../IdentityCell';
import { StatusBadge } from '../StatusBadge';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDate, formatMinorAmount } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import { exportCsv } from '../../lib/exportCsv';
import {
    useApproveWithdrawal,
    useMarkWithdrawalPaid,
    useRejectWithdrawal,
    useRetryWithdrawal,
    useWithdrawals,
} from '../../hooks/useFinance';
import type { WithdrawalListItem, WithdrawalQuery } from '../../types/finance';
import { DateRangeFilter, ExportButton, SearchInput, ToolbarCard } from './FinanceFilters';
import { ActionDialog } from './ActionDialog';

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'PendingLabelApproval', label: 'Awaiting label' },
    { value: 'Pending', label: 'Pending (admin)' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

type ActionKind = 'approve' | 'reject' | 'retry' | 'markPaid';

function ActionButtons({ w, onAct }: { w: WithdrawalListItem; onAct: (id: string, kind: ActionKind) => void }) {
    const btn = (label: string, kind: ActionKind, danger?: boolean) => (
        <Button
            size="xs"
            variant="outline"
            borderColor={danger ? '#FECACA' : 'gray.200'}
            color={danger ? '#C53030' : 'gray.700'}
            borderRadius="md"
            fontSize="11px"
            onClick={(e) => { e.stopPropagation(); onAct(w.id, kind); }}
        >
            {label}
        </Button>
    );
    return (
        <HStack gap={1.5} justify="flex-end">
            {w.status === 'PendingLabelApproval' && (
                <Text fontSize="10px" color="#92660C" fontStyle="italic">Awaiting label</Text>
            )}
            {w.status === 'Pending' && (<>{btn('Approve', 'approve')}{btn('Reject', 'reject', true)}</>)}
            {w.status === 'Processing' && (<>{btn('Mark paid', 'markPaid')}{btn('Fail', 'reject', true)}</>)}
            {w.status === 'Failed' && (<>{btn('Retry', 'retry')}{btn('Reject', 'reject', true)}</>)}
        </HStack>
    );
}

function RequesterCell({ w }: { w: WithdrawalListItem }) {
    const isLabel = w.requesterRole === 'Label';
    return (
        <VStack align="start" gap={0}>
            <Text fontSize="xs" fontWeight="medium" color={isLabel ? '#1D4ED8' : 'gray.700'}>
                {isLabel ? 'Record Label' : 'Artist'}
            </Text>
            {w.labelName && (
                <Text fontSize="10px" color="gray.500">via {w.labelName}</Text>
            )}
        </VStack>
    );
}

export function WithdrawalsTab() {
    const [query, setQuery] = React.useState<WithdrawalQuery>({ page: 1, pageSize: PAGE_SIZE, sort: 'newest' });
    const [action, setAction] = React.useState<{ id: string; kind: ActionKind } | null>(null);
    const { data, isLoading, error } = useWithdrawals(query);

    const approve = useApproveWithdrawal();
    const reject = useRejectWithdrawal();
    const retry = useRetryWithdrawal();
    const markPaid = useMarkWithdrawalPaid();
    const pending = approve.isPending || reject.isPending || retry.isPending || markPaid.isPending;

    const patch = (next: Partial<WithdrawalQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));
    const close = () => setAction(null);

    const columns: AdminTableColumn<WithdrawalListItem>[] = [
        { key: 'artist', header: 'Creator', render: (w) => <IdentityCell name={w.artistName} secondary={w.artistEmail ?? undefined} size="xs" /> },
        { key: 'requester', header: 'Requester', render: (w) => <RequesterCell w={w} /> },
        { key: 'amount', header: 'Net amount', align: 'right', render: (w) => <Text fontSize="xs" fontWeight="semibold">{formatMinorAmount(w.netAmountMinor, w.currency)}</Text> },
        { key: 'bank', header: 'Bank', render: (w) => <Text fontSize="xs" color="gray.600">{w.bankName ?? '—'}{w.accountNumber ? ` ·••${w.accountNumber.slice(-4)}` : ''}</Text> },
        { key: 'status', header: 'Status', render: (w) => <StatusBadge style={financeStatusStyle(w.status)} /> },
        { key: 'date', header: 'Requested', render: (w) => <Text fontSize="xs" color="gray.500">{adminDate(w.requestedAt)}</Text> },
        { key: 'actions', header: '', align: 'right', render: (w) => <ActionButtons w={w} onAct={(id, kind) => setAction({ id, kind })} /> },
    ];

    const handleExport = () =>
        exportCsv<WithdrawalListItem>('withdrawals', [
            { header: 'Requested', value: (w) => adminDate(w.requestedAt) },
            { header: 'Creator', value: (w) => w.artistName },
            { header: 'Email', value: (w) => w.artistEmail ?? '' },
            { header: 'Amount (minor)', value: (w) => w.amountMinor },
            { header: 'Fee (minor)', value: (w) => w.processingFeeMinor },
            { header: 'Net (minor)', value: (w) => w.netAmountMinor },
            { header: 'Bank', value: (w) => w.bankName ?? '' },
            { header: 'Account', value: (w) => w.accountNumber ?? '' },
            { header: 'Status', value: (w) => w.status },
        ], data?.items ?? []);

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <SearchInput value={query.search ?? ''} onChange={(v) => patch({ search: v || undefined })} placeholder="Search creator or account…" />
                <Select options={STATUS_OPTIONS} value={query.status ?? 'All'} onChange={(v) => patch({ status: v === 'All' ? undefined : v })} width="150px" fontSize="xs" />
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <AdminTable<WithdrawalListItem> columns={columns} rows={data?.items ?? []} rowKey={(w) => w.id} emptyTitle="No withdrawals" />
                    <Paginator page={data?.page ?? 1} pageSize={data?.pageSize ?? PAGE_SIZE} total={data?.total ?? 0} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
                </>
            )}

            <ActionDialog
                isOpen={action?.kind === 'approve'}
                onClose={close}
                title="Approve withdrawal"
                description="Sends the money. Approving dispatches a Flutterwave transfer to the bank account on this request, and the withdrawal closes itself once the gateway settles or fails. Leave the reference blank unless you are recording an external one."
                confirmLabel="Approve & send"
                optionalFields={[{ key: 'paymentReference', label: 'Payment reference (optional)', placeholder: 'Gateway / transfer reference' }]}
                isLoading={pending}
                onConfirm={({ fields }) => action && approve.mutate({ id: action.id, paymentReference: fields.paymentReference || undefined }, { onSuccess: close })}
            />
            <ActionDialog
                isOpen={action?.kind === 'reject'}
                onClose={close}
                title="Reject withdrawal"
                description="Cancels a pending withdrawal or fails one already processing."
                confirmLabel="Reject"
                reasonLabel="Reason"
                danger
                isLoading={pending}
                onConfirm={({ reason }) => action && reject.mutate({ id: action.id, reason }, { onSuccess: close })}
            />
            <ActionDialog
                isOpen={action?.kind === 'retry'}
                onClose={close}
                title="Retry withdrawal"
                description="Re-attempts the Flutterwave transfer for a failed withdrawal. Only do this once you know the first attempt did not send funds."
                confirmLabel="Retry"
                optionalFields={[{ key: 'paymentReference', label: 'Payment reference (optional)' }]}
                isLoading={pending}
                onConfirm={({ fields }) => action && retry.mutate({ id: action.id, paymentReference: fields.paymentReference || undefined }, { onSuccess: close })}
            />
            <ActionDialog
                isOpen={action?.kind === 'markPaid'}
                onClose={close}
                title="Mark as paid"
                description="Escape hatch for money sent outside Muxify. Blocked while a Flutterwave transfer is still in flight — that one closes the withdrawal on its own."
                confirmLabel="Mark paid"
                optionalFields={[
                    { key: 'gatewayTransactionId', label: 'Gateway transaction ID (optional)' },
                    { key: 'gatewayMessage', label: 'Gateway message (optional)' },
                ]}
                isLoading={pending}
                onConfirm={({ fields }) =>
                    action &&
                    markPaid.mutate(
                        { id: action.id, gatewayTransactionId: fields.gatewayTransactionId || undefined, gatewayMessage: fields.gatewayMessage || undefined },
                        { onSuccess: close },
                    )
                }
            />
        </VStack>
    );
}
