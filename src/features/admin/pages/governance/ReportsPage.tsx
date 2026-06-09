import React from 'react';
import { FiFlag } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    FilterBar,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { Text, VStack } from '@chakra-ui/react';
import { adminRelative } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useModerationItems } from '../../hooks/useSupport';
import { ModerationActionDialog } from '../../components/support/ModerationActionDialog';
import type {
    ModerationContentType,
    ModerationItemDto,
    ModerationQuery,
    ModerationStatus,
} from '../../types';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Dismissed', label: 'Dismissed' },
    { value: 'All', label: 'All statuses' },
];

const TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'track', label: 'Track' },
    { value: 'video', label: 'Video' },
    { value: 'comment', label: 'Comment' },
    { value: 'profile', label: 'Profile' },
];

/**
 * Reports — the content-report queue, reusing the existing moderation read
 * (`useModerationItems`) and resolve dialog (`ModerationActionDialog`). Defaults
 * to Pending reports. Gated on `ModerationView`.
 */
const ReportsPage: React.FC = () => {
    const canView = useHasPermission('ModerationView');
    const [query, setQuery] = React.useState<ModerationQuery>({
        status: 'Pending',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [actionItem, setActionItem] = React.useState<ModerationItemDto | null>(null);

    const { data, isLoading, error } = useModerationItems(query);

    const columns: DataColumn<ModerationItemDto>[] = [
        {
            key: 'content',
            header: 'Reported content',
            render: (m) => (
                <VStack align="start" gap={0.5}>
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
                <Text fontSize="xs" color="gray.600" lineClamp={2} maxW="300px">
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
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {adminRelative(m.reportedAt)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (m) => <StatusBadge status={m.status} />,
        },
    ];

    return (
        <AdminPageLayout
            title="Reports"
            subtitle="User-submitted content reports awaiting a moderation decision."
            breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Reports' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : (
                <>
                    <FilterBar
                        search={{
                            value: query.search ?? '',
                            onChange: (v) =>
                                setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                            placeholder: 'Search reported content',
                        }}
                        filters={[
                            {
                                key: 'status',
                                value: query.status ?? 'Pending',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        status: v as ModerationStatus | 'All',
                                        page: 1,
                                    })),
                                options: STATUS_OPTIONS,
                                width: '160px',
                            },
                            {
                                key: 'type',
                                value: query.type ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        type:
                                            v === 'All'
                                                ? undefined
                                                : (v as ModerationContentType),
                                        page: 1,
                                    })),
                                options: TYPE_OPTIONS,
                                width: '150px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load reports." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(m) => m.id}
                            loading={isLoading && !data}
                            onRowClick={(m) => setActionItem(m)}
                            emptyIcon={FiFlag}
                            emptyTitle="No reports"
                            emptyDescription="No content reports match the current filters."
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

                    <ModerationActionDialog
                        item={actionItem}
                        onClose={() => setActionItem(null)}
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default ReportsPage;
