import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { formatPercentBps } from '@/features/record-label/lib/format';
import {
    CoverThumb,
    DataTable,
    KpiStrip,
    StatusBadge,
    toneStyle,
} from '@/features/admin/components/ui';
import type { DataColumn, KpiItem } from '@/features/admin/components/ui';
import { useContributorSplits } from '../hooks/useContributor';
import { ContributorPageShell } from '../components/ContributorPageShell';
import { RaiseDisputeDialog } from '../components/RaiseDisputeDialog';
import type { ContributorSplitDto } from '../services/contributorService';

const splitStatus = (s: ContributorSplitDto) => {
    if (s.isFrozen) return toneStyle('warning', 'Frozen');
    if (s.disputeStatus === 'UnderReview') return toneStyle('warning', 'Under review');
    if (s.disputeStatus === 'Resolved') return toneStyle('success', 'Resolved');
    return toneStyle('success', 'Active');
};

const ContributorSplitsPage: React.FC = () => {
    const splitsQuery = useContributorSplits();
    const splits = splitsQuery.data?.splits ?? [];
    const [disputeFor, setDisputeFor] = React.useState<ContributorSplitDto | null>(null);

    const frozenCount = splits.filter((s) => s.isFrozen).length;
    const reviewCount = splits.filter((s) => s.disputeStatus === 'UnderReview').length;

    const kpis: KpiItem[] = [
        { label: 'Tracks you earn on', value: splits.length, tone: 'info' },
        { label: 'Frozen', value: frozenCount, tone: frozenCount > 0 ? 'warning' : 'neutral' },
        { label: 'Under review', value: reviewCount, tone: reviewCount > 0 ? 'warning' : 'neutral' },
    ];

    const columns: DataColumn<ContributorSplitDto>[] = [
        {
            key: 'track',
            header: 'Track',
            render: (s) => (
                <HStack gap={3} minW={0}>
                    <CoverThumb src={s.coverArtUrl} alt={s.trackTitle} size="38px" />
                    <VStack align="start" gap={0} minW={0}>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                            {s.trackTitle}
                        </Text>
                        <Text fontSize="11px" color="gray.500" lineClamp={1}>
                            {s.artistName || 'Unknown artist'}
                        </Text>
                    </VStack>
                </HStack>
            ),
        },
        {
            key: 'role',
            header: 'Your role',
            render: (s) => <StatusBadge style={toneStyle('neutral', s.role)} />,
        },
        {
            key: 'share',
            header: 'Your share',
            align: 'right',
            render: (s) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {formatPercentBps(s.percentBps)}%
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (s) => <StatusBadge style={splitStatus(s)} />,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (s) => (
                <Button
                    size="xs"
                    variant="ghost"
                    color="gray.600"
                    fontSize="11px"
                    _hover={{ color: 'primary.500', bg: 'primary.50' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDisputeFor(s);
                    }}
                >
                    <FiFlag /> Dispute
                </Button>
            ),
        },
    ];

    return (
        <ContributorPageShell
            title="Your splits"
            subtitle="The tracks whose royalties you earn a share of. Spot something wrong? Raise a dispute on any split."
        >
            <KpiStrip items={kpis} columns={{ base: 3, md: 3, xl: 3 }} />

            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                    Royalty splits
                </Text>
                <DataTable
                    columns={columns}
                    rows={splits}
                    rowKey={(s) => s.trackId}
                    loading={splitsQuery.isLoading}
                    emptyIcon={FiFlag}
                    emptyTitle="You're not on any splits yet"
                    emptyDescription="When an artist or label adds you to a track's royalty split, it appears here."
                />
            </Box>

            <RaiseDisputeDialog
                isOpen={!!disputeFor}
                onClose={() => setDisputeFor(null)}
                defaultSubjectType="Split"
                subjectId={disputeFor?.trackId}
                contextLabel={disputeFor ? `${disputeFor.trackTitle} — ${disputeFor.artistName ?? ''}`.trim() : undefined}
                lockSubject
            />
        </ContributorPageShell>
    );
};

export default ContributorSplitsPage;
