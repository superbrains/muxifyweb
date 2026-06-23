import React from 'react';
import { Button, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { FiCheckSquare, FiImage } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    CoverThumb,
    DataTable,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate, formatMinorAmount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useApproveCampaign,
    useCreativeReview,
    useRejectCampaign,
} from '../../hooks/useAdvertising';
import type { AdCampaignDetailDto, ReviewQuery } from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/** Creative review queue — pending creatives with inline preview, approve and reject. */
const CreativeReviewPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');
    const [query, setQuery] = React.useState<ReviewQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [rejectId, setRejectId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useCreativeReview(query);

    const approve = useApproveCampaign();
    const reject = useRejectCampaign();

    const columns: DataColumn<AdCampaignDetailDto>[] = [
        {
            key: 'preview',
            header: 'Creative',
            render: (c) => (
                <CoverThumb src={c.coverImageUrl ?? c.creativeUrl} alt={c.name} size="48px" icon={FiImage} />
            ),
        },
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
            key: 'clickUrl',
            header: 'Destination',
            render: (c) =>
                c.clickUrl ? (
                    <Link href={c.clickUrl} color="primary.500" fontSize="11px" target="_blank" lineClamp={1}>
                        {c.clickUrl}
                    </Link>
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        —
                    </Text>
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
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setRejectId(c.id);
                                  }}
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
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      approve.mutate(c.id);
                                  }}
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
            title="Creative Review"
            subtitle="Pending campaign creatives awaiting approval before they go live."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Creative Review' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : error ? (
                <AdminError error={error} message="Could not load the review queue." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(c) => c.id}
                    loading={isLoading && !data}
                    emptyIcon={FiCheckSquare}
                    emptyTitle="Queue clear"
                    emptyDescription="No creatives are awaiting review."
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
                    title="Reject creative"
                    confirmText="Reject"
                    tone="danger"
                    isLoading={reject.isPending}
                />
            )}
        </AdminPageLayout>
    );
};

export default CreativeReviewPage;
