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
import { FansAndSubscribersCard } from './FansAndSubscribersCard';

export const VideoTab: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [continentFilter, setContinentFilter] = useState<string>('all');
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const [sortFilter, setSortFilter] = useState<string>('latest');

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

    const activityOptions = [
        { id: 'all', label: 'All' },
        { id: 'views', label: 'Views (250,000)' },
        { id: 'gifts', label: 'Gifts (150,000)' },
        { id: 'unlocked', label: 'Unlocked (10,000)' },
        { id: 'shares', label: 'Shares (10,000)' },
    ];

    const sortOptions = [
        { value: 'latest', label: 'Latest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'popular', label: 'Most Popular' },
    ];

    // Sample data for leaderboard cards
    const leaderboardData = {
        topViewsByCountry: [
            { rank: 1, name: 'Nigeria', value: '150,000,000', avatar: '🇳🇬', country: 'Africa' },
            { rank: 2, name: 'United States', value: '145,673,000', avatar: '🇺🇸', country: 'America' },
            { rank: 3, name: 'Japan', value: '14,673,000', avatar: '🇯🇵', country: 'Asia' },
            { rank: 4, name: 'Poland', value: '45,453', avatar: '🇵🇱', country: 'Europe' },
            { rank: 5, name: 'United Kingdom', value: '10,000', avatar: '🇬🇧', country: 'Europe' },
        ],
        topGiversByCountry: [
            { rank: 1, name: 'Nigeria', value: '150,000,000', avatar: '🇳🇬', country: 'Africa' },
            { rank: 2, name: 'United States', value: '145,673,000', avatar: '🇺🇸', country: 'America' },
            { rank: 3, name: 'Japan', value: '14,673,000', avatar: '🇯🇵', country: 'Asia' },
            { rank: 4, name: 'Poland', value: '45,453', avatar: '🇵🇱', country: 'Europe' },
            { rank: 5, name: 'United Kingdom', value: '10,000', avatar: '🇬🇧', country: 'Europe' },
        ],
        topUnlockByCountry: [
            { rank: 1, name: 'Nigeria', value: '150,000,000', avatar: '🇳🇬', country: 'Africa' },
            { rank: 2, name: 'United States', value: '145,673,000', avatar: '🇺🇸', country: 'America' },
            { rank: 3, name: 'Japan', value: '14,673,000', avatar: '🇯🇵', country: 'Asia' },
            { rank: 4, name: 'Poland', value: '45,453', avatar: '🇵🇱', country: 'Europe' },
            { rank: 5, name: 'United Kingdom', value: '10,000', avatar: '🇬🇧', country: 'Europe' },
        ],
        topGivers: [
            { rank: 1, name: 'big_josh', value: '150,000,000', avatar: '👤', country: 'Nigeria' },
            { rank: 2, name: 'aku_baby', value: '145,673,000', avatar: '👤', country: 'Ghana' },
            { rank: 3, name: 'moving_man', value: '14,673,000', avatar: '👤', country: 'United Kingdom' },
            { rank: 4, name: 'nero_boy', value: '45,453', avatar: '👤', country: 'United States' },
            { rank: 5, name: 'webby_baby', value: '10,000', avatar: '👤', country: 'Rwanda' },
        ],
        topUnlocked: [
            { rank: 1, name: 'big_josh', value: '150,000,000', avatar: '👤', country: 'Nigeria' },
            { rank: 2, name: 'aku_baby', value: '145,673,000', avatar: '👤', country: 'Ghana' },
            { rank: 3, name: 'moving_man', value: '14,673,000', avatar: '👤', country: 'United Kingdom' },
            { rank: 4, name: 'nero_boy', value: '45,453', avatar: '👤', country: 'United States' },
            { rank: 5, name: 'webby_baby', value: '10,000', avatar: '👤', country: 'Rwanda' },
        ],
    };

    // Sample data for activity table
    const tableData = [
        { no: 1, name: 'big_josh', category: 'Gifting', totalCounts: '150,000,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 2, name: 'big_josh', category: 'Gifting', totalCounts: '145,673,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 3, name: 'nero_boy', category: 'Unlocked', totalCounts: '14,673,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 4, name: 'aku_baby', category: 'Gifting', totalCounts: '45,453', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 5, name: 'big_josh', category: 'Shares', totalCounts: '200', date: '26/8/2025', amount: '-' },
        { no: 6, name: 'webby_baby', category: 'Unlocked', totalCounts: '10,000', date: '26/8/2025', amount: formatNaira(50000) },
        { no: 7, name: 'big_josh', category: 'Gifting', totalCounts: '100', date: '26/8/2025', amount: formatNaira(50000) },
    ];


    return (
        <VStack bg="white" borderTopRadius="xl" p={6} overflow="hidden" align="stretch" gap={6}>
            {/* Time Filters and Statistics */}
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
                            75,550,000
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Views
                        </Text>
                    </VStack>
                    <VStack align="end" gap={1}>
                        <Text fontSize="lg" color="red.500" fontWeight="bold">
                            75,550,000
                        </Text>
                        <Text fontSize="11px" color="gray.900">
                            Total Followers (Fans)
                        </Text>
                    </VStack>

                </HStack>
            </Flex>
            <Box className="" w="full" display="flex" justifyContent="end">
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
                <FansAndSubscribersCard title="Top views by country" data={leaderboardData.topViewsByCountry} />
                <FansAndSubscribersCard title="Top givers by country" data={leaderboardData.topGiversByCountry} />
                <FansAndSubscribersCard title="Top unlock by country" data={leaderboardData.topUnlockByCountry} />
                <FansAndSubscribersCard title="Top Givers" data={leaderboardData.topGivers} />
                <FansAndSubscribersCard title="Top Unlocked" data={leaderboardData.topUnlocked} />
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
                            borderColor="gray.400"
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
