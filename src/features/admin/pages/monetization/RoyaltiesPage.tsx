import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiDownload, FiUsers } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    IdentityCell,
    KpiStrip,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { CreatorEarningsDrawer } from '../../components/finance/CreatorEarningsDrawer';
import { formatCount, formatMinorAmount } from '../../lib/format';
import { useRoyalties } from '../../hooks/useMonetization';
import { useFinanceEarnings } from '../../hooks/useFinance';
import { monetizationService } from '../../services/monetizationService';
import type { CreatorEarningSummary } from '../../types/finance';
import type { DateRangeQuery, RoyaltiesByRoleDto } from '../../types/monetization';
import { RANGE_OPTIONS, rangeFor } from './rangeFilter';

const ACCENT = '#f94444';

const ROLE_COLOR: Record<string, string> = {
    Artist: '#f94444',
    Label: '#3B82F6',
    Featured: '#7C3AED',
    Producer: '#D97706',
    Songwriter: '#16A34A',
};

const ShareBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = ACCENT }) => (
    <Box bg="gray.100" borderRadius="full" h="6px" w="full" overflow="hidden" minW="60px">
        <Box bg={color} h="full" w={`${Math.max(2, Math.min(100, pct))}%`} borderRadius="full" />
    </Box>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
        <Text fontSize="xs" fontWeight="semibold" color="gray.800" fontFamily="Poppins" mb={4}>
            {title}
        </Text>
        {children}
    </Box>
);

/** Royalties — net allocation analytics with a per-creator earnings drill-down. */
const RoyaltiesPage: React.FC = () => {
    const [preset, setPreset] = React.useState('30d');
    const range: DateRangeQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data, isLoading, error } = useRoyalties(range);
    const earnings = useFinanceEarnings({ ...range, page: 1, pageSize: 50 });
    const [artistId, setArtistId] = React.useState<string | null>(null);
    const [exporting, setExporting] = React.useState(false);
    const toast = useChakraToast();

    const currency = data?.currency ?? 'NGN';
    const totalRole = (data?.byRole ?? []).reduce((s, r) => s + r.allocatedMinor, 0);

    const kpis: KpiItem[] = [
        { label: 'Net royalties', value: formatMinorAmount(data?.totalNetMinor, currency), tone: 'success' },
        { label: 'Net coins', value: formatCount(data?.totalNetCoins) },
        { label: 'Creators', value: formatCount(data?.creatorCount), tone: 'info' },
        { label: 'Earnings counted', value: formatCount(data?.earningCount) },
    ];

    const topCreators = React.useMemo(
        () => [...(earnings.data?.items ?? [])].sort((a, b) => b.totalNetMinor - a.totalNetMinor).slice(0, 25),
        [earnings.data],
    );

    const creatorColumns: DataColumn<CreatorEarningSummary>[] = [
        {
            key: 'creator',
            header: 'Creator',
            render: (c) => <IdentityCell name={c.artistName} secondary={c.artistEmail ?? undefined} />,
        },
        {
            key: 'count',
            header: 'Earnings',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.600">
                    {formatCount(c.earningCount)}
                </Text>
            ),
        },
        {
            key: 'unwithdrawn',
            header: 'Unwithdrawn',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.500">
                    {formatMinorAmount(c.unwithdrawnMinor, c.currency)}
                </Text>
            ),
        },
        {
            key: 'net',
            header: 'Net royalties',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" fontWeight="semibold" color="#0F7B5C">
                    {formatMinorAmount(c.totalNetMinor, c.currency)}
                </Text>
            ),
        },
    ];

    const exportCsv = async () => {
        setExporting(true);
        try {
            await monetizationService.downloadCoinReport(range);
        } catch {
            toast.error('Export failed', 'Could not download the coin report.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <AdminPageLayout
            title="Royalties"
            subtitle="Net royalties allocated to creators and contributors — by role, with a per-creator drill-down."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Royalties' }]}
        >
            <HStack
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                px={4}
                py={3}
                justify="space-between"
                flexWrap="wrap"
                gap={2}
            >
                <HStack gap={2} flexWrap="wrap">
                    {RANGE_OPTIONS.map((o) => (
                        <Button
                            key={o.value}
                            size="xs"
                            fontSize="11px"
                            borderRadius="999px"
                            onClick={() => setPreset(o.value)}
                            bg={preset === o.value ? ACCENT : 'gray.50'}
                            color={preset === o.value ? 'white' : 'gray.600'}
                            border="1px solid"
                            borderColor={preset === o.value ? ACCENT : 'gray.200'}
                            _hover={{ bg: preset === o.value ? '#e53939' : 'gray.100' }}
                        >
                            {o.label}
                        </Button>
                    ))}
                </HStack>
                <Button
                    size="sm"
                    fontSize="xs"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    borderRadius="10px"
                    onClick={exportCsv}
                    loading={exporting}
                >
                    <FiDownload /> Export CSV
                </Button>
            </HStack>

            {error ? (
                <AdminError error={error} message="Could not load royalties." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={kpis} />

                    <Card title="Allocation by role">
                        {(data?.byRole ?? []).length === 0 ? (
                            <Text fontSize="xs" color="gray.400" py={6} textAlign="center">
                                No role-attributable royalties in the selected window.
                            </Text>
                        ) : (
                            <VStack align="stretch" gap={3.5}>
                                {data!.byRole.map((r: RoyaltiesByRoleDto) => {
                                    const pct = totalRole > 0 ? (r.allocatedMinor / totalRole) * 100 : 0;
                                    return (
                                        <Box key={r.role}>
                                            <HStack justify="space-between" mb={1.5}>
                                                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                                    {r.role}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                                    {formatMinorAmount(r.allocatedMinor, currency)}
                                                </Text>
                                            </HStack>
                                            <HStack gap={2}>
                                                <ShareBar pct={pct} color={ROLE_COLOR[r.role] ?? ACCENT} />
                                                <Text fontSize="10px" color="gray.400" minW="34px" textAlign="right">
                                                    {pct.toFixed(0)}%
                                                </Text>
                                            </HStack>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        )}
                    </Card>

                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={2} px={1}>
                            Top earning creators · click to inspect earnings & splits
                        </Text>
                        <DataTable
                            columns={creatorColumns}
                            rows={topCreators}
                            rowKey={(c) => c.artistId}
                            loading={earnings.isLoading && !earnings.data}
                            onRowClick={(c) => setArtistId(c.artistId)}
                            emptyIcon={FiUsers}
                            emptyTitle="No creator earnings"
                            emptyDescription="No creators earned royalties in the selected window."
                        />
                    </Box>
                </>
            )}

            <CreatorEarningsDrawer artistId={artistId} onClose={() => setArtistId(null)} />
        </AdminPageLayout>
    );
};

export default RoyaltiesPage;
