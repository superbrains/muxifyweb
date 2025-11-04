import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
} from '@chakra-ui/react';
import Chart from 'react-apexcharts';
import { AnimatedTabs } from '@shared/components/AnimatedTabs';
import { formatNaira } from '@shared/utils';

export const VideoTab: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [commissionFilter, setCommissionFilter] = useState<'all' | 'gifts' | 'sponsorship' | 'unlock'>('all');

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

    const unlockChartSeries = [65, 25, 10];
    const unlockTotalAmount = 374384348; // Example amount in kobo

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

    const giftingChartSeries = [70, 20, 10];
    const giftingTotalAmount = 425000000; // Example amount in kobo

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

    const commissionChartSeries = [60, 25, 15];
    const commissionTotalAmount = 298500000; // Example amount in kobo

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

    const pieChartSeries = [50, 25, 10.5];

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
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
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

    const activityChartSeries = [
        {
            name: 'Gifts',
            data: [280, 260, 220, 180, 140, 120, 140, 200, 280, 360, 390, 380]
        },
        {
            name: 'Unlocked',
            data: [300, 360, 390, 395, 380, 340, 280, 240, 240, 280, 340, 380]
        },
        {
            name: 'Commission',
            data: [290, 330, 365, 380, 360, 310, 250, 220, 250, 300, 350, 380]
        }
    ];

    // Commission data for video
    const commissionData = [
        { id: 1, type: 'Gift Commission', source: 'Sabinus vs Food', date: '26/8/2025', amount: formatNaira(50000) },
        { id: 2, type: 'Unlock Commission', source: 'Where is Sabinus', date: '26/8/2025', amount: formatNaira(50000) },
        { id: 3, type: 'Sponsorship Commission', source: 'Professor Sabinus', date: '26/8/2025', amount: formatNaira(50000) },
        { id: 4, type: 'Unlock Commission', source: 'Driver Sabinus', date: '26/8/2025', amount: formatNaira(50000) },
        { id: 5, type: 'Sponsorship Commission', source: 'Sabinus Real Estate Agent', date: '26/8/2025', amount: formatNaira(50000) },
        { id: 6, type: 'Gift Commission', source: 'Mechanic Sabinus', date: '26/8/2025', amount: formatNaira(50000) },
        { id: 7, type: 'Unlock Commission', source: 'Banker Sabinus', date: '26/8/2025', amount: formatNaira(50000) },
    ];

    const filteredCommissionData = commissionFilter === 'all'
        ? commissionData
        : commissionData.filter(item =>
            item.type.toLowerCase().includes(commissionFilter.toLowerCase())
        );

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
                <VStack align="end" gap={1}>
                    <Text fontSize="xs" color="red.500" fontWeight="bold">
                        {formatNaira(25550000)} Total Earning Today
                    </Text>
                    <Text fontSize="11px" color="gray.900">
                        {formatNaira(100000000)} Total Earning Today
                    </Text>
                </VStack>
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

