import React from 'react';
import { Button, Text, Wrap } from '@chakra-ui/react';
import { FiUserCheck } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate, adminRelative, formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useNudgeUser, useStuckUsers } from '../../hooks/useGovernance';
import {
    ONBOARDING_ROLE_OPTIONS,
    STUCK_REASON_OPTIONS,
    stuckReasonLabel,
    type StuckUserDto,
    type StuckUserQuery,
} from '../../types/governance';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/**
 * Onboarding & Empty-State — users who have stalled (incomplete onboarding, no
 * content, or inactive). `GET /admin/onboarding/stuck`, filterable by reason and
 * role. Each row exposes a "Nudge" action that posts a re-engagement message.
 * List gated on `OnboardingView`; nudging additionally on `OnboardingManage`.
 */
const OnboardingPage: React.FC = () => {
    const canView = useHasPermission('OnboardingView');
    const canManage = useHasPermission('OnboardingManage');
    const [query, setQuery] = React.useState<StuckUserQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [nudgeTarget, setNudgeTarget] = React.useState<StuckUserDto | null>(null);

    const { data, isLoading, error } = useStuckUsers(query);
    const nudge = useNudgeUser();

    const columns: DataColumn<StuckUserDto>[] = [
        {
            key: 'user',
            header: 'User',
            render: (u) => <IdentityCell name={u.fullName} secondary={u.email} />,
        },
        {
            key: 'role',
            header: 'Role',
            render: (u) => (
                <Text fontSize="xs" color="gray.600" textTransform="capitalize">
                    {u.role.replace(/_/g, ' ')}
                </Text>
            ),
        },
        {
            key: 'reasons',
            header: 'Stuck reasons',
            render: (u) => (
                <Wrap gap={1}>
                    {u.stuckReasons.map((r) => (
                        <StatusBadge key={r} status={r} label={stuckReasonLabel(r)} />
                    ))}
                </Wrap>
            ),
        },
        {
            key: 'content',
            header: 'Content',
            align: 'right',
            render: (u) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(u.contentCount)}
                </Text>
            ),
        },
        {
            key: 'lastLogin',
            header: 'Last login',
            render: (u) => (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {u.lastLoginAt ? adminRelative(u.lastLoginAt) : 'Never'}
                </Text>
            ),
        },
        {
            key: 'created',
            header: 'Joined',
            render: (u) => (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {adminDate(u.createdAt)}
                </Text>
            ),
        },
        {
            key: 'action',
            header: '',
            align: 'right',
            render: (u) =>
                canManage ? (
                    <Button
                        size="xs"
                        fontSize="11px"
                        variant="outline"
                        borderColor="gray.300"
                        color="primary.500"
                        borderRadius="8px"
                        onClick={(e) => {
                            e.stopPropagation();
                            setNudgeTarget(u);
                        }}
                    >
                        Nudge
                    </Button>
                ) : null,
        },
    ];

    return (
        <AdminPageLayout
            title="Onboarding & Empty-State"
            subtitle="Users who stalled during onboarding, never published, or have gone inactive."
            breadcrumbs={[
                { label: 'Support & Governance' },
                { label: 'Onboarding' },
            ]}
        >
            {!canView ? (
                <NoAccess description="This area requires the onboarding view permission." />
            ) : (
                <>
                    <FilterBar
                        filters={[
                            {
                                key: 'reason',
                                value: query.reason ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        reason: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: STUCK_REASON_OPTIONS,
                                width: '190px',
                            },
                            {
                                key: 'role',
                                value: query.role ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        role: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: ONBOARDING_ROLE_OPTIONS,
                                width: '170px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load stuck users." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(u) => u.userId}
                            loading={isLoading && !data}
                            emptyIcon={FiUserCheck}
                            emptyTitle="No one is stuck"
                            emptyDescription="No users match the current filters — everyone is moving along."
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

                    {nudgeTarget && (
                        <ConfirmActionModal
                            isOpen
                            onClose={() => setNudgeTarget(null)}
                            title={`Nudge ${nudgeTarget.fullName}`}
                            message="Send a re-engagement message to help this user get unstuck."
                            reasonLabel="Message"
                            placeholder="Write a short, friendly nudge — e.g. finish setting up your profile to start earning."
                            confirmText="Send nudge"
                            tone="primary"
                            minReasonLength={10}
                            isLoading={nudge.isPending}
                            onConfirm={(message) =>
                                nudge.mutate(
                                    {
                                        userId: nudgeTarget.userId,
                                        payload: { message },
                                    },
                                    { onSuccess: () => setNudgeTarget(null) },
                                )
                            }
                        />
                    )}
                </>
            )}
        </AdminPageLayout>
    );
};

export default OnboardingPage;
