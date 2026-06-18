import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiDollarSign, FiDownload } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    AuditTimeline,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    KpiStrip,
    MetaGrid,
    StatusBadge,
} from '../../components/ui';
import type { AuditEntry, DataColumn, KpiItem, MetaField } from '../../components/ui';
import { ActionDialog } from '../../components/finance/ActionDialog';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { exportCsv } from '../../lib/exportCsv';
import { adminDate, adminDateTime, formatMinorAmount } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import {
    useApproveWithdrawal,
    useMarkWithdrawalPaid,
    useRejectWithdrawal,
    useRetryWithdrawal,
    useWithdrawal,
    useWithdrawals,
    useWithdrawalSummary,
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

function actionsForStatus(
    w: WithdrawalListItem,
    onAct: (id: string, kind: ActionKind) => void,
    size: 'xs' | 'sm' = 'xs',
) {
    const btn = (label: string, kind: ActionKind, danger?: boolean) => (
        <Button
            key={`${kind}-${label}`}
            size={size}
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
    switch (w.status) {
        case 'PendingLabelApproval':
            return [
                <Text key="awaiting" fontSize="10px" color="#92660C" fontStyle="italic">
                    Awaiting label
                </Text>,
            ];
        case 'Pending':
            return [btn('Approve', 'approve'), btn('Reject', 'reject', true)];
        case 'Processing':
            return [btn('Mark paid', 'markPaid'), btn('Fail', 'reject', true)];
        case 'Failed':
            return [btn('Retry', 'retry'), btn('Reject', 'reject', true)];
        default:
            return [];
    }
}

/** Builds the two-tier approval lifecycle for the detail drawer timeline. */
function buildTimeline(w: WithdrawalListItem, d: {
    processingStartedAt?: string | null;
    failedAt?: string | null;
    paymentReference?: string | null;
    gatewayMessage?: string | null;
}): AuditEntry[] {
    const entries: AuditEntry[] = [
        {
            id: 'requested',
            action: 'Requested',
            actor: w.requesterRole ?? undefined,
            timestamp: w.requestedAt,
        },
    ];
    if (w.labelDecisionAt) {
        entries.push({
            id: 'label',
            action: w.labelRejectionReason ? 'Rejected by label' : 'Approved by label',
            actor: w.labelName ?? undefined,
            timestamp: w.labelDecisionAt,
            detail: w.labelRejectionReason ?? undefined,
            tone: w.labelRejectionReason ? 'danger' : 'success',
        });
    }
    if (d.processingStartedAt) {
        entries.push({
            id: 'processing',
            action: 'Approved — processing',
            timestamp: d.processingStartedAt,
            detail: d.paymentReference ? `Reference: ${d.paymentReference}` : undefined,
            tone: 'success',
        });
    }
    if (w.completedAt) {
        entries.push({
            id: 'completed',
            action: 'Completed',
            timestamp: w.completedAt,
            detail: d.gatewayMessage ?? undefined,
            tone: 'success',
        });
    }
    if (d.failedAt) {
        entries.push({
            id: 'failed',
            action: 'Failed',
            timestamp: d.failedAt,
            detail: d.gatewayMessage ?? undefined,
            tone: 'danger',
        });
    }
    if (w.rejectionReason) {
        entries.push({
            id: 'rejected',
            action: w.rejectedByRole ? `Rejected by ${w.rejectedByRole}` : 'Rejected',
            timestamp: w.completedAt,
            detail: w.rejectionReason,
            tone: 'danger',
        });
    }
    return entries;
}

/**
 * Consolidated payout requests across every role. Reuses the finance
 * withdrawals feed + the shared approve/reject/retry/mark-paid action flow,
 * with role + status filters, a summary strip and a full detail drawer that
 * surfaces the two-tier label-approval trail and gateway info.
 */
const AllRequestsPage: React.FC = () => {
    const [query, setQuery] = React.useState<WithdrawalQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        sort: 'newest',
    });
    const [action, setAction] = React.useState<{ id: string; kind: ActionKind } | null>(null);
    const [selected, setSelected] = React.useState<WithdrawalListItem | null>(null);

    const { data, isLoading, error } = useWithdrawals(query);
    const { data: summary } = useWithdrawalSummary({});
    const { data: detail } = useWithdrawal(selected?.id ?? null);

    const approve = useApproveWithdrawal();
    const reject = useRejectWithdrawal();
    const retry = useRetryWithdrawal();
    const markPaid = useMarkWithdrawalPaid();
    const pending = approve.isPending || reject.isPending || retry.isPending || markPaid.isPending;

    const patch = (next: Partial<WithdrawalQuery>) =>
        setQuery((q) => ({ ...q, ...next, page: 1 }));
    const close = () => setAction(null);
    const onAct = (id: string, kind: ActionKind) => setAction({ id, kind });

    const kpis: KpiItem[] = [
        { label: 'Awaiting label', value: summary?.pendingLabelApproval ?? 0, tone: 'warning' },
        { label: 'Pending (admin)', value: summary?.pending ?? 0, tone: 'info' },
        { label: 'Processing', value: summary?.processing ?? 0, tone: 'info' },
        { label: 'Completed', value: summary?.completed ?? 0, tone: 'success' },
        { label: 'Failed', value: summary?.failed ?? 0, tone: 'danger' },
        {
            label: 'Pending payout value',
            value: formatMinorAmount(summary?.pendingNetAmountMinor ?? 0, summary?.currency ?? 'NGN'),
        },
    ];

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
            render: (w) => (
                <HStack gap={1.5} justify="flex-end">
                    {actionsForStatus(w, onAct)}
                </HStack>
            ),
        },
    ];

    const onExport = () =>
        exportCsv<WithdrawalListItem>(
            'payout-requests',
            [
                { header: 'Recipient', value: (w) => w.artistName },
                { header: 'Email', value: (w) => w.artistEmail ?? '' },
                { header: 'Role', value: (w) => w.requesterRole ?? '' },
                { header: 'Gross', value: (w) => w.amountMinor },
                { header: 'Fee', value: (w) => w.processingFeeMinor },
                { header: 'Net', value: (w) => w.netAmountMinor },
                { header: 'Currency', value: (w) => w.currency },
                { header: 'Status', value: (w) => w.status },
                { header: 'Bank', value: (w) => w.bankName ?? '' },
                { header: 'Account', value: (w) => w.accountNumber ?? '' },
                { header: 'Requested', value: (w) => w.requestedAt },
            ],
            data?.items ?? [],
        );

    const metaFields: MetaField[] = selected
        ? [
              { label: 'Requester role', value: selected.requesterRole },
              { label: 'Label', value: detail?.withdrawal.labelName ?? selected.labelName },
              { label: 'Gross amount', value: formatMinorAmount(selected.amountMinor, selected.currency) },
              { label: 'Processing fee', value: formatMinorAmount(selected.processingFeeMinor, selected.currency) },
              { label: 'Net amount', value: formatMinorAmount(selected.netAmountMinor, selected.currency) },
              { label: 'Bank', value: selected.bankName },
              { label: 'Bank code', value: detail?.bankCode },
              { label: 'Account name', value: selected.accountName },
              { label: 'Account number', value: selected.accountNumber },
              { label: 'Payment reference', value: detail?.paymentReference },
              { label: 'Gateway txn ID', value: detail?.gatewayTransactionId },
              { label: 'Gateway message', value: detail?.gatewayMessage },
              { label: 'Admin notes', value: detail?.adminNotes },
              { label: 'Requested', value: adminDateTime(selected.requestedAt) },
          ]
        : [];

    return (
        <AdminPageLayout
            title="All Payout Requests"
            subtitle="Every withdrawal request across all creator roles."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'All Requests' }]}
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
                    onRowClick={setSelected}
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

            <DetailDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.artistName ?? 'Withdrawal'}
                subtitle={selected ? `${selected.requesterRole ?? 'Creator'} · ${formatMinorAmount(selected.netAmountMinor, selected.currency)}` : undefined}
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
                                mb={3}
                            >
                                Approval trail
                            </Text>
                            <AuditTimeline entries={buildTimeline(selected, detail ?? {})} />
                        </Box>
                    </VStack>
                )}
            </DetailDrawer>

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
