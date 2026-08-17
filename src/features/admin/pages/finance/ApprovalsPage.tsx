import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
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
} from '@shared/console';
import type { DataColumn, KpiItem, MetaField } from '@shared/console';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime } from '@shared/console/lib/format';
import {
    useApprovalRequests,
    useApprovalSummary,
    useApproveRequest,
    useRejectRequest,
} from '../../hooks/useFinance';
import { useHasPermission } from '../../hooks/useAdminManagement';
import type { ApprovalRequestQuery, FinanceApprovalRequestDto } from '../../types/finance';

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
    { value: 'PendingReview', label: 'Pending review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'All', label: 'All' },
];

/** Humanise an actionType like `RefundPurchase` → `Refund purchase`. */
const humanizeAction = (action: string): string => {
    const spaced = action
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const isPendingReview = (r: FinanceApprovalRequestDto) =>
    r.status.toLowerCase() === 'pendingreview';
const isRejected = (r: FinanceApprovalRequestDto) => r.status.toLowerCase() === 'rejected';

/**
 * Maker-checker (dual-approval) review queue. A second reviewer approves or
 * rejects high-risk finance actions that another admin (the maker) requested.
 * The backend rejects self-approval (403) — surfaced here as a toast error.
 */
const ApprovalsPage: React.FC = () => {
    const canReview = useHasPermission('FinanceApproveSecondReviewer');

    const [query, setQuery] = React.useState<ApprovalRequestQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        status: 'PendingReview',
    });
    const [selected, setSelected] = React.useState<FinanceApprovalRequestDto | null>(null);
    const [rejectTarget, setRejectTarget] = React.useState<FinanceApprovalRequestDto | null>(null);

    const { data, isLoading, error } = useApprovalRequests(query);
    const { data: summary } = useApprovalSummary();
    const approve = useApproveRequest();
    const reject = useRejectRequest();
    const pending = approve.isPending || reject.isPending;

    const kpis: KpiItem[] = [
        { label: 'Pending review', value: summary?.pendingReview ?? 0, tone: 'warning', sub: 'Awaiting a second reviewer' },
        { label: 'Approved', value: summary?.approved ?? 0, tone: 'success', sub: 'Reviewed & applied' },
        { label: 'Rejected', value: summary?.rejected ?? 0, tone: 'danger', sub: 'Declined by reviewer' },
    ];

    const handleApprove = (r: FinanceApprovalRequestDto) =>
        approve.mutate({ id: r.id }, { onSuccess: () => setSelected(null) });

    const handleReject = (reason: string) => {
        if (!rejectTarget) return;
        reject.mutate(
            { id: rejectTarget.id, reason },
            {
                onSuccess: () => {
                    setRejectTarget(null);
                    setSelected(null);
                },
            },
        );
    };

    const ActionButtons: React.FC<{ r: FinanceApprovalRequestDto; size?: 'xs' | 'sm' }> = ({
        r,
        size = 'xs',
    }) => (
        <HStack gap={1.5} justify="flex-end">
            <Button
                size={size}
                variant="outline"
                borderColor="gray.200"
                color="#0F7B5C"
                borderRadius="md"
                fontSize="11px"
                disabled={pending}
                onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(r);
                }}
            >
                Approve
            </Button>
            <Button
                size={size}
                variant="outline"
                borderColor="#FECACA"
                color="#C53030"
                borderRadius="md"
                fontSize="11px"
                disabled={pending}
                onClick={(e) => {
                    e.stopPropagation();
                    setRejectTarget(r);
                }}
            >
                Reject
            </Button>
        </HStack>
    );

    const columns: DataColumn<FinanceApprovalRequestDto>[] = [
        {
            key: 'action',
            header: 'Action',
            render: (r) => (
                <VStack align="start" gap={0.5}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                        {humanizeAction(r.actionType)}
                    </Text>
                    <Text fontSize="11px" color="gray.500" lineClamp={2}>
                        {r.summary}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'requestedBy',
            header: 'Requested by',
            render: (r) => <IdentityCell name={r.requestedByName} size="xs" />,
        },
        {
            key: 'created',
            header: 'Requested',
            render: (r) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(r.createdAt)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r) => (
                <VStack align="start" gap={0.5}>
                    <StatusBadge status={r.status} />
                    {r.reviewedByName && (
                        <Text fontSize="10px" color="gray.400">
                            by {r.reviewedByName} · {adminDateTime(r.reviewedAt)}
                        </Text>
                    )}
                    {isRejected(r) && r.rejectionReason && (
                        <Text fontSize="10px" color="#C53030" lineClamp={1} maxW="200px" title={r.rejectionReason}>
                            “{r.rejectionReason}”
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (r) => {
                if (!canReview || !isPendingReview(r)) return null;
                return <ActionButtons r={r} />;
            },
        },
    ];

    const detailFields = (r: FinanceApprovalRequestDto): MetaField[] => [
        { label: 'Action', value: humanizeAction(r.actionType) },
        { label: 'Status', value: <StatusBadge status={r.status} /> },
        { label: 'Summary', value: r.summary },
        { label: 'Target type', value: r.targetType },
        { label: 'Target id', value: <CopyableId value={r.targetId} label="Target id" /> },
        { label: 'Requested by', value: <IdentityCell name={r.requestedByName} size="xs" /> },
        { label: 'Requested at', value: adminDateTime(r.createdAt) },
        { label: 'Reviewed by', value: r.reviewedByName },
        { label: 'Reviewed at', value: r.reviewedByName ? adminDateTime(r.reviewedAt) : null },
    ];

    return (
        <AdminPageLayout
            title="Approval Requests"
            subtitle="Second-reviewer queue for high-risk finance actions (maker-checker)"
            breadcrumbs={[{ label: 'Finance' }, { label: 'Approval Requests' }]}
        >
            <KpiStrip items={kpis} columns={{ base: 1, md: 3, xl: 3 }} />

            <FilterBar
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                status: v,
                                page: 1,
                            })),
                        options: STATUS_OPTIONS,
                        width: '170px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <DataTable<FinanceApprovalRequestDto>
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(r) => r.id}
                    onRowClick={(r) => setSelected(r)}
                    loading={isLoading && !data}
                    emptyIcon={FiCheckCircle}
                    emptyTitle="Nothing to review"
                    emptyDescription="There are no requests awaiting a second reviewer."
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
                title={selected ? humanizeAction(selected.actionType) : ''}
                subtitle={selected ? `Requested by ${selected.requestedByName}` : undefined}
                footer={
                    selected && canReview && isPendingReview(selected) ? (
                        <ActionButtons r={selected} size="sm" />
                    ) : undefined
                }
            >
                {selected && (
                    <VStack align="stretch" gap={4}>
                        <MetaGrid fields={detailFields(selected)} columns={2} />
                        {isRejected(selected) && selected.rejectionReason && (
                            <Box
                                bg="#FEF2F2"
                                border="1px solid"
                                borderColor="#FECACA"
                                borderRadius="md"
                                px={3}
                                py={2.5}
                            >
                                <Text fontSize="10px" fontWeight="600" color="#C53030" textTransform="uppercase" letterSpacing="0.5px">
                                    Rejection reason
                                </Text>
                                <Text fontSize="xs" color="gray.700" mt={1}>
                                    {selected.rejectionReason}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                )}
            </DetailDrawer>

            <ConfirmActionModal
                isOpen={rejectTarget !== null}
                onClose={() => setRejectTarget(null)}
                onConfirm={handleReject}
                title="Reject this request"
                message={
                    rejectTarget
                        ? `Reject "${humanizeAction(rejectTarget.actionType)}" requested by ${rejectTarget.requestedByName}. The action will not be applied.`
                        : undefined
                }
                reasonLabel="Rejection reason"
                placeholder="Explain why this request is being rejected — recorded in the audit log."
                confirmText="Reject request"
                tone="danger"
                isLoading={reject.isPending}
            />
        </AdminPageLayout>
    );
};

export default ApprovalsPage;
