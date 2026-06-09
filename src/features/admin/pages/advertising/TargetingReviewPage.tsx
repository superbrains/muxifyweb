import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiCrosshair } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate, formatMinorAmount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useApproveCampaign,
    useRejectCampaign,
    useTargetingReview,
} from '../../hooks/useAdvertising';
import type { AdCampaignDetailDto, ReviewQuery } from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/** Pretty-prints a targeting JSON blob; falls back to the raw string. */
const formatTargeting = (raw?: string | null): string => {
    if (!raw) return '—';
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
};

/** Targeting review queue — pending campaigns with their targeting JSON, approve and reject. */
const TargetingReviewPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');
    const [query, setQuery] = React.useState<ReviewQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [rejectId, setRejectId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useTargetingReview(query);

    const approve = useApproveCampaign();
    const reject = useRejectCampaign();

    const columns: DataColumn<AdCampaignDetailDto>[] = [
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
            key: 'targeting',
            header: 'Targeting',
            render: (c) => (
                <Box
                    as="pre"
                    bg="gray.50"
                    borderRadius="md"
                    p={2}
                    fontSize="10px"
                    color="gray.700"
                    maxW="320px"
                    maxH="120px"
                    overflow="auto"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                >
                    {formatTargeting(c.targetingSettings)}
                </Box>
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
            header: 'Submitted',
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
                      render: (c: AdCampaignDetailDto) => (
                          <HStack gap={2} justify="flex-end">
                              <Button
                                  size="xs"
                                  fontSize="11px"
                                  variant="outline"
                                  borderColor="gray.300"
                                  color="#E53E3E"
                                  borderRadius="8px"
                                  onClick={() => setRejectId(c.id)}
                              >
                                  Reject
                              </Button>
                              <Button
                                  size="xs"
                                  fontSize="11px"
                                  bg="primary.500"
                                  color="white"
                                  borderRadius="8px"
                                  _hover={{ bg: '#E61E45' }}
                                  loading={approve.isPending && approve.variables === c.id}
                                  onClick={() => approve.mutate(c.id)}
                              >
                                  Approve
                              </Button>
                          </HStack>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AdminPageLayout
            title="Targeting Review"
            subtitle="Pending campaigns whose audience targeting needs sign-off before launch."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Targeting Review' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : error ? (
                <AdminError error={error} message="Could not load the targeting queue." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(c) => c.id}
                    loading={isLoading && !data}
                    emptyIcon={FiCrosshair}
                    emptyTitle="Queue clear"
                    emptyDescription="No targeting awaiting review."
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

            {rejectId && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setRejectId(null)}
                    onConfirm={(reason) =>
                        reject.mutate(
                            { id: rejectId, payload: { reason } },
                            { onSuccess: () => setRejectId(null) },
                        )
                    }
                    title="Reject targeting"
                    confirmText="Reject"
                    tone="danger"
                    isLoading={reject.isPending}
                />
            )}
        </AdminPageLayout>
    );
};

export default TargetingReviewPage;
