import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { FiBriefcase, FiUserPlus, FiUsers } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    DetailDrawer,
    DetailTabs,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate, adminDateTime, formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useLabelDetail, useLabels } from '../../hooks/useGovernance';
import type {
    LabelDetailDto,
    LabelListItemDto,
    LabelOpsQuery,
} from '../../types/governance';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/**
 * Record Label Operations — labels with their roster size, pending invites and
 * pending-approval withdrawals (`GET /admin/labels`). The drawer breaks the
 * label down into roster + pending-invite tabs. Gated on `LabelOpsView`.
 */
const RecordLabelOpsPage: React.FC = () => {
    const canView = useHasPermission('LabelOpsView');
    const [query, setQuery] = React.useState<LabelOpsQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const { data, isLoading, error } = useLabels(query);

    const columns: DataColumn<LabelListItemDto>[] = [
        {
            key: 'label',
            header: 'Record label',
            render: (l) => <IdentityCell name={l.name} secondary={l.email} />,
        },
        {
            key: 'roster',
            header: 'Roster',
            align: 'right',
            render: (l) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(l.rosterCount)}
                </Text>
            ),
        },
        {
            key: 'invites',
            header: 'Pending invites',
            align: 'right',
            render: (l) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(l.pendingInviteCount)}
                </Text>
            ),
        },
        {
            key: 'withdrawals',
            header: 'Pending withdrawals',
            align: 'right',
            render: (l) =>
                l.pendingApprovalWithdrawals > 0 ? (
                    <StatusBadge
                        status="Pending"
                        label={`${formatCount(l.pendingApprovalWithdrawals)} pending`}
                    />
                ) : (
                    <Text fontSize="xs" color="gray.400">
                        —
                    </Text>
                ),
        },
        {
            key: 'created',
            header: 'Joined',
            render: (l) => (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {adminDate(l.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Record Label Operations"
            subtitle="Record labels, their rosters, pending artist invites and approval-bound withdrawals."
            breadcrumbs={[
                { label: 'Support & Governance' },
                { label: 'Record Label Operations' },
            ]}
        >
            {!canView ? (
                <NoAccess description="This area requires the label operations view permission." />
            ) : (
                <>
                    <FilterBar
                        search={{
                            value: query.search ?? '',
                            onChange: (v) =>
                                setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                            placeholder: 'Search by label name or email',
                        }}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load record labels." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(l) => l.userId}
                            loading={isLoading && !data}
                            onRowClick={(l) => setSelectedId(l.userId)}
                            emptyIcon={FiBriefcase}
                            emptyTitle="No record labels"
                            emptyDescription="No labels match the current search."
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

                    <LabelDrawer userId={selectedId} onClose={() => setSelectedId(null)} />
                </>
            )}
        </AdminPageLayout>
    );
};

export default RecordLabelOpsPage;

/* ------------------------------ Detail drawer ----------------------------- */

const RosterTab: React.FC<{ label: LabelDetailDto }> = ({ label }) => {
    if (label.roster.length === 0) {
        return (
            <Text fontSize="xs" color="gray.400" py={2}>
                No artists on this label's roster yet.
            </Text>
        );
    }
    return (
        <VStack align="stretch" gap={0}>
            {label.roster.map((r) => (
                <HStack
                    key={r.artistUserId}
                    justify="space-between"
                    py={2.5}
                    borderBottom="1px solid"
                    borderColor="gray.50"
                >
                    <IdentityCell name={r.artistName} secondary={r.artistUserId} />
                    <Text fontSize="11px" color="gray.500" whiteSpace="nowrap">
                        {r.acceptedAt ? `Joined ${adminDate(r.acceptedAt)}` : 'Pending'}
                    </Text>
                </HStack>
            ))}
        </VStack>
    );
};

const InvitesTab: React.FC<{ label: LabelDetailDto }> = ({ label }) => {
    if (label.pendingInvites.length === 0) {
        return (
            <Text fontSize="xs" color="gray.400" py={2}>
                No pending invites.
            </Text>
        );
    }
    return (
        <VStack align="stretch" gap={0}>
            {label.pendingInvites.map((inv) => (
                <HStack
                    key={inv.id}
                    justify="space-between"
                    py={2.5}
                    borderBottom="1px solid"
                    borderColor="gray.50"
                    gap={3}
                >
                    <VStack align="start" gap={0.5} minW={0}>
                        <Text fontSize="xs" color="gray.800" lineClamp={1}>
                            {inv.inviteeEmail}
                        </Text>
                        <Text fontSize="10px" color="gray.400">
                            Expires {adminDate(inv.expiresAt)}
                        </Text>
                    </VStack>
                    <StatusBadge status={inv.status} />
                </HStack>
            ))}
        </VStack>
    );
};

const LabelDrawer: React.FC<{ userId: string | null; onClose: () => void }> = ({
    userId,
    onClose,
}) => {
    const { data, isLoading, error } = useLabelDetail(userId);

    return (
        <DetailDrawer
            open={userId !== null}
            onClose={onClose}
            title={data?.name ?? 'Record label'}
            subtitle={data?.email}
            size="md"
        >
            {error ? (
                <AdminError error={error} message="Could not load this label." />
            ) : isLoading || !data ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={4}>
                    <HStack justify="space-between">
                        <Text fontSize="11px" color="gray.500">
                            Joined
                        </Text>
                        <Text fontSize="xs" color="gray.800">
                            {adminDateTime(data.createdAt)}
                        </Text>
                    </HStack>
                    {data.pendingApprovalWithdrawalCount > 0 && (
                        <StatusBadge
                            status="Pending"
                            label={`${formatCount(
                                data.pendingApprovalWithdrawalCount,
                            )} withdrawal(s) awaiting approval`}
                        />
                    )}
                    <DetailTabs
                        tabs={[
                            {
                                id: 'roster',
                                label: `Roster (${formatCount(data.roster.length)})`,
                                icon: FiUsers,
                                content: <RosterTab label={data} />,
                            },
                            {
                                id: 'invites',
                                label: `Pending invites (${formatCount(
                                    data.pendingInvites.length,
                                )})`,
                                icon: FiUserPlus,
                                content: <InvitesTab label={data} />,
                            },
                        ]}
                    />
                </VStack>
            )}
        </DetailDrawer>
    );
};
