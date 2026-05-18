import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AnimatedTabs } from '@shared/components';
import { TicketsPanel } from '../components/support/TicketsPanel';
import { ModerationPanel } from '../components/support/ModerationPanel';

const TABS = [
    { id: 'tickets', label: 'Support Tickets' },
    { id: 'moderation', label: 'Content Moderation' },
];

const SupportPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') === 'moderation' ? 'moderation' : 'tickets';

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="Support & Moderation"
                subtitle="Resolve support tickets and act on flagged content"
            />

            <Box>
                <AnimatedTabs
                    tabs={TABS}
                    activeTab={tab}
                    onTabChange={(id) =>
                        setSearchParams(id === 'moderation' ? { tab: 'moderation' } : {})
                    }
                    size="sm"
                />
            </Box>

            {tab === 'moderation' ? <ModerationPanel /> : <TicketsPanel />}
        </VStack>
    );
};

export default SupportPage;
