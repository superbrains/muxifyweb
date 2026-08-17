import React from 'react';
import { Box } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { AnimatedTabs } from '@shared/components';
import { AdminPageLayout } from '@shared/console';
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
        <AdminPageLayout
            title="Support & Moderation"
            subtitle="Resolve support tickets and act on flagged content"
            breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Support' }]}
            toolbar={
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
            }
        >
            {tab === 'moderation' ? <ModerationPanel /> : <TicketsPanel />}
        </AdminPageLayout>
    );
};

export default SupportPage;
