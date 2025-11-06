import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Flex,
    Grid,
    Icon,
} from '@chakra-ui/react';
import { FiFilter, FiImage, FiVideo, FiMusic, FiMousePointer, FiEye } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import Chart from 'react-apexcharts';
import { useAdsStore } from '../store/useAdsStore';

export const AdsSpending: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const { campaigns } = useAdsStore();

    // Calculate spending data from campaigns
    const calculateSpending = () => {
        const audioSpending = campaigns
            .filter(c => c.type === 'audio')
            .reduce((sum, c) => sum + (c.budget || 0), 0);
        const photoSpending = campaigns
            .filter(c => c.type === 'photo')
            .reduce((sum, c) => sum + (c.budget || 0), 0);
        const videoSpending = campaigns
            .filter(c => c.type === 'video')
            .reduce((sum, c) => sum + (c.budget || 0), 0);

        return { audioSpending, photoSpending, videoSpending };
    };

    const { audioSpending, photoSpending, videoSpending } = calculateSpending();
    const totalSpending = audioSpending + photoSpending + videoSpending;
    const dailySpend = totalSpending / 7; // Mock daily calculation

    // Mock data for charts
    const spendingChartOptions = {
        chart: {
            type: 'bar' as const,
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
        },
        colors: ['#f94444', '#ffa800', '#f97316'],
        dataLabels: { enabled: false },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                endingShape: 'rounded',
                borderRadius: 4,
            },
        },
        xaxis: {
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            labels: {
                style: {
                    fontSize: '10px',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7b91b0'
                },
            },
        },
        yaxis: {
            min: 0,
            max: 45000,
            tickAmount: 5,
            labels: {
                style: {
                    fontSize: '10px',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7b91b0'
                },
                formatter: (value: number) => value >= 1000 ? (value / 1000) + 'k' : value.toString(),
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

    const spendingChartSeries = [
        {
            name: 'Audio Ads',
            data: [38000, 26000, 12000, 32000, 12000, 40000, 34000]
        },
        {
            name: 'Photo Ads',
            data: [34000, 18000, 44000, 42000, 4000, 20000, 20000]
        },
        {
            name: 'Video Ads',
            data: [20000, 6000, 19000, 12000, 11000, 9000, 15000]
        }
    ];

    const distributionChartOptions = {
        chart: {
            type: 'pie' as const,
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
        },
        colors: ['#f94444', '#ffa800', '#f97316'],
        labels: ['Audio Ads', 'Photo Ads', 'Video Ads'],
        legend: {
            position: 'bottom' as const,
            horizontalAlign: 'center' as const,
            fontSize: '10px',
            fontFamily: 'Manrope, sans-serif',
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
            style: {
                fontSize: '10px',
                fontFamily: 'Manrope, sans-serif',
            },
        },
    };

    const distributionChartSeries = [
        Math.round((audioSpending / totalSpending) * 100) || 50,
        Math.round((photoSpending / totalSpending) * 100) || 10.5,
        Math.round((videoSpending / totalSpending) * 100) || 25,
    ];

    const timeTabs = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
    ];

    // Mock spending actions data
    const clicks = 25000;
    const views = 100000;
    const clicksCost = 35000;
    const viewsCost = 75000;
    const totalActions = clicksCost + viewsCost;

    return (
        <Box bg="gray.50" minH="100vh" p={6}>
            <VStack align="stretch" gap={6}>
                {/* Top Section - Tabs and Metrics */}
                <Box bg="white" p={6} borderRadius="xl">
                    <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
                        <AnimatedTabs
                            tabs={timeTabs}
                            activeTab={timeFilter}
                            onTabChange={(tab) => setTimeFilter(tab as typeof timeFilter)}
                            size="sm"
                            backgroundColor="gray.200"
                            selectedColor="primary.500"
                            textColor="black"
                            selectedTextColor="white"
                            tabStyle={1}
                        />
                        <HStack gap={4}>
                            <Button
                                variant="outline"
                                size="sm"
                                fontSize="xs"
                                borderColor="gray.300"
                                _hover={{ bg: 'gray.50' }}
                            >
                                <Icon as={FiFilter} mr={1.5} /> Filter Duration
                            </Button>
                            <VStack align="end" gap={0}>
                                <Text fontSize="xs" color="gray.600">Daily Spend</Text>
                                <Text fontSize="lg" fontWeight="bold" color="black">
                                    N{dailySpend.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <VStack align="end" gap={0}>
                                <Text fontSize="xs" color="gray.600">Total Expenditure</Text>
                                <Text fontSize="lg" fontWeight="bold" color="black">
                                    N{totalSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                        </HStack>
                    </Flex>
                </Box>

                {/* Charts Section */}
                <Grid templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }} gap={6}>
                    {/* Advert Spending Chart */}
                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                            Advert Spending
                        </Text>
                        <Chart
                            options={spendingChartOptions}
                            series={spendingChartSeries}
                            type="bar"
                            width="100%"
                            height={350}
                        />
                    </Box>

                    {/* Distribution Chart */}
                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                            Distribution
                        </Text>
                        <Chart
                            options={distributionChartOptions}
                            series={distributionChartSeries}
                            type="pie"
                            width="100%"
                            height={350}
                        />
                    </Box>
                </Grid>

                {/* Bottom Section - Spending Allocation and Actions */}
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                    {/* Spending Allocation */}
                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                            Spending Allocation
                        </Text>
                        <HStack gap={4} justify="space-between">
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="md"
                                    bg="gray.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={FiImage} boxSize={6} color="gray.600" />
                                </Box>
                                <Text fontSize="xs" color="gray.600">Photo Ad</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    N{photoSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <Box h="16" w="1px" bg="gray.200" />
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="md"
                                    bg="gray.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={FiVideo} boxSize={6} color="gray.600" />
                                </Box>
                                <Text fontSize="xs" color="gray.600">Video Ad</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    N{videoSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <Box h="16" w="1px" bg="gray.200" />
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="md"
                                    bg="gray.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={FiMusic} boxSize={6} color="gray.600" />
                                </Box>
                                <Text fontSize="xs" color="gray.600">Audio Ad</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    N{audioSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>

                    {/* Spending Actions */}
                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={2}>
                            Spending Actions
                        </Text>
                        <Text fontSize="xs" color="gray.600" mb={4}>
                            {clicks.toLocaleString()} + {views.toLocaleString()} = N{totalActions.toLocaleString()}.00
                        </Text>
                        <HStack gap={4} justify="space-between">
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="md"
                                    bg="gray.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={FiMousePointer} boxSize={6} color="gray.600" />
                                </Box>
                                <Text fontSize="xs" color="gray.600">Clicks</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    {clicks.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" fontWeight="bold" color="#f94444">
                                    N{clicksCost.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <Box h="16" w="1px" bg="gray.200" />
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={12}
                                    h={12}
                                    borderRadius="md"
                                    bg="gray.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={FiEye} boxSize={6} color="gray.600" />
                                </Box>
                                <Text fontSize="xs" color="gray.600">Views</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    {views.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" fontWeight="bold" color="#f94444">
                                    N{viewsCost.toLocaleString()}.00
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>
                </Grid>
            </VStack>
        </Box>
    );
};

export default AdsSpending;

