import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
    Badge,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { AnimatedTabs, Select } from '@shared/components';
import { formatNaira } from '@shared/utils';
import { LeaderboardCard } from './LeaderboardCard';
import { leaderboardService } from '../services/leaderboardService';
import { useUserStore } from '@/app/store/useUserStore';
import type {
    TopGifterDto,
    MostGiftedArtistDto,
    MostPlayedTrackDto,
    ArtistTopFanDto,
    LeaderboardStatsDto,
    HighestUnlockedContentDto,
    TopAlbumDto,
    MostSharedContentDto,
    LeaderboardPeriod,
} from '../types';

// Map UI time filter to API period
const mapTimeFilterToPeriod = (filter: string): LeaderboardPeriod => {
    switch (filter) {
        case 'daily': return 'day';
        case 'weekly': return 'week';
        case 'monthly': return 'month';
        case 'yearly': return 'all-time';
        default: return 'all-time';
    }
};

// Get period label for display
const getPeriodLabel = (filter: string): string => {
    switch (filter) {
        case 'daily': return 'Today';
        case 'weekly': return 'This Week';
        case 'monthly': return 'This Month';
        case 'yearly': return 'All Time';
        default: return 'All Time';
    }
};

// Map DTO to LeaderboardCard format
interface LeaderboardItem {
    rank: number;
    name: string;
    value: string;
    avatarUrl?: string;
}

