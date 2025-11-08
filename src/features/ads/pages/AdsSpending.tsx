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
import { FiFilter } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import Chart from 'react-apexcharts';
import { useAdsStore } from '../store/useAdsStore';
import { formatCurrency } from '@/shared/lib';
import { ClickFilledIcon, EyeFilledIcon, GalleryIcon, MusicFilledIcon, VideoPlayIcon } from '@/shared/icons/CustomIcons';

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
                borderRadius: 1,
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

                        <HStack gap={4}>
                            <AnimatedTabs
                                tabs={timeTabs}
                                activeTab={timeFilter}
                                onTabChange={(tab) => setTimeFilter(tab as typeof timeFilter)}
                                size="sm"
                                backgroundColor="gray.100"
                                selectedColor="primary.500"
                                textColor="black"
                                selectedTextColor="white"
                                tabStyle={1}
                            />

                            <Button
                                variant="outline"
                                borderWidth="1px"
                                borderColor="gray.blue.200"
                                bg="white"
                                size="xs"
                                fontSize="10px"
                                h="28px"
                                _hover={{
                                    bg: "gray.50",
                                    borderColor: "gray.blue.300"
                                }}
                                rounded="5px"
                                className='text-[#9cb1c5]'
                                color="gray.blue.800"
                                gap={2}
                            >
                                <Icon as={FiFilter} mr={1.5} /> Filter Duration
                            </Button>

                        </HStack>

                        <HStack gap={6}>
                            <VStack align="end" gap={1}>
                                <Text fontSize="lg" color="red.500" fontWeight="bold">
                                    {formatCurrency(dailySpend)}
                                </Text>
                                <Text fontSize="11px" color="gray.900">
                                    Daily Spend
                                </Text>
                            </VStack>
                            <VStack align="end" gap={1}>
                                <Text fontSize="lg" color="red.500" fontWeight="bold">
                                    {formatCurrency(totalSpending)}
                                </Text>
                                <Text fontSize="11px" color="gray.900">
                                    Total Expenditure
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
                            height={300}
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
                            height={300}
                        />
                    </Box>
                </Grid>

                {/* Bottom Section - Spending Allocation and Actions */}
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5}>
                    {/* Spending Allocation */}
                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={5}>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={3}>
                            Spending Allocation
                        </Text>
                        <HStack gap={3} justify="space-between" align="stretch">
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="#f94444"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={GalleryIcon} boxSize={5} color="#f94444" />
                                </Box>
                                <Text fontSize="10px" color="gray.600">Photo Ad</Text>
                                <Text fontSize="xs" fontWeight="bold" color="#f94444">
                                    N{photoSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <Box h="18" w="1px" bg="gray.200" alignSelf="center" />
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="#f94444"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={VideoPlayIcon} boxSize={5} color="#f94444" />
                                </Box>
                                <Text fontSize="10px" color="gray.600">Video Ad</Text>
                                <Text fontSize="xs" fontWeight="bold" color="#f94444">
                                    N{videoSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <Box h="18" w="1px" bg="gray.200" alignSelf="center" />
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="#f94444"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={MusicFilledIcon} boxSize={5} color="#f94444" />
                                </Box>
                                <Text fontSize="10px" color="gray.600">Audio Ad</Text>
                                <Text fontSize="xs" fontWeight="bold" color="#f94444">
                                    N{audioSpending.toLocaleString()}.00
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>

                    {/* Spending Actions */}
                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={5}>
                        <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                Spending Actions
                            </Text>
                            <HStack gap={1}>
                                <Text fontSize="xs" fontWeight="semibold" color="black">
                                    {clicks.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" fontWeight="semibold" color="black">
                                    +
                                </Text>
                                <Text fontSize="xs" fontWeight="semibold" color="black">
                                    {views.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" fontWeight="semibold" color="black">
                                    =
                                </Text>
                                <Text fontSize="xs" fontWeight="semibold" color="#f94444">
                                    N{totalActions.toLocaleString()}.00
                                </Text>
                            </HStack>
                        </Flex>
                        <HStack gap={3} justify="space-between" align="stretch">
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="#f94444"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={ClickFilledIcon} boxSize={5} color="#f94444" />
                                </Box>
                                <Text fontSize="10px" color="gray.600">Clicks</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    {clicks.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" fontWeight="medium" color="#f94444">
                                    N{clicksCost.toLocaleString()}.00
                                </Text>
                            </VStack>
                            <Box h="20" w="1px" bg="gray.200" alignSelf="center" />
                            <VStack align="center" gap={2} flex="1">
                                <Box
                                    w={10}
                                    h={10}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="#f94444"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={EyeFilledIcon} boxSize={5} color="#f94444" />
                                </Box>
                                <Text fontSize="10px" color="gray.600">Views</Text>
                                <Text fontSize="sm" fontWeight="bold" color="black">
                                    {views.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" fontWeight="medium" color="#f94444">
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

