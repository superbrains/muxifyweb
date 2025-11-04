import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Flex,
    Grid,
    Badge,
} from '@chakra-ui/react';
import { AnimatedTabs, Select } from '@shared/components';
import { formatNaira } from '@shared/utils';
import { LeaderboardCard } from './LeaderboardCard';

export const MusicLeaderboard: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [leaderboardFilter, setLeaderboardFilter] = useState<string>('all');
    const [sortFilter, setSortFilter] = useState<string>('latest');

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

    // Sample data for leaderboard cards
    const leaderboardData = {
        highestUnlocked: [
            { rank: 1, name: 'With you ft Omah Lay', value: '150,000,000', avatar: '🎵' },
            { rank: 2, name: 'Sive', value: '145,673,000', avatar: '🎵' },
            { rank: 3, name: 'Skelewu', value: '14,673,000', avatar: '🎵' },
            { rank: 4, name: 'Caroline ft Sinzu', value: '45,453', avatar: '🎵' },
            { rank: 5, name: 'The Money ft Olamide', value: '10,000', avatar: '🎵' },
        ],
        highestGifted: [
            { rank: 1, name: 'With you ft Omah Lay', value: '150,000,000', avatar: '🎵' },
            { rank: 2, name: 'Sive', value: '145,673,000', avatar: '🎵' },
            { rank: 3, name: 'Skelewu', value: '14,673,000', avatar: '🎵' },
            { rank: 4, name: 'Caroline ft Sinzu', value: '45,453', avatar: '🎵' },
            { rank: 5, name: 'The Money ft Olamide', value: '10,000', avatar: '🎵' },
        ],
        highestPlayed: [
            { rank: 1, name: 'With you ft Omah Lay', value: '150,000,000', avatar: '🎵' },
            { rank: 2, name: 'Sive', value: '145,673,000', avatar: '🎵' },
            { rank: 3, name: 'Skelewu', value: '14,673,000', avatar: '🎵' },
            { rank: 4, name: 'Caroline ft Sinzu', value: '45,453', avatar: '🎵' },
            { rank: 5, name: 'The Money ft Olamide', value: '10,000', avatar: '🎵' },
        ],
        topPlayedAlbums: [
            { rank: 1, name: 'With you ft Omah Lay', value: '150,000,000', avatar: '🎵' },
            { rank: 2, name: 'Sive', value: '145,673,000', avatar: '🎵' },
            { rank: 3, name: 'Skelewu', value: '14,673,000', avatar: '🎵' },
            { rank: 4, name: 'Caroline ft Sinzu', value: '45,453', avatar: '🎵' },
            { rank: 5, name: 'The Money ft Olamide', value: '10,000', avatar: '🎵' },
        ],
        topPlayedSingle: [
            { rank: 1, name: 'big_josh', value: '150,000,000', avatar: '👤' },
            { rank: 2, name: 'aku_baby', value: '145,673,000', avatar: '👤' },
            { rank: 3, name: 'moving_man', value: '14,673,000', avatar: '👤' },
            { rank: 4, name: 'nem_boy', value: '45,453', avatar: '👤' },
            { rank: 5, name: 'webby_baby', value: '10,000', avatar: '👤' },
        ],
        highestGiven: [
            { rank: 1, name: 'With you ft Omah Lay', value: '150,000,000', avatar: '🎵' },
            { rank: 2, name: 'Sive', value: '145,673,000', avatar: '🎵' },
            { rank: 3, name: 'Skelewu', value: '14,673,000', avatar: '🎵' },
            { rank: 4, name: 'Caroline ft Sinzu', value: '45,453', avatar: '🎵' },
            { rank: 5, name: 'The Money ft Olamide', value: '10,000', avatar: '🎵' },
        ],
        topGiver: [
            { rank: 1, name: 'big_josh', value: '150,000,000', avatar: '👤' },
            { rank: 2, name: 'aku_baby', value: '145,673,000', avatar: '👤' },
            { rank: 3, name: 'moving_man', value: '14,673,000', avatar: '👤' },
            { rank: 4, name: 'nem_boy', value: '45,453', avatar: '👤' },
            { rank: 5, name: 'webby_baby', value: '10,000', avatar: '👤' },
        ],
        topFans: [
            { rank: 1, name: 'big_josh', value: '150,000,000', avatar: '👤' },
            { rank: 2, name: 'aku_baby', value: '145,673,000', avatar: '👤' },
            { rank: 3, name: 'moving_man', value: '14,673,000', avatar: '👤' },
            { rank: 4, name: 'nem_boy', value: '45,453', avatar: '👤' },
            { rank: 5, name: 'webby_baby', value: '10,000', avatar: '👤' },
        ],
        mostShared: [
            { rank: 1, name: 'With you ft Omah Lay', value: '150,000,000', avatar: '🎵' },
            { rank: 2, name: 'Sive', value: '145,673,000', avatar: '🎵' },
            { rank: 3, name: 'Skelewu', value: '14,673,000', avatar: '🎵' },
            { rank: 4, name: 'Caroline ft Sinzu', value: '45,453', avatar: '🎵' },
            { rank: 5, name: 'The Money ft Olamide', value: '10,000', avatar: '🎵' },
        ],
    };

    // Sample data for detailed table
    const tableData = [
        { no: 1, name: 'With You ft. Omah Lay', category: 'Plays', totalCounts: '150,000,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 2, name: 'Sive', category: 'Gifting', totalCounts: '145,673,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 3, name: 'Skelewu', category: 'Unlocked', totalCounts: '14,673,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 4, name: 'Caroline ft. Sinzu', category: 'Gifting', totalCounts: '45,455', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 5, name: 'big_josh', category: 'Fans', totalCounts: '-', date: '26/8/2025', amount: '-' },
        { no: 6, name: 'The Money ft. Olamide', category: 'Shares', totalCounts: '10,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 7, name: 'big_jash', category: 'Giver', totalCounts: '100', date: '26/8/2025', amount: formatNaira(50000) },
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
                            {formatNaira(25550000)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Earning Today
                        </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            {formatNaira(100000000)}
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Earning Today
                        </Text>
                    </VStack>
                </HStack>
            </Flex>

            {/* Leaderboard Cards Grid */}
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
