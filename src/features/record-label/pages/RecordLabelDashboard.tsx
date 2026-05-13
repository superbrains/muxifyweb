import React from 'react';
import {
    Box,
    Center,
    Flex,
    Grid,
    SimpleGrid,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';
import { useLabelSummary } from '../hooks/useLabelSummary';
import { useLabelReleaseSummary } from '../hooks/useLabelReleases';
import { VerificationBanner } from '../components/VerificationBanner';
import { KpiCard } from '../components/KpiCard';
import { DashboardHero } from '../components/DashboardHero';
import { StreamsAreaChart } from '../components/StreamsAreaChart';
import { RevenueByArtistChart } from '../components/RevenueByArtistChart';
import { RevenueShareDonut } from '../components/RevenueShareDonut';
import { ReleasesPipelineCard } from '../components/ReleasesPipelineCard';
import { TopArtistsCard } from '../components/TopArtistsCard';
import { PendingPayoutsCard } from '../components/PendingPayoutsCard';
import { RosterPulseCard } from '../components/RosterPulseCard';
import { SplitsAttentionCard } from '../components/SplitsAttentionCard';
import { formatMinorAmount, formatTrend } from '../lib/format';

const RecordLabelDashboard: React.FC = () => {
    const { data: summary, isLoading, error } = useLabelSummary();
    const { data: releaseSummary } = useLabelReleaseSummary();

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

    const revenueTrend = formatTrend(summary.mtdRevenueMinor, summary.prevMonthRevenueMinor);
    const streamsTrend = releaseSummary
        ? formatTrend(releaseSummary.streamsLast30d, releaseSummary.streamsPrev30d)
        : undefined;
    const rosterGrowth = summary.rosterGrowthLast30d;
    const rosterTrend =
        rosterGrowth === 0
            ? undefined
            : {
                  deltaPct: Math.abs(rosterGrowth),
                  isPositive: rosterGrowth > 0,
              };

    return (
        <Stack
            gap={{ base: 3, lg: 5 }}
            bg="gray.50"
            minH="100vh"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <VerificationBanner
                status={summary.verificationStatus}
                rejectionReason={summary.verificationRejectionReason}
            />

            <DashboardHero verificationStatus={summary.verificationStatus} />

            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={3}>
                <KpiCard
                    bg="#F6F1FF"
                    iconColor="#8B5CF6"
                    label="Roster size"
                    value={summary.rosterCount.toString()}
                    trend={rosterTrend}
                    trendCaption={rosterTrend ? 'last 30d' : undefined}
                    sub={rosterGrowth === 0 ? 'No change in 30 days' : undefined}
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
                    trend={revenueTrend}
                    trendCaption={revenueTrend ? 'vs last month' : undefined}
                />
                <KpiCard
                    bg="#E7FFF7"
                    iconColor="green.500"
                    label="Pending payouts"
                    value={formatMinorAmount(
                        summary.pendingPayoutsAmountMinor,
                        summary.currency,
                    )}
                    sub={`${summary.pendingPayoutsCount} payout${
                        summary.pendingPayoutsCount === 1 ? '' : 's'
                    }`}
                />
                <KpiCard
                    bg="#ECF7FF"
                    iconColor="#3B82F6"
                    label="Streams (30d)"
                    value={summary.streamsLast30d.toLocaleString()}
                    trend={streamsTrend}
                    trendCaption={streamsTrend ? 'vs prev 30d' : undefined}
                />
            </SimpleGrid>

            <Grid
                templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                gap={{ base: 3, lg: 4 }}
                alignItems="start"
            >
                <Stack gap={{ base: 3, lg: 4 }}>
                    <StreamsAreaChart />
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        gap={{ base: 3, lg: 4 }}
                        align="stretch"
                    >
                        <Box flex={{ base: '1 1 auto', md: 2 }}>
                            <RevenueByArtistChart currency={summary.currency} />
                        </Box>
                        <Box flex={{ base: '1 1 auto', md: 1 }}>
                            <RevenueShareDonut currency={summary.currency} />
                        </Box>
                    </Flex>
                    <ReleasesPipelineCard />
                </Stack>

                <Stack gap={{ base: 3, lg: 4 }}>
                    <TopArtistsCard />
                    <PendingPayoutsCard />
                    <RosterPulseCard />
                    <SplitsAttentionCard />
                </Stack>
            </Grid>
        </Stack>
    );
};

export default RecordLabelDashboard;
