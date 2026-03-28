import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
    Badge,
    Spinner,
    Alert,
} from '@chakra-ui/react';
import { AnimatedTabs, Select } from '@shared/components';
import { formatNaira } from '@shared/utils';
import { FansAndSubscribersCard } from './FansAndSubscribersCard';
import { useUserStore } from '@/app/store/useUserStore';
import { leaderboardService } from '@/features/leaderboard/services/leaderboardService';
import type { ArtistTopFansLeaderboardDto, ArtistTopFanDto } from '@/features/leaderboard/types';
import type { TimeFilter, FanLeaderboardItem } from '../types';
import { mapTimeFilterToPeriod } from '../types';

export const MusicTab: React.FC = () => {
    const { user } = useUserStore();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily');
    const [continentFilter, setContinentFilter] = useState<string>('all');
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const [sortFilter, setSortFilter] = useState<string>('latest');

    // API state
    const [topFansData, setTopFansData] = useState<ArtistTopFansLeaderboardDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const timeTabs = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
    ];

    const continentOptions = [
        { value: 'all', label: 'All Continents' },
        { value: 'africa', label: 'Africa' },
        { value: 'america', label: 'America' },
        { value: 'asia', label: 'Asia' },
        { value: 'europe', label: 'Europe' },
    ];

    const sortOptions = [
        { value: 'latest', label: 'Latest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'popular', label: 'Most Popular' },
    ];

    // Fetch top fans data
    useEffect(() => {
        const fetchTopFans = async () => {
            if (!user?.id) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const period = mapTimeFilterToPeriod(timeFilter);
                const data = await leaderboardService.getArtistTopFans(user.id, 10, period);
                setTopFansData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch top fans');
            } finally {
                setIsLoading(false);
                setHasFetched(true);
            }
        };

        fetchTopFans();
    }, [user?.id, timeFilter]);

    // Map API data to UI format
    const topGivers: FanLeaderboardItem[] = useMemo(() => {
        if (!topFansData?.entries) return [];
        return topFansData.entries.map((fan: ArtistTopFanDto) => ({
            rank: fan.rank,
            name: fan.displayName || fan.username || 'Anonymous',
            value: fan.totalGiftValue.toLocaleString(),
            avatarUrl: fan.avatarUrl,
            country: '', // Country not available in API response
        }));
    }, [topFansData]);

    // Activity options with dynamic counts from API
    const activityOptions = useMemo(() => {
        const totalGifts = topFansData?.entries?.reduce((sum, fan) => sum + fan.giftCount, 0) || 0;
        return [
            { id: 'all', label: 'All' },
            { id: 'plays', label: `Plays (${(0).toLocaleString()})` },
            { id: 'gifts', label: `Gifts (${totalGifts.toLocaleString()})` },
            { id: 'unlocked', label: `Unlocked (${(0).toLocaleString()})` },
            { id: 'shares', label: `Shares (${(0).toLocaleString()})` },
        ];
    }, [topFansData]);

    // Table data from top fans
    const tableData = useMemo(() => {
        if (!topFansData?.entries) return [];

        let data = topFansData.entries.map((fan: ArtistTopFanDto, index: number) => ({
            no: index + 1,
            name: fan.displayName || fan.username || 'Anonymous',
            category: 'Gifting',
            totalCounts: fan.giftCount.toLocaleString(),
            date: topFansData.lastUpdated
                ? new Date(topFansData.lastUpdated).toLocaleDateString('en-GB')
                : '-',
            amount: formatNaira(fan.totalGiftValue),
        }));

        // Filter by activity type
        if (activityFilter !== 'all') {
            data = data.filter((row) => {
                if (activityFilter === 'gifts') return row.category === 'Gifting';
                return true;
            });
        }

        // Sort data
        if (sortFilter === 'oldest') {
            data = [...data].reverse();
        } else if (sortFilter === 'popular') {
            data = [...data].sort((a, b) => {
                const aVal = parseInt(a.totalCounts.replace(/,/g, '')) || 0;
                const bVal = parseInt(b.totalCounts.replace(/,/g, '')) || 0;
                return bVal - aVal;
            });
        }

        return data;
    }, [topFansData, activityFilter, sortFilter]);

    // Calculate totals
    const totalPlays = 0; // No plays endpoint available
    const totalFollowers = topFansData?.entries?.length || 0;

    // Placeholder data for country-based leaderboards (no backend endpoints yet)
    const placeholderCountryData: FanLeaderboardItem[] = [];

    // Show loading only when actually fetching
    if (isLoading || (!hasFetched && user?.id)) {
        return (
            <VStack bg="white" borderTopRadius="xl" p={6} minH="400px" justify="center">
                <Spinner size="xl" color="red.500" />
                <Text color="gray.600">Loading fan data...</Text>
            </VStack>
        );
    }

    // Show message if user is not loaded yet
    if (!user?.id) {
        return (
            <VStack bg="white" borderTopRadius="xl" p={6} minH="400px" justify="center">
                <Text color="gray.600">Please log in to view your fans</Text>
            </VStack>
        );
    }

    if (error) {
        return (
            <VStack bg="white" borderTopRadius="xl" p={6}>
                <Alert.Root status="error" borderRadius="md">
                    <Alert.Indicator />
                    <Alert.Description>{error}</Alert.Description>
                </Alert.Root>
            </VStack>
        );
    }

    return (
        <VStack bg="white" borderTopRadius="xl" p={6} overflow="hidden" align="stretch" gap={6}>
            {/* Time Filters and Statistics */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <AnimatedTabs
                    tabs={timeTabs}
                    activeTab={timeFilter}
                    onTabChange={(tabId) => setTimeFilter(tabId as TimeFilter)}
                    selectedColor="red.500"
                    size="sm"
                />
                <HStack gap={6}>
                    <VStack align="end" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {totalPlays.toLocaleString()}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Plays
                        </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {totalFollowers.toLocaleString()}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Followers (Fans)
                        </Text>
                    </VStack>
                </HStack>
            </Flex>
            <Box w="full" display="flex" justifyContent="end">
                <Select
                    options={continentOptions}
                    value={continentFilter}
                    onChange={setContinentFilter}
                    backgroundColor="primary.500"
                    textColor="white"
                    borderColor="primary.500"
                    iconColor="white"
                    width="160px"
                />
            </Box>

            {/* Leaderboard Cards Grid */}
            <Grid
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={4}
                maxW="100%"
                overflow="hidden"
            >
                <FansAndSubscribersCard
                    title="Top play by country"
                    data={placeholderCountryData}
                    emptyMessage="Country data coming soon"
                />
                <FansAndSubscribersCard
                    title="Top givers by country"
                    data={placeholderCountryData}
                    emptyMessage="Country data coming soon"
                />
                <FansAndSubscribersCard
                    title="Top unlock by country"
                    data={placeholderCountryData}
                    emptyMessage="Country data coming soon"
                />
                <FansAndSubscribersCard
                    title="Top Givers"
                    data={topGivers}
                    emptyMessage="No top givers yet"
                />
                <FansAndSubscribersCard
                    title="Top Unlocked"
                    data={placeholderCountryData}
                    emptyMessage="No unlock data yet"
                />
            </Grid>

            {/* Activity Table */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
                <VStack align="stretch" gap={0}>
                    {/* Table Header */}
                    <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.200">
                        <HStack gap={4}>
                            <AnimatedTabs
                                tabs={activityOptions}
                                activeTab={activityFilter}
                                onTabChange={setActivityFilter}
                                size="sm"
                                selectedColor="red.500"
                            />
                        </HStack>
                        <Select
                            options={sortOptions}
                            value={sortFilter}
                            onChange={setSortFilter}
                            backgroundColor="white"
                            textColor="gray.800"
                            borderColor="gray.300"
                            iconColor="gray.600"
                            width="120px"
                        />
                    </Flex>

                    {/* Table */}
                    <Box as="table" w="100%" borderCollapse="separate" borderSpacing="0">
                        <Box as="thead" bg="red.500">
                            <Box as="tr">
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">No.</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Name</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Category</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Total Counts</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Date</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Amount</Box>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {tableData.length === 0 ? (
                                <Box as="tr">
                                    <Box as="td" colSpan={6} textAlign="center" py={8} color="gray.500">
                                        No fan activity data available
                                    </Box>
                                </Box>
                            ) : (
                                tableData.map((row, index) => (
                                    <Box as="tr" key={index} _hover={{ bg: "gray.50" }} borderBottom="1px solid" borderColor="gray.100">
                                        <Box as="td" fontSize="12px" fontWeight="semibold" py={4} px={4} color="red.500">
                                            {row.no.toString().padStart(2, '0')}
                                        </Box>
                                        <Box as="td" fontSize="12px" py={4} px={4}>
                                            {row.name}
                                        </Box>
                                        <Box as="td" fontSize="12px" py={4} px={4}>
                                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                                {row.category}
                                            </Badge>
                                        </Box>
                                        <Box as="td" fontSize="12px" py={4} px={4}>
                                            {row.totalCounts}
                                        </Box>
                                        <Box as="td" fontSize="12px" py={4} px={4} color="gray.600">
                                            {row.date}
                                        </Box>
                                        <Box as="td" fontSize="12px" fontWeight="semibold" py={4} px={4} color="red.500">
                                            {row.amount}
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
