import React from 'react';
import { Button, HStack, Text } from '@chakra-ui/react';
import { FiDollarSign } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { ActionDialog } from '../../components/finance/ActionDialog';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDate, formatMinorAmount } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import {
    useApproveWithdrawal,
    useMarkWithdrawalPaid,
    useRejectWithdrawal,
    useRetryWithdrawal,
    useWithdrawals,
} from '../../hooks/useFinance';
import type { WithdrawalListItem, WithdrawalQuery } from '../../types/finance';

const PAGE_SIZE = 20;

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

const ROLE_OPTIONS = [
    { value: 'All', label: 'All roles' },
    { value: 'artist', label: 'Artists' },
    { value: 'dj', label: 'DJs' },
    { value: 'creator', label: 'Creators' },
    { value: 'podcaster', label: 'Podcasters' },
    { value: 'record_label', label: 'Record Labels' },
    { value: 'contributor', label: 'Contributors' },
];

type ActionKind = 'approve' | 'reject' | 'retry' | 'markPaid';

function ActionButtons({
    w,
    onAct,
}: {
    w: WithdrawalListItem;
    onAct: (id: string, kind: ActionKind) => void;
}) {
    const btn = (label: string, kind: ActionKind, danger?: boolean) => (
        <Button
            size="xs"
            variant="outline"
            borderColor={danger ? '#FECACA' : 'gray.200'}
            color={danger ? '#C53030' : 'gray.700'}
            borderRadius="md"
            fontSize="11px"
            onClick={(e) => {
                e.stopPropagation();
                onAct(w.id, kind);
            }}
        >
            {label}
        </Button>
    );
    return (
        <HStack gap={1.5} justify="flex-end">
            {w.status === 'PendingLabelApproval' && (
                <Text fontSize="10px" color="#92660C" fontStyle="italic">
                    Awaiting label
                </Text>
            )}
            {w.status === 'Pending' && (
                <>
                    {btn('Approve', 'approve')}
                    {btn('Reject', 'reject', true)}
                </>
            )}
            {w.status === 'Processing' && (
                <>
                    {btn('Mark paid', 'markPaid')}
                    {btn('Fail', 'reject', true)}
                </>
            )}
            {w.status === 'Failed' && (
                <>
                    {btn('Retry', 'retry')}
                    {btn('Reject', 'reject', true)}
                </>
            )}
        </HStack>
    );
}

/**
 * Consolidated payout requests across every role. Reuses the finance
 * withdrawals feed + the shared approve/reject/retry/mark-paid action flow,
 * with role + status filters layered on top of the per-role request queues.
 */
const AllRequestsPage: React.FC = () => {
    const [query, setQuery] = React.useState<WithdrawalQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        sort: 'newest',
    });
    const [action, setAction] = React.useState<{ id: string; kind: ActionKind } | null>(null);

    const { data, isLoading, error } = useWithdrawals(query);

    const approve = useApproveWithdrawal();
    const reject = useRejectWithdrawal();
    const retry = useRetryWithdrawal();
    const markPaid = useMarkWithdrawalPaid();
    const pending = approve.isPending || reject.isPending || retry.isPending || markPaid.isPending;

    const patch = (next: Partial<WithdrawalQuery>) =>
        setQuery((q) => ({ ...q, ...next, page: 1 }));
    const close = () => setAction(null);

    const columns: DataColumn<WithdrawalListItem>[] = [
        {
            key: 'creator',
            header: 'Recipient',
            render: (w) => (
                <IdentityCell name={w.artistName} secondary={w.artistEmail ?? undefined} size="xs" />
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (w) => (
                <Text fontSize="xs" color="gray.600">
                    {w.requesterRole ?? '—'}
                </Text>
            ),
        },
        {
            key: 'amount',
            header: 'Net amount',
            align: 'right',
            render: (w) => (
                <Text fontSize="xs" fontWeight="semibold">
                    {formatMinorAmount(w.netAmountMinor, w.currency)}
                </Text>
            ),
        },
        {
            key: 'bank',
            header: 'Bank',
            render: (w) => (
                <Text fontSize="xs" color="gray.600">
                    {w.bankName ?? '—'}
                    {w.accountNumber ? ` ·••${w.accountNumber.slice(-4)}` : ''}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (w) => <StatusBadge style={financeStatusStyle(w.status)} />,
        },
        {
            key: 'date',
            header: 'Requested',
            render: (w) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(w.requestedAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (w) => <ActionButtons w={w} onAct={(id, kind) => setAction({ id, kind })} />,
        },
    ];

    return (
        <AdminPageLayout
            title="All Payout Requests"
            subtitle="Every withdrawal request across all creator roles."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'All Requests' }]}
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => patch({ search: v || undefined }),
                    placeholder: 'Search recipient or account',
                }}
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
                <DataTable<WithdrawalListItem>
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(w) => w.id}
                    loading={isLoading && !data}
                    emptyIcon={FiDollarSign}
                    emptyTitle="No payout requests"
                    emptyDescription="No withdrawal requests match the current filters."
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

            <ActionDialog
                isOpen={action?.kind === 'approve'}
                onClose={close}
                title="Approve withdrawal"
                description="Moves the withdrawal into processing."
                confirmLabel="Approve"
                optionalFields={[
                    {
                        key: 'paymentReference',
                        label: 'Payment reference (optional)',
                        placeholder: 'Gateway / transfer reference',
                    },
                ]}
                isLoading={pending}
                onConfirm={({ fields }) =>
                    action &&
                    approve.mutate(
                        { id: action.id, paymentReference: fields.paymentReference || undefined },
                        { onSuccess: close },
                    )
                }
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
                onConfirm={({ reason }) =>
                    action && reject.mutate({ id: action.id, reason }, { onSuccess: close })
                }
            />
            <ActionDialog
                isOpen={action?.kind === 'retry'}
                onClose={close}
                title="Retry withdrawal"
                description="Re-drives a failed withdrawal back into processing."
                confirmLabel="Retry"
                optionalFields={[{ key: 'paymentReference', label: 'Payment reference (optional)' }]}
                isLoading={pending}
                onConfirm={({ fields }) =>
                    action &&
                    retry.mutate(
                        { id: action.id, paymentReference: fields.paymentReference || undefined },
                        { onSuccess: close },
                    )
                }
            />
            <ActionDialog
                isOpen={action?.kind === 'markPaid'}
                onClose={close}
                title="Mark as paid"
                description="Completes the withdrawal."
                confirmLabel="Mark paid"
                optionalFields={[
                    { key: 'gatewayTransactionId', label: 'Gateway transaction ID (optional)' },
                    { key: 'gatewayMessage', label: 'Gateway message (optional)' },
                ]}
                isLoading={pending}
                onConfirm={({ fields }) =>
                    action &&
                    markPaid.mutate(
                        {
                            id: action.id,
                            gatewayTransactionId: fields.gatewayTransactionId || undefined,
                            gatewayMessage: fields.gatewayMessage || undefined,
                        },
                        { onSuccess: close },
                    )
                }
            />
        </AdminPageLayout>
    );
};

export default AllRequestsPage;
