import React, { useState, useMemo } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
    Button,
    Icon,
    Spinner,
} from '@chakra-ui/react';
import { AnimatedTabs } from '@shared/components';
import Chart from 'react-apexcharts';
import {
    FiTrendingUp,
    FiTrendingDown
} from 'react-icons/fi';
import { CalendarIcon, UploadIcon, PaymentsIcon, MusicFilledIcon, VideoPlayIcon, MusicPlayIcon, GiftBananaIcon, GiftBoxingIcon, GiftCatIcon, GiftFlowerIcon, GiftDonutIcon, GiftPotatoIcon } from '@/shared/icons/CustomIcons';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import { useSalesReport } from '../hooks/useSalesReport';
import {
    mapAnalyticsToRevenueChart,
    getAnalyticsCategories,
    mapAnalyticsToEarningsComparisonChart,
} from '@/features/dashboard/utils/chartMappers';

// Gift icon mapping based on gift type
const GIFT_ICONS: Record<string, React.ElementType> = {
    donut: GiftDonutIcon,
    boxing: GiftBoxingIcon,
    potato: GiftPotatoIcon,
    banana: GiftBananaIcon,
    cat: GiftCatIcon,
    flower: GiftFlowerIcon,
    default: GiftFlowerIcon,
};

const getGiftIcon = (giftType: string): React.ElementType => {
    const normalizedType = giftType.toLowerCase();
    return GIFT_ICONS[normalizedType] || GIFT_ICONS.default;
};

