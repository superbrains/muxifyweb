import React from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';
import {
    AdminError,
    DataTable,
    FilterBar,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '@shared/console';
import type { DataColumn } from '@shared/console';
import { useTickets, useTicketStats } from '../../hooks/useSupport';
import { ticketPriorityStyle, ticketStatusStyle } from '../../lib/statusColor';
import { adminRelative } from '@shared/console/lib/format';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import type { TicketDto, TicketQuery, TicketStatus } from '../../types';

const PAGE_SIZE = 15;

const STATUS_FILTER_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'InProgress', label: 'In progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' },
];

interface TicketsPanelProps {
    /**
     * Locks the queue to tickets opened by a single role (snake_case, e.g.
     * `artist`). Used by the CR1 per-role support pages; when omitted the panel
     * shows tickets across all roles (the legacy combined queue).
     */
    role?: string;
}

/** Support ticket queue — KPI strip + filterable table with a detail drawer. */
export const TicketsPanel: React.FC<TicketsPanelProps> = ({ role }) => {
    const [query, setQuery] = React.useState<TicketQuery>({
        status: 'Open',
        role,
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const { data, isLoading, error } = useTickets(query);
    const { data: stats } = useTicketStats(role);

    const kpis = stats
        ? [
              { label: 'Open', value: stats.open, tone: 'warning' as const },
              { label: 'In progress', value: stats.inProgress, tone: 'info' as const },
              { label: 'Resolved', value: stats.resolved, tone: 'success' as const },
              { label: 'Closed', value: stats.closed, tone: 'neutral' as const },
          ]
        : [];

    const columns: DataColumn<TicketDto>[] = [
        {
            key: 'subject',
            header: 'Subject',
            render: (t) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={2}>
                    {t.subject}
                </Text>
            ),
        },
        {
            key: 'requester',
            header: 'Requester',
            render: (t) => <IdentityCell name={t.requesterName} size="xs" />,
        },
        {
            key: 'priority',
            header: 'Priority',
            render: (t) => <StatusBadge style={ticketPriorityStyle(t.priority)} />,
        },
        {
            key: 'status',
            header: 'Status',
            render: (t) => <StatusBadge style={ticketStatusStyle(t.status)} />,
        },
        {
            key: 'updated',
            header: 'Updated',
            render: (t) => (
                <Text fontSize="xs" color="gray.600">
                    {adminRelative(t.updatedAt)}
                </Text>
            ),
        },
    ];

    return (
        <VStack align="stretch" gap={3}>
            {kpis.length > 0 && <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />}

            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) =>
                        setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by subject or requester',
                }}
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                status: v as TicketStatus | 'All',
                                page: 1,
                            })),
                        options: STATUS_FILTER_OPTIONS,
                        width: '160px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load support tickets." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(t) => t.id}
                    onRowClick={(t) => setSelectedId(t.id)}
                    loading={isLoading && !data}
                    emptyIcon={FiInbox}
                    emptyTitle="No tickets"
                    emptyDescription="Nothing matches the current filters."
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
            )}

            <TicketDetailDrawer
                ticketId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </VStack>
    );
};
