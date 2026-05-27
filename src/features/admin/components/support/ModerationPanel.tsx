import React from 'react';
import { HStack, Icon, Stack, Tag, Text, VStack } from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { AdminError, AdminLoading } from '../AdminStateBlock';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '../Paginator';
import { StatusBadge } from '../StatusBadge';
import { StatusPills } from './StatusPills';
import { ModerationActionDialog } from './ModerationActionDialog';
import { useModerationItems } from '../../hooks/useSupport';
import { moderationStatusStyle } from '../../lib/statusColor';
import { adminRelative } from '../../lib/format';
import type { ModerationItemDto, ModerationQuery, ModerationStatus } from '../../types';

const PAGE_SIZE = 15;

const STATUS_PILLS = [
    { value: 'All', label: 'All' },
    { value: 'Pending', label: 'Pending', style: moderationStatusStyle('Pending') },
    {
        value: 'Disputed',
        label: 'Disputed',
        style: { bg: '#FFF3EC', color: '#C2410C', dot: '#F97316', label: 'Disputed' },
    },
    { value: 'Resolved', label: 'Resolved', style: moderationStatusStyle('Resolved') },
    { value: 'Dismissed', label: 'Dismissed', style: moderationStatusStyle('Dismissed') },
];

// Visual palette for the duplicate-tier badge in the queue table.
function duplicateTierBg(tier: string): string {
    switch (tier) {
        case 'Exact':
            return 'red.50';
        case 'High':
            return 'orange.50';
        case 'Medium':
            return 'yellow.50';
        default:
            return 'gray.100';
    }
}
function duplicateTierFg(tier: string): string {
    switch (tier) {
        case 'Exact':
            return 'red.700';
        case 'High':
            return 'orange.700';
        case 'Medium':
            return 'yellow.800';
        default:
            return 'gray.700';
    }
}

/** Flagged-content moderation queue — table with a resolve-action dialog. */
export const ModerationPanel: React.FC = () => {
    // The "Disputed" pill is a client-side filter over Pending — backend has no
    // disputed-specific status, since a dispute is metadata on a still-Pending case.
    const [activePill, setActivePill] = React.useState<ModerationStatus | 'All' | 'Disputed'>('Pending');
    const [query, setQuery] = React.useState<ModerationQuery>({
        status: 'Pending',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [actionItem, setActionItem] = React.useState<ModerationItemDto | null>(null);

    const { data, isLoading, error } = useModerationItems(query);

    const visibleItems = React.useMemo(() => {
        const items = data?.items ?? [];
        if (activePill === 'Disputed') {
            return items.filter((m) => !!m.disputedAt);
        }
        return items;
    }, [activePill, data?.items]);

    const columns: AdminTableColumn<ModerationItemDto>[] = [
        {
            key: 'content',
            header: 'Content',
            render: (m) => (
                <VStack align="start" gap={1}>
                    <HStack gap={1.5} flexWrap="wrap">
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                            {m.contentTitle}
                        </Text>
                        {/* "Disputed" badge — the most important signal in this queue. Tells
                            the moderator the artist has responded and is waiting on a decision. */}
                        {m.disputedAt && (
                            <Tag.Root
                                size="sm"
                                bg="orange.50"
                                color="orange.700"
                                borderRadius="full"
                                px={1.5}
                            >
                                <Icon as={FiFlag} boxSize={2.5} mr={0.5} />
                                <Tag.Label fontSize="9px" fontWeight="700" letterSpacing="0.04em">
                                    DISPUTED
                                </Tag.Label>
                            </Tag.Root>
                        )}
                        {m.isAutomatedDuplicateReport && m.duplicateTier && (
                            <Tag.Root
                                size="sm"
                                bg={duplicateTierBg(m.duplicateTier)}
                                color={duplicateTierFg(m.duplicateTier)}
                                borderRadius="full"
                                px={1.5}
                            >
                                <Tag.Label fontSize="9px" fontWeight="700" letterSpacing="0.04em">
                                    {m.duplicateTier.toUpperCase()}
                                </Tag.Label>
                            </Tag.Root>
                        )}
                    </HStack>
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                        {m.contentType} · {m.ownerName}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (m) => (
                <Text fontSize="xs" color="gray.600" lineClamp={2}>
                    {m.reason}
                </Text>
            ),
        },
        {
            key: 'reporter',
            header: 'Reporter',
            render: (m) => (
                <Text fontSize="xs" color="gray.600">
                    {m.reporterName}
                </Text>
            ),
        },
        {
            key: 'reported',
            header: 'Reported',
            render: (m) => (
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.600">
                        {adminRelative(m.reportedAt)}
                    </Text>
                    {m.disputedAt && (
                        <Text fontSize="10px" color="orange.700" fontWeight="500">
                            Disputed {adminRelative(m.disputedAt)}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (m) => <StatusBadge style={moderationStatusStyle(m.status)} />,
        },
        {
            key: 'action',
            header: '',
            align: 'right',
            render: (m) => (
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color={m.status === 'Pending' ? 'primary.500' : 'gray.400'}
                >
                    {m.status === 'Pending' ? 'Resolve' : 'View'}
                </Text>
            ),
        },
    ];

    return (
        <VStack align="stretch" gap={3}>
            <Stack
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                px={{ base: 3, md: 4 }}
                py={3}
            >
                <StatusPills
                    options={STATUS_PILLS}
                    active={activePill}
                    onChange={(v) => {
                        const pill = v as ModerationStatus | 'All' | 'Disputed';
                        setActivePill(pill);
                        // "Disputed" pill keeps the backend status as Pending — disputes
                        // are metadata on still-pending cases — and filters client-side.
                        const backendStatus: ModerationStatus | 'All' =
                            pill === 'Disputed' ? 'Pending' : pill;
                        setQuery((q) => ({
                            ...q,
                            status: backendStatus,
                            page: 1,
                        }));
                    }}
                />
            </Stack>

            {isLoading && !data ? (
                <AdminLoading minH="30vh" />
            ) : error ? (
                <AdminError
                    error={error}
                    message="Could not load flagged content."
                    minH="30vh"
                />
            ) : (
                <>
                    <AdminTable
                        columns={columns}
                        rows={visibleItems}
                        rowKey={(m) => m.id}
                        onRowClick={(m) => setActionItem(m)}
                        emptyTitle={
                            activePill === 'Disputed'
                                ? 'No disputes waiting'
                                : 'Nothing flagged'
                        }
                        emptyDescription={
                            activePill === 'Disputed'
                                ? 'No artists have disputed a flag on this page. Switch to Pending to see all open cases.'
                                : 'No content matches the current filters.'
                        }
                    />
                    {data && (
                        <Paginator
                            page={data.page}
                            pageSize={data.pageSize}
                            total={data.total}
                            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                        />
                    )}
                    {activePill === 'Disputed' && data && data.total > data.pageSize && (
                        <Text fontSize="10px" color="gray.500" px={1}>
                            Disputed filter is client-side: it narrows the current page only.
                            Page through to see disputed cases across the full queue.
                        </Text>
                    )}
                </>
            )}

            <ModerationActionDialog
                item={actionItem}
                onClose={() => setActionItem(null)}
            />
        </VStack>
    );
};
