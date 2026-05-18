import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { AdminError, AdminLoading } from '../AdminStateBlock';
import { Paginator } from '../Paginator';
import { adminDateTime } from '../../lib/format';
import { useAuditLog } from '../../hooks/useAdminManagement';
import type { AdminAuditLogDto } from '../../services/adminManagementService';

const PAGE_SIZE = 20;

/** Splits a PascalCase audit action into a readable label ("RoleCreated" → "Role created"). */
const humanizeAction = (action: string): string => {
    const spaced = action.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
};

/** "Activity" tab — the immutable admin-management audit feed. */
export const ActivityTab: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const { data, isLoading, error } = useAuditLog(page, PAGE_SIZE);

    const columns: AdminTableColumn<AdminAuditLogDto>[] = [
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
                <Text fontSize="xs" color="gray.700" lineClamp={2} maxW="380px">
                    {l.summary}
                </Text>
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
        <Box>
            <Text fontSize="11px" color="gray.600" mb={3}>
                Every role, admin and invitation change — append-only.
            </Text>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message="Could not load the activity feed." />
            ) : (
                <>
                    <AdminTable
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(l) => l.id}
                        emptyTitle="No activity yet"
                        emptyDescription="Admin-management actions will show up here."
                    />
                    {data && (
                        <Box mt={3}>
                            <Paginator
                                page={data.page}
                                pageSize={data.pageSize}
                                total={data.total}
                                onPageChange={setPage}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};
