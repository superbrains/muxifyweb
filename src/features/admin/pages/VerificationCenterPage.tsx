import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FiCheckSquare } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../components/ui';
import type { DataColumn, KpiItem } from '../components/ui';
import { AnimatedTabs } from '@shared/components';
import { VerificationFilterBar } from '../components/verification/VerificationFilterBar';
import { VerificationReviewDrawer } from '../components/verification/VerificationReviewDrawer';
import { useVerifications, useVerificationSummary } from '../hooks/useVerifications';
import { verificationStatusStyle } from '../lib/statusColor';
import { adminDate, adminRelative, formatCount } from '../lib/format';
import type {
    VerificationEntityType,
    VerificationListItemDto,
    VerificationQuery,
} from '../types';

const PAGE_SIZE = 15;

const ENTITY_TYPES: VerificationEntityType[] = ['artist', 'label', 'contributor', 'ad_manager'];

const ENTITY_TYPE_LABEL: Record<VerificationEntityType, string> = {
    artist: 'Artist',
    label: 'Record Label',
    contributor: 'Contributor',
    ad_manager: 'Ad Manager',
};

const ENTITY_TYPE_PLURAL: Record<VerificationEntityType, string> = {
    artist: 'Artists',
    label: 'Record Labels',
    contributor: 'Contributors',
    ad_manager: 'Ad Managers',
};

const VerificationCenterPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const entityType: VerificationEntityType =
        (ENTITY_TYPES as string[]).includes(typeParam ?? '')
            ? (typeParam as VerificationEntityType)
            : 'artist';

    const [query, setQuery] = React.useState<VerificationQuery>({
        entityType,
        status: 'Pending',
        sort: 'oldest',
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    // Keep the query's entityType in sync with the active tab.
    React.useEffect(() => {
        setQuery((q) => ({ ...q, entityType, page: 1 }));
    }, [entityType]);

    const { data, isLoading, error } = useVerifications(query);
    const { data: summary } = useVerificationSummary();

    const summaryFor = (type: VerificationEntityType) =>
        summary?.find((s) => s.entityType === type);

    const kpiItems: KpiItem[] = ENTITY_TYPES.map((type) => {
        const s = summaryFor(type);
        return {
            label: `Pending · ${ENTITY_TYPE_PLURAL[type]}`,
            value: formatCount(s?.pending),
            sub: s?.oldestPendingSubmittedAt
                ? `oldest waiting ${adminRelative(s.oldestPendingSubmittedAt)}`
                : undefined,
        };
    });

    const tabs = ENTITY_TYPES.map((type) => {
        const pending = summaryFor(type)?.pending ?? 0;
        return {
            id: type,
            label: pending > 0 ? `${ENTITY_TYPE_PLURAL[type]} · ${pending}` : ENTITY_TYPE_PLURAL[type],
        };
    });

    const handleTabChange = (id: string) => {
        setSearchParams(id === 'artist' ? {} : { type: id });
    };

    const columns: DataColumn<VerificationListItemDto>[] = [
        {
            key: 'applicant',
            header: 'Applicant',
            render: (r) => (
                <IdentityCell
                    name={r.displayName}
                    secondary={r.email}
                    avatarUrl={r.avatarUrl}
                />
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {ENTITY_TYPE_LABEL[r.entityType] ?? 'Artist'}
                </Text>
            ),
        },
        {
            key: 'submitted',
            header: 'Submitted',
            render: (r) => (
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.600">
                        {adminDate(r.submittedAt)}
                    </Text>
                    {r.status === 'Pending' && r.submittedAt && (
                        <Text fontSize="10px" color="gray.400">
                            waiting {adminRelative(r.submittedAt).replace(' ago', '')}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r) => <StatusBadge style={verificationStatusStyle(r.status)} />,
        },
        {
            key: 'action',
            header: '',
            align: 'right',
            render: () => (
                <Text fontSize="xs" fontWeight="semibold" color="primary.500">
                    Review
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Verification Centre"
            subtitle="Review and decide on Artist, Record Label, Contributor & Ad Manager verification documents"
            breadcrumbs={[{ label: 'Users & Roles' }, { label: 'Verification Centre' }]}
        >
            <KpiStrip items={kpiItems} columns={{ base: 2, md: 4, xl: 4 }} />

            <Box>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={entityType}
                    onTabChange={handleTabChange}
                    size="sm"
                />
            </Box>

            <VerificationFilterBar query={query} onChange={setQuery} />

            {error ? (
                <AdminError error={error} message="Could not load verification requests." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(r) => r.id}
                    onRowClick={(r) => setSelectedId(r.id)}
                    loading={isLoading && !data}
                    emptyIcon={FiCheckSquare}
                    emptyTitle="No verification requests"
                    emptyDescription="Nothing matches the current filters."
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

            <VerificationReviewDrawer
                verificationId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </AdminPageLayout>
    );
};

export default VerificationCenterPage;
