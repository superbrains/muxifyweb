import React from 'react';
import { Box, HStack, Input, Stack, Text, VStack } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { AdminError, AdminLoading } from '../AdminStateBlock';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '../Paginator';
import { StatusBadge } from '../StatusBadge';
import { StatusPills } from './StatusPills';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { useTickets } from '../../hooks/useSupport';
import { ticketPriorityStyle, ticketStatusStyle } from '../../lib/statusColor';
import { adminRelative } from '../../lib/format';
import type { TicketDto, TicketQuery, TicketStatus } from '../../types';

const PAGE_SIZE = 15;

const STATUS_PILLS = [
    { value: 'All', label: 'All' },
    { value: 'Open', label: 'Open', style: ticketStatusStyle('Open') },
    { value: 'InProgress', label: 'In progress', style: ticketStatusStyle('InProgress') },
    { value: 'Resolved', label: 'Resolved', style: ticketStatusStyle('Resolved') },
    { value: 'Closed', label: 'Closed', style: ticketStatusStyle('Closed') },
];

/** Support ticket queue — filterable table with a detail drawer. */
export const TicketsPanel: React.FC = () => {
    const [query, setQuery] = React.useState<TicketQuery>({
        status: 'Open',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [search, setSearch] = React.useState('');
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const trimmed = search.trim();
        if (trimmed === (query.search ?? '')) return;
        const id = window.setTimeout(() => {
            setQuery((q) => ({ ...q, search: trimmed || undefined, page: 1 }));
        }, 300);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const { data, isLoading, error } = useTickets(query);

    const columns: AdminTableColumn<TicketDto>[] = [
        {
            key: 'subject',
            header: 'Subject',
            render: (t) => (
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {t.subject}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {t.requesterName}
                    </Text>
                </VStack>
            ),
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
            <Stack
                gap={3}
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                px={{ base: 3, md: 4 }}
                py={3}
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'stretch', md: 'center' }}
            >
                <StatusPills
                    options={STATUS_PILLS}
                    active={query.status ?? 'All'}
                    onChange={(v) =>
                        setQuery((q) => ({
                            ...q,
                            status: v as TicketStatus | 'All',
                            page: 1,
                        }))
                    }
                />
                <HStack
                    bg="gray.50"
                    borderRadius="10px"
                    px={3}
                    border="1px solid"
                    borderColor="gray.100"
                    minW={{ base: 'full', md: '240px' }}
                >
                    <Box color="gray.400" fontSize="14px">
                        <FiSearch />
                    </Box>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tickets"
                        variant="subtle"
                        size="sm"
                        bg="transparent"
                        border="none"
                        fontSize="xs"
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                    />
                </HStack>
            </Stack>

            {isLoading && !data ? (
                <AdminLoading minH="30vh" />
            ) : error ? (
                <AdminError error={error} message="Could not load support tickets." minH="30vh" />
            ) : (
                <>
                    <AdminTable
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(t) => t.id}
                        onRowClick={(t) => setSelectedId(t.id)}
                        emptyTitle="No tickets"
                        emptyDescription="Nothing matches the current filters."
                    />
                    {data && (
                        <Paginator
                            page={data.page}
                            pageSize={data.pageSize}
                            total={data.total}
                            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                        />
                    )}
                </>
            )}

            <TicketDetailDrawer
                ticketId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </VStack>
    );
};
