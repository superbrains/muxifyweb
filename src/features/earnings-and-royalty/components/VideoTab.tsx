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
} from '@chakra-ui/react';
import Chart from 'react-apexcharts';
import { AnimatedTabs } from '@shared/components/AnimatedTabs';
import { formatNaira } from '@shared/utils';
import { earningsService } from '../services/earningsService';
import type { EarningsSummaryDto, EarningsHistoryDto, DashboardAnalyticsDto, EarningDto } from '../types';
import { getEarningTypeLabel } from '../types';

// Helper functions
const mapTimeFilterToPeriod = (filter: string): string => {
    switch (filter) {
        case 'daily': return '7d';
        case 'weekly': return '30d';
        case 'monthly': return '90d';
        case 'yearly': return '12m';
        default: return '30d';
    }
};

const calculateChartPercentages = (summary: EarningsSummaryDto | null) => {
    if (!summary) return [0, 0, 0];
    const total = summary.giftEarnings + summary.contentUnlockEarnings +
        summary.streamingEarnings + summary.bonusEarnings;
    if (total === 0) return [0, 0, 0];
    return [
        Math.round((summary.contentUnlockEarnings / total) * 100),
        Math.round((summary.giftEarnings / total) * 100),
        Math.round(((summary.streamingEarnings + summary.bonusEarnings) / total) * 100)
    ];
};

const mapHistoryToCommissionData = (earnings: EarningDto[]) =>
    earnings.map((e, i) => ({
        id: i + 1,
        type: getEarningTypeLabel(e.type) + ' Commission',
        source: e.description || 'N/A',
        date: new Date(e.earnedAt).toLocaleDateString(),
        amount: formatNaira(e.amountInSmallestUnit)
    }));

