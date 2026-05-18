import React from 'react';
import { Stack, Text, VStack } from '@chakra-ui/react';
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
    { value: 'Resolved', label: 'Resolved', style: moderationStatusStyle('Resolved') },
    { value: 'Dismissed', label: 'Dismissed', style: moderationStatusStyle('Dismissed') },
];

/** Flagged-content moderation queue — table with a resolve-action dialog. */
export const ModerationPanel: React.FC = () => {
    const [query, setQuery] = React.useState<ModerationQuery>({
        status: 'Pending',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [actionItem, setActionItem] = React.useState<ModerationItemDto | null>(null);

    const { data, isLoading, error } = useModerationItems(query);

    const columns: AdminTableColumn<ModerationItemDto>[] = [
        {
            key: 'content',
            header: 'Content',
            render: (m) => (
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {m.contentTitle}
                    </Text>
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
                <Text fontSize="xs" color="gray.600">
                    {adminRelative(m.reportedAt)}
                </Text>
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
                    active={query.status ?? 'All'}
                    onChange={(v) =>
                        setQuery((q) => ({
                            ...q,
                            status: v as ModerationStatus | 'All',
                            page: 1,
                        }))
                    }
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
                        rows={data?.items ?? []}
                        rowKey={(m) => m.id}
                        onRowClick={(m) => setActionItem(m)}
                        emptyTitle="Nothing flagged"
                        emptyDescription="No content matches the current filters."
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

            <ModerationActionDialog
                item={actionItem}
                onClose={() => setActionItem(null)}
            />
        </VStack>
    );
};
