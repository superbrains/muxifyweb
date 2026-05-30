import React from 'react';
import { Badge, Text, VStack } from '@chakra-ui/react';
import { Select } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '../Paginator';
import { AdminLoading, AdminError } from '../AdminStateBlock';
import { IdentityCell } from '../IdentityCell';
import { StatusBadge } from '../StatusBadge';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime, formatCount } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import { exportCsv } from '../../lib/exportCsv';
import { useFinanceUnlocks } from '../../hooks/useFinance';
import type { FinanceUnlock, UnlockQuery } from '../../types/finance';
import { DateRangeFilter, ExportButton, ToolbarCard } from './FinanceFilters';

const PAGE_SIZE = 15;

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

export function UnlocksTab() {
    const [query, setQuery] = React.useState<UnlockQuery>({ page: 1, pageSize: PAGE_SIZE, kind: 'content' });
    const { data, isLoading, error } = useFinanceUnlocks(query);
    const isAirtime = query.kind === 'airtime';

    const patch = (next: Partial<UnlockQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const columns: AdminTableColumn<FinanceUnlock>[] = [
        { key: 'user', header: 'User', render: (u) => <IdentityCell name={u.userDisplayName} size="xs" /> },
        { key: 'content', header: 'Content', render: (u) => <Text fontSize="xs">{u.contentTitle ?? (u.videoId ? 'Video' : 'Track')}</Text> },
        { key: 'kind', header: 'Kind', render: (u) => <Badge fontSize="9px" variant="subtle" colorPalette={u.kind === 'Airtime' ? 'orange' : 'purple'}>{u.kind}</Badge> },
        {
            key: 'cost',
            header: 'Cost',
            align: 'right',
            render: (u) =>
                u.kind === 'Airtime' ? (
                    <Text fontSize="xs" fontWeight="semibold">₦{u.airtimeAmount ?? 0}</Text>
                ) : (
                    <Text fontSize="xs" fontWeight="semibold">{formatCount(u.coinsSpent ?? 0)} coins</Text>
                ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (u) => (u.status ? <StatusBadge style={financeStatusStyle(u.status)} /> : <Text fontSize="xs" color="gray.400">—</Text>),
        },
        { key: 'date', header: 'Date', render: (u) => <Text fontSize="xs" color="gray.500">{adminDateTime(u.createdAt)}</Text> },
    ];

    const handleExport = () =>
        exportCsv<FinanceUnlock>(`unlocks-${query.kind}`, [
            { header: 'Date', value: (u) => adminDateTime(u.createdAt) },
            { header: 'User', value: (u) => u.userDisplayName },
            { header: 'Content', value: (u) => u.contentTitle ?? '' },
            { header: 'Kind', value: (u) => u.kind },
            { header: 'Coins', value: (u) => u.coinsSpent ?? '' },
            { header: 'Airtime', value: (u) => u.airtimeAmount ?? '' },
            { header: 'Provider', value: (u) => u.provider ?? '' },
            { header: 'Status', value: (u) => u.status ?? '' },
        ], data?.items ?? []);

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <Select options={KIND_OPTIONS} value={query.kind ?? 'content'} onChange={(v) => patch({ kind: v, status: undefined })} width="170px" fontSize="xs" />
                {isAirtime && (
                    <Select options={AIRTIME_STATUS} value={query.status ?? 'All'} onChange={(v) => patch({ status: v === 'All' ? undefined : v })} width="150px" fontSize="xs" />
                )}
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <AdminTable<FinanceUnlock> columns={columns} rows={data?.items ?? []} rowKey={(u) => u.id} emptyTitle="No unlocks" />
                    <Paginator page={data?.page ?? 1} pageSize={data?.pageSize ?? PAGE_SIZE} total={data?.total ?? 0} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
                </>
            )}
        </VStack>
    );
}
