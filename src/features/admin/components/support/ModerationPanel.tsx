import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, HStack, Tag, Text, VStack } from '@chakra-ui/react';
import { FiAlertCircle, FiFlag } from 'react-icons/fi';
import {
    AdminError,
    DataTable,
    FilterBar,
    IdentityCell,
    KpiStrip,
    StatusBadge,
    toneStyle,
} from '../ui';
import type { DataColumn } from '../ui';
import { useModerationItems } from '../../hooks/useSupport';
import { useModerationStats } from '../../hooks/useContent';
import { adminRelative } from '../../lib/format';
import { ModerationActionDialog } from './ModerationActionDialog';
import type { ModerationItemDto, ModerationQuery, ModerationStatus } from '../../types';

const PAGE_SIZE = 15;

const STATUS_FILTER_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Disputed', label: 'Disputed' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Dismissed', label: 'Dismissed' },
];

const REPORT_TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Copyright', label: 'Copyright' },
    { value: 'Spam', label: 'Spam' },
    { value: 'Inappropriate', label: 'Inappropriate' },
    { value: 'Misinformation', label: 'Misinformation' },
    { value: 'Other', label: 'Other' },
];

function duplicateTierStyle(tier: string): { bg: string; color: string } {
    switch (tier) {
        case 'Exact': return { bg: 'red.50', color: 'red.700' };
        case 'High': return { bg: 'orange.50', color: 'orange.700' };
        case 'Medium': return { bg: 'yellow.50', color: 'yellow.800' };
        default: return { bg: 'gray.100', color: 'gray.700' };
    }
}

interface ModerationPanelProps {
    /**
     * Locks the queue to a single content-owner role (snake_case, e.g.
     * `artist`). Used by the CR1 per-role moderation pages; when omitted the
     * panel shows reports across all roles.
     */
    ownerRole?: string;
}

