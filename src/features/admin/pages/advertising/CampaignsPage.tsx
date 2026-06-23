import React from 'react';
import { Box, Button, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { FiTarget, FiImage } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    ConfirmActionModal,
    CoverThumb,
    DataTable,
    DetailDrawer,
    FilterBar,
    StatusBadge,
} from '../../components/ui';
import type { ActionTone, DataColumn } from '../../components/ui';
import { adminDate, adminDateTime, formatCount, formatMinorAmount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useAdCampaign,
    useAdCampaigns,
    useApproveCampaign,
    usePauseCampaign,
    useRejectCampaign,
    useResumeCampaign,
    useStopCampaign,
} from '../../hooks/useAdvertising';
import {
    CAMPAIGN_STATUS_OPTIONS,
    CAMPAIGN_TYPE_OPTIONS,
    type AdCampaignListItemDto,
    type AdCampaignQuery,
} from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

type ReasonAction = 'reject' | 'stop';

/** Campaigns — list, detail drawer and the full approval/run lifecycle. */
const CampaignsPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');
    const [query, setQuery] = React.useState<AdCampaignQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useAdCampaigns(query);

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
                <VStack align="end" gap={0.5}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                        {formatMinorAmount(c.budgetMinor, c.currency)}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {formatMinorAmount(c.amountSpentMinor, c.currency)} spent
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'engagement',
            header: 'Engagement',
            align: 'right',
            render: (c) => (
                <Text fontSize="11px" color="gray.600">
                    {formatCount(c.impressions)} imp · {formatCount(c.clicks)} clk ·{' '}
                    {c.clickThroughRate.toFixed(2)}%
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
    ];

    return (
        <AdminPageLayout
            title="Campaigns"
            subtitle="All advertising campaigns, with approval, pause/resume and stop lifecycle."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Campaigns' }]}
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
                            placeholder: 'Search by campaign name',
                        }}
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
                            {
                                key: 'type',
                                value: query.type ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        type: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: CAMPAIGN_TYPE_OPTIONS,
                                width: '160px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load campaigns." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(c) => c.id}
                            loading={isLoading && !data}
                            onRowClick={(c) => setSelectedId(c.id)}
                            emptyIcon={FiTarget}
                            emptyTitle="No campaigns"
                            emptyDescription="No campaigns match the current filters."
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

                    <CampaignDrawer
                        campaignId={selectedId}
                        canManage={canManage}
                        onClose={() => setSelectedId(null)}
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default CampaignsPage;

/* ------------------------------ Detail drawer ----------------------------- */

const CampaignDrawer: React.FC<{
    campaignId: string | null;
    canManage: boolean;
    onClose: () => void;
}> = ({ campaignId, canManage, onClose }) => {
    const { data, isLoading, error } = useAdCampaign(campaignId);
    const [reasonAction, setReasonAction] = React.useState<ReasonAction | null>(null);

    const approve = useApproveCampaign();
    const pause = usePauseCampaign();
    const resume = useResumeCampaign();
    const reject = useRejectCampaign();
    const stop = useStopCampaign();

    const status = data?.status;
    const canApprove = status === 'PendingApproval';
    const canReject = status === 'PendingApproval';
    const canPause = status === 'Active';
    const canResume = status === 'Paused';
    const canStop = status === 'Active' || status === 'Paused' || status === 'PendingApproval';

    const runReason = (reason: string) => {
        if (!campaignId || !reasonAction) return;
        const done = () => setReasonAction(null);
        if (reasonAction === 'reject')
            reject.mutate({ id: campaignId, payload: { reason } }, { onSuccess: done });
        else stop.mutate({ id: campaignId, payload: { reason: reason || null } }, { onSuccess: done });
    };

    const REASON_META: Record<ReasonAction, { title: string; confirm: string; tone: ActionTone; require: boolean }> = {
        reject: { title: 'Reject campaign', confirm: 'Reject', tone: 'danger', require: true },
        stop: { title: 'Stop campaign', confirm: 'Stop', tone: 'danger', require: false },
    };

    return (
        <DetailDrawer
            open={campaignId !== null}
            onClose={onClose}
            title={data?.name ?? 'Campaign'}
            subtitle={data ? `${data.advertiserName} · ${data.type}` : undefined}
            size="lg"
            footer={
                canManage && data ? (
                    <HStack gap={2} justify="flex-end" w="100%" flexWrap="wrap">
                        {canReject && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="#E53E3E"
                                borderRadius="10px"
                                onClick={() => setReasonAction('reject')}
                            >
                                Reject
                            </Button>
                        )}
                        {canStop && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                onClick={() => setReasonAction('stop')}
                            >
                                Stop
                            </Button>
                        )}
                        {canPause && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                loading={pause.isPending}
                                onClick={() => pause.mutate(data.id)}
                            >
                                Pause
                            </Button>
                        )}
                        {canResume && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                borderRadius="10px"
                                _hover={{ bg: '#E61E45' }}
                                loading={resume.isPending}
                                onClick={() => resume.mutate(data.id)}
                            >
                                Resume
                            </Button>
                        )}
                        {canApprove && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="primary.500"
                                color="white"
                                borderRadius="10px"
                                _hover={{ bg: '#E61E45' }}
                                loading={approve.isPending}
                                onClick={() => approve.mutate(data.id)}
                            >
                                Approve
                            </Button>
                        )}
                    </HStack>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load this campaign." />
            ) : isLoading || !data ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={4}>
                    <StatusBadge status={data.status} />
                    {(data.coverImageUrl || data.creativeUrl) && (
                        <CoverThumb
                            src={data.coverImageUrl ?? data.creativeUrl}
                            alt={data.name}
                            size="180px"
                            radius="lg"
                            icon={FiImage}
                        />
                    )}
                    <DetailRow label="Budget" value={formatMinorAmount(data.budgetMinor, data.currency)} />
                    {data.dailyLimitMinor != null && (
                        <DetailRow
                            label="Daily limit"
                            value={formatMinorAmount(data.dailyLimitMinor, data.currency)}
                        />
                    )}
                    <DetailRow label="Spent" value={formatMinorAmount(data.amountSpentMinor, data.currency)} />
                    <DetailRow
                        label="Remaining"
                        value={formatMinorAmount(data.remainingBudgetMinor, data.currency)}
                    />
                    <DetailRow
                        label="Engagement"
                        value={`${formatCount(data.impressions)} imp · ${formatCount(
                            data.clicks,
                        )} clk · ${data.clickThroughRate.toFixed(2)}% CTR`}
                    />
                    <DetailRow label="Window" value={`${adminDate(data.startDate)} – ${adminDate(data.endDate)}`} />
                    {data.targetContentType && (
                        <DetailRow
                            label="Target content"
                            value={`${data.targetContentType}${
                                data.targetContentId ? ` · ${data.targetContentId}` : ''
                            }`}
                        />
                    )}
                    {data.clickUrl && (
                        <DetailRow
                            label="Click URL"
                            value={
                                <Link href={data.clickUrl} color="primary.500" fontSize="xs" target="_blank">
                                    {data.clickUrl}
                                </Link>
                            }
                        />
                    )}
                    {data.targetingSettings && (
                        <Box>
                            <Text fontSize="11px" color="gray.500" mb={1}>
                                Targeting
                            </Text>
                            <Box
                                as="pre"
                                bg="gray.50"
                                borderRadius="md"
                                p={2.5}
                                fontSize="11px"
                                color="gray.700"
                                overflowX="auto"
                                whiteSpace="pre-wrap"
                                wordBreak="break-word"
                            >
                                {data.targetingSettings}
                            </Box>
                        </Box>
                    )}
                    {data.rejectionReason && (
                        <DetailRow label="Rejection reason" value={data.rejectionReason} />
                    )}
                    <DetailRow label="Created" value={adminDateTime(data.createdAt)} />
                </VStack>
            )}

            {reasonAction && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setReasonAction(null)}
                    onConfirm={runReason}
                    title={REASON_META[reasonAction].title}
                    confirmText={REASON_META[reasonAction].confirm}
                    tone={REASON_META[reasonAction].tone}
                    requireReason={REASON_META[reasonAction].require}
                    isLoading={reject.isPending || stop.isPending}
                />
            )}
        </DetailDrawer>
    );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <HStack justify="space-between" align="flex-start" gap={4}>
        <Text fontSize="11px" color="gray.500" flexShrink={0}>
            {label}
        </Text>
        <Text fontSize="xs" color="gray.800" textAlign="right" wordBreak="break-word">
            {value}
        </Text>
    </HStack>
);
