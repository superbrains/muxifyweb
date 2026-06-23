import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Button,
    Grid,
    Icon,
    Badge,
    Table,
    Skeleton,
    Flex,
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import { adsService } from '../services/adsService';
import { exportCsv, type CsvColumn } from '@/features/admin/lib/exportCsv';
import { formatNaira } from '@/shared/lib';
import type { AdReportDto, AdReportRowDto } from '../types';

const STATUS_COLORS: Record<string, string> = {
    Active: '#4ab58e',
    Paused: '#ffa800',
    Draft: '#7b91b0',
    PendingApproval: '#ffa800',
    Completed: '#7b91b0',
    Stopped: '#f94444',
    Rejected: '#f94444',
};

export const AdReport: React.FC = () => {
    const [data, setData] = useState<AdReportDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        adsService
            .getReport()
            .then((res) => !cancelled && setData(res))
            .catch(() => !cancelled && setData(null))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const rows = useMemo(() => data?.rows ?? [], [data]);

    const handleExport = () => {
        const columns: CsvColumn<AdReportRowDto>[] = [
            { header: 'Campaign', value: (r) => r.name },
            { header: 'Format', value: (r) => r.format },
            { header: 'Status', value: (r) => r.status },
            { header: 'Impressions', value: (r) => r.impressions },
            { header: 'Clicks', value: (r) => r.clicks },
            { header: 'CTR %', value: (r) => r.clickThroughRate },
            { header: 'Spend (NGN)', value: (r) => (r.spendMinor / 100).toFixed(2) },
            { header: 'CPC (NGN)', value: (r) => r.costPerClick },
            { header: 'CPI (NGN)', value: (r) => r.costPerImpression },
            { header: 'Start', value: (r) => new Date(r.startDate).toLocaleDateString('en-NG') },
            { header: 'End', value: (r) => (r.endDate ? new Date(r.endDate).toLocaleDateString('en-NG') : '') },
        ];
        exportCsv('ad-report', columns, rows);
    };

    return (
        <Box bg="gray.50" minH="100vh" p={6}>
            <VStack align="stretch" gap={6}>
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                    <VStack align="start" gap={0}>
                        <Text fontSize="xl" fontWeight="bold" color="gray.900">
                            Ad Report
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Performance across all your campaigns
                        </Text>
                    </VStack>
                    <Button
                        bg="primary.500"
                        color="white"
                        size="sm"
                        _hover={{ bg: 'primary.600' }}
                        onClick={handleExport}
                        disabled={loading || rows.length === 0}
                    >
                        <Icon as={FiDownload} mr={2} /> Export CSV
                    </Button>
                </Flex>

                {/* KPI strip */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <Kpi label="Total Impressions" value={loading ? null : (data?.totalImpressions ?? 0).toLocaleString()} />
                    <Kpi label="Total Clicks" value={loading ? null : (data?.totalClicks ?? 0).toLocaleString()} />
                    <Kpi label="Total Spend" value={loading ? null : formatNaira((data?.totalSpendMinor ?? 0) / 100, { compact: false })} accent />
                </Grid>

                {/* Table */}
                <Box bg="white" p={6} borderRadius="xl" overflowX="auto">
                    {loading ? (
                        <VStack align="stretch" gap={3}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} height="36px" borderRadius="md" />
                            ))}
                        </VStack>
                    ) : rows.length === 0 ? (
                        <VStack py={12} gap={2}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                No campaigns yet
                            </Text>
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                Create and publish a campaign — its performance will show up here once it starts serving.
                            </Text>
                        </VStack>
                    ) : (
                        <Table.Root size="sm" interactive>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader fontSize="xs">Campaign</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs">Format</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs">Status</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs" textAlign="end">Impressions</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs" textAlign="end">Clicks</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs" textAlign="end">CTR</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs" textAlign="end">Spend</Table.ColumnHeader>
                                    <Table.ColumnHeader fontSize="xs" textAlign="end">CPC</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {rows.map((r) => (
                                    <Table.Row key={r.campaignId}>
                                        <Table.Cell fontSize="sm" fontWeight="medium">{r.name}</Table.Cell>
                                        <Table.Cell fontSize="sm" textTransform="capitalize">{r.format}</Table.Cell>
                                        <Table.Cell>
                                            <Badge bg={STATUS_COLORS[r.status] ?? '#7b91b0'} color="white" fontSize="11px" px={2} py={0.5} borderRadius="full">
                                                {r.status}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell fontSize="sm" textAlign="end">{r.impressions.toLocaleString()}</Table.Cell>
                                        <Table.Cell fontSize="sm" textAlign="end">{r.clicks.toLocaleString()}</Table.Cell>
                                        <Table.Cell fontSize="sm" textAlign="end">{r.clickThroughRate.toFixed(2)}%</Table.Cell>
                                        <Table.Cell fontSize="sm" textAlign="end" fontWeight="semibold" color="primary.500">
                                            {formatNaira(r.spendMinor / 100, { compact: false })}
                                        </Table.Cell>
                                        <Table.Cell fontSize="sm" textAlign="end">{formatNaira(r.costPerClick, { compact: false })}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    )}
                </Box>
            </VStack>
        </Box>
    );
};

const Kpi: React.FC<{ label: string; value: string | null; accent?: boolean }> = ({ label, value, accent }) => (
    <Box bg="white" p={5} borderRadius="xl">
        <Text fontSize="xs" color="gray.500" mb={1}>
            {label}
        </Text>
        {value === null ? (
            <Skeleton height="28px" width="120px" />
        ) : (
            <Text fontSize="2xl" fontWeight="bold" color={accent ? 'primary.500' : 'gray.900'}>
                {value}
            </Text>
        )}
    </Box>
);

export default AdReport;
