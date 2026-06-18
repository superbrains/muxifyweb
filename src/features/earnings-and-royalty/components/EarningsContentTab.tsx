import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
    Spinner,
    Center,
    chakra,
} from '@chakra-ui/react';
import Chart from 'react-apexcharts';
import { AnimatedTabs } from '@shared/components/AnimatedTabs';
import { formatNaira } from '@shared/utils';
import { earningsService } from '../services/earningsService';
import type { EarningsSummaryDto, EarningsHistoryDto, DashboardAnalyticsDto, EarningDto, ChartSeriesDto } from '../types';

// Maps the UI period tabs to the analytics endpoint's period codes.
const mapTimeFilterToPeriod = (filter: string): string => {
    switch (filter) {
        case 'daily': return '7d';
        case 'weekly': return '30d';
        case 'monthly': return '90d';
        case 'yearly': return '12m';
        default: return '30d';
    }
};

// Short, human label for the active period (used in donut centers).
const periodLabel = (filter: string): string => {
    switch (filter) {
        case 'daily': return 'Last 7 Days';
        case 'weekly': return 'Last 30 Days';
        case 'monthly': return 'Last 90 Days';
        case 'yearly': return 'Last 12 Months';
        default: return 'This Period';
    }
};

const sumSeries = (s?: ChartSeriesDto): number =>
    (s?.data ?? []).reduce((acc, d) => acc + (d.value ?? 0), 0);

// Backend serializes EarningType as PascalCase (Gift, ContentUnlock, Streaming, Bonus, Referral).
const earningLabel = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'gift': return 'Gift';
        case 'contentunlock':
        case 'unlock': return 'Content Unlock';
        case 'streaming': return 'Streaming';
        case 'bonus': return 'Bonus';
        case 'referral': return 'Referral';
        default: return type;
    }
};

type EarningCategory = 'gifts' | 'unlock' | 'other';

const earningCategory = (type: string): EarningCategory => {
    const t = type.toLowerCase();
    if (t === 'gift') return 'gifts';
    if (t === 'contentunlock' || t === 'unlock') return 'unlock';
    return 'other'; // streaming, bonus, referral
};

type CommissionRow = {
    id: string;
    label: string;
    category: EarningCategory;
    source: string;
    date: string;
    earnedAt: string;
    amount: string;
    rawAmount: number;
};

const mapHistoryToCommissionRows = (earnings: EarningDto[]): CommissionRow[] =>
    earnings.map((e) => ({
        id: e.id,
        label: earningLabel(e.type),
        category: earningCategory(e.type),
        source: e.description || 'N/A',
        date: new Date(e.earnedAt).toLocaleDateString(),
        earnedAt: e.earnedAt,
        amount: formatNaira(e.netAmountDisplay),
        rawAmount: e.netAmountDisplay,
    }));

type CommissionFilter = 'all' | 'gifts' | 'unlock' | 'other';
type SortOption = 'latest' | 'oldest' | 'amount';

interface EarningsContentTabProps {
    /** Drives the backend content-type filter and which donut/figures are shown. */
    mediaType: 'Music' | 'Video';
}

/**
 * Shared body for the Music and Video earnings tabs. Every chart, donut and
 * figure is wired to the backend and recomputes whenever the period tab or the
 * media type changes. Music/Video are kept identical by sharing this component.
 */
