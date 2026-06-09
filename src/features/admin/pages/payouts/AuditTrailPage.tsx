import React from 'react';
import { Box, Button, HStack, Input } from '@chakra-ui/react';
import {
    AdminError,
    AdminEmptyState,
    AdminLoading,
    AdminPageLayout,
    AuditTimeline,
    FilterBar,
} from '../../components/ui';
import type { AuditEntry } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { usePayoutAudit } from '../../hooks/useFinance';
import type { PayoutAuditEntryDto, PayoutAuditQuery } from '../../types/finance';

const PAGE_SIZE = 30;

const ACTION_OPTIONS = [
    { value: 'All', label: 'All actions' },
    { value: 'WithdrawalApproved', label: 'Withdrawal approved' },
    { value: 'WithdrawalRejected', label: 'Withdrawal rejected' },
    { value: 'WithdrawalRetried', label: 'Withdrawal retried' },
    { value: 'WithdrawalMarkedPaid', label: 'Withdrawal marked paid' },
    { value: 'PayoutRetried', label: 'Payout retried' },
    { value: 'PayoutCancelled', label: 'Payout cancelled' },
];

const ACTION_LABEL: Record<string, string> = {
    WithdrawalApproved: 'Withdrawal approved',
    WithdrawalRejected: 'Withdrawal rejected',
    WithdrawalRetried: 'Withdrawal retried',
    WithdrawalMarkedPaid: 'Withdrawal marked paid',
    PayoutRetried: 'Payout retried',
    PayoutCancelled: 'Payout cancelled',
};

const ACTION_TONE: Record<string, AuditEntry['tone']> = {
    WithdrawalApproved: 'success',
    WithdrawalMarkedPaid: 'success',
    WithdrawalRejected: 'danger',
    PayoutCancelled: 'danger',
    WithdrawalRetried: 'warning',
    PayoutRetried: 'warning',
};

const toEntry = (e: PayoutAuditEntryDto): AuditEntry => ({
    id: e.id,
    action: ACTION_LABEL[e.action] ?? e.action,
    actor: e.actorName,
    timestamp: e.createdAt,
    detail: e.summary,
    target: e.targetType,
    tone: ACTION_TONE[e.action] ?? 'default',
});

/** Payout audit trail — every approve/reject/retry/mark-paid/cancel action. */
const AuditTrailPage: React.FC = () => {
    const [query, setQuery] = React.useState<PayoutAuditQuery>({ page: 1, pageSize: PAGE_SIZE });
    const { data, isLoading, error } = usePayoutAudit(query);

    const patch = (next: Partial<PayoutAuditQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const entries = (data?.items ?? []).map(toEntry);
    const hasMore = data ? data.page * data.pageSize < data.total : false;

    return (
        <AdminPageLayout
            title="Payout Audit Trail"
            subtitle="Every payout-related admin action — approvals, rejections, retries and cancellations."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'Audit Trail' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'action',
                        value: query.action ?? 'All',
                        onChange: (v) => patch({ action: v === 'All' ? undefined : v }),
                        options: ACTION_OPTIONS,
                        width: '220px',
                    },
                ]}
                right={
                    <HStack gap={2}>
                        <Input
                            type="date"
                            size="sm"
                            fontSize="xs"
                            w="150px"
                            borderColor="gray.200"
                            borderRadius="10px"
                            value={query.from ?? ''}
                            onChange={(e) => patch({ from: e.target.value || undefined })}
                            aria-label="From date"
                        />
                        <Input
                            type="date"
                            size="sm"
                            fontSize="xs"
                            w="150px"
                            borderColor="gray.200"
                            borderRadius="10px"
                            value={query.to ?? ''}
                            onChange={(e) => patch({ to: e.target.value || undefined })}
                            aria-label="To date"
                        />
                    </HStack>
                }
            />

            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" px={4} py={4} mt={3}>
                {error ? (
                    <AdminError error={error} message={getApiErrorMessage(error)} />
                ) : isLoading && !data ? (
                    <AdminLoading />
                ) : entries.length === 0 ? (
                    <AdminEmptyState
                        title="No audit entries"
                        description="No payout actions match the current filters."
                    />
                ) : (
                    <>
                        <AuditTimeline entries={entries} />
                        {hasMore && (
                            <HStack justify="center" mt={4}>
                                <Button
                                    size="sm"
                                    fontSize="xs"
                                    variant="outline"
                                    borderColor="gray.200"
                                    borderRadius="lg"
                                    onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
                                >
                                    Load more
                                </Button>
                            </HStack>
                        )}
                    </>
                )}
            </Box>
        </AdminPageLayout>
    );
};

export default AuditTrailPage;
