import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
    Badge,
} from '@chakra-ui/react';
import { FiPlay, FiMusic, FiDisc, FiUnlock, FiGift, FiHeart, FiShare2 } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { formatNaira } from '@shared/utils';
import { LeaderboardCard, type LeaderboardItem } from './LeaderboardCard';
import { leaderboardService } from '../services/leaderboardService';
import { useUserStore } from '@/app/store/useUserStore';
import type {
    TopGifterDto,
    MostPlayedTrackDto,
    ArtistTopFanDto,
    LeaderboardStatsDto,
    HighestUnlockedContentDto,
    TopAlbumDto,
    TopSingleDto,
    MostSharedContentDto,
    MostGiftedContentDto,
    LeaderboardPeriod,
    LeaderboardScope,
} from '../types';

// Map UI time filter to API period
const mapTimeFilterToPeriod = (filter: string): LeaderboardPeriod => {
    switch (filter) {
        case 'daily': return 'day';
        case 'weekly': return 'week';
        case 'monthly': return 'month';
        case 'yearly': return 'year';
        default: return 'all-time';
    }
};

const getPeriodLabel = (filter: string): string => {
    switch (filter) {
        case 'daily': return 'Today';
        case 'weekly': return 'This Week';
        case 'monthly': return 'This Month';
        case 'yearly': return 'This Year';
        default: return 'All Time';
    }
};

interface MusicLeaderboardProps {
    scope: LeaderboardScope;
}

