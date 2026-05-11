import React from 'react';
import { VStack, Box, Text, SimpleGrid, Spinner, HStack, Center } from '@chakra-ui/react';
import { useLabelSummary } from '../hooks/useLabelSummary';
import { VerificationBanner } from '../components/VerificationBanner';
import { KpiCard } from '../components/KpiCard';
import { formatMinorAmount } from '../lib/format';

const RecordLabelDashboard: React.FC = () => {
    const { data: summary, isLoading, error } = useLabelSummary();

    if (isLoading) {
        return (
            <Center minH="60vh" w="full" bg="gray.50">
                <Spinner size="lg" color="primary.500" />
            </Center>
        );
    }

    if (error || !summary) {
        return (
            <Center minH="60vh" w="full" bg="gray.50">
                <Text fontSize="sm" color="gray.500">
                    Could not load your dashboard. Please refresh.
                </Text>
            </Center>
        );
    }

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <VerificationBanner
                status={summary.verificationStatus}
                rejectionReason={summary.verificationRejectionReason}
            />

            <HStack justify="space-between" align="flex-end" px={{ base: 1, md: 0 }}>
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Label Overview
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        Roster, releases, and payouts at a glance
                    </Text>
                </Box>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 5 }} gap={4}>
                <KpiCard
                    bg="#F6F1FF"
                    iconColor="#8B5CF6"
                    label="Roster size"
                    value={summary.rosterCount.toString()}
                />
                <KpiCard
                    bg="#FFF5F3"
                    iconColor="primary.500"
                    label="Releases (30d)"
                    value={summary.releasesLast30d.toString()}
                />
                <KpiCard
                    bg="#FFF5F6"
                    iconColor="primary.500"
                    label="Revenue (MTD)"
                    value={formatMinorAmount(summary.mtdRevenueMinor, summary.currency)}
                />
                <KpiCard
                    bg="#E7FFF7"
                    iconColor="green.500"
                    label="Pending payouts"
                    value={formatMinorAmount(summary.pendingPayoutsAmountMinor, summary.currency)}
                    sub={`${summary.pendingPayoutsCount} payout${summary.pendingPayoutsCount === 1 ? '' : 's'}`}
                />
                <KpiCard
                    bg="#ECF7FF"
                    iconColor="#3B82F6"
                    label="Streams (30d)"
                    value={summary.streamsLast30d.toLocaleString()}
                />
            </SimpleGrid>
        </VStack>
    );
};

export default RecordLabelDashboard;
