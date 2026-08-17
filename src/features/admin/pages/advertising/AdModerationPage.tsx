import React from 'react';
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    StatusBadge,
} from '@shared/console';
import type { ActionTone, DataColumn } from '@shared/console';
import { adminDate, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAdModeration, useRejectCampaign, useStopCampaign } from '../../hooks/useAdvertising';
import {
    CAMPAIGN_STATUS_OPTIONS,
    type AdCampaignListItemDto,
    type AdModerationQuery,
} from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

type ModerationAction = { id: string; kind: 'reject' | 'stop' };

/** Ad moderation — campaigns flagged for review, with stop and reject actions. */
const AdModerationPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');
    const [query, setQuery] = React.useState<AdModerationQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [action, setAction] = React.useState<ModerationAction | null>(null);
    const { data, isLoading, error } = useAdModeration(query);

    const reject = useRejectCampaign();
    const stop = useStopCampaign();

    const runAction = (reason: string) => {
        if (!action) return;
        const done = () => setAction(null);
        if (action.kind === 'reject')
            reject.mutate({ id: action.id, payload: { reason } }, { onSuccess: done });
        else stop.mutate({ id: action.id, payload: { reason: reason || null } }, { onSuccess: done });
    };

    const ACTION_META: Record<ModerationAction['kind'], { title: string; confirm: string; tone: ActionTone; require: boolean }> = {
        reject: { title: 'Reject campaign', confirm: 'Reject', tone: 'danger', require: true },
        stop: { title: 'Stop campaign', confirm: 'Stop', tone: 'danger', require: false },
    };

    const columns: DataColumn<AdCampaignListItemDto>[] = [
        {
            key: 'campaign',
            header: 'Campaign',
            render: (c) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {c.name}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {c.advertiserName} · {c.type}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'budget',
            header: 'Budget',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(c.budgetMinor, c.currency)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (c) => <StatusBadge status={c.status} />,
        },
        {
            key: 'created',
            header: 'Created',
            render: (c) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(c.createdAt)}
                </Text>
            ),
        },
        ...(canManage
            ? [
                  {
                      key: 'actions',
                      header: '',
                      align: 'right' as const,
                      render: (c: AdCampaignListItemDto) => (
                          <HStack gap={2} justify="flex-end">
                              <Button
                                  size="xs"
                                  fontSize="11px"
                                  variant="outline"
                                  borderColor="gray.300"
                                  color="gray.700"
                                  borderRadius="8px"
                                  onClick={() => setAction({ id: c.id, kind: 'stop' })}
                              >
                                  Stop
                              </Button>
                              <Button
                                  size="xs"
                                  fontSize="11px"
                                  variant="outline"
                                  borderColor="gray.300"
                                  color="#E53E3E"
                                  borderRadius="8px"
                                  onClick={() => setAction({ id: c.id, kind: 'reject' })}
                              >
                                  Reject
                              </Button>
                          </HStack>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AdminPageLayout
            title="Ad Moderation"
            subtitle="Campaigns flagged for policy review — stop or reject offending ads."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Moderation' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : (
                <>
                    <FilterBar
                        filters={[
                            {
                                key: 'status',
                                value: query.status ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        status: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: CAMPAIGN_STATUS_OPTIONS,
                                width: '170px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load the moderation queue." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(c) => c.id}
                            loading={isLoading && !data}
                            emptyIcon={FiFlag}
                            emptyTitle="Nothing flagged"
                            emptyDescription="No campaigns currently need moderation."
                            pagination={
                                data
                                    ? {
                                          page: data.page,
                                          pageSize: data.pageSize,
                                          total: data.total,
                                          onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                                      }
                                    : undefined
                            }
                        />
                    )}

                    {action && (
                        <ConfirmActionModal
                            isOpen
                            onClose={() => setAction(null)}
                            onConfirm={runAction}
                            title={ACTION_META[action.kind].title}
                            confirmText={ACTION_META[action.kind].confirm}
                            tone={ACTION_META[action.kind].tone}
                            requireReason={ACTION_META[action.kind].require}
                            isLoading={reject.isPending || stop.isPending}
                        />
                    )}
                </>
            )}
        </AdminPageLayout>
    );
};

export default AdModerationPage;
