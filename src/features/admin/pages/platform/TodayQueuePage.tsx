import React from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '@/features/record-label/components/KpiCard';
import { AdminPageLayout, AdminError, AdminLoading } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount } from '../../lib/format';
import { useTodayQueue } from '../../hooks/usePlatform';
import type { TodayQueue } from '../../types/platform';

interface QueueCard {
    label: string;
    value: number;
    to: string;
    bg: string;
    iconColor: string;
}

/** Tower — the operational "do this today" queue, each tile deep-linking to its area. */
const TodayQueuePage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useTodayQueue();

    const cards: QueueCard[] = ([
        { key: 'pendingVerifications', label: 'Pending Verifications', to: '/admin/verifications', bg: '#FFF9E6', iconColor: '#D97706' },
        { key: 'openTickets', label: 'Open Support Tickets', to: '/admin/support', bg: '#ECF7FF', iconColor: '#3B82F6' },
        { key: 'flaggedContent', label: 'Flagged Content', to: '/admin/content/moderation/artists', bg: '#FEF2F2', iconColor: '#E53E3E' },
        { key: 'pendingWithdrawals', label: 'Pending Withdrawals', to: '/admin/payouts/requests/artists', bg: '#F6F1FF', iconColor: '#7C3AED' },
        { key: 'pendingPayouts', label: 'Pending Payouts', to: '/admin/finance', bg: '#E7FFF7', iconColor: '#16A34A' },
        { key: 'pendingFinanceApprovals', label: 'Pending Finance Approvals', to: '/admin/finance/approvals', bg: '#FFF5F6', iconColor: 'primary.500' },
    ] as { key: keyof TodayQueue; label: string; to: string; bg: string; iconColor: string }[]).map((c) => ({
        label: c.label,
        value: data ? data[c.key] : 0,
        to: c.to,
        bg: c.bg,
        iconColor: c.iconColor,
    }));

    return (
        <AdminPageLayout
            title="Today's Queue"
            subtitle="Everything awaiting an action right now — click a tile to jump to its area"
            breadcrumbs={[{ label: 'Platform' }, { label: "Today's Queue" }]}
        >
            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error, "Could not load today's queue.")} />
            ) : (
                <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={3}>
                    {cards.map((c) => (
                        <Box
                            key={c.label}
                            as="button"
                            textAlign="left"
                            onClick={() => navigate(c.to)}
                            transition="transform 0.12s"
                            _hover={{ transform: 'translateY(-2px)' }}
                        >
                            <KpiCard bg={c.bg} iconColor={c.iconColor} label={c.label} value={formatCount(c.value)} />
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </AdminPageLayout>
    );
};

export default TodayQueuePage;
