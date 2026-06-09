import React from 'react';
import {
    Box,
    Center,
    Grid,
    HStack,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { formatNaira } from '@shared/utils';
import {
    useContributorEarningsSummary,
    useContributorEarningsHistory,
} from '../hooks/useContributor';
import type { ContributorEarningType } from '../services/contributorService';

const earningTypeLabel = (type: ContributorEarningType): string => {
    switch (type) {
        case 'gift':
            return 'Gift';
        case 'unlock':
            return 'Content Unlock';
        case 'streaming':
            return 'Streaming';
        case 'bonus':
            return 'Bonus';
        case 'referral':
            return 'Referral';
        case 'split':
            return 'Split';
        default:
            return type;
    }
};

interface StatCardProps {
    label: string;
    value: string;
    accent?: boolean;
    helper?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, accent, helper }) => (
    <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        p={5}
    >
        <Text fontSize="xs" color="gray.500" mb={1}>
            {label}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color={accent ? 'primary.500' : 'gray.900'}>
            {value}
        </Text>
        {helper && (
            <Text fontSize="11px" color="gray.400" mt={1}>
                {helper}
            </Text>
        )}
    </Box>
);

const ContributorDashboardPage: React.FC = () => {
    const summaryQuery = useContributorEarningsSummary();
    const historyQuery = useContributorEarningsHistory({ pageSize: 20 });

    const summary = summaryQuery.data;
    const earnings = historyQuery.data?.earnings ?? [];

    if (summaryQuery.isLoading) {
        return (
            <Center minH="60vh">
                <Spinner size="xl" color="primary.500" />
            </Center>
        );
    }

    const growth = summary?.growthPercentage ?? 0;
    const growthLabel =
        growth === 0
            ? 'No change vs last month'
            : `${growth > 0 ? '+' : ''}${growth.toFixed(1)}% vs last month`;

    return (
        <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={6}>
                Contributor Dashboard
            </Text>

            {/* Summary cards */}
            <Grid
                templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }}
                gap={4}
                mb={6}
            >
                <StatCard
                    label="Available for withdrawal"
                    value={formatNaira(summary?.availableForWithdrawalDisplay ?? 0)}
                    accent
                />
                <StatCard
                    label="Total earned"
                    value={formatNaira(summary?.totalEarnedDisplay ?? 0)}
                    helper={growthLabel}
                />
                <StatCard
                    label="Pending withdrawal"
                    value={formatNaira(summary?.pendingWithdrawalDisplay ?? 0)}
                />
                <StatCard
                    label="Total withdrawn"
                    value={formatNaira(summary?.totalWithdrawnDisplay ?? 0)}
                />
            </Grid>

            {/* Earnings history */}
            <Box
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                overflow="hidden"
            >
                <Box p={5} borderBottom="1px solid" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Earnings History
                    </Text>
                </Box>

                {historyQuery.isLoading ? (
                    <Center py={16}>
                        <Spinner color="primary.500" />
                    </Center>
                ) : earnings.length === 0 ? (
                    <Center py={16}>
                        <VStack gap={1}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                No earnings yet
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Your contributor earnings will appear here once they accrue.
                            </Text>
                        </VStack>
                    </Center>
                ) : (
                    <Box as="table" w="100%" borderCollapse="separate" borderSpacing="0">
                        <Box as="thead" bg="primary.500">
                            <Box as="tr">
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">No.</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Type</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Description</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="left">Date</Box>
                                <Box as="th" color="white" fontSize="12px" fontWeight="semibold" py={4} px={4} textAlign="right">Net Amount</Box>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {earnings.map((e, index) => (
                                <Box as="tr" key={e.id} _hover={{ bg: 'gray.50' }}>
                                    <Box as="td" fontSize="12px" color="gray.600" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                        {String(index + 1).padStart(2, '0')}
                                    </Box>
                                    <Box as="td" fontSize="12px" color="gray.900" fontWeight="medium" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                        {earningTypeLabel(e.type)}
                                    </Box>
                                    <Box as="td" fontSize="12px" color="gray.900" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                        {e.description || 'N/A'}
                                    </Box>
                                    <Box as="td" fontSize="12px" color="gray.600" py={4} px={4} borderBottom="1px solid" borderColor="gray.100">
                                        {new Date(e.earnedAt).toLocaleDateString()}
                                    </Box>
                                    <Box as="td" fontSize="12px" color="gray.900" fontWeight="semibold" py={4} px={4} borderBottom="1px solid" borderColor="gray.100" textAlign="right">
                                        <HStack justify="flex-end" gap={2}>
                                            <Text>{formatNaira(e.netAmountDisplay)}</Text>
                                            {e.isWithdrawn && (
                                                <Text fontSize="10px" color="gray.400">(withdrawn)</Text>
                                            )}
                                        </HStack>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ContributorDashboardPage;