export const VideoTab: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [commissionFilter, setCommissionFilter] = useState<'all' | 'gifts' | 'sponsorship' | 'unlock'>('all');

    // API State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<EarningsSummaryDto | null>(null);
    const [history, setHistory] = useState<EarningsHistoryDto | null>(null);
    const [analytics, setAnalytics] = useState<DashboardAnalyticsDto | null>(null);

    // Fetch data on mount and when timeFilter changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [summaryRes, historyRes, analyticsRes] = await Promise.all([
                    earningsService.getSummary(),
                    earningsService.getHistory({ pageSize: 20 }),
                    earningsService.getAnalytics(mapTimeFilterToPeriod(timeFilter))
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
    }, [timeFilter]);

    // Derived values from API data
    const unlockTotalAmount = summary?.contentUnlockEarnings ?? 0;
    const giftingTotalAmount = summary?.giftEarnings ?? 0;
    const commissionTotalAmount = (summary?.streamingEarnings ?? 0) + (summary?.bonusEarnings ?? 0);

    const chartPercentages = useMemo(() => calculateChartPercentages(summary), [summary]);
    const unlockChartSeries = chartPercentages;
    const giftingChartSeries = chartPercentages;
    const commissionChartSeries = chartPercentages;
    const pieChartSeries = chartPercentages;

    // Map commission data from API
    const commissionData = useMemo(() =>
        history?.earnings ? mapHistoryToCommissionData(history.earnings) : [],
        [history]
    );

    // Map activity chart data from API
    const activityChartCategories = useMemo(() =>
        analytics?.giftEarningsChart?.data?.map(d => d.label) ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        [analytics]
    );

    const activityChartSeries = useMemo(() => [
        {
            name: 'Gifts',
            data: analytics?.giftEarningsChart?.data?.map(d => d.value) ?? []
        },
        {
            name: 'Unlocked',
            data: analytics?.unlockEarningsChart?.data?.map(d => d.value) ?? []
        },
        {
            name: 'Commission',
            data: analytics?.otherEarningsChart?.data?.map(d => d.value) ?? []
        }
    ], [analytics]);

    const pieChartLabels = ['Unlocking', 'Gifting', 'Commission'];

    // Donut Chart Options for Unlock
    const unlockChartOptions = {
        chart: {
            type: 'donut' as const,
            height: 200,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout' as const,
                speed: 800,
            }
        },
        responsive: [{
            breakpoint: undefined,
            options: {
                chart: {
                    width: '100%'
                }
            }
        }],
        colors: ['#EF4444', '#3B82F6', '#F97316'],
        dataLabels: {
            enabled: false,
        },
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
                            formatter: function () {
                                return formatNaira(unlockTotalAmount);
                            },
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Today Earnings',
                            fontSize: '10px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 300,
                            color: '#6B7280',
                        },
                    },
                },
            },
        },
    };

    // Donut Chart Options for Gifting
    const giftingChartOptions = {
        ...unlockChartOptions,
        colors: ['#3B82F6', '#EF4444', '#8B5CF6'],
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
                            formatter: function () {
                                return formatNaira(giftingTotalAmount);
                            },
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Today Earnings',
                            fontSize: '11px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 300,
                            color: '#6B7280',
                        },
                    },
                },
            },
        },
    };

    // Donut Chart Options for Commission
    const commissionChartOptions = {
        ...unlockChartOptions,
        colors: ['#10B981', '#3B82F6', '#F97316'],
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
                            formatter: function () {
                                return formatNaira(commissionTotalAmount);
                            },
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Today Earnings',
                            fontSize: '11px',
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 300,
                            color: '#6B7280',
                        },
                    },
                },
            },
        },
    };

    // Pie Chart Options for Overall Earnings
    const pieChartOptions = {
        chart: {
            type: 'pie' as const,
            height: 300,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout' as const,
                speed: 800,
            }
        },
        responsive: [{
            breakpoint: undefined,
            options: {
                chart: {
                    width: '100%'
                }
            }
        }],
        colors: ['#EF4444', '#3B82F6', '#10B981'],
        labels: pieChartLabels,
        dataLabels: {
            enabled: true,
            formatter: function (val: string, opts: { w: { config: { labels: string[] } }, seriesIndex: number }) {
                const seriesName = opts.w.config.labels[opts.seriesIndex];
                return val + "%\n" + seriesName;
            },
            style: {
                fontSize: '10px',
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
            },
            offsetY: 0,
        },
        legend: {
            show: false,
        },
    };

    // Activity Insights Line Chart
    const activityChartOptions = {
        chart: {
            type: 'line' as const,
            height: 300,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout' as const,
                speed: 800,
            }
        },
        responsive: [{
            breakpoint: undefined,
            options: {
                chart: {
                    width: '100%'
                }
            }
        }],
        colors: ['#3B82F6', '#F97316', '#10B981'],
        stroke: {
            width: 3,
            curve: 'smooth' as const,
            lineCap: 'round' as const,
        },
        markers: {
            size: 0,
            hover: {
                size: 6
            }
        },
        xaxis: {
            categories: activityChartCategories,
            labels: {
                style: {
                    fontSize: '12px',
                    cssClass: 'apexcharts-xaxis-label',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7B91B0'
                },
            },
        },
        yaxis: {
            min: 0,
            max: 400,
            tickAmount: 4,
            labels: {
                style: {
                    fontSize: '12px',
                    cssClass: 'apexcharts-yaxis-label',
                    fontFamily: 'Poppins, sans-serif',
                    color: '#7B91B0'
                },
            },
        },
        legend: {
            position: 'bottom' as const,
            horizontalAlign: 'center' as const,
            fontSize: '10px',
            fontFamily: 'Manrope, sans-serif',
        },
        grid: {
            show: true,
            strokeDashArray: 3,
        },
    };

    const filteredCommissionData = commissionFilter === 'all'
        ? commissionData
        : commissionData.filter(item =>
            item.type.toLowerCase().includes(commissionFilter.toLowerCase())
        );

    // Loading state
    if (loading) {
        return (
            <Center py={20} bg="white" borderBottomRadius="xl">
                <VStack gap={4}>
                    <Spinner size="xl" color="red.500" thickness="4px" />
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
                            {formatNaira(summary?.earningsThisMonth ?? 0)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Earnings This Period
                        </Text>
                    </VStack>
                    <VStack align="start" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {formatNaira(summary?.totalEarnedAmount ?? 0)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Earnings (All Time)
                        </Text>
                    </VStack>
                </Box>
            </Flex>

            {/* Donut Charts Row */}
            <Grid templateColumns={{ base: "1fr", sm: "1fr", md: "repeat(3, 1fr)" }} gap={4} w="full" maxW="100%" overflow="hidden">
                {/* Unlock Chart */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Unlock
                        </Text>
                        <Box w="100%" minW={0}>
                            <Chart
                                options={unlockChartOptions}
                                series={unlockChartSeries}
                                type="donut"
                                width="100%"
                                height={200}
                            />
                        </Box>
                    </VStack>
                </Box>

                {/* Gifting Chart */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Gifting
                        </Text>
                        <Box w="100%" minW={0}>
                            <Chart
                                options={giftingChartOptions}
                                series={giftingChartSeries}
                                type="donut"
                                width="100%"
                                height={200}
                            />
                        </Box>
                    </VStack>
                </Box>

                {/* Commission Chart */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={3}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Commission
                        </Text>
                        <Box w="100%" minW={0}>
                            <Chart
                                options={commissionChartOptions}
                                series={commissionChartSeries}
                                type="donut"
                                width="100%"
                                height={200}
                            />
                        </Box>
                    </VStack>
                </Box>
            </Grid>

            {/* Pie Chart and Activity Insights */}
            <Grid templateColumns={{ base: "1fr", lg: "3.4fr 7fr" }} gap={4} w="full" maxW="100%" overflow="hidden">
                {/* Overall Earnings Pie Chart */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={4}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Overall Earnings Breakdown
                        </Text>
                        <Box w="100%">
                            <Chart
                                options={pieChartOptions}
                                series={pieChartSeries}
                                type="pie"
                                width="100%"
                                height={250}
                            />
                        </Box>
                    </VStack>
                </Box>

                {/* Activity Insights Line Chart */}
                <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200" minW={0}>
                    <VStack gap={4}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Activity Insights
                        </Text>
                        <Box w="100%">
                            <Chart
                                options={activityChartOptions}
                                series={activityChartSeries}
                                type="line"
                                width="100%"
                                height={250}
                            />
                        </Box>
                    </VStack>
                </Box>
            </Grid>

            {/* Bottom Section - Commission Earnings Table */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
                <VStack align="stretch" gap={0}>
                    {/* Table Header */}
                    <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.200">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Commission Earnings
                        </Text>
                        <HStack gap={4}>
                            {/* Filter Tabs */}
                            <AnimatedTabs
                                tabs={[
                                    { id: 'all', label: 'All' },
                                    { id: 'gifts', label: 'Gifts' },
                                    { id: 'sponsorship', label: 'Sponsorship' },
                                    { id: 'unlock', label: 'Unlock' },
                                ]}
                                activeTab={commissionFilter}
                                onTabChange={(tabId) => setCommissionFilter(tabId as 'all' | 'gifts' | 'sponsorship' | 'unlock')}
                                size="sm"
                                selectedColor="red.500"
                            />
                            {/* Dropdown */}
                            <Box
                                as="select"
                                w="120px"
                                fontSize="12px"
                                p={2}
                                border="1px solid"
                                borderColor="gray.300"
                                borderRadius="md"
                                bg="white"
                                _focus={{ borderColor: "primary.500", outline: "none" }}
                                defaultValue="latest"
                            >
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                                <option value="amount">Amount</option>
                            </Box>
                        </HStack>
                    </Flex>

                    {/* Table */}
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
                            {filteredCommissionData.map((item, index) => (
                                <Box as="tr" key={item.id} _hover={{ bg: 'gray.50' }}>
                                    <Box as="td" fontSize="12px" color="gray.600" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                        {String(index + 1).padStart(2, '0')}
                                    </Box>
                                    <Box as="td" fontSize="12px" color="gray.900" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                        {item.type}
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
                            ))}
                        </Box>
                    </Box>
                </VStack>
            </Box>
        </VStack>
    );
};

export default VideoTab;
