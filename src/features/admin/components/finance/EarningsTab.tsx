import React from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { Select } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '../Paginator';
import { AdminLoading, AdminError } from '../AdminStateBlock';
import { IdentityCell } from '../IdentityCell';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount, formatMinorAmount } from '../../lib/format';
import { exportCsv } from '../../lib/exportCsv';
import { useFinanceEarnings } from '../../hooks/useFinance';
import type { CreatorEarningSummary, EarningsQuery } from '../../types/finance';
import { DateRangeFilter, ExportButton, SearchInput, ToolbarCard } from './FinanceFilters';
import { CreatorEarningsDrawer } from './CreatorEarningsDrawer';

const PAGE_SIZE = 15;

const TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Gift', label: 'Gift' },
    { value: 'ContentUnlock', label: 'Content unlock' },
    { value: 'Streaming', label: 'Streaming' },
    { value: 'Bonus', label: 'Bonus' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Other', label: 'Other' },
];
const WITHDRAWN_OPTIONS = [
    { value: 'All', label: 'All earnings' },
    { value: 'false', label: 'Unwithdrawn' },
    { value: 'true', label: 'Withdrawn' },
];

export function EarningsTab() {
    const [query, setQuery] = React.useState<EarningsQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [artistId, setArtistId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useFinanceEarnings(query);

    const patch = (next: Partial<EarningsQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const columns: AdminTableColumn<CreatorEarningSummary>[] = [
        { key: 'artist', header: 'Creator', render: (c) => <IdentityCell name={c.artistName} secondary={c.artistEmail ?? undefined} size="xs" /> },
        { key: 'coins', header: 'Coins earned', align: 'right', render: (c) => <Text fontSize="xs">{formatCount(c.totalCoinEarned)}</Text> },
        { key: 'net', header: 'Net', align: 'right', render: (c) => <Text fontSize="xs" fontWeight="semibold" color="#0F7B5C">{formatMinorAmount(c.totalNetMinor, c.currency)}</Text> },
        { key: 'fee', header: 'Platform fee', align: 'right', render: (c) => <Text fontSize="xs" color="gray.500">{formatMinorAmount(c.totalPlatformFeeMinor, c.currency)}</Text> },
        { key: 'unwithdrawn', header: 'Unwithdrawn', align: 'right', render: (c) => <Text fontSize="xs" color="#92660C">{formatMinorAmount(c.unwithdrawnMinor, c.currency)}</Text> },
        { key: 'count', header: 'Records', align: 'right', render: (c) => <Text fontSize="xs" color="gray.500">{formatCount(c.earningCount)}</Text> },
    ];

    const handleExport = () =>
        exportCsv<CreatorEarningSummary>('creator-earnings', [
            { header: 'Creator', value: (c) => c.artistName },
            { header: 'Email', value: (c) => c.artistEmail ?? '' },
            { header: 'Coins earned', value: (c) => c.totalCoinEarned },
            { header: 'Net (minor)', value: (c) => c.totalNetMinor },
            { header: 'Platform fee (minor)', value: (c) => c.totalPlatformFeeMinor },
            { header: 'Unwithdrawn (minor)', value: (c) => c.unwithdrawnMinor },
            { header: 'Records', value: (c) => c.earningCount },
        ], data?.items ?? []);

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <SearchInput value={query.search ?? ''} onChange={(v) => patch({ search: v || undefined })} placeholder="Search creator…" />
                <Select options={TYPE_OPTIONS} value={query.type ?? 'All'} onChange={(v) => patch({ type: v === 'All' ? undefined : v })} width="150px" fontSize="xs" />
                <Select
                    options={WITHDRAWN_OPTIONS}
                    value={query.withdrawn === undefined ? 'All' : String(query.withdrawn)}
                    onChange={(v) => patch({ withdrawn: v === 'All' ? undefined : v === 'true' })}
                    width="150px"
                    fontSize="xs"
                />
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <AdminTable<CreatorEarningSummary>
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(c) => c.artistId}
                        onRowClick={(c) => setArtistId(c.artistId)}
                        emptyTitle="No earnings"
                    />
                    <Paginator page={data?.page ?? 1} pageSize={data?.pageSize ?? PAGE_SIZE} total={data?.total ?? 0} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
                </>
            )}

            <CreatorEarningsDrawer artistId={artistId} onClose={() => setArtistId(null)} />
        </VStack>
    );
}
