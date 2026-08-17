import React from 'react';
import { Button, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '@shared/console';
import type { DataColumn } from '@shared/console';
import { adminDate, adminDateTime, formatCount, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useAdvertiser,
    useAdvertisers,
    useApproveVerification,
    useRejectVerification,
} from '../../hooks/useAdvertising';
import {
    VERIFICATION_STATUS_OPTIONS,
    type AdvertiserListItemDto,
    type AdvertiserQuery,
} from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;

/** Advertisers — list, detail drawer and a verification approve/reject lifecycle. */
const AdvertisersPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const [query, setQuery] = React.useState<AdvertiserQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useAdvertisers(query);

    const columns: DataColumn<AdvertiserListItemDto>[] = [
        {
            key: 'advertiser',
            header: 'Advertiser',
            render: (a) => (
                <IdentityCell name={a.fullName} secondary={a.companyName ?? a.email} />
            ),
        },
        {
            key: 'industry',
            header: 'Industry',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {a.industry ?? '—'}
                </Text>
            ),
        },
        {
            key: 'campaigns',
            header: 'Campaigns',
            align: 'right',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(a.activeCampaignCount)} / {formatCount(a.totalCampaignCount)}
                </Text>
            ),
        },
        {
            key: 'wallet',
            header: 'Wallet',
            align: 'right',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(a.walletBalanceMinor)}
                </Text>
            ),
        },
        {
            key: 'verification',
            header: 'Verification',
            render: (a) => <StatusBadge status={a.verificationStatus} />,
        },
        {
            key: 'created',
            header: 'Joined',
            render: (a) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(a.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Advertisers"
            subtitle="Advertiser accounts, their campaigns, wallet balances and verification status."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Advertisers' }]}
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
                            placeholder: 'Search by name, email or company',
                        }}
                        filters={[
                            {
                                key: 'verificationStatus',
                                value: query.verificationStatus ?? 'All',
                                onChange: (v) =>
                                    setQuery((q) => ({
                                        ...q,
                                        verificationStatus: v === 'All' ? undefined : v,
                                        page: 1,
                                    })),
                                options: VERIFICATION_STATUS_OPTIONS,
                                width: '170px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load advertisers." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(a) => a.userId}
                            loading={isLoading && !data}
                            onRowClick={(a) => setSelectedId(a.userId)}
                            emptyIcon={FiUsers}
                            emptyTitle="No advertisers"
                            emptyDescription="No advertisers match the current filters."
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

                    <AdvertiserDrawer userId={selectedId} onClose={() => setSelectedId(null)} />
                </>
            )}
        </AdminPageLayout>
    );
};

export default AdvertisersPage;

/* ------------------------------ Detail drawer ----------------------------- */

const AdvertiserDrawer: React.FC<{ userId: string | null; onClose: () => void }> = ({
    userId,
    onClose,
}) => {
    const { data, isLoading, error } = useAdvertiser(userId);
    const canApprove = useHasPermission('VerificationsApprove');
    const canReject = useHasPermission('VerificationsReject');
    const [rejecting, setRejecting] = React.useState(false);

    const approve = useApproveVerification();
    const reject = useRejectVerification();

    const pending = data?.verificationStatus === 'Pending';
    const addr = data?.businessAddress;
    const addrText = addr
        ? [addr.street, addr.city, addr.state, addr.country, addr.postalCode]
              .filter(Boolean)
              .join(', ')
        : null;

    return (
        <DetailDrawer
            open={userId !== null}
            onClose={onClose}
            title={data?.fullName ?? 'Advertiser'}
            subtitle={data?.companyName ?? data?.email}
            size="md"
            footer={
                pending && data && (canApprove || canReject) ? (
                    <HStack gap={2} justify="flex-end" w="100%">
                        {canReject && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="#E53E3E"
                                borderRadius="10px"
                                onClick={() => setRejecting(true)}
                            >
                                Reject
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
                                onClick={() => approve.mutate(data.userId)}
                            >
                                Approve
                            </Button>
                        )}
                    </HStack>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load this advertiser." />
            ) : isLoading || !data ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={4}>
                    <StatusBadge status={data.verificationStatus} />
                    <DetailRow label="Email" value={data.email} />
                    {data.companyName && <DetailRow label="Company" value={data.companyName} />}
                    {data.industry && <DetailRow label="Industry" value={data.industry} />}
                    {data.businessPhone && <DetailRow label="Phone" value={data.businessPhone} />}
                    {data.website && (
                        <DetailRow
                            label="Website"
                            value={
                                <Link href={data.website} color="primary.500" fontSize="xs" target="_blank">
                                    {data.website}
                                </Link>
                            }
                        />
                    )}
                    {addrText && <DetailRow label="Address" value={addrText} />}
                    <DetailRow
                        label="Wallet balance"
                        value={formatMinorAmount(data.walletBalanceMinor)}
                    />
                    <DetailRow label="Total ad spend (NGN)" value={formatCount(data.totalAdSpendNgn)} />
                    <DetailRow
                        label="Campaigns"
                        value={`${formatCount(data.activeCampaignCount)} active / ${formatCount(
                            data.totalCampaignCount,
                        )} total`}
                    />
                    {data.verificationDocumentUrl && (
                        <DetailRow
                            label="Verification doc"
                            value={
                                <Link
                                    href={data.verificationDocumentUrl}
                                    color="primary.500"
                                    fontSize="xs"
                                    target="_blank"
                                >
                                    View document
                                </Link>
                            }
                        />
                    )}
                    {data.verificationSubmittedAt && (
                        <DetailRow
                            label="Submitted"
                            value={adminDateTime(data.verificationSubmittedAt)}
                        />
                    )}
                    {data.verificationReviewedAt && (
                        <DetailRow
                            label="Reviewed"
                            value={adminDateTime(data.verificationReviewedAt)}
                        />
                    )}
                    {data.verificationRejectionReason && (
                        <DetailRow
                            label="Rejection reason"
                            value={data.verificationRejectionReason}
                        />
                    )}
                    <DetailRow label="Joined" value={adminDate(data.createdAt)} />
                </VStack>
            )}

            {rejecting && userId && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setRejecting(false)}
                    onConfirm={(reason) =>
                        reject.mutate(
                            { userId, payload: { reason } },
                            { onSuccess: () => setRejecting(false) },
                        )
                    }
                    title="Reject verification"
                    confirmText="Reject"
                    tone="danger"
                    isLoading={reject.isPending}
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