export const SalesReport: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const { isRecordLabel } = useUserType();

    // Fetch sales report data from API
    const {
        analytics,
        topTracks,
        giftBreakdown,
        giftSales,
        unlockStats,
        isLoading,
        error,
    } = useSalesReport(timeFilter);

    const timeTabs = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
    ];

    // Map gift breakdown to display format with icons
    const giftingData = useMemo(() => {
        if (giftBreakdown.length === 0) {
            // Return empty array when no data
            return [];
        }

        return giftBreakdown.map((item) => ({
            icon: getGiftIcon(item.type),
            badge: `X${item.count}`,
            value: item.displayValue,
        }));
    }, [giftBreakdown]);

    // Calculate total gift value for display
    const totalGiftValue = useMemo(() => {
        return giftBreakdown.reduce((sum, item) => sum + item.totalValue, 0);
    }, [giftBreakdown]);


    // Map analytics data to chart formats
    const revenueChartSeries = useMemo(() => {
        return mapAnalyticsToRevenueChart(analytics);
    }, [analytics]);

    const chartCategories = useMemo(() => {
        return getAnalyticsCategories(analytics);
    }, [analytics]);

    // Calculate dynamic Y-axis max for revenue chart
    const revenueYAxisMax = useMemo(() => {
        const allValues = revenueChartSeries.flatMap((s) => s.data);
        const maxValue = Math.max(...allValues, 100);
        return Math.ceil(maxValue * 1.2);
    }, [revenueChartSeries]);

    // Revenue Chart Options (dynamically configured)
    const revenueChartOptions = useMemo(() => ({
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
            categories: chartCategories,
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
            max: revenueYAxisMax,
            tickAmount: 5,
            labels: {
                style: {
                    fontSize: '10px',
                    cssClass: 'apexcharts-yaxis-label',
                    color: '#7B91B0',
                    fontFamily: 'Poppins, sans-serif',
                },
                formatter: function (value: number) {
                    return value >= 1000 ? (value / 1000) + 'k' : value.toString();
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
    }), [chartCategories, revenueYAxisMax]);

    // Earnings comparison chart series from API
    const earningsChartSeries = useMemo(() => {
        return mapAnalyticsToEarningsComparisonChart(analytics);
    }, [analytics]);

    // Earnings Chart Options
    const earningsChartOptions = useMemo(() => ({
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
        colors: ['#10B981', '#EF4444'],
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
            colors: ['#10B981', '#EF4444'],
            strokeColors: '#000',
            strokeWidth: 2,
            shape: 'circle' as const,
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: chartCategories.slice(0, 4), // Use first 4 categories for weeks
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
    }), [chartCategories]);

    // Derived display values from analytics
    const profitDisplay = analytics?.totalEarningsDisplay?.toLocaleString() || '0';
    const unlockedCount = analytics?.totalContentUnlocks?.toLocaleString() || '0';
    const totalGiftsReceived = analytics?.totalGiftsReceived || 0;

    // Show loading state
    if (isLoading) {
        return (
            <VStack minH="90vh" align="center" justify="center">
                <Spinner size="xl" color="red.500" thickness="4px" />
                <Text color="gray.600">Loading sales report...</Text>
            </VStack>
        );
    }

    // Show error state
    if (error) {
        return (
            <VStack minH="90vh" align="center" justify="center">
                <Text color="red.500" fontWeight="semibold">Failed to load sales report</Text>
                <Text color="gray.600" fontSize="sm">{error}</Text>
            </VStack>
        );
    }

    return (
        <VStack minH="90vh" align="stretch" gap={4}>
            {/* Artist Dropdown for Record Labels */}
            {isRecordLabel && (
                <Box alignSelf="flex-end" mb={-2}>
                    <ArtistDropdown />
                </Box>
            )}

            <Box bg="white" minH="90vh" p={{ base: 4, md: 6 }} borderRadius="10px" >
                  {/* Filter and Export Bar */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack gap={3}>
                    <AnimatedTabs
                        tabs={timeTabs}
                        activeTab={timeFilter}
                        onTabChange={(tabId) => setTimeFilter(tabId as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                        selectedColor="red.500"
                        size="sm"
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
                        <CalendarIcon color="dark.800" boxSize={4} />
                        Filter Duration
                    </Button>
                </HStack>
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
            </Flex>

            {/* Top Section - Revenue Chart and Stats */}
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4}>
                {/* Revenue Chart Card */}
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={3}>
                        Revenue
                    </Text>
                    <VStack align="stretch" gap={3}>
                        {/* Revenue Chart */}
                        <Box width="100%" overflow="hidden">
                            <Chart
                                options={revenueChartOptions}
                                series={revenueChartSeries}
                                type="bar"
                                width="100%"
                                height={350}
                            />
                        </Box>
                    </VStack>
                </Box>

                {/* Right Column Stats */}
                <VStack align="stretch" gap={4}>
                    {/* Profit Card */}
                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={3} textAlign="center">
                            Profit
                        </Text>
                        <VStack align="start" gap={2}>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                                N{profitDisplay}
                            </Text>
                            <HStack gap={2}>
                                <PaymentsIcon color="red.500" boxSize={4} />
                                <Text fontSize="sm" color="red.500">m{totalGiftsReceived.toLocaleString()}</Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                                After Commission
                            </Text>
                            <HStack gap={2}>
                                <Icon as={FiTrendingUp} color="green.500" />
                                <Text fontSize="xs" color="green.500" fontWeight="medium">
                                    Total Earnings
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Unlocked Content Card */}
                    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={3} textAlign="center">
                            Unlocked Content
                        </Text>
                        <VStack align="start" gap={2}>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                                {unlockedCount}
                            </Text>
                            <HStack gap={2}>
                                <Text fontSize="sm" color="gray.600">Total Unlocks</Text>
                                <PaymentsIcon color="red.500" boxSize={4} />
                                <Text fontSize="sm" color="red.500">m{totalGiftsReceived.toLocaleString()}</Text>
                            </HStack>
                            <HStack gap={4}>
                                <HStack gap={2}>
                                    <MusicFilledIcon color="red.500" boxSize={4} />
                                    <Text fontSize="sm" color="gray.600">{Math.round((analytics?.totalContentUnlocks || 0) * 0.65).toLocaleString()}</Text>
                                </HStack>
                                <HStack gap={2}>
                                    <VideoPlayIcon color="red.500" boxSize={4} />
                                    <Text fontSize="sm" color="gray.600">{Math.round((analytics?.totalContentUnlocks || 0) * 0.35).toLocaleString()}</Text>
                                </HStack>
                            </HStack>
                            <HStack gap={2}>
                                <Icon as={analytics?.totalContentUnlocks ? FiTrendingUp : FiTrendingDown} color={analytics?.totalContentUnlocks ? "green.500" : "red.500"} />
                                <Text fontSize="xs" color={analytics?.totalContentUnlocks ? "green.500" : "red.500"} fontWeight="medium">
                                    Content Unlocks
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>
                </VStack>
            </Grid>

            {/* Bottom Section */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
                {/* 
                 Card */}
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                    <VStack align="start" gap={3}>
                        <HStack justify="space-between" w="full">
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                Giftings
                            </Text>
                            <HStack gap={2}>
                                <Text fontSize="xs" color="red.500" fontWeight="medium">
                                    {giftSales.length.toLocaleString()} ~ N{totalGiftValue.toLocaleString()}
                                </Text>
                            </HStack>
                        </HStack>
                        {giftingData.length === 0 ? (
                            <Text fontSize="xs" color="gray.500" textAlign="center" w="full" py={4}>
                                No gift data available
                            </Text>
                        ) : (
                        <Grid templateColumns="repeat(8, 1fr)" gap={3} w="full">
                            {giftingData.map((item, index) => (
                                <VStack key={index} align="center" gap={1.5}>
                                    <Box position="relative" display="flex" alignItems="end" justifyContent="center">
                                        <Box

                                        >
                                            <Icon as={item.icon} boxSize={10} />
                                        </Box>
                                        <Text
                                            position="absolute"
                                            color="white"
                                            fontSize="10px"
                                            fontFamily="'Luckiest Guy', cursive"
                                            fontWeight="normal"
                                            letterSpacing="0.5px"
                                            mb="-8px"
                                            textShadow="
                                                2px 0 #000, 
                                                -2px 0 #000, 
                                                0 2px #000, 
                                                0 -2px #000,
                                                1px 1px #000, 
                                                -1px -1px #000, 
                                                1px -1px #000, 
                                                -1px 1px #000
                                            "
                                        >
                                            {item.badge}
                                        </Text>
                                    </Box>
                                    <Text fontSize="9px" color="gray.600" textAlign="center" fontWeight="medium">
                                        {item.value}
                                    </Text>
                                </VStack>
                            ))}
                        </Grid>
                        )}
                    </VStack>
                </Box>

                {/* Unlocked Card */}
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                    <VStack align="start" gap={3} h="full">
                        <HStack justify="space-between" w="full">
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                Unlocked
                            </Text>
                            <HStack gap={2}>
                                <Text fontSize="xs" color="black" fontWeight="medium">
                                    {unlockedCount} ~ N{profitDisplay} ~
                                </Text>
                                <PaymentsIcon color="red.500" boxSize={4} />
                                <Text fontSize="xs" color="red.500" fontWeight="medium">
                                    m{totalGiftsReceived.toLocaleString()}
                                </Text>
                            </HStack>
                        </HStack>
                        <HStack justify="center" align="center" w="full" flexGrow={1}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={4}>
                                <VStack align="center" gap={2}>
                                    <VStack gap={5}>
                                        <Box h={8} w={8} rounded="5px" borderColor="primary.500" borderWidth="1px" display="flex" alignItems="center" justifyContent="center">
                                            <MusicPlayIcon color="red.500" boxSize={4} />
                                        </Box>

                                        <HStack gap={1} align="center">
                                            <Box position="relative" w="16px" h="8px" display="flex" alignItems="center" justifyContent="center">
                                                {/* Blue pill shape */}
                                                <Box
                                                    w="16px"
                                                    h="3px"
                                                    bg="#4285F4"
                                                    borderRadius="full"
                                                    position="relative"
                                                    zIndex={1}
                                                />
                                                {/* Green circle */}
                                                <Box
                                                    position="absolute"
                                                    w="6.5px"
                                                    h="6.5px"
                                                    bg="#6AA84F"
                                                    borderRadius="full"
                                                    left="50%"
                                                    top="50%"
                                                    transform="translate(-50%, -50%)"
                                                    zIndex={2}
                                                />
                                            </Box>
                                            <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                                Yesterday's Unlock
                                            </Text>
                                        </HStack>
                                    </VStack>
                                    <Text fontSize="xs" color="gray.600">
                                        {unlockStats?.yesterday.count.toLocaleString() || '0'} - N{unlockStats?.yesterday.earningsDisplay.toLocaleString() || '0'}
                                    </Text>
                                    <Text fontSize="xs" color="red.500">
                                        m{unlockStats?.yesterday.muxifyCoins.toLocaleString() || '0'}
                                    </Text>
                                </VStack>
                                <Box
                                    h="32px"
                                    borderLeft="1px solid"
                                    borderColor="gray.200"
                                    mx={2}
                                />
                                <VStack align="center" gap={2}>
                                    <VStack gap={5}>
                                        <Box h={8} w={8} rounded="5px" borderColor="primary.500" borderWidth="1px" display="flex" alignItems="center" justifyContent="center" >
                                            <MusicFilledIcon color="red.500" boxSize={4} />
                                        </Box>

                                        <HStack gap={1} align="center">
                                            <Box position="relative" w="16px" h="8px" display="flex" alignItems="center" justifyContent="center">
                                                {/* Blue pill shape */}
                                                <Box
                                                    w="16px"
                                                    h="3px"
                                                    bg="#FFA88D"
                                                    borderRadius="full"
                                                    position="relative"
                                                    zIndex={1}
                                                />
                                                {/* Green circle */}
                                                <Box
                                                    position="absolute"
                                                    w="6.5px"
                                                    h="6.5px"
                                                    bg="#F94444"
                                                    borderRadius="full"
                                                    left="50%"
                                                    top="50%"
                                                    transform="translate(-50%, -50%)"
                                                    zIndex={2}
                                                />
                                            </Box>
                                            <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                                Today's Unlock
                                            </Text>
                                        </HStack>
                                    </VStack>
                                    <Text fontSize="xs" color="gray.600">
                                        {unlockStats?.today.count.toLocaleString() || '0'} - N{unlockStats?.today.earningsDisplay.toLocaleString() || '0'}
                                    </Text>
                                    <Text fontSize="xs" color="red.500">
                                        m{unlockStats?.today.muxifyCoins.toLocaleString() || '0'}
                                    </Text>
                                </VStack>
                            </Box>
                        </HStack>

                    </VStack>
                </Box>
            </Grid>

            {/* Bottom Row */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
                {/* Top Earnings Card */}
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
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
                            {topTracks?.tracks && topTracks.tracks.length > 0 ? (
                                topTracks.tracks.slice(0, 4).map((track, index) => {
                                    // Calculate popularity based on play count relative to max
                                    const maxPlays = Math.max(...topTracks.tracks.map(t => t.playCount), 1);
                                    const popularity = Math.round((track.playCount / maxPlays) * 100);
                                    const rank = String(index + 1).padStart(2, '0');

                                    return (
                                        <Box as="tr" key={track.id} _hover={{ bg: 'gray.50' }}>
                                            <Box as="td" fontSize="10px" color="#7B91B0" fontWeight="semibold" px={2} py={3} borderBottom="1px solid" borderColor="gray.100">
                                                {rank}
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
                                                    {track.earningsDisplay.toLocaleString()}
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Box as="tr">
                                    <Box as="td" colSpan={4} textAlign="center" py={4} fontSize="xs" color="gray.500">
                                        No top tracks data available
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Earnings Chart Card */}
                <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={3}>
                        Earnings
                    </Text>
                    <VStack align="stretch" gap={3}>
                        {/* Earnings Chart */}
                        <Box width="100%" overflow="hidden">
                            <Chart
                                options={earningsChartOptions}
                                series={earningsChartSeries}
                                type="area"
                                width="100%"
                                height={150}
                            />
                        </Box>
                        {/* Legend and Values */}
                        <HStack justify="center" gap={2} mt={1}>
                            <VStack gap={0} align="center">
                                <HStack gap={1}>
                                    <Box w={2} h={2} bg="#10B981" borderRadius="full" />
                                    <Text fontSize="8px" whiteSpace="nowrap" color="#7B91B0">Period Earnings</Text>
                                </HStack>
                                <Text fontSize="9px" fontWeight="bold" color="gray.900">N{profitDisplay}</Text>
                            </VStack>
                            <Box
                                h="24px"
                                borderLeft="1px solid"
                                borderColor="gray.200"
                                mx={2}
                            />
                            <VStack gap={0} align="center">
                                <HStack gap={1}>
                                    <Box w={2} h={2} bg="#EF4444" borderRadius="full" />
                                    <Text fontSize="8px" whiteSpace="nowrap" color="#7B91B0">Total Plays</Text>
                                </HStack>
                                <Text fontSize="9px" fontWeight="bold" color="gray.900">{analytics?.totalPlays?.toLocaleString() || '0'}</Text>
                            </VStack>
                        </HStack>
                    </VStack>
                </Box>
            </Grid>
            </Box>

          
        </VStack>
    );
};

export default SalesReport;
