import React from 'react';
import { Badge, Box, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { AdminLoading, AdminError } from '../AdminStateBlock';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount, formatMinorAmount } from '../../lib/format';
import { useReconciliation } from '../../hooks/useFinance';
import type { DateRange, LedgerAccountBalance } from '../../types/finance';
import { DateRangeFilter, ToolbarCard } from './FinanceFilters';

const prettyAccount = (a: string) => a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function SummaryStat({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" px={4} py={3}>
            <Text fontSize="10px" color="gray.500" textTransform="uppercase">{label}</Text>
            <Text fontSize="lg" fontWeight="bold" color={color ?? 'gray.900'}>{value}</Text>
        </Box>
    );
}

export function ReconciliationTab() {
    const [range, setRange] = React.useState<DateRange>({});
    const { data, isLoading, error } = useReconciliation(range);
    const cur = data?.currency ?? 'NGN';

    const columns: AdminTableColumn<LedgerAccountBalance>[] = [
        { key: 'account', header: 'Account', render: (a) => <Text fontSize="xs" fontWeight="semibold" color="gray.800">{prettyAccount(a.account)}</Text> },
        { key: 'debits', header: 'Debits', align: 'right', render: (a) => <Text fontSize="xs">{formatMinorAmount(a.debitsMinor, cur)}</Text> },
        { key: 'credits', header: 'Credits', align: 'right', render: (a) => <Text fontSize="xs">{formatMinorAmount(a.creditsMinor, cur)}</Text> },
        {
            key: 'net',
            header: 'Net',
            align: 'right',
            render: (a) => (
                <Text fontSize="xs" fontWeight="semibold" color={a.netMinor >= 0 ? '#0F7B5C' : '#C53030'}>
                    {formatMinorAmount(a.netMinor, cur)}
                </Text>
            ),
        },
        { key: 'count', header: 'Entries', align: 'right', render: (a) => <Text fontSize="xs" color="gray.500">{formatCount(a.entryCount)}</Text> },
    ];

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <DateRangeFilter range={range} onChange={setRange} />
                {data && (
                    <Badge ml={{ lg: 'auto' }} colorPalette={data.isBalanced ? 'green' : 'red'} variant="subtle" fontSize="11px" px={3} py={1} borderRadius="full">
                        {data.isBalanced ? '✓ Ledger balanced' : '⚠ Out of balance'}
                    </Badge>
                )}
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                        <SummaryStat label="Total debits" value={formatMinorAmount(data?.totalDebitsMinor, cur)} />
                        <SummaryStat label="Total credits" value={formatMinorAmount(data?.totalCreditsMinor, cur)} />
                        <SummaryStat
                            label="Difference"
                            value={formatMinorAmount((data?.totalDebitsMinor ?? 0) - (data?.totalCreditsMinor ?? 0), cur)}
                            color={data?.isBalanced ? '#0F7B5C' : '#C53030'}
                        />
                    </SimpleGrid>
                    <AdminTable<LedgerAccountBalance>
                        columns={columns}
                        rows={data?.accounts ?? []}
                        rowKey={(a) => a.account}
                        emptyTitle="No ledger entries"
                        emptyDescription="No double-entry activity in this period."
                    />
                </>
            )}
            <HStack>
                <Text fontSize="11px" color="gray.400">
                    Double-entry chart of accounts. A balanced ledger means total debits equal total credits across all accounts.
                </Text>
            </HStack>
        </VStack>
    );
}
