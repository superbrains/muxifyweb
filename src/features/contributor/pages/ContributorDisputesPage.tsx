import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { formatMinorAmount } from '@/features/record-label/lib/format';
import {
    DataTable,
    DetailDrawer,
    StatusBadge,
    FilterBar,
    CopyableId,
} from '@/features/admin/components/ui';
import type { DataColumn } from '@/features/admin/components/ui';
import { useContributorDisputes, useContributorDispute } from '../hooks/useContributor';
import { ContributorPageShell } from '../components/ContributorPageShell';
import { RaiseDisputeDialog } from '../components/RaiseDisputeDialog';
import type { ContributorDisputeListItem } from '../services/contributorService';

const SUBJECT_LABEL: Record<string, string> = {
    Withdrawal: 'Payout',
    Earning: 'Earning',
    Split: 'Royalty split',
    Other: 'Other',
};

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'UnderReview', label: 'Under review' },
    { value: 'AwaitingInfo', label: 'Awaiting info' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Escalated', label: 'Escalated' },
];

const PAGE_SIZE = 15;

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

/* --------------------------------------------------------- Detail drawer */

const DisputeDetail: React.FC<{ id: string }> = ({ id }) => {
    const { data, isLoading } = useContributorDispute(id);

    if (isLoading || !data) {
        return (
            <VStack align="stretch" gap={3}>
                {[0, 1, 2].map((i) => (
                    <Box key={i} h="48px" bg="gray.50" borderRadius="8px" />
                ))}
            </VStack>
        );
    }

    return (
        <VStack align="stretch" gap={5}>
            <HStack justify="space-between">
                <StatusBadge status={data.status} size="md" />
                <Text fontSize="xs" color="gray.400">
                    {SUBJECT_LABEL[data.subjectType] ?? data.subjectType}
                </Text>
            </HStack>

            <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                    <Text fontSize="11px" color="gray.500">Reference</Text>
                    <CopyableId value={data.reference} />
                </HStack>
                {data.amountMinor != null && (
                    <HStack justify="space-between">
                        <Text fontSize="11px" color="gray.500">Disputed amount</Text>
                        <Text fontSize="xs" fontWeight="medium" color="gray.800">
                            {formatMinorAmount(data.amountMinor, data.currency ?? 'NGN')}
                        </Text>
                    </HStack>
                )}
                <HStack justify="space-between">
                    <Text fontSize="11px" color="gray.500">Raised</Text>
                    <Text fontSize="xs" color="gray.700">{formatDateTime(data.createdAt)}</Text>
                </HStack>
            </VStack>

            <Box>
                <Text fontSize="11px" color="gray.500" mb={1}>What you reported</Text>
                <Box bg="gray.50" borderRadius="10px" p={3}>
                    <Text fontSize="xs" color="gray.800" whiteSpace="pre-wrap">{data.description}</Text>
                </Box>
            </Box>

            {data.resolutionNotes && (
                <Box>
                    <Text fontSize="11px" color="gray.500" mb={1}>Outcome</Text>
                    <Box bg="#E7FFF7" borderRadius="10px" p={3}>
                        <Text fontSize="xs" color="#0F7B5C" whiteSpace="pre-wrap">{data.resolutionNotes}</Text>
                    </Box>
                </Box>
            )}

            <Box>
                <Text fontSize="11px" color="gray.500" mb={3}>Timeline</Text>
                <VStack align="stretch" gap={0}>
                    {data.events.map((e, idx) => (
                        <HStack key={e.id} align="flex-start" gap={3}>
                            <VStack gap={0} align="center" flexShrink={0}>
                                <Box boxSize="9px" borderRadius="full" bg="primary.500" mt={1} />
                                {idx < data.events.length - 1 && (
                                    <Box w="2px" flex={1} minH="28px" bg="gray.200" />
                                )}
                            </VStack>
                            <VStack align="start" gap={0} pb={4} minW={0}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    {e.action}
                                    <Text as="span" color="gray.400" fontWeight="normal">
                                        {' '}· {e.byYou ? 'You' : 'Muxify team'}
                                    </Text>
                                </Text>
                                {e.note && (
                                    <Text fontSize="11px" color="gray.600">{e.note}</Text>
                                )}
                                <Text fontSize="10px" color="gray.400">{formatDateTime(e.createdAt)}</Text>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};

/* ------------------------------------------------------------------ Page */

const ContributorDisputesPage: React.FC = () => {
    const [status, setStatus] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [raiseOpen, setRaiseOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const { data, isLoading } = useContributorDisputes({
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
    });
    const disputes = data?.items ?? [];

    const columns: DataColumn<ContributorDisputeListItem>[] = [
        {
            key: 'reference',
            header: 'Reference',
            render: (d) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" fontFamily="mono">
                    {d.reference}
                </Text>
            ),
        },
        {
            key: 'about',
            header: 'About',
            render: (d) => (
                <Text fontSize="xs" color="gray.700">{SUBJECT_LABEL[d.subjectType] ?? d.subjectType}</Text>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (d) => (
                <Text fontSize="xs" color="gray.600">
                    {d.amountMinor != null ? formatMinorAmount(d.amountMinor, d.currency ?? 'NGN') : '—'}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (d) => <StatusBadge status={d.status} />,
        },
        {
            key: 'raised',
            header: 'Raised',
            align: 'right',
            render: (d) => (
                <Text fontSize="xs" color="gray.600">
                    {new Date(d.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </Text>
            ),
        },
    ];

    return (
        <ContributorPageShell
            title="Disputes"
            subtitle="Raised an issue with a payout, an earning or a split? Track it here until it's resolved."
            actions={
                <Button
                    size="sm"
                    bg="primary.500"
                    color="white"
                    fontSize="xs"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                    onClick={() => setRaiseOpen(true)}
                >
                    <FiFlag /> Raise a dispute
                </Button>
            }
        >
            <FilterBar
                filters={[
                    {
                        key: 'status',
                        value: status,
                        onChange: (v) => {
                            setStatus(v);
                            setPage(1);
                        },
                        options: STATUS_OPTIONS,
                        width: '180px',
                    },
                ]}
            />

            <DataTable
                columns={columns}
                rows={disputes}
                rowKey={(d) => d.id}
                loading={isLoading}
                onRowClick={(d) => setSelectedId(d.id)}
                emptyIcon={FiFlag}
                emptyTitle="No disputes"
                emptyDescription="When you raise a dispute, it appears here so you can follow its progress."
                pagination={{
                    page,
                    pageSize: PAGE_SIZE,
                    total: data?.total ?? 0,
                    onPageChange: setPage,
                }}
            />

            <DetailDrawer
                open={!!selectedId}
                onClose={() => setSelectedId(null)}
                title="Dispute"
                subtitle="Case details and timeline"
            >
                {selectedId && <DisputeDetail id={selectedId} />}
            </DetailDrawer>

            <RaiseDisputeDialog
                isOpen={raiseOpen}
                onClose={() => setRaiseOpen(false)}
                onSubmitted={(id) => setSelectedId(id)}
            />
        </ContributorPageShell>
    );
};

export default ContributorDisputesPage;
