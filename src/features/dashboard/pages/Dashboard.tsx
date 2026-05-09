import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Text,
    Button,
    HStack,
    VStack,
    Flex,
    Spinner,
    Center,
    chakra,
} from '@chakra-ui/react';
import { FaGift } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { AddUserIcon, CalendarIcon, GiftIcon, MusicFilledIcon, MusicIconOutlinedIcon, PlayerIcon, SalesDashboardIcon, UploadIcon } from '@/shared/icons/CustomIcons';
import BackgroundImg from '@/assets/images/Background.png';
import { AuthedImage } from '@/shared/components/AuthedImage';
import { useWindowWidth } from '@/shared/hooks/useWindowsWidth';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '@shared/lib';
import { leaderboardService } from '@/features/leaderboard/services/leaderboardService';
import type { TopGifterDto } from '@/features/leaderboard/types';
import {
    mapAnalyticsToActivityChart,
    mapAnalyticsToRevenueChart,
    mapAnalyticsToEarningsComparisonChart,
    mapAnalyticsToPopularActivityChart,
    getAnalyticsCategories,
    calculateYAxisMax,
} from '../utils/chartMappers';
import '../styles/dashboard.css';

// Helper function to format large numbers
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { windowWidth } = useWindowWidth();
    const {
        statsDto,
        analyticsDto,
        topTracksDto,
        isLoading,
        error,
    } = useDashboard();

    // Top Gifters state
    const [topGifters, setTopGifters] = useState<TopGifterDto[]>([]);
    const [topGiftersLoading, setTopGiftersLoading] = useState(true);

    // Fetch top gifters on mount
    useEffect(() => {
        const fetchTopGifters = async () => {
            try {
                setTopGiftersLoading(true);
                const response = await leaderboardService.getTopGifters(5, 'all-time');
                setTopGifters(response.entries);
            } catch (err) {
                console.error('Failed to fetch top gifters:', err);
            } finally {
                setTopGiftersLoading(false);
            }
        };
        void fetchTopGifters();
    }, []);

    // Helper to get avatar background color based on index
    const getAvatarBgColor = (index: number): string => {
        const colors = ['#8B5CF6', '#A855F7', '#1F2937', '#A855F7', '#8B5CF6'];
        return colors[index % colors.length];
    };

    // Activity Insights Chart Data - derived from API
    const activityChartSeries = mapAnalyticsToActivityChart(analyticsDto);
    const activityCategories = getAnalyticsCategories(analyticsDto, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']);
    const activityYMax = calculateYAxisMax(activityChartSeries, 1.2);

    const activityChartOptions = {
        chart: {
            type: 'line' as const,
            height: 350,
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
            categories: activityCategories,
            labels: {
                style: {
                    fontSize: '10px',
                    cssClass: 'apexcharts-xaxis-label',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7B91B0'
                },
            },
        },
        yaxis: {
            min: 0,
            max: activityYMax,
            tickAmount: 4,
            forceNiceScale: true,
            labels: {
                style: {
                    fontSize: '10px',
                    cssClass: 'apexcharts-yaxis-label',
                    fontFamily: 'Poppins, sans-serif',
                    color: '#7B91B0'
                },
                formatter: function (value: number) {
                    if (value >= 1000) return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
                    return Number.isInteger(value) ? value.toString() : value.toFixed(0);
                }
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

    // Total Revenue Chart Data - derived from API
    const revenueChartSeries = mapAnalyticsToRevenueChart(analyticsDto);
    const revenueCategories = getAnalyticsCategories(analyticsDto, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    const revenueYMax = calculateYAxisMax(revenueChartSeries, 1.2);

    const revenueChartOptions = {
        chart: {
            type: 'bar' as const,
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
        },
        responsive: [{
            breakpoint: undefined,
            options: {
                chart: {
                    width: '100%'
                }
            }
        }],
        colors: ['#EF4444', '#F97316', '#EAB308'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 3,
            colors: ['transparent']
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '70%',
                endingShape: 'rounded',
                borderRadius: 2,
                borderRadiusApplication: 'end' as const,
                dataLabels: {
                    position: 'top',
                }
            },
        },
        states: {
            hover: {
                filter: {
                    type: 'lighten',
                    value: 0.04,
                }
            }
        },
        xaxis: {
            categories: revenueCategories,
            labels: {
                rotateAlways: false,
                style: {
                    fontSize: '10px',
                    cssClass: 'apexcharts-xaxis-label',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7B91B0'
                },
            },
        },
        yaxis: {
            min: 0,
            max: revenueYMax,
            tickAmount: 5,
            forceNiceScale: true,
            labels: {
                style: {
                    fontSize: '10px',
                    cssClass: 'apexcharts-yaxis-label',
                    color: '#7B91B0',
                    fontFamily: 'Poppins, sans-serif',
                },
                formatter: function (value: number) {
                    if (value >= 1000) return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
                    return Number.isInteger(value) ? value.toString() : value.toFixed(0);
                }
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

    // Earnings Chart Data - derived from API
    const earningsChartSeries = mapAnalyticsToEarningsComparisonChart(analyticsDto);
    const earningsCategories = getAnalyticsCategories(analyticsDto, ['Week 1', 'Week 2', 'Week 3', 'Week 4']);

    const earningsChartOptions = {
        chart: {
            type: 'area' as const,
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
        colors: ['#10B981', '#3B82F6'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 3,
            curve: 'smooth' as const,
            lineCap: 'round' as const,
        },
        fill: {
            type: 'solid' as const,
            opacity: 0.2,
        },
        markers: {
            size: 5,
            colors: ['#10B981', '#3B82F6'],
            strokeColors: '#fff',
            strokeWidth: 2,
            shape: 'circle' as const,
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: earningsCategories,
            labels: {
                show: false,
            },
        },
        yaxis: {
            show: false,
            labels: {
                show: false,
            },
        },
        legend: {
            position: 'bottom' as const,
            show: false,
            horizontalAlign: 'center' as const,
            fontSize: '10px',
            fontFamily: 'Manrope, sans-serif',
        },
        grid: {
            show: true,
            strokeDashArray: 3,
        },
    };

    // Popular Activity Chart Data - derived from API
    const popularActivityChartSeries = mapAnalyticsToPopularActivityChart(analyticsDto);

    const popularActivityChartOptions = {
        chart: {
            type: 'bar' as const,
            height: 200,
            stacked: true,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
        },
        colors: ['#F59E0B', '#EF4444'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '30%',
                borderRadius: 4,
                borderRadiusApplication: 'end' as const,
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: false,
        },
        xaxis: {
            categories: getAnalyticsCategories(analyticsDto, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).slice(0, 6),
            labels: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            show: false,
            labels: {
                show: false,
            },
        },
        legend: {
            show: false,
        },
        grid: {
            show: false,
        },
        tooltip: {
            enabled: false,
        },
    };

    // Show loading spinner while data is being fetched
    if (isLoading && !statsDto) {
        return (
            <Center minH="100vh" bg="gray.50">
                <VStack gap={4}>
                    <Spinner size="xl" color="primary.500" borderWidth="4px" />
                    <Text color="gray.600">Loading dashboard...</Text>
                </VStack>
            </Center>
        );
    }

    // Show error message if there was an error
    if (error && !statsDto) {
        return (
            <Center minH="100vh" bg="gray.50">
                <VStack gap={4}>
                    <Text color="red.500" fontSize="lg">{error}</Text>
                    <Button colorScheme="primary" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </VStack>
            </Center>
        );
    }

    return (
        <VStack gap={{ base: 2, lg: 6 }} bg="gray.50" minH="100vh">
            {/* Header Section */}

            <HStack
                w="full"
                align={{ base: "stretch", md: "center" }}
                gap={{ base: 3, md: 5 }}
                flexDirection={{ base: "column", md: "column", lg: "row" }}
            >
                <VStack flexGrow={1} w={{ base: "full", md: "full", lg: "auto" }} gap={{ base: 2, lg: 8 }} bg="white" p={5} borderRadius="xl">

                    <Flex
                        justify={{ base: "flex-start", md: "space-between" }}
                        w="full"
                        align={{ base: "flex-start", md: "center" }}
                        flexDirection={{ base: "column", md: "row" }}
                        gap={{ base: 2, md: 0 }}
                    >
                        <Box fontFamily="Poppins" display="flex" flexDirection="column" gap={1}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900" alignSelf="start">
                                Today's Insight
                            </Text>
                            <Text fontSize="11px" color="gray.600">Sales Summary</Text>
                        </Box>

                        <HStack gap={3}>
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
                                <CalendarIcon color="dark.800" boxSize={4} />
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                borderWidth="1px"
                                borderColor="gray.blue.200"
                                bg="white" size="xs"
                                fontSize="10px"
                                h="28px"
                                _hover={{
                                    bg: "gray.50",
                                    borderColor: "gray.blue.300"
                                }}
                                rounded="5px"
                                color="gray.blue.800"
                                gap={2}>
                                <UploadIcon color="dark.800" boxSize={4} />
                                Export
                            </Button>
                        </HStack>
                    </Flex>
                    <Grid
                        templateColumns={windowWidth >= 768 ? "repeat(5, 1fr)" : "repeat(2, 1fr)"}
                        gap={4}
                        w="full">
                        {/* Total Earning Card */}
                        <Box bg="#FFF5F6" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <SalesDashboardIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        {statsDto?.totalEarnings.formattedValue || formatCurrency(0)}
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Total Earning
                                    </Text>
                                    <Text fontSize="8px" color={statsDto?.totalEarnings.isPositiveChange ? "green.500" : "red.500"}>
                                        {statsDto?.totalEarnings.isPositiveChange ? '+' : ''}{statsDto?.totalEarnings.percentChange.toFixed(1) || 0}% from yesterday
                                    </Text>
                                </VStack>

                            </VStack>
                        </Box>

                        {/* Total Gifts Card */}
                        <Box bg="#FFF5F3" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <GiftIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        {formatNumber(analyticsDto?.totalGiftsReceived || 0)}
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Total Gifts
                                    </Text>
                                    <Text fontSize="8px" color="green.500">
                                        This period
                                    </Text>
                                </VStack>

                            </VStack>
                        </Box>

                        {/* Total Unlocked Card */}
                        <Box bg="#E7FFF7" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <MusicIconOutlinedIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        {formatNumber(analyticsDto?.totalContentUnlocks || 0)}
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Total Unlocked
                                    </Text>
                                    <Text fontSize="8px" color="green.500">
                                        This period
                                    </Text>
                                </VStack>

                            </VStack>
                        </Box>

                        {/* Plays Card */}
                        <Box bg="#F6F1FF" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <PlayerIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        {statsDto?.totalPlays.formattedValue || formatNumber(0)}
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Plays
                                    </Text>
                                    <Text fontSize="8px" color={statsDto?.totalPlays.isPositiveChange ? "green.500" : "red.500"}>
                                        {statsDto?.totalPlays.isPositiveChange ? '+' : ''}{statsDto?.totalPlays.percentChange.toFixed(1) || 0}% from yesterday
                                    </Text>
                                </VStack>

                            </VStack>
                        </Box>

                        {/* New Fans Card */}
                        <Box
                            bg="#ECF7FF"
                            p={4}
                            borderRadius="xl"
                            flex="1"
                            gridColumn={windowWidth >= 768 ? "auto" : "span 2"}
                        >
                            <VStack align="start" gap={3}>
                                <AddUserIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        {statsDto?.totalFollowers.formattedValue || formatNumber(0)}
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        New Fans/Followers
                                    </Text>
                                    <Text fontSize="8px" color={statsDto?.totalFollowers.isPositiveChange ? "green.500" : "red.500"}>
                                        {statsDto?.totalFollowers.isPositiveChange ? '+' : ''}{statsDto?.totalFollowers.percentChange.toFixed(1) || 0}% from yesterday
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>
                    </Grid>
                </VStack>

                <div
                    className="relative rounded-[15px] p-5 w-full lg:w-[250px] flex items-center justify-center h-[245px] bg-cover flex-col"
                    style={{ backgroundImage: `url(${BackgroundImg})` }}
                >
                    <div className='flex flex-col w-full gap-3 items-center self-center'>
                        <Box bg="white" borderRadius="10px" p={1.5}>
                            <MusicFilledIcon color="#4AB58E" boxSize={6} />
                        </Box>
                        <VStack align="center" gap={1}>
                            <Text fontSize="sm" color="white">
                                Publish Songs 
                            </Text>
                            <Text textAlign="center" w="90%" color="white" fontSize="9px">
                                Upload your songs for the world to reward you
                            </Text>
                        </VStack>
                        <Button
                            bg="white"
                            color="green.500"
                            borderRadius="10px"
                            fontSize="xs"
                            size="sm"
                            w="70%"
                            border="none"
                            _hover={{ bg: 'gray.100' }}
                            onClick={() => navigate('/upload')}
                        >
                            Upload Now
                        </Button>
                    </div>
                </div>
            </HStack>

            {/* Charts Section */}
            <Flex
                direction={{ base: 'column', md: 'row' }}
                gap={{ base: 2, lg: 6 }}
                w="full"
            >
                {/* Activity Insights Chart */}
                <Box flex="1" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={4}>
                        Activity Insights
                    </Text>
                    <Box width="100%" overflow="hidden">
                        <Chart
                            options={activityChartOptions}
                            series={activityChartSeries}
                            type="line"
                            width="100%"
                            height={200}
                        />
                    </Box>
                </Box>

                {/* Total Revenue Chart */}
                <Box flex="1" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                            Total Revenue
                        </Text>
                        <Button size="xs" h="25px" rounded="full" border="1px solid" borderColor="gray.blue.500" py={1} px={3} fontSize="10px" color="black" cursor="pointer">
                            See All
                        </Button>
                    </Flex>
                    <Box width="100%" overflow="hidden">
                        <Chart
                            options={revenueChartOptions}
                            series={revenueChartSeries}
                            type="bar"
                            width="100%"
                            height={200}
                        />
                    </Box>
                </Box>
            </Flex>

            {/* Bottom Section - Top Earnings, Earnings Chart, and Top Giver in one row */}
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                gap={{ base: 2, lg: 6 }}
                w="full"
            >
                {/* Top Earnings Table */}
                <Box flex="4.5" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={4}>
                        Top Earnings
                    </Text>

                    <Box as="table" w="100%" borderCollapse="separate" borderSpacing="0">
                        {/* Table Header */}
                        <Box as="thead">
                            <Box as="tr">
                                <Box as="th" fontSize="9px" color="#7B91B0" fontWeight="medium" textAlign="left" px={2} py={3} borderBottom="1px solid" borderColor="gray.200">
                                    #
                                </Box>
                                <Box as="th" fontSize="9px" color="#7B91B0" fontWeight="medium" textAlign="left" px={2} py={3} borderBottom="1px solid" borderColor="gray.200">
                                    Name
                                </Box>
                                <Box as="th" fontSize="9px" color="#7B91B0" fontWeight="medium" textAlign="left" px={2} py={3} borderBottom="1px solid" borderColor="gray.200">
                                    Popularity
                                </Box>
                                <Box as="th" fontSize="9px" color="#7B91B0" fontWeight="medium" textAlign="right" px={2} py={3} borderBottom="1px solid" borderColor="gray.200">
                                    Sales
                                </Box>
                            </Box>
                        </Box>
                        {/* Table Body */}
                        <Box as="tbody">
                            {(topTracksDto?.tracks || []).slice(0, 4).map((track, index) => {
                                // Calculate popularity as percentage of max plays in the list
                                const maxPlays = Math.max(...(topTracksDto?.tracks || []).map(t => t.playCount), 1);
                                const popularity = Math.round((track.playCount / maxPlays) * 100);
                                return (
                                    <Box as="tr" key={track.id} _hover={{ bg: 'gray.50' }}>
                                        <Box as="td" fontSize="10px" color="#7B91B0" fontWeight="semibold" px={2} py={3} borderBottom="1px solid" borderColor="gray.100">
                                            {String(index + 1).padStart(2, '0')}
                                        </Box>
                                        <Box as="td" fontSize="10px" color="gray.700" fontWeight="medium" px={2} py={3} borderBottom="1px solid" borderColor="gray.100">
                                            {track.title}
                                        </Box>
                                        <Box as="td" px={2} py={3} borderBottom="1px solid" borderColor="gray.100">
                                            <Box w="100%" bg="red.300" h={1} borderRadius="full" overflow="hidden">
                                                <Box
                                                    w={`${popularity}%`}
                                                    h="100%"
                                                    bg="primary.500"
                                                    borderRadius="full"
                                                />
                                            </Box>
                                        </Box>
                                        <Box as="td" fontSize="9px" color="red.500" fontWeight="semibold" px={2} py={3} textAlign="right" borderBottom="1px solid" borderColor="gray.100">
                                            <Box
                                                as="span"
                                                border="1px solid"
                                                borderColor="red.500"
                                                color="red.500"
                                                bg="primary.70"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                display="inline-block"
                                            >
                                                {formatCurrency(track.earningsDisplay)}
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                            {(!topTracksDto?.tracks || topTracksDto.tracks.length === 0) && (
                                <Box as="tr">
                                    <chakra.td colSpan={4} textAlign="center" py={8} color="gray.500" fontSize="sm">
                                        No tracks data available
                                    </chakra.td>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Earnings Chart */}
                <Box flex="2.74" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={4}>
                        Earnings
                    </Text>
                    <Box width="100%" overflow="hidden">
                        <Chart
                            options={earningsChartOptions}
                            series={earningsChartSeries}
                            type="area"
                            width="100%"
                            height={170}
                        />
                    </Box>
                    <HStack justify="center" gap={2} mt={2}>
                        <VStack gap={0} align="center">
                            <HStack gap={1}>
                                <Box w={2} h={2} bg="#10B981" borderRadius="full" />
                                <Text fontSize="9px" whiteSpace="nowrap" color="#7B91B0">Period Earnings</Text>
                            </HStack>
                            <Text fontSize="10px" fontWeight="bold" color="gray.900">
                                {formatCurrency(analyticsDto?.totalEarningsDisplay || 0)}
                            </Text>
                        </VStack>
                        <Box
                            h="32px"
                            borderLeft="1px solid"
                            borderColor="gray.200"
                            mx={2}
                        />
                        <VStack gap={0} align="center">
                            <HStack gap={1}>
                                <Box w={2} h={2} bg="#3B82F6" borderRadius="full" />
                                <Text fontSize="9px" whiteSpace="nowrap" color="#7B91B0">Total Plays</Text>
                            </HStack>
                            <Text fontSize="10px" fontWeight="bold" color="gray.900">
                                {formatNumber(analyticsDto?.totalPlays || 0)}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>

                {/* Top Giver Section */}
                <Box flex="2.74" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={4}>
                        Top Giver
                    </Text>

                    {topGiftersLoading ? (
                        <Center py={8}>
                            <Spinner size="sm" color="primary.500" />
                        </Center>
                    ) : topGifters.length === 0 ? (
                        <Center py={8}>
                            <Text fontSize="12px" color="gray.500">No top gifters yet</Text>
                        </Center>
                    ) : (
                        <VStack align="stretch" gap={0.5}>
                            {topGifters.map((giver, index) => (
                                <HStack key={giver.userId} justify="space-between" align="center" py={2}>
                                    <HStack gap={3}>
                                        <AuthedImage
                                            src={giver.avatarUrl}
                                            alt={giver.displayName || giver.username || 'Top giver'}
                                            w={6}
                                            h={6}
                                            borderRadius="full"
                                            objectFit="cover"
                                            fallback={
                                                <Box
                                                    w={6}
                                                    h={6}
                                                    borderRadius="full"
                                                    bg={getAvatarBgColor(index)}
                                                    color="white"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    fontSize="8px"
                                                    fontWeight="bold"
                                                >
                                                    {(giver.displayName || giver.username || 'U').charAt(0).toUpperCase()}
                                                </Box>
                                            }
                                        />
                                        <VStack align="start" gap={0}>
                                            <HStack gap={1}>
                                                <Text fontSize="10px" fontWeight="semibold" color="gray.900">
                                                    {giver.displayName || giver.username || 'Unknown'}
                                                </Text>
                                                {giver.currentMedal && (
                                                    <Text fontSize="9px">{giver.medalIcon || '🏆'}</Text>
                                                )}
                                            </HStack>
                                            <Text fontSize="7px" color="#C0C5D0" mt={0.5}>
                                                {giver.giftCount} gift{giver.giftCount !== 1 ? 's' : ''} sent
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <VStack align="end" gap={0}>
                                        <HStack gap={1}>
                                            <FaGift color="#F97316" size={12} />
                                            <Text fontSize="10px" fontWeight="bold" color="gray.900">
                                                {giver.totalGiftValue.toLocaleString()}
                                            </Text>
                                        </HStack>
                                        <Text fontSize="7px" color="#C0C5D0" mt={0.5}>
                                            Gift Worth
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                    )}
                </Box>
            </Flex>

            {/* Bottom Row - Popularity Mapping and Popular Activity */}
            <HStack
                gap={{ base: 2, lg: 6 }}
                w="full"
                flexDirection={{ base: "column", md: "row" }}
                alignItems="stretch"
            >
                {/* Popularity Mapping by Country */}
                <Box
                    bg="white"
                    p={4}
                    borderRadius="xl"
                    w={{ base: "100%", md: "60%", lg: "30%" }}
                    minW={0}
                >
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={6}>
                        Popularity Mapping by Country
                    </Text>

                    {/* World map with react-simple-maps */}
                    <Box h="140px" mb={4} overflow="hidden">
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 100,
                                center: [0, 20]
                            }}
                            width={800}
                            height={350}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                                {({ geographies }: { geographies: any[] }) =>
                                    geographies.map((geo: any) => {
                                        /* eslint-enable @typescript-eslint/no-explicit-any */
                                        const countryName = geo.properties.name;
                                        let fillColor = '#E5E7EB'; // Default light gray

                                        // Color coding based on countries
                                        if (countryName === 'United States of America') {
                                            fillColor = '#F59E0B'; // Orange (Gifting)
                                        } else if (countryName === 'Brazil') {
                                            fillColor = '#F97316'; // Orange/Red (Gifting)
                                        } else if (countryName === 'China') {
                                            fillColor = '#3B82F6'; // Blue (Plays)
                                        } else if (countryName === 'Indonesia') {
                                            fillColor = '#3B82F6'; // Blue (Plays)
                                        } else if (countryName === 'Saudi Arabia' || countryName === 'Congo' || countryName === 'Dem. Rep. Congo') {
                                            fillColor = '#10B981'; // Green (Unlock)
                                        }

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fillColor}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: 'none' },
                                                    hover: { outline: 'none', fill: fillColor, opacity: 0.8 },
                                                    pressed: { outline: 'none' },
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                    </Box>

                    <Box w="100%" display="flex" justifyContent="center" alignItems="center">
                        <HStack justify="center" flexWrap="wrap" gap={2}>

                            <VStack align="start" gap={0}>
                                <HStack gap={1.5}>
                                    <Box w={2.5} h={2.5} bg="#F97316" borderRadius="full" />
                                    <Text fontSize="8px" color="#7B91B0">Gifting</Text>
                                </HStack>
                                <Text fontSize="8px" fontWeight="semibold" color="gray.900" ml={4}>
                                    {formatNumber(analyticsDto?.totalGiftsReceived || 0)}
                                </Text>
                            </VStack>
                            <Box
                                h="32px"
                                borderLeft="1px solid"
                                borderColor="gray.200"
                                mx={2}
                            />
                            <VStack align="start" gap={0}>
                                <HStack gap={1.5}>
                                    <Box w={2.5} h={2.5} bg="#3B82F6" borderRadius="full" />
                                    <Text fontSize="8px" color="#7B91B0">Plays</Text>
                                </HStack>
                                <Text fontSize="8px" fontWeight="semibold" color="gray.900" ml={4}>
                                    {formatNumber(analyticsDto?.totalPlays || 0)}
                                </Text>
                            </VStack>
                            <Box
                                h="32px"
                                borderLeft="1px solid"
                                borderColor="gray.200"
                                mx={2}
                            />
                            <VStack align="start" gap={0}>
                                <HStack gap={1.5}>
                                    <Box w={2.5} h={2.5} bg="#10B981" borderRadius="full" />
                                    <Text fontSize="8px" color="#7B91B0">Unlock</Text>
                                </HStack>
                                <Text fontSize="8px" fontWeight="semibold" color="gray.900" ml={4}>
                                    {formatNumber(analyticsDto?.totalContentUnlocks || 0)}
                                </Text>
                            </VStack>
                        </HStack>

                    </Box>
                </Box>

                {/* Popular Activity Chart */}
                <Box
                    bg="white"
                    p={4}
                    borderRadius="xl"
                    w={{ base: "100%", sm: "60%", md: "40%", lg: "25%" }}
                    minW={0}
                >
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        Popular Activity
                    </Text>

                    <Box width="100%" overflow="hidden" mb={4}>
                        <Chart
                            options={popularActivityChartOptions}
                            series={popularActivityChartSeries}
                            type="bar"
                            width="100%"
                            height={150}
                        />
                    </Box>

                    <HStack justify="center" gap={4} flexWrap="wrap">
                        <VStack align="center" gap={0}>
                            <HStack gap={1.5}>
                                <Box w={2.5} h={2.5} bg="#EF4444" borderRadius="full" />
                                <Text fontSize="8px" color="#7B91B0">Gifting</Text>
                            </HStack>
                            <Text fontSize="8px" fontWeight="bold" color="gray.900">
                                {formatNumber(analyticsDto?.totalGiftsReceived || 0)}
                            </Text>
                        </VStack>
                        <Box
                            h="32px"
                            borderLeft="1px solid"
                            borderColor="gray.200"
                            mx={2}
                        />
                        <VStack align="center" gap={0}>
                            <HStack gap={1.5}>
                                <Box w={2.5} h={2.5} bg="#F59E0B" borderRadius="full" />
                                <Text fontSize="8px" color="#7B91B0">Unlock</Text>
                            </HStack>
                            <Text fontSize="8px" fontWeight="bold" color="gray.900">
                                {formatNumber(analyticsDto?.totalContentUnlocks || 0)}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            </HStack>
        </VStack>
    );
};

export default Dashboard;