/** Modernised flagged-content moderation queue using the shared DataTable + FilterBar kit. */
export const ModerationPanel: React.FC<ModerationPanelProps> = ({ ownerRole }) => {
    const navigate = useNavigate();
    const [activePill, setActivePill] = React.useState<ModerationStatus | 'All' | 'Disputed'>('Pending');
    const [search, setSearch] = React.useState('');
    const [reportType, setReportType] = React.useState<string | undefined>(undefined);
    const [query, setQuery] = React.useState<ModerationQuery>({
        status: 'Pending',
        ownerRole,
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [actionItem, setActionItem] = React.useState<ModerationItemDto | null>(null);

    const { data, isLoading, error } = useModerationItems(query);
    const { data: stats } = useModerationStats(ownerRole);

    const visibleItems = React.useMemo(() => {
        const items = data?.items ?? [];
        if (activePill === 'Disputed') return items.filter((m) => !!m.disputedAt);
        return items;
    }, [activePill, data?.items]);

    const kpis = stats
        ? [
              { label: 'Pending', value: stats.pending, tone: 'warning' as const },
              { label: 'Disputed', value: stats.disputed, tone: 'info' as const },
              { label: 'Resolved', value: stats.resolved, tone: 'success' as const },
              { label: 'Dismissed', value: stats.dismissed, tone: 'neutral' as const },
          ]
        : [];

    const columns: DataColumn<ModerationItemDto>[] = [
        {
            key: 'content',
            header: 'Content',
            render: (m) => (
                <VStack align="start" gap={1} minW={0}>
                    <HStack gap={1.5} flexWrap="wrap">
                        <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="gray.900"
                            lineClamp={1}
                            as="button"
                            _hover={{ color: 'primary.600', textDecoration: 'underline' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/content/${m.contentType}/${m.contentId}`);
                            }}
                        >
                            {m.contentTitle}
                        </Text>
                        {m.disputedAt && (
                            <Tag.Root size="sm" bg="orange.50" color="orange.700" borderRadius="full" px={1.5}>
                                <FiFlag size={9} />
                                <Tag.Label fontSize="9px" fontWeight="700" letterSpacing="0.04em" ml={0.5}>
                                    DISPUTED
                                </Tag.Label>
                            </Tag.Root>
                        )}
                        {m.warnedAt && (
                            <Tag.Root size="sm" bg="purple.50" color="purple.700" borderRadius="full" px={1.5}>
                                <FiAlertCircle size={9} />
                                <Tag.Label fontSize="9px" fontWeight="700" letterSpacing="0.04em" ml={0.5}>
                                    WARNED
                                </Tag.Label>
                            </Tag.Root>
                        )}
                        {m.isAutomatedDuplicateReport && m.duplicateTier && (() => {
                            const s = duplicateTierStyle(m.duplicateTier);
                            return (
                                <Tag.Root size="sm" bg={s.bg} color={s.color} borderRadius="full" px={1.5}>
                                    <Tag.Label fontSize="9px" fontWeight="700" letterSpacing="0.04em">
                                        {m.duplicateTier.toUpperCase()}
                                    </Tag.Label>
                                </Tag.Root>
                            );
                        })()}
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
            render: (m) => <IdentityCell name={m.reporterName} size="xs" />,
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
            render: (m) => (
                <StatusBadge
                    style={
                        m.status === 'Pending'
                            ? toneStyle('warning', 'Pending')
                            : m.status === 'Resolved'
                            ? toneStyle('success', 'Resolved')
                            : m.status === 'Dismissed'
                            ? toneStyle('neutral', 'Dismissed')
                            : undefined
                    }
                    status={m.status}
                />
            ),
        },
    ];

    return (
        <VStack align="stretch" gap={3}>
            {kpis.length > 0 && <KpiStrip items={kpis} />}

            <FilterBar
                search={{
                    value: search,
                    onChange: (v) => {
                        setSearch(v);
                        setQuery((q) => ({ ...q, search: v || undefined, page: 1 }));
                    },
                    placeholder: 'Search by title or reporter',
                }}
                filters={[
                    {
                        key: 'status',
                        value: activePill,
                        onChange: (v) => {
                            const pill = v as ModerationStatus | 'All' | 'Disputed';
                            setActivePill(pill);
                            const backendStatus: ModerationStatus | 'All' =
                                pill === 'Disputed' ? 'Pending' : pill;
                            setQuery((q) => ({ ...q, status: backendStatus, page: 1 }));
                        },
                        options: STATUS_FILTER_OPTIONS,
                        width: '150px',
                    },
                    {
                        key: 'type',
                        value: reportType ?? 'All',
                        onChange: (v) => {
                            setReportType(v === 'All' ? undefined : v);
                            setQuery((q) => ({
                                ...q,
                                type: v === 'All' ? undefined : v,
                                page: 1,
                            }));
                        },
                        options: REPORT_TYPE_OPTIONS,
                        width: '150px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load flagged content." />
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        rows={visibleItems}
                        rowKey={(m) => m.id}
                        onRowClick={(m) => setActionItem(m)}
                        loading={isLoading && !data}
                        emptyIcon={FiFlag}
                        emptyTitle={
                            activePill === 'Disputed' ? 'No disputes waiting' : 'Nothing flagged'
                        }
                        emptyDescription={
                            activePill === 'Disputed'
                                ? 'No artists have disputed a flag. Switch to Pending to see all open cases.'
                                : 'No content matches the current filters.'
                        }
                        pagination={
                            data
                                ? {
                                      page: data.page,
                                      pageSize: data.pageSize,
                                      total: data.total,
                                      onPageChange: (page) =>
                                          setQuery((q) => ({ ...q, page })),
                                  }
                                : undefined
                        }
                    />
                    {activePill === 'Disputed' && data && data.total > data.pageSize && (
                        <Box px={1}>
                            <Text fontSize="10px" color="gray.500">
                                Disputed filter is client-side on the current page.
                            </Text>
                        </Box>
                    )}
                </>
            )}

            <ModerationActionDialog item={actionItem} onClose={() => setActionItem(null)} />
        </VStack>
    );
};
