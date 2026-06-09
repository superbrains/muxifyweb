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
} from '../ui';
import type { DataColumn } from '../ui';
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
import type { PlatformRoleMeta } from '../../config/adminRoles';
import type { WithdrawalListItem, WithdrawalQuery } from '../../types/finance';
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
 * Per-role payout (withdrawal) queue. Renders the standard admin page chrome
 * plus a withdrawals DataTable filtered server-side by `role`, locked to the
 * passed role. Shares the withdrawal action flow (approve / reject / retry /
 * mark-paid) with the consolidated `WithdrawalsTab`.
 */
export function RolePayoutsQueue({ meta }: { meta: PlatformRoleMeta }) {
    const [query, setQuery] = React.useState<WithdrawalQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        sort: 'newest',
        role: meta.role,
    });
    const [action, setAction] = React.useState<{ id: string; kind: ActionKind } | null>(null);

    // Role is locked for this page — never let it drift out of the query.
    const effectiveQuery: WithdrawalQuery = { ...query, role: meta.role };
    const { data, isLoading, error } = useWithdrawals(effectiveQuery);

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
            header: meta.singular,
            render: (w) => (
                <IdentityCell name={w.artistName} secondary={w.artistEmail ?? undefined} size="xs" />
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
            render: (w) => (
                <ActionButtons w={w} onAct={(id, kind) => setAction({ id, kind })} />
            ),
        },
    ];

    return (
        <AdminPageLayout
            title={`${meta.plural} Payout Requests`}
            subtitle={`Review and process withdrawal requests from ${meta.plural.toLowerCase()}`}
            breadcrumbs={[
                { label: 'Payouts' },
                { label: 'Payout Requests' },
                { label: meta.plural },
            ]}
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => patch({ search: v || undefined }),
                    placeholder: `Search ${meta.singular.toLowerCase()} or account`,
                }}
                filters={[
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
                    emptyDescription={`No ${meta.plural.toLowerCase()} have pending withdrawals.`}
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
}
