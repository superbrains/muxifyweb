import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FiUnlock } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { DateRangeFilter, ExportButton, ToolbarCard } from '../../components/finance/FinanceFilters';
import { Select } from '@shared/components';
import { adminDateTime, formatCount } from '../../lib/format';
import { exportCsv } from '../../lib/exportCsv';
import {
    useFinanceUnlocks,
    useFinanceUnlockSummary,
    useRefundAirtimeUnlock,
    useRefundContentUnlock,
} from '../../hooks/useFinance';
import type { FinanceUnlock, UnlockQuery } from '../../types/finance';

const PAGE_SIZE = 20;
const nf = new Intl.NumberFormat('en-NG');

const KIND_OPTIONS = [
    { value: 'content', label: 'Content (coins)' },
    { value: 'airtime', label: 'Airtime (USSD)' },
];
const AIRTIME_STATUS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' },
];

const subType = (u: FinanceUnlock) =>
    u.kind === 'Airtime' ? 'Airtime' : u.videoId ? 'Video' : 'Track';

/** Unlocks ledger — coin-funded content unlocks and airtime conversions, with KPIs, filters, refunds and export. */
const UnlocksPage: React.FC = () => {
    const [query, setQuery] = React.useState<UnlockQuery>({ page: 1, pageSize: PAGE_SIZE, kind: 'content' });
    const [refundTarget, setRefundTarget] = React.useState<FinanceUnlock | null>(null);
    const [detail, setDetail] = React.useState<FinanceUnlock | null>(null);

    const isAirtime = query.kind === 'airtime';
    const { data, isLoading, error } = useFinanceUnlocks(query);
    const { data: summary } = useFinanceUnlockSummary({ kind: query.kind ?? 'content', from: query.from, to: query.to });

    const refundContent = useRefundContentUnlock();
    const refundAirtime = useRefundAirtimeUnlock();
    const refundBusy = refundContent.isPending || refundAirtime.isPending;

    const patch = (next: Partial<UnlockQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const statusCount = (s: string) =>
        summary?.airtimeByStatus.find((x) => x.status === s)?.count ?? 0;

    const kpis: KpiItem[] = !summary
        ? []
        : isAirtime
          ? [
                { label: 'Airtime unlocks', value: summary.totalAirtimeUnlocks },
                { label: 'Airtime value', value: `₦${nf.format(summary.totalAirtimeAmount)}`, tone: 'info' },
                { label: 'Completed', value: statusCount('Completed'), tone: 'success' },
                { label: 'Failed', value: statusCount('Failed'), tone: 'danger' },
                { label: 'Refunded', value: statusCount('Refunded'), tone: 'neutral' },
            ]
          : [
                { label: 'Content unlocks', value: summary.totalContentUnlocks },
                { label: 'Coins spent', value: `${formatCount(summary.totalCoinsSpent)} coins`, tone: 'info' },
                { label: 'Tracks', value: summary.trackUnlockCount, tone: 'success' },
                { label: 'Videos', value: summary.videoUnlockCount, tone: 'warning' },
            ];

    const columns: DataColumn<FinanceUnlock>[] = [
        { key: 'user', header: 'User', render: (u) => <IdentityCell name={u.userDisplayName} size="xs" /> },
        {
            key: 'content',
            header: 'Content',
            render: (u) => (
                <Text fontSize="xs" color="gray.700" lineClamp={1}>
                    {u.contentTitle ?? u.phoneNumber ?? '—'}
                </Text>
            ),
        },
        { key: 'type', header: 'Type', render: (u) => <Text fontSize="xs" color="gray.500">{subType(u)}</Text> },
        {
            key: 'cost',
            header: 'Cost',
            align: 'right',
            render: (u) =>
                u.kind === 'Airtime' ? (
                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">₦{nf.format(u.airtimeAmount ?? 0)}</Text>
                ) : (
                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                        {u.coinsSpent != null ? `${formatCount(u.coinsSpent)} coins` : '—'}
                    </Text>
                ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (u) => (u.status ? <StatusBadge status={u.status} /> : <Text fontSize="xs" color="gray.400">—</Text>),
        },
        { key: 'date', header: 'Date', render: (u) => <Text fontSize="xs" color="gray.500">{adminDateTime(u.createdAt)}</Text> },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (u) => {
                const alreadyRefunded = u.kind === 'Airtime' && u.status === 'Refunded';
                if (alreadyRefunded) return null;
                return (
                    <Text
                        as="button"
                        fontSize="xs"
                        fontWeight="medium"
                        color="#C53030"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setRefundTarget(u);
                        }}
                    >
                        Refund
                    </Text>
                );
            },
        },
    ];

    const handleExport = () =>
        exportCsv<FinanceUnlock>(`unlocks-${query.kind ?? 'content'}`, [
            { header: 'Date', value: (u) => adminDateTime(u.createdAt) },
            { header: 'User', value: (u) => u.userDisplayName },
            { header: 'Content', value: (u) => u.contentTitle ?? '' },
            { header: 'Type', value: (u) => subType(u) },
            { header: 'Coins', value: (u) => u.coinsSpent ?? '' },
            { header: 'Airtime', value: (u) => u.airtimeAmount ?? '' },
            { header: 'Provider', value: (u) => u.provider ?? '' },
            { header: 'Status', value: (u) => u.status ?? '' },
        ], data?.items ?? []);

    const confirmRefund = (reason: string) => {
        if (!refundTarget) return;
        const opts = { onSuccess: () => setRefundTarget(null) };
        if (refundTarget.kind === 'Airtime') {
            refundAirtime.mutate({ id: refundTarget.id, reason }, opts);
        } else {
            refundContent.mutate({ id: refundTarget.id, reason }, opts);
        }
    };

    return (
        <AdminPageLayout
            title="Unlocks"
            subtitle="Coin-funded content unlocks (tracks, videos) and airtime conversions."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Unlocks' }]}
        >
            {kpis.length > 0 && <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: isAirtime ? 5 : 4 }} />}

            <ToolbarCard>
                <Select
                    options={KIND_OPTIONS}
                    value={query.kind ?? 'content'}
                    onChange={(v) => patch({ kind: v as string, status: undefined })}
                    width="170px"
                    fontSize="xs"
                />
                {isAirtime && (
                    <Select
                        options={AIRTIME_STATUS}
                        value={query.status ?? 'All'}
                        onChange={(v) => patch({ status: v === 'All' ? undefined : (v as string) })}
                        width="150px"
                        fontSize="xs"
                    />
                )}
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {error ? (
                <AdminError error={error} message="Could not load unlocks." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(u) => u.id}
                    onRowClick={(u) => setDetail(u)}
                    loading={isLoading && !data}
                    emptyIcon={FiUnlock}
                    emptyTitle="No unlocks"
                    emptyDescription="No unlocks match the current filters."
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
                isOpen={refundTarget !== null}
                onClose={() => setRefundTarget(null)}
                title={refundTarget?.kind === 'Airtime' ? 'Refund airtime unlock' : 'Refund content unlock'}
                message={
                    refundTarget?.kind === 'Airtime'
                        ? 'Marks the airtime unlock as refunded. The airtime itself is refunded manually off-platform.'
                        : 'Credits the fan back the coins spent, reverses the creator earning and removes the unlock. This cannot be undone.'
                }
                reasonLabel="Reason"
                confirmText="Refund"
                tone="danger"
                isLoading={refundBusy}
                onConfirm={confirmRefund}
            />

            <DetailDrawer
                open={detail !== null}
                onClose={() => setDetail(null)}
                title={detail ? `${subType(detail)} unlock` : ''}
                subtitle={detail ? adminDateTime(detail.createdAt) : undefined}
                size="sm"
            >
                {detail && (
                    <VStack align="stretch" gap={4}>
                        <DetailRow label="User" value={detail.userDisplayName} />
                        <DetailRow label="Content" value={detail.contentTitle ?? '—'} />
                        <DetailRow label="Type" value={subType(detail)} />
                        {detail.kind === 'Airtime' ? (
                            <>
                                <DetailRow label="Amount" value={`₦${nf.format(detail.airtimeAmount ?? 0)}`} />
                                <DetailRow label="Provider" value={detail.provider ?? '—'} />
                                <DetailRow label="Phone" value={detail.phoneNumber ?? '—'} />
                            </>
                        ) : (
                            <DetailRow
                                label="Coins spent"
                                value={detail.coinsSpent != null ? `${formatCount(detail.coinsSpent)} coins` : '—'}
                            />
                        )}
                        {detail.status && (
                            <Box>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.4px" mb={1}>
                                    Status
                                </Text>
                                <StatusBadge status={detail.status} />
                            </Box>
                        )}
                    </VStack>
                )}
            </DetailDrawer>
        </AdminPageLayout>
    );
};

export default UnlocksPage;

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <Box>
        <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.4px" mb={1}>
            {label}
        </Text>
        <Text fontSize="xs" color="gray.800" fontWeight="medium">
            {value}
        </Text>
    </Box>
);
