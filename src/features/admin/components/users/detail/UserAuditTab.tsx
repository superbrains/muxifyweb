import React from 'react';
import { Box } from '@chakra-ui/react';
import { AuditTimeline } from '@shared/console';
import type { AuditEntry } from '@shared/console';
import { Paginator } from '@shared/console/components/Paginator';
import { useUserAudit } from '../../../hooks/useUsers';
import { AdminError, AdminLoading } from '@shared/console/components/AdminStateBlock';

const PAGE_SIZE = 20;

const TONE_BY_ACTION: Record<string, AuditEntry['tone']> = {
    UserSuspended: 'danger',
    AccountLocked: 'danger',
    UserActivated: 'success',
    AccountUnlocked: 'success',
    UserRoleChanged: 'warning',
    PasswordResetFlagged: 'warning',
};

/** `UserRoleChanged` → `User role changed`. */
const humanizeAction = (action: string): string => {
    const spaced = action.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
};

/** Chronological admin-action history for this user, from the audit log. */
export const UserAuditTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [page, setPage] = React.useState(1);
    const { data, isLoading, error } = useUserAudit(userId, page, PAGE_SIZE);

    if (isLoading && !data) return <AdminLoading />;
    if (error) return <AdminError error={error} message="Could not load the activity history." />;

    const entries: AuditEntry[] = (data?.items ?? []).map((e) => ({
        id: e.id,
        action: humanizeAction(e.action),
        detail: e.summary,
        actor: e.actorName,
        timestamp: e.createdAt,
        tone: TONE_BY_ACTION[e.action] ?? 'default',
    }));

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5} maxW="3xl">
            <AuditTimeline
                entries={entries}
                emptyText="No admin actions have been recorded for this user yet."
            />
            {data && data.total > data.pageSize && (
                <Box mt={4}>
                    <Paginator
                        page={data.page}
                        pageSize={data.pageSize}
                        total={data.total}
                        onPageChange={setPage}
                    />
                </Box>
            )}
        </Box>
    );
};
