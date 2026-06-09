import React from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { FiActivity } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDateTime } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAuditLog } from '../../hooks/useAdminManagement';
import type { AdminAuditLogDto } from '../../services/adminManagementService';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/** Splits a PascalCase audit action into a readable label ("RoleCreated" → "Role created"). */
const humanizeAction = (action: string): string => {
    const spaced = action.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
};

/**
 * Activity Log — a standalone, append-only feed of admin-management actions,
 * reusing the existing `useAuditLog` read (`GET /admin/management/audit`). Gated
 * on `ManagementView`.
 */
const ActivityLogPage: React.FC = () => {
    const canView = useHasPermission('ManagementView');
    const [page, setPage] = React.useState(1);
    const { data, isLoading, error } = useAuditLog(page, PAGE_SIZE);

    const columns: DataColumn<AdminAuditLogDto>[] = [
        {
            key: 'actor',
            header: 'Admin',
            render: (l) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {l.actorName}
                </Text>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            render: (l) => (
                <Text fontSize="xs" color="gray.600">
                    {humanizeAction(l.action)}
                </Text>
            ),
        },
        {
            key: 'summary',
            header: 'Detail',
            render: (l) => (
                <VStack align="start" gap={0.5}>
                    <Text fontSize="xs" color="gray.700" lineClamp={2} maxW="420px">
                        {l.summary}
                    </Text>
                    {l.targetType && (
                        <Text fontSize="10px" color="gray.400">
                            {l.targetType}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'when',
            header: 'When',
            render: (l) => (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {adminDateTime(l.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Activity Log"
            subtitle="Every role, admin and invitation change across the console — append-only."
            breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Activity Log' }]}
        >
            {!canView ? (
                <NoAccess description="This area requires the management view permission." />
            ) : error ? (
                <AdminError error={error} message="Could not load the activity feed." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(l) => l.id}
                    loading={isLoading && !data}
                    emptyIcon={FiActivity}
                    emptyTitle="No activity yet"
                    emptyDescription="Admin-management actions will show up here."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: setPage,
                              }
                            : undefined
                    }
                />
            )}
        </AdminPageLayout>
    );
};

export default ActivityLogPage;
