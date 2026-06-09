import React from 'react';
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    FilterBar,
    IdentityCell,
    StatusBadge,
    ConfirmActionModal,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime } from '../../lib/format';
import {
    useApprovalRequests,
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
    const [rejectTarget, setRejectTarget] = React.useState<FinanceApprovalRequestDto | null>(null);

    const { data, isLoading, error } = useApprovalRequests(query);
    const approve = useApproveRequest();
    const reject = useRejectRequest();
    const pending = approve.isPending || reject.isPending;

    const isPendingReview = (r: FinanceApprovalRequestDto) =>
        r.status.toLowerCase() === 'pendingreview';

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
                            by {r.reviewedByName}
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
                return (
                    <HStack gap={1.5} justify="flex-end">
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.200"
                            color="#0F7B5C"
                            borderRadius="md"
                            fontSize="11px"
                            disabled={pending}
                            onClick={() => approve.mutate({ id: r.id })}
                        >
                            Approve
                        </Button>
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="#FECACA"
                            color="#C53030"
                            borderRadius="md"
                            fontSize="11px"
                            disabled={pending}
                            onClick={() => setRejectTarget(r)}
                        >
                            Reject
                        </Button>
                    </HStack>
                );
            },
        },
    ];

    return (
        <AdminPageLayout
            title="Approval Requests"
            subtitle="Second-reviewer queue for high-risk finance actions (maker-checker)"
            breadcrumbs={[{ label: 'Finance' }, { label: 'Approval Requests' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'PendingReview',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                status: v === 'All' ? undefined : v,
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

            <ConfirmActionModal
                isOpen={rejectTarget !== null}
                onClose={() => setRejectTarget(null)}
                onConfirm={(reason) =>
                    rejectTarget &&
                    reject.mutate(
                        { id: rejectTarget.id, reason },
                        { onSuccess: () => setRejectTarget(null) },
                    )
                }
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
