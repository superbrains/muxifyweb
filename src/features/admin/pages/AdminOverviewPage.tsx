import React from 'react';
import { Grid, GridItem, VStack } from '@chakra-ui/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminKpiStrip } from '../components/AdminKpiStrip';
import { AdminError, AdminLoading } from '../components/AdminStateBlock';
import { PlatformActivityChart } from '../components/overview/PlatformActivityChart';
import { PendingQueueCard } from '../components/overview/PendingQueueCard';
import { RecentSignupsCard } from '../components/overview/RecentSignupsCard';
import { useAdminOverview } from '../hooks/useAdminOverview';

const AdminOverviewPage: React.FC = () => {
    const { data, isLoading, error } = useAdminOverview();

    return (
        <VStack
            gap={{ base: 4, lg: 5 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="Platform Overview"
                subtitle="Health of artists, labels, fans and the review queues at a glance"
            />

            {isLoading ? (
                <AdminLoading />
            ) : error || !data ? (
                <AdminError error={error} message="Could not load the platform overview." />
            ) : (
                <>
                    <AdminKpiStrip overview={data} />

                    <Grid
                        templateColumns={{ base: '1fr', lg: '1.7fr 1fr' }}
                        gap={{ base: 4, lg: 5 }}
                    >
                        <GridItem>
                            <PlatformActivityChart />
                        </GridItem>
                        <GridItem>
                            <PendingQueueCard overview={data} />
                        </GridItem>
                    </Grid>

                    <RecentSignupsCard users={data.recentSignups ?? []} />
                </>
            )}
        </VStack>
    );
};

export default AdminOverviewPage;