export const MusicLeaderboard: React.FC<MusicLeaderboardProps> = ({ scope }) => {
    const { user } = useUserStore();
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

    // API data states
    const [stats, setStats] = useState<LeaderboardStatsDto | null>(null);
    const [topGivers, setTopGivers] = useState<(TopGifterDto | ArtistTopFanDto)[]>([]);
    const [mostPlayedTracks, setMostPlayedTracks] = useState<MostPlayedTrackDto[]>([]);
    const [topSingles, setTopSingles] = useState<TopSingleDto[]>([]);
    const [highestUnlocked, setHighestUnlocked] = useState<HighestUnlockedContentDto[]>([]);
    const [topAlbums, setTopAlbums] = useState<TopAlbumDto[]>([]);
    const [mostShared, setMostShared] = useState<MostSharedContentDto[]>([]);
    const [mostGifted, setMostGifted] = useState<MostGiftedContentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const timeTabs = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
    ];

    const isMine = scope === 'mine';
    const canScopeToFans = !!user?.id && (user.role === 'artist' || user.role === 'record_label');

    const fetchLeaderboardData = useCallback(async () => {
        setIsLoading(true);
        const period = mapTimeFilterToPeriod(timeFilter);

        try {
            const [
                playedRes,
                singlesRes,
                albumsRes,
                unlockedRes,
                giftedRes,
                sharedRes,
                statsRes,
            ] = await Promise.all([
                leaderboardService.getMostPlayedTracks(5, period, scope),
                leaderboardService.getTopSingles(5, period, scope),
                leaderboardService.getTopAlbums(5, period, scope),
                leaderboardService.getHighestUnlocked(5, period, 'track', scope),
                leaderboardService.getMostGiftedContent(5, period, 'track', scope),
                leaderboardService.getMostShared(5, period, 'track', scope),
                leaderboardService.getLeaderboardStats(period),
            ]);

            setMostPlayedTracks(playedRes.entries);
            setTopSingles(singlesRes.entries);
            setTopAlbums(albumsRes.entries);
            setHighestUnlocked(unlockedRes.entries);
            setMostGifted(giftedRes.entries);
            setMostShared(sharedRes.entries);
            setStats(statsRes);

            // Top givers: "mine" → my top fans; "global" → platform-wide top gifters.
            if (isMine && canScopeToFans) {
                try {
                    const fansRes = await leaderboardService.getArtistTopFans(user!.id, 5, period);
                    setTopGivers(fansRes.entries);
                } catch {
                    setTopGivers([]);
                }
            } else {
                const giftersRes = await leaderboardService.getTopGifters(5, period);
                setTopGivers(giftersRes.entries);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [timeFilter, scope, isMine, canScopeToFans, user]);

    useEffect(() => {
        void fetchLeaderboardData();
    }, [fetchLeaderboardData]);

    // ---- Mappers to the card item shape ----
    const playedItems: LeaderboardItem[] = mostPlayedTracks.map(t => ({
        rank: t.rank, name: t.title || 'Unknown Track', value: t.playCount.toLocaleString(), avatarUrl: t.coverUrl,
    }));
    const singleItems: LeaderboardItem[] = topSingles.map(t => ({
        rank: t.rank, name: t.title || 'Unknown Single', value: t.playCount.toLocaleString(), avatarUrl: t.coverUrl,
    }));
    const albumItems: LeaderboardItem[] = topAlbums.map(a => ({
        rank: a.rank, name: a.title || 'Unknown Album', value: a.totalPlayCount.toLocaleString(), avatarUrl: a.coverArtUrl,
    }));
    const unlockedItems: LeaderboardItem[] = highestUnlocked.map(c => ({
        rank: c.rank, name: c.title || 'Unknown Content', value: c.unlockCount.toLocaleString(), avatarUrl: c.coverUrl,
    }));
    const giftedItems: LeaderboardItem[] = mostGifted.map(c => ({
        rank: c.rank, name: c.title || 'Unknown Content', value: c.totalGiftValue.toLocaleString(), avatarUrl: c.coverUrl,
    }));
    const sharedItems: LeaderboardItem[] = mostShared.map(c => ({
        rank: c.rank, name: c.title || 'Unknown Content', value: c.shareCount.toLocaleString(), avatarUrl: c.coverUrl,
    }));
    const giverItems: LeaderboardItem[] = topGivers.map(g => ({
        rank: g.rank, name: g.displayName || g.username || 'Anonymous', value: g.totalGiftValue.toLocaleString(), avatarUrl: g.avatarUrl,
    }));

    // ---- Detailed breakdown table (monetary / engagement rows with real values) ----
    const tableData = isLoading ? [] : [
        ...mostGifted.slice(0, 3).map((c, i) => ({
            no: i + 1,
            name: c.title || 'Unknown Content',
            category: 'Gift',
            count: c.giftCount.toLocaleString(),
            value: `${c.totalGiftValue.toLocaleString()} coins`,
        })),
        ...highestUnlocked.slice(0, 3).map((c, i) => ({
            no: i + 4,
            name: c.title || 'Unknown Content',
            category: 'Unlock',
            count: c.unlockCount.toLocaleString(),
            value: `${c.totalCoinsEarned.toLocaleString()} coins`,
        })),
        ...topGivers.slice(0, 3).map((g, i) => ({
            no: i + 7,
            name: g.displayName || g.username || 'Anonymous',
            category: isMine ? 'Fan' : 'Giver',
            count: g.giftCount.toLocaleString(),
            value: `${g.totalGiftValue.toLocaleString()} coins`,
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
                {!isMine && (
                    <HStack gap={6}>
                        <VStack align="end" gap={1}>
                            <Text fontSize="lg" color="red.500" fontWeight="bold">
                                {formatNaira((stats?.totalEarningsToday ?? 0) / 100)}
                            </Text>
                            <Text fontSize="11px" color="gray.900">Total Earnings Today</Text>
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
                )}
            </Flex>

            {/* Leaderboard Cards Grid */}
            <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={4}
                maxW="100%"
            >
                <LeaderboardCard title="Most Played" icon={FiPlay} variant="content" fallbackIcon={FiMusic} valueLabel="plays" data={playedItems} loading={isLoading} />
                <LeaderboardCard title="Top Singles" icon={FiMusic} variant="content" fallbackIcon={FiMusic} valueLabel="plays" data={singleItems} loading={isLoading} />
                <LeaderboardCard title="Top Albums" icon={FiDisc} variant="content" fallbackIcon={FiDisc} valueLabel="plays" data={albumItems} loading={isLoading} />
                <LeaderboardCard title="Most Unlocked" icon={FiUnlock} variant="content" fallbackIcon={FiMusic} valueLabel="unlocks" data={unlockedItems} loading={isLoading} />
                <LeaderboardCard title="Most Gifted" icon={FiGift} variant="content" fallbackIcon={FiMusic} valueLabel="coins" data={giftedItems} loading={isLoading} />
                <LeaderboardCard title={isMine ? 'Your Top Fans' : 'Top Givers'} icon={FiHeart} variant="people" valueLabel="coins" data={giverItems} loading={isLoading} emptyLabel={isMine ? 'No fans yet' : 'No data yet'} />
                <LeaderboardCard title="Most Shared" icon={FiShare2} variant="content" fallbackIcon={FiMusic} valueLabel="shares" data={sharedItems} loading={isLoading} />
            </Grid>

            {/* Detailed Breakdown Table */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
                <Flex justify="space-between" align="center" p={5} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        {isMine ? 'Your Engagement Breakdown' : 'Engagement Breakdown'}
                    </Text>
                    <Text fontSize="11px" color="gray.500">{getPeriodLabel(timeFilter)}</Text>
                </Flex>
                <Box as="table" w="100%" borderCollapse="separate" borderSpacing="0">
                    <Box as="thead" bg="red.500">
                        <Box as="tr">
                            <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={3} px={4} textAlign="left">No.</Box>
                            <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={3} px={4} textAlign="left">Name</Box>
                            <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={3} px={4} textAlign="left">Category</Box>
                            <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={3} px={4} textAlign="left">Count</Box>
                            <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={3} px={4} textAlign="left">Value</Box>
                        </Box>
                    </Box>
                    <Box as="tbody">
                        {tableData.length === 0 ? (
                            <Box as="tr">
                                <Box as="td" py={6} px={4} textAlign="center" color="gray.400" fontSize="13px" {...{ colSpan: 5 }}>
                                    No data available for this period.
                                </Box>
                            </Box>
                        ) : (
                            tableData.map((row, index) => (
                                <Box as="tr" key={index} _hover={{ bg: 'gray.50' }} borderBottom="1px solid" borderColor="gray.100">
                                    <Box as="td" fontSize="12px" fontWeight="semibold" py={3} px={4} color="red.500">
                                        {row.no.toString().padStart(2, '0')}
                                    </Box>
                                    <Box as="td" fontSize="12px" py={3} px={4} color="gray.800">{row.name}</Box>
                                    <Box as="td" fontSize="12px" py={3} px={4}>
                                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">{row.category}</Badge>
                                    </Box>
                                    <Box as="td" fontSize="12px" py={3} px={4} color="gray.700">{row.count}</Box>
                                    <Box as="td" fontSize="12px" fontWeight="semibold" py={3} px={4} color="red.500">{row.value}</Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
            </Box>
        </VStack>
    );
};