export const MusicLeaderboard: React.FC = () => {
    const { user } = useUserStore();
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [leaderboardFilter, setLeaderboardFilter] = useState<string>('all');
    const [sortFilter, setSortFilter] = useState<string>('latest');

    // API data states
    const [stats, setStats] = useState<LeaderboardStatsDto | null>(null);
    const [topGifters, setTopGifters] = useState<TopGifterDto[]>([]);
    const [mostGiftedArtists, setMostGiftedArtists] = useState<MostGiftedArtistDto[]>([]);
    const [mostPlayedTracks, setMostPlayedTracks] = useState<MostPlayedTrackDto[]>([]);
    const [artistTopFans, setArtistTopFans] = useState<ArtistTopFanDto[]>([]);
    const [highestUnlocked, setHighestUnlocked] = useState<HighestUnlockedContentDto[]>([]);
    const [topAlbums, setTopAlbums] = useState<TopAlbumDto[]>([]);
    const [mostShared, setMostShared] = useState<MostSharedContentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const timeTabs = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
    ];

    const leaderboardOptions = [
        { value: 'all', label: 'All Leaderboard' },
        { value: 'music', label: 'Music' },
        { value: 'video', label: 'Video' },
    ];

    const sortOptions = [
        { value: 'latest', label: 'Latest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'popular', label: 'Most Popular' },
    ];

    // Fetch leaderboard data
    const fetchLeaderboardData = useCallback(async () => {
        setIsLoading(true);
        const period = mapTimeFilterToPeriod(timeFilter);

        try {
            // Fetch all data in parallel
            const [
                giftersRes,
                artistsRes,
                tracksRes,
                statsRes,
                unlockedRes,
                albumsRes,
                sharedRes,
            ] = await Promise.all([
                leaderboardService.getTopGifters(5, period),
                leaderboardService.getMostGiftedArtists(5, period),
                leaderboardService.getMostPlayedTracks(5, period),
                leaderboardService.getLeaderboardStats(period),
                leaderboardService.getHighestUnlocked(5, period, 'track'),
                leaderboardService.getTopAlbums(5, period),
                leaderboardService.getMostShared(5, period, 'track'),
            ]);

            setTopGifters(giftersRes.entries);
            setMostGiftedArtists(artistsRes.entries);
            setMostPlayedTracks(tracksRes.entries);
            setStats(statsRes);
            setHighestUnlocked(unlockedRes.entries);
            setTopAlbums(albumsRes.entries);
            setMostShared(sharedRes.entries);

            // Fetch artist top fans if user is an artist
            if (user?.id && (user.role === 'artist' || user.role === 'record_label')) {
                try {
                    const fansRes = await leaderboardService.getArtistTopFans(user.id, 5, period);
                    setArtistTopFans(fansRes.entries);
                } catch {
                    // User may not have top fans data yet
                    setArtistTopFans([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [timeFilter, user?.id, user?.role]);

    useEffect(() => {
        void fetchLeaderboardData();
    }, [fetchLeaderboardData]);

    // Map API data to LeaderboardCard format
    const mapTopGiftersToItems = (data: TopGifterDto[]): LeaderboardItem[] =>
        data.map(g => ({
            rank: g.rank,
            name: g.displayName || g.username || 'Unknown',
            value: g.totalGiftValue.toLocaleString(),
            avatarUrl: g.avatarUrl,
        }));

    const mapMostGiftedArtistsToItems = (data: MostGiftedArtistDto[]): LeaderboardItem[] =>
        data.map(a => ({
            rank: a.rank,
            name: a.artistName || 'Unknown Artist',
            value: a.totalReceived.toLocaleString(),
            avatarUrl: a.avatarUrl,
        }));

    const mapMostPlayedTracksToItems = (data: MostPlayedTrackDto[]): LeaderboardItem[] =>
        data.map(t => ({
            rank: t.rank,
            name: t.title || 'Unknown Track',
            value: t.playCount.toLocaleString(),
            avatarUrl: t.coverUrl,
        }));

    const mapArtistTopFansToItems = (data: ArtistTopFanDto[]): LeaderboardItem[] =>
        data.map(f => ({
            rank: f.rank,
            name: f.displayName || f.username || 'Unknown',
            value: f.totalGiftValue.toLocaleString(),
            avatarUrl: f.avatarUrl,
        }));

    const mapHighestUnlockedToItems = (data: HighestUnlockedContentDto[]): LeaderboardItem[] =>
        data.map(c => ({
            rank: c.rank,
            name: c.title || 'Unknown Content',
            value: c.unlockCount.toLocaleString(),
            avatarUrl: c.coverUrl,
        }));

    const mapTopAlbumsToItems = (data: TopAlbumDto[]): LeaderboardItem[] =>
        data.map(a => ({
            rank: a.rank,
            name: a.title || 'Unknown Album',
            value: a.totalPlayCount.toLocaleString(),
            avatarUrl: a.coverArtUrl,
        }));

    const mapMostSharedToItems = (data: MostSharedContentDto[]): LeaderboardItem[] =>
        data.map(c => ({
            rank: c.rank,
            name: c.title || 'Unknown Content',
            value: c.shareCount.toLocaleString(),
            avatarUrl: c.coverUrl,
        }));

    // Empty state for categories without data
    const emptyState: LeaderboardItem[] = [
        { rank: 1, name: 'No data available', value: '-' },
    ];

    // Build leaderboard data from API or empty state
    const leaderboardData = {
        highestUnlocked: highestUnlocked.length > 0
            ? mapHighestUnlockedToItems(highestUnlocked)
            : emptyState,
        highestGifted: mostGiftedArtists.length > 0
            ? mapMostGiftedArtistsToItems(mostGiftedArtists)
            : emptyState,
        highestPlayed: mostPlayedTracks.length > 0
            ? mapMostPlayedTracksToItems(mostPlayedTracks)
            : emptyState,
        topPlayedAlbums: topAlbums.length > 0
            ? mapTopAlbumsToItems(topAlbums)
            : emptyState,
        topPlayedSingle: mostPlayedTracks.length > 0
            ? mapMostPlayedTracksToItems(mostPlayedTracks)
            : emptyState,
        highestGiven: mostGiftedArtists.length > 0
            ? mapMostGiftedArtistsToItems(mostGiftedArtists)
            : emptyState,
        topGiver: topGifters.length > 0
            ? mapTopGiftersToItems(topGifters)
            : emptyState,
        topFans: artistTopFans.length > 0
            ? mapArtistTopFansToItems(artistTopFans)
            : emptyState,
        mostShared: mostShared.length > 0
            ? mapMostSharedToItems(mostShared)
            : emptyState,
    };

    // Build table data from API responses
    const tableData = isLoading ? [] : [
        ...mostPlayedTracks.slice(0, 3).map((t, i) => ({
            no: i + 1,
            name: t.title || 'Unknown Track',
            category: 'Plays',
            totalCounts: t.playCount.toLocaleString(),
            date: '-',
            amount: '-',
        })),
        ...mostGiftedArtists.slice(0, 2).map((a, i) => ({
            no: i + 4,
            name: a.artistName || 'Unknown Artist',
            category: 'Gifting',
            totalCounts: a.giftCount.toLocaleString(),
            date: '-',
            amount: formatNaira(a.totalReceived / 100),
        })),
        ...topGifters.slice(0, 2).map((g, i) => ({
            no: i + 6,
            name: g.displayName || g.username || 'Unknown',
            category: 'Giver',
            totalCounts: g.giftCount.toLocaleString(),
            date: '-',
            amount: formatNaira(g.totalGiftValue / 100),
        })),
    ];


    return (
        <VStack align="stretch" gap={6}>
            {/* Time Filters and Earnings */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <AnimatedTabs
                    tabs={timeTabs}
                    activeTab={timeFilter}
                    onTabChange={(tabId) => setTimeFilter(tabId as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    selectedColor="red.500"
                    size="sm"
                />
                <HStack gap={6}>
                    <VStack align="end" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {formatNaira((stats?.totalEarningsToday ?? 0) / 100)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Earnings Today
                        </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {formatNaira((stats?.totalEarningsThisPeriod ?? 0) / 100)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Earnings ({getPeriodLabel(timeFilter)})
                        </Text>
                    </VStack>
                </HStack>
            </Flex>

            {/* Leaderboard Cards Grid */}
            {isLoading ? (
                <Center py={12}>
                    <Spinner size="lg" color="primary.500" />
                </Center>
            ) : (
                <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={4}
                    maxW="100%"
                    overflow="hidden"
                >
                    <LeaderboardCard title="Highest Unlocked" data={leaderboardData.highestUnlocked} />
                    <LeaderboardCard title="Highest Gifted" data={leaderboardData.highestGifted} />
                    <LeaderboardCard title="Highest Played" data={leaderboardData.highestPlayed} />
                    <LeaderboardCard title="Top Played Albums" data={leaderboardData.topPlayedAlbums} />
                    <LeaderboardCard title="Top Played Single" data={leaderboardData.topPlayedSingle} />
                    <LeaderboardCard title="Highest Given" data={leaderboardData.highestGiven} />
                    <LeaderboardCard title="Top Giver" data={leaderboardData.topGiver} />
                    <LeaderboardCard title="Top Fans" data={leaderboardData.topFans} />
                    <LeaderboardCard title="Most Shared" data={leaderboardData.mostShared} />
                </Grid>
            )}

            {/* Detailed Leaderboard Table */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
                <VStack align="stretch" gap={0}>
                    {/* Table Header */}
                    <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.200">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Leaderboard
                        </Text>
                        <HStack gap={4}>
                            {/* Filter Tabs */}
                            <Select
                                options={leaderboardOptions}
                                value={leaderboardFilter}
                                onChange={setLeaderboardFilter}
                                backgroundColor="primary.500"
                                textColor="white"
                                borderColor="primary.500"
                                iconColor="white"
                                width="140px"
                            />
                            {/* Sort Dropdown */}
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
                        </HStack>
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
                            {tableData.map((row, index) => (
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
                            ))}
                        </Box>
                    </Box>
                </VStack>
            </Box>
        </VStack>
    );
};