export const EarningsContentTab: React.FC<EarningsContentTabProps> = ({ mediaType }) => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [commissionFilter, setCommissionFilter] = useState<CommissionFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('latest');

    // API State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<EarningsSummaryDto | null>(null);
    const [history, setHistory] = useState<EarningsHistoryDto | null>(null);
    const [analytics, setAnalytics] = useState<DashboardAnalyticsDto | null>(null);

    // Fetch data on mount and whenever the period or media type changes.
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [summaryRes, historyRes, analyticsRes] = await Promise.all([
                    earningsService.getSummary(mediaType),
                    earningsService.getHistory({ pageSize: 20 }, mediaType),
                    earningsService.getAnalytics(mapTimeFilterToPeriod(timeFilter), mediaType),
                ]);
                setSummary(summaryRes.data);
                setHistory(historyRes.data);
                setAnalytics(analyticsRes.data);
            } catch (err) {
                setError('Failed to load earnings data');
                console.error('Error fetching earnings data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeFilter, mediaType]);

    // Per-stream earnings for the SELECTED PERIOD, in Naira (the analytics chart
    // values are already net amounts in Naira). These drive the donuts and pie so
    // the whole page responds to the Daily/Weekly/Monthly/Yearly filter.
    const periodUnlock = useMemo(() => sumSeries(analytics?.unlockEarningsChart), [analytics]);
    const periodGift = useMemo(() => sumSeries(analytics?.giftEarningsChart), [analytics]);
    const periodCommission = useMemo(() => sumSeries(analytics?.otherEarningsChart), [analytics]);

    const centerLabel = periodLabel(timeFilter);

    // Activity Insights line chart (already period-accurate from analytics).
    const activityChartCategories = useMemo(
        () => analytics?.giftEarningsChart?.data?.map(d => d.label) ?? [],
        [analytics]
    );

    const activityChartSeries = useMemo(() => [
        { name: 'Gifts', data: analytics?.giftEarningsChart?.data?.map(d => d.value) ?? [] },
        { name: 'Unlocked', data: analytics?.unlockEarningsChart?.data?.map(d => d.value) ?? [] },
        { name: 'Commission', data: analytics?.otherEarningsChart?.data?.map(d => d.value) ?? [] },
    ], [analytics]);

    // --- Donut charts: each shows ONE revenue stream vs the rest -------------
    const STREAM_COLOR = { unlock: '#EF4444', gifting: '#3B82F6', commission: '#10B981' };
    const OTHER_COLOR = '#E5E7EB';

    const makeDonutOptions = (label: string, amount: number, color: string) => ({
        chart: {
            type: 'donut' as const,
            height: 200,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            animations: { enabled: true, easing: 'easeinout' as const, speed: 800 },
        },
        responsive: [{ breakpoint: undefined, options: { chart: { width: '100%' } } }],
        colors: [color, OTHER_COLOR],
        labels: [label, 'Other'],
        dataLabels: { enabled: false },
        legend: {
            position: 'bottom' as const,
            horizontalAlign: 'center' as const,
            fontSize: '10px',
            fontFamily: 'Manrope, sans-serif',
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 600,
                            color: '#374151',
                        },
                        value: {
                            show: true,
                            fontSize: '14px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 700,
                            color: '#111827',
                            formatter: () => formatNaira(amount),
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: centerLabel,
                            fontSize: '10px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 300,
                            color: '#6B7280',
                            formatter: () => formatNaira(amount),
                        },
                    },
                },
            },
        },
    });

    const unlockChartOptions = makeDonutOptions('Unlock', periodUnlock, STREAM_COLOR.unlock);
    const giftingChartOptions = makeDonutOptions('Gifting', periodGift, STREAM_COLOR.gifting);
    const commissionChartOptions = makeDonutOptions('Commission', periodCommission, STREAM_COLOR.commission);

    const unlockChartSeries = [periodUnlock, periodGift + periodCommission];
    const giftingChartSeries = [periodGift, periodUnlock + periodCommission];
    const commissionChartSeries = [periodCommission, periodUnlock + periodGift];

    // --- Overall breakdown pie ----------------------------------------------
    const pieChartLabels = ['Unlocking', 'Gifting', 'Commission'];
    const pieChartSeries = [periodUnlock, periodGift, periodCommission];

    const pieChartOptions = {
        chart: {
            type: 'pie' as const,
            height: 300,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            animations: { enabled: true, easing: 'easeinout' as const, speed: 800 },
        },
        responsive: [{ breakpoint: undefined, options: { chart: { width: '100%' } } }],
        colors: [STREAM_COLOR.unlock, STREAM_COLOR.gifting, STREAM_COLOR.commission],
        labels: pieChartLabels,
        dataLabels: {
            enabled: true,
            formatter: function (val: string, opts: { w: { config: { labels: string[] } }, seriesIndex: number }) {
                const seriesName = opts.w.config.labels[opts.seriesIndex];
                return val + "%\n" + seriesName;
            },
            style: { fontSize: '10px', fontFamily: 'Manrope, sans-serif', fontWeight: 600 },
            offsetY: 0,
        },
        legend: { show: false },
        // When there is no data ApexCharts renders an empty pie; the noData label keeps it readable.
        noData: { text: 'No earnings for this period' },
    };

    // --- Activity Insights line chart ---------------------------------------
    const activityChartOptions = {
        chart: {
            type: 'line' as const,
            height: 300,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            animations: { enabled: true, easing: 'easeinout' as const, speed: 800 },
        },
        responsive: [{ breakpoint: undefined, options: { chart: { width: '100%' } } }],
        colors: ['#3B82F6', '#F97316', '#10B981'],
        stroke: { width: 3, curve: 'smooth' as const, lineCap: 'round' as const },
        markers: { size: 0, hover: { size: 6 } },
        xaxis: {
            categories: activityChartCategories,
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Manrope, sans-serif',
                    cssClass: 'apexcharts-xaxis-label',
                    color: '#7B91B0',
                },
            },
        },
        // Auto-scale the y-axis so real earnings are never clipped (was hard-capped at 400).
        yaxis: {
            min: 0,
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Poppins, sans-serif',
                    cssClass: 'apexcharts-yaxis-label',
                    color: '#7B91B0',
                },
                formatter: (val: number) => formatNaira(Math.round(val)),
            },
        },
        legend: {
            position: 'bottom' as const,
            horizontalAlign: 'center' as const,
            fontSize: '10px',
            fontFamily: 'Manrope, sans-serif',
        },
        grid: { show: true, strokeDashArray: 3 },
    };

    // --- Commission table ----------------------------------------------------
    const commissionRows = useMemo(
        () => (history?.earnings ? mapHistoryToCommissionRows(history.earnings) : []),
        [history]
    );

    const visibleRows = useMemo(() => {
        const filtered = commissionFilter === 'all'
            ? commissionRows
            : commissionRows.filter(r => r.category === commissionFilter);
        const sorted = [...filtered];
        switch (sortBy) {
            case 'oldest':
                sorted.sort((a, b) => new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime());
                break;
            case 'amount':
                sorted.sort((a, b) => b.rawAmount - a.rawAmount);
                break;
            case 'latest':
            default:
                sorted.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
                break;
        }
        return sorted;
    }, [commissionRows, commissionFilter, sortBy]);

    // Loading state
    if (loading) {
        return (
            <Center py={20} bg="white" borderBottomRadius="xl">
                <VStack gap={4}>
                    <Spinner size="xl" color="red.500" borderWidth="4px" />
                    <Text color="gray.600">Loading earnings data...</Text>
                </VStack>
            </Center>
        );
    }

    // Error state
    if (error) {
        return (
            <Center py={20} bg="white" borderBottomRadius="xl">
                <VStack gap={4}>
                    <Text color="red.500" fontSize="lg" fontWeight="semibold">Error</Text>
                    <Text color="gray.600">{error}</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <VStack gap={6} align="stretch" bg="white" borderBottomRadius="xl" p={4}>
            {/* Time Filter Tabs and Total Earnings */}
            <Flex justify="space-between" align="center" w="full">
                <AnimatedTabs
                    tabs={[
                        { id: 'daily', label: 'Daily' },
                        { id: 'weekly', label: 'Weekly' },
                        { id: 'monthly', label: 'Monthly' },
                        { id: 'yearly', label: 'Yearly' },
                    ]}
                    activeTab={timeFilter}
                    onTabChange={(tabId) => setTimeFilter(tabId as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    size="sm"
                    selectedColor="red.500"
                />
                <Box display="flex" gap={4}>
                    <VStack align="start" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {formatNaira(analytics?.totalEarningsDisplay ?? 0)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Earnings This Period
                        </Text>
                    </VStack>
                    <VStack align="start" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {formatNaira(summary?.totalEarnedDisplay ?? 0)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Earnings (All Time)
                        </Text>
                    </VStack>
                </Box>
            </Flex>

            {/* Donut Charts Row */}
            <Grid templateColumns={{ base: "1fr", sm: "1fr", md: "repeat(3, 1fr)" }} gap={4} w="full" maxW="100%" overflow="hidden">
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">Unlock</Text>
                        <Box w="100%" minW={0}>
                            <Chart options={unlockChartOptions} series={unlockChartSeries} type="donut" width="100%" height={200} />
                        </Box>
                    </VStack>
                </Box>

                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">Gifting</Text>
                        <Box w="100%" minW={0}>
                            <Chart options={giftingChartOptions} series={giftingChartSeries} type="donut" width="100%" height={200} />
                        </Box>
                    </VStack>
                </Box>

                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">Commission</Text>
                        <Box w="100%" minW={0}>
                            <Chart options={commissionChartOptions} series={commissionChartSeries} type="donut" width="100%" height={200} />
                        </Box>
                    </VStack>
                </Box>
            </Grid>

            {/* Pie Chart and Activity Insights */}
            <Grid templateColumns={{ base: "1fr", lg: "3.4fr 7fr" }} gap={4} w="full" maxW="100%" overflow="hidden">
                <Box p={4} minW={0}>
                    <VStack gap={4}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">Overall Earnings Breakdown</Text>
                        <Box w="100%">
                            <Chart options={pieChartOptions} series={pieChartSeries} type="pie" width="100%" height={250} />
                        </Box>
                    </VStack>
                </Box>

                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={4}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">Activity Insights</Text>
                        <Box w="100%">
                            <Chart options={activityChartOptions} series={activityChartSeries} type="line" width="100%" height={250} />
                        </Box>
                    </VStack>
                </Box>
            </Grid>

            {/* Bottom Section - Commission Earnings Table */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
                <VStack align="stretch" gap={0}>
                    <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.200">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">Commission Earnings</Text>
                        <HStack gap={4}>
                            <AnimatedTabs
                                tabs={[
                                    { id: 'all', label: 'All' },
                                    { id: 'gifts', label: 'Gifts' },
                                    { id: 'unlock', label: 'Unlocks' },
                                    { id: 'other', label: 'Other' },
                                ]}
                                activeTab={commissionFilter}
                                onTabChange={(tabId) => setCommissionFilter(tabId as CommissionFilter)}
                                size="sm"
                                selectedColor="red.500"
                            />
                            <chakra.select
                                w="120px"
                                fontSize="12px"
                                p={2}
                                border="1px solid"
                                borderColor="gray.300"
                                borderRadius="md"
                                bg="white"
                                _focus={{ borderColor: "primary.500", outline: "none" }}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                            >
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                                <option value="amount">Amount</option>
                            </chakra.select>
                        </HStack>
                    </Flex>

                    <Box as="table" w="100%" borderCollapse="separate" borderSpacing="0">
                        <Box as="thead" bg="red.500">
                            <Box as="tr">
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">No.</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Earning Type</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Source</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Date</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Amount</Box>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {visibleRows.length === 0 ? (
                                <Box as="tr">
                                    <Box as="td" {...{ colSpan: 5 }} fontSize="13px" color="gray.500" textAlign="center" py={8}>
                                        No earnings to show for this selection.
                                    </Box>
                                </Box>
                            ) : (
                                visibleRows.map((item, index) => (
                                    <Box as="tr" key={item.id} _hover={{ bg: 'gray.50' }}>
                                        <Box as="td" fontSize="12px" color="gray.600" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                            {String(index + 1).padStart(2, '0')}
                                        </Box>
                                        <Box as="td" fontSize="12px" color="gray.900" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                            {item.label}
                                        </Box>
                                        <Box as="td" fontSize="12px" color="gray.900" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                            {item.source}
                                        </Box>
                                        <Box as="td" fontSize="12px" color="gray.600" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                            {item.date}
                                        </Box>
                                        <Box as="td" fontSize="12px" color="gray.900" fontWeight="semibold" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                            {item.amount}
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                </VStack>
            </Box>
        </VStack>
    );
};

export default EarningsContentTab;
