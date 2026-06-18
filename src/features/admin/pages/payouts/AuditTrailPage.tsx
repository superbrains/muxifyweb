import React from 'react';
import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react';
import {
    AdminError,
    AdminEmptyState,
    AdminLoading,
    AdminPageLayout,
    AuditTimeline,
    FilterBar,
} from '../../components/ui';
import type { AuditEntry } from '../../components/ui';
import { Paginator } from '../../components/Paginator';
import { adminDate, formatCount } from '../../lib/format';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { usePayoutAudit } from '../../hooks/useFinance';
import type { PayoutAuditEntryDto, PayoutAuditQuery } from '../../types/finance';

const PAGE_SIZE = 30;

// Mirrors the backend AdminFinanceService.PayoutAuditActions set — every action the
// /payout-audit endpoint can return, so account actions are labelled and filterable too.
const ACTION_OPTIONS = [
    { value: 'All', label: 'All actions' },
    { value: 'WithdrawalApproved', label: 'Withdrawal approved' },
    { value: 'WithdrawalRejected', label: 'Withdrawal rejected' },
    { value: 'WithdrawalRetried', label: 'Withdrawal retried' },
    { value: 'WithdrawalMarkedPaid', label: 'Withdrawal marked paid' },
    { value: 'PayoutRetried', label: 'Payout retried' },
    { value: 'PayoutCancelled', label: 'Payout cancelled' },
    { value: 'PayoutAccountSetDefault', label: 'Account set as default' },
    { value: 'PayoutAccountForceVerified', label: 'Account force-verified' },
    { value: 'PayoutAccountDeactivated', label: 'Account deactivated' },
    { value: 'PayoutAccountReactivated', label: 'Account reactivated' },
    { value: 'PayoutAccountDeleted', label: 'Account deleted' },
];

const ACTION_LABEL: Record<string, string> = {
    WithdrawalApproved: 'Withdrawal approved',
    WithdrawalRejected: 'Withdrawal rejected',
    WithdrawalRetried: 'Withdrawal retried',
    WithdrawalMarkedPaid: 'Withdrawal marked paid',
    PayoutRetried: 'Payout retried',
    PayoutCancelled: 'Payout cancelled',
    PayoutAccountSetDefault: 'Account set as default',
    PayoutAccountForceVerified: 'Account force-verified',
    PayoutAccountDeactivated: 'Account deactivated',
    PayoutAccountReactivated: 'Account reactivated',
    PayoutAccountDeleted: 'Account deleted',
};

const ACTION_TONE: Record<string, AuditEntry['tone']> = {
    WithdrawalApproved: 'success',
    WithdrawalMarkedPaid: 'success',
    PayoutAccountForceVerified: 'success',
    PayoutAccountReactivated: 'success',
    WithdrawalRejected: 'danger',
    PayoutCancelled: 'danger',
    PayoutAccountDeleted: 'danger',
    WithdrawalRetried: 'warning',
    PayoutRetried: 'warning',
    PayoutAccountDeactivated: 'warning',
    PayoutAccountSetDefault: 'default',
};

const toEntry = (e: PayoutAuditEntryDto): AuditEntry => ({
    id: e.id,
    action: ACTION_LABEL[e.action] ?? e.action,
    actor: e.actorName,
    timestamp: e.createdAt,
    detail: e.summary,
    target: e.targetType,
    targetId: e.targetId,
    idLabel: e.targetType || 'ID',
    tone: ACTION_TONE[e.action] ?? 'default',
});

interface DayGroup {
    key: string;
    iso: string;
    entries: AuditEntry[];
}

/** Payout audit trail — every approve/reject/retry/mark-paid/cancel and account action. */
const AuditTrailPage: React.FC = () => {
    const [query, setQuery] = React.useState<PayoutAuditQuery>({ page: 1, pageSize: PAGE_SIZE });
    const { data, isLoading, error } = usePayoutAudit(query);

    // Filter changes reset to page 1; pagination keeps the active filters.
    const patch = (next: Partial<PayoutAuditQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    // Group chronologically by calendar day so a long trail stays scannable.
    const days = React.useMemo<DayGroup[]>(() => {
        const order: string[] = [];
        const byDay: Record<string, { iso: string; rows: PayoutAuditEntryDto[] }> = {};
        for (const it of items) {
            const k = it.createdAt ? new Date(it.createdAt).toDateString() : 'unknown';
            if (!byDay[k]) {
                byDay[k] = { iso: it.createdAt, rows: [] };
                order.push(k);
            }
            byDay[k].rows.push(it);
        }
        return order.map((k) => ({ key: k, iso: byDay[k].iso, entries: byDay[k].rows.map(toEntry) }));
    }, [items]);

    return (
        <AdminPageLayout
            title="Payout Audit Trail"
            subtitle="Every payout-related admin action — approvals, rejections, retries, cancellations and account changes."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'Audit Trail' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'action',
                        value: query.action ?? 'All',
                        onChange: (v) => patch({ action: v === 'All' ? undefined : v }),
                        options: ACTION_OPTIONS,
                        width: '230px',
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

            {!error && !(isLoading && !data) && total > 0 && (
                <Text fontSize="11px" color="gray.500" mt={3}>
                    {formatCount(total)} {total === 1 ? 'action' : 'actions'}
                </Text>
            )}

            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" px={4} py={4} mt={3}>
                {error ? (
                    <AdminError error={error} message={getApiErrorMessage(error)} />
                ) : isLoading && !data ? (
                    <AdminLoading />
                ) : items.length === 0 ? (
                    <AdminEmptyState
                        title="No audit entries"
                        description="No payout actions match the current filters."
                    />
                ) : (
                    <VStack align="stretch" gap={5}>
                        {days.map((d) => (
                            <Box key={d.key}>
                                <Text
                                    fontSize="10px"
                                    fontWeight="semibold"
                                    color="#7B91B0"
                                    textTransform="uppercase"
                                    letterSpacing="0.4px"
                                    mb={3}
                                >
                                    {adminDate(d.iso)}
                                </Text>
                                <AuditTimeline entries={d.entries} />
                            </Box>
                        ))}

                        <Paginator
                            page={query.page}
                            pageSize={query.pageSize}
                            total={total}
                            onPageChange={(p) => setQuery((q) => ({ ...q, page: p }))}
                        />
                    </VStack>
                )}
            </Box>
        </AdminPageLayout>
    );
};

export default AuditTrailPage;
