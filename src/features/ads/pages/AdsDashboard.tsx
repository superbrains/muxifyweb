import React from 'react';
import {
    Box,
    Grid,
    Text,
    Button,
    HStack,
    VStack,
    Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { CalendarIcon, UploadIcon, EyeIcon, FlashIcon, PodCastAdsIcon, EyeOpenIcon, ClickIcon } from '@/shared/icons/CustomIcons';
import { useWindowWidth } from '@/shared/hooks/useWindowsWidth';
import { formatNaira } from '@/shared/utils';

export const AdsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { windowWidth } = useWindowWidth();
    
    // Activity Insights Chart Data
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
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
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
            max: 400,
            tickAmount: 4,
            labels: {
                style: {
                    fontSize: '10px',
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
            name: 'Impressions',
            data: [290, 330, 365, 380, 360, 310, 250, 220, 250, 300, 350, 380]
        },
        {
            name: 'Clicks',
            data: [280, 260, 220, 180, 140, 120, 140, 200, 280, 360, 390, 380]
        },
        {
            name: 'Conversions',
            data: [300, 360, 390, 395, 380, 340, 280, 240, 240, 280, 340, 380]
        }
    ];



    // Earnings Chart Data
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
            strokeColors: '#fff',
            strokeWidth: 2,
            shape: 'circle' as const,
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
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

    const earningsChartSeries = [
        {
            name: 'Last Month Earnings',
            data: [250000, 280000, 290000, 300004]
        },
        {
            name: 'This Month Earning',
            data: [80000, 95000, 100000, 104504]
        }
    ];

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
                            <Text fontSize="11px" color="gray.600">Campaign Summary</Text>
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
                        templateColumns={windowWidth >= 768 ? "repeat(4, 1fr)" : "repeat(2, 1fr)"}
                        gap={4}
                        w="full">
                        {/* Visibility Score Card */}
                        <Box bg="#ECF7FF" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <EyeIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        7.5
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Visibility Score
                                    </Text>
                                    <Text fontSize="8px" color="green.500">
                                        +8% from yesterday
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        {/* Presence Score Card */}
                        <Box bg="#FFF5F3" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <PodCastAdsIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        85%
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Presence Score
                                    </Text>
                                    <Text fontSize="8px" color="green.500">
                                        +1.2% from yesterday
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        {/* Total Visibility Card */}
                        <Box bg="#E7FFF7" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <EyeOpenIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        1,112,000
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Total Visibility
                                    </Text>
                                    <Text fontSize="8px" color="green.500">
                                        +1.2% from yesterday
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                        {/* Total Clicks Card */}
                        <Box bg="#F6F1FF" p={4} borderRadius="xl" flex="1">
                            <VStack align="start" gap={3}>
                                <ClickIcon boxSize={6} />
                                <VStack align="start" gap={1}>
                                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                                        100,000
                                    </Text>
                                    <Text fontSize="9px" color="gray.600">
                                        Clicks
                                    </Text>
                                    <Text fontSize="8px" color="red.500">
                                        0.5% from yesterday
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>

                    
                    </Grid>
                </VStack>

                <div
                    className="relative rounded-[15px] p-5 w-full lg:w-[250px] flex items-center justify-center h-[245px] bg-cover flex-col"
                    style={{ backgroundImage: "url('https://res.cloudinary.com/dygrsvya5/image/upload/v1762113250/Background-blue_iekzdy.png')" }}
                >
                    <div className='flex flex-col w-full gap-3 items-center self-center'>
                        <Box bg="white" borderRadius="10px" p={1.5}>
                            <FlashIcon color="#0095ff" boxSize={6} />
                        </Box>
                        <VStack align="center" gap={1}>
                            <Text fontSize="sm" color="white">
                                Create Campaign
                            </Text>
                            <Text textAlign="center" w="90%" color="white" fontSize="9px">
                                Start a new ad campaign to reach your audience
                            </Text>
                        </VStack>
                        <Button
                            bg="white"
                            color="#0095ff"
                            borderRadius="10px"
                            fontSize="xs"
                            size="sm"
                            w="70%"
                            border="none"
                            _hover={{ bg: 'gray.100' }}
                            onClick={() => navigate('/ads/create-campaign')}
                        >
                            Create Now
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
                <Box flex="2.3" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={4}>
                        Activity Insights
                    </Text>
                    <Box width="100%" overflow="hidden">
                        <Chart
                            options={activityChartOptions}
                            series={activityChartSeries}
                            type="line"
                            width="100%"
                            height={250}
                        />
                    </Box>
                </Box>

                {/* Total Revenue Chart */}
                <Box flex="1" minW="0" bg="white" p={4} borderRadius="xl" overflow="hidden">
                    {/* Unlock Chart */}
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
                                    height={250}
                                />
                            </Box>
                        </VStack>
       
                </Box>
            </Flex>


            {/* Bottom Row - Popularity Mapping and Popular Activity */}
            <HStack
                gap={{ base: 2, lg: 6 }}
                w="full"
                flexDirection={{ base: "column", md: "row" }}
                alignItems="stretch"
            >
                {/* Campaign Reach by Country */}
                <Box
                    bg="white"
                    p={4}
                    flex="1.8"
                    borderRadius="xl"
                    w={{ base: "100%", md: "60%", lg: "30%" }}
                    minW={0}
                >
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={6}>
                        Campaign Reach by Country
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
                                            fillColor = '#F59E0B'; // Orange
                                        } else if (countryName === 'Brazil') {
                                            fillColor = '#F97316'; // Orange/Red
                                        } else if (countryName === 'China') {
                                            fillColor = '#3B82F6'; // Blue
                                        } else if (countryName === 'Indonesia') {
                                            fillColor = '#3B82F6'; // Blue
                                        } else if (countryName === 'Saudi Arabia' || countryName === 'Congo' || countryName === 'Dem. Rep. Congo') {
                                            fillColor = '#10B981'; // Green
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
                                    <Text fontSize="8px" color="#7B91B0">Photo Ads</Text>
                                </HStack>
                                <Text fontSize="8px" fontWeight="semibold" color="gray.900" ml={4}>1,135</Text>
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
                                    <Text fontSize="8px" color="#7B91B0">Video Ads</Text>
                                </HStack>
                                <Text fontSize="8px" fontWeight="semibold" color="gray.900" ml={4}>635</Text>
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
                                    <Text fontSize="8px" color="#7B91B0">Music Ads</Text>
                                </HStack>
                                <Text fontSize="8px" fontWeight="semibold" color="gray.900" ml={4}>635</Text>
                            </VStack>
                        </HStack>
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
                                <Text fontSize="9px" whiteSpace="nowrap" color="#7B91B0">Last Month Earnings</Text>
                            </HStack>
                            <Text fontSize="10px" fontWeight="bold" color="gray.900">N300,004</Text>
                        </VStack>
                        <Box
                            h="32px"
                            borderLeft="1px solid"
                            borderColor="gray.200"
                            mx={2}
                        />
                        <VStack gap={0} align="center">
                            <HStack gap={1}>
                                <Box w={2} h={2} bg="#EF4444" borderRadius="full" />
                                <Text fontSize="9px" whiteSpace="nowrap" color="#7B91B0">This Month Earning</Text>
                            </HStack>
                            <Text fontSize="10px" fontWeight="bold" color="gray.900">N104,504</Text>
                        </VStack>
                    </HStack>
                </Box>
            </HStack>
        </VStack>
    );
};

export default AdsDashboard;