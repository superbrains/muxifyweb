import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminError, AdminLoading } from '../components/AdminStateBlock';
import { AdminTable, type AdminTableColumn } from '../components/AdminTable';
import { Paginator } from '../components/Paginator';
import { StatusBadge } from '../components/StatusBadge';
import { IdentityCell } from '../components/IdentityCell';
import { AnimatedTabs } from '@shared/components';
import { VerificationFilterBar } from '../components/verification/VerificationFilterBar';
import { VerificationReviewDrawer } from '../components/verification/VerificationReviewDrawer';
import { useVerifications } from '../hooks/useVerifications';
import { verificationStatusStyle } from '../lib/statusColor';
import { adminDate } from '../lib/format';
import type {
    VerificationEntityType,
    VerificationListItemDto,
    VerificationQuery,
} from '../types';

const PAGE_SIZE = 15;

const TABS = [
    { id: 'artist', label: 'Artists' },
    { id: 'label', label: 'Record Labels' },
];

const VerificationCenterPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const entityType: VerificationEntityType =
        searchParams.get('type') === 'label' ? 'label' : 'artist';

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

    const handleTabChange = (id: string) => {
        setSearchParams(id === 'label' ? { type: 'label' } : {});
    };

    const columns: AdminTableColumn<VerificationListItemDto>[] = [
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
                    {r.entityType === 'label' ? 'Record Label' : 'Artist'}
                </Text>
            ),
        },
        {
            key: 'submitted',
            header: 'Submitted',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {adminDate(r.submittedAt)}
                </Text>
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

    const pendingCount = data?.items.filter((v) => v.status === 'Pending').length ?? 0;

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="Verification Center"
                subtitle="Review and decide on Artist & Record Label verification documents"
            />

            <Box>
                <AnimatedTabs
                    tabs={TABS}
                    activeTab={entityType}
                    onTabChange={handleTabChange}
                    size="sm"
                />
            </Box>

            <VerificationFilterBar query={query} onChange={setQuery} />

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message="Could not load verification requests." />
            ) : (
                <>
                    {query.status === 'Pending' && pendingCount > 0 && (
                        <Text fontSize="11px" color="gray.600">
                            {pendingCount} request{pendingCount === 1 ? '' : 's'} awaiting
                            review on this page
                        </Text>
                    )}
                    <AdminTable
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(r) => r.id}
                        onRowClick={(r) => setSelectedId(r.id)}
                        emptyTitle="No verification requests"
                        emptyDescription="Nothing matches the current filters."
                    />
                    {data && (
                        <Paginator
                            page={data.page}
                            pageSize={data.pageSize}
                            total={data.total}
                            onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                        />
                    )}
                </>
            )}

            <VerificationReviewDrawer
                verificationId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </VStack>
    );
};

export default VerificationCenterPage;
