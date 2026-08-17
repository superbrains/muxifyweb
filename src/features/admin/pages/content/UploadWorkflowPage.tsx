import React from 'react';
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiClock, FiRefreshCw, FiUploadCloud, FiXCircle } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    CopyableId,
    CoverThumb,
    DataTable,
    DetailDrawer,
    DetailTabs,
    FilterBar,
    IdentityCell,
    KpiStrip,
    MetaGrid,
    StatusBadge,
} from '@shared/console';
import type { DataColumn, DetailTab, MetaField } from '@shared/console';
import { RescheduleModal } from '../../components/content/RescheduleModal';
import { adminDateTime } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useProcessingItems,
    useRetryProcessing,
    useUploadSession,
    useUploadSessions,
    useUploadStats,
} from '../../hooks/useContent';
import type { ProcessingItemDto, UploadSessionDto } from '../../types/content';

const PAGE_SIZE = 15;

const SESSION_STATUS_OPTIONS = [
    { value: 'All', label: 'All sessions' },
    { value: 'InProgress', label: 'In progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Abandoned', label: 'Abandoned' },
];

/* ------------------------------ Processing table ------------------------------ */

const ProcessingTable: React.FC<{
    status: 'processing' | 'failed';
    canManage: boolean;
    onReschedule: (item: ProcessingItemDto) => void;
}> = ({ status, canManage, onReschedule }) => {
    const [page, setPage] = React.useState(1);
    const { data, isLoading, error } = useProcessingItems({ status, page, pageSize: PAGE_SIZE });
    const retry = useRetryProcessing();

    const columns: DataColumn<ProcessingItemDto>[] = [
        {
            key: 'title',
            header: 'Item',
            render: (p) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {p.title || 'Untitled'}
                    </Text>
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                        {p.kind}
                        {p.stage ? ` · ${p.stage}` : ''}
                    </Text>
                </VStack>
            ),
        },
        { key: 'owner', header: 'Owner', render: (p) => <IdentityCell name={p.ownerName ?? 'Unknown'} size="xs" /> },
        {
            key: 'status',
            header: 'Status',
            render: (p) => (
                <VStack align="start" gap={0.5}>
                    <StatusBadge status={p.status} />
                    {p.errorMessage && (
                        <Text fontSize="10px" color="#C53030" lineClamp={2}>
                            {p.errorMessage}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'created',
            header: 'Started',
            render: (p) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(p.createdAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (p) => {
                if (!canManage) return null;
                return (
                    <HStack gap={1.5} justify="flex-end">
                        {status === 'failed' && (
                            <Button
                                size="xs"
                                variant="outline"
                                borderRadius="md"
                                fontSize="11px"
                                disabled={retry.isPending}
                                onClick={() => retry.mutate({ kind: p.kind, id: p.id })}
                            >
                                <FiRefreshCw /> Retry
                            </Button>
                        )}
                        {p.kind.toLowerCase() === 'track' && (
                            <Button
                                size="xs"
                                variant="outline"
                                borderRadius="md"
                                fontSize="11px"
                                onClick={() => onReschedule(p)}
                            >
                                <FiClock /> Reschedule
                            </Button>
                        )}
                    </HStack>
                );
            },
        },
    ];

    if (error) return <AdminError error={error} message="Could not load processing items." />;

    return (
        <DataTable
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(p) => p.id}
            loading={isLoading && !data}
            emptyIcon={status === 'failed' ? FiXCircle : FiClock}
            emptyTitle={status === 'failed' ? 'No failed items' : 'Nothing processing'}
            emptyDescription={
                status === 'failed'
                    ? 'No uploads have failed processing.'
                    : 'No uploads are currently being processed.'
            }
            pagination={
                data
                    ? { page: data.page, pageSize: data.pageSize, total: data.total, onPageChange: setPage }
                    : undefined
            }
        />
    );
};

/* ------------------------------- Session detail drawer ----------------------- */

const SessionDetailDrawer: React.FC<{
    sessionId: string | null;
    onClose: () => void;
}> = ({ sessionId, onClose }) => {
    const { data, isLoading } = useUploadSession(sessionId);
    const session = data?.session;

    const fields: MetaField[] = session
        ? [
              { label: 'Session ID', value: <CopyableId value={session.id} label="Session ID" /> },
              { label: 'Media type', value: session.mediaType },
              { label: 'Content type', value: session.contentType },
              { label: 'File name', value: session.originalFileName },
              { label: 'Size', value: `${(session.sizeBytes / 1024 / 1024).toFixed(2)} MB` },
              { label: 'Status', value: session.status },
              { label: 'Started', value: adminDateTime(session.createdAt) },
              session.failureReason && { label: 'Failure reason', value: session.failureReason },
          ].filter(Boolean) as MetaField[]
        : [];

    return (
        <DetailDrawer
            open={!!sessionId}
            onClose={onClose}
            title="Upload session"
            subtitle={session?.originalFileName}
        >
            {isLoading ? (
                <Text fontSize="xs" color="gray.500">Loading…</Text>
            ) : session ? (
                <VStack align="stretch" gap={4}>
                    {data?.linkedContentTitle && (
                        <HStack
                            gap={3}
                            bg="gray.50"
                            borderRadius="xl"
                            p={3}
                            align="center"
                        >
                            <CoverThumb src={data.linkedContentCoverArtUrl} size="44px" radius="8px" />
                            <VStack align="start" gap={0} minW={0}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                                    {data.linkedContentTitle}
                                </Text>
                                <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                                    Linked {data.linkedContentKind}
                                </Text>
                            </VStack>
                        </HStack>
                    )}
                    <MetaGrid fields={fields} columns={1} />
                </VStack>
            ) : (
                <Text fontSize="xs" color="gray.500">Session not found.</Text>
            )}
        </DetailDrawer>
    );
};

/* ------------------------------- Sessions table ------------------------------ */

const SessionsTable: React.FC = () => {
    const [status, setStatus] = React.useState<string | undefined>(undefined);
    const [page, setPage] = React.useState(1);
    const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useUploadSessions({ status, page, pageSize: PAGE_SIZE });

    const columns: DataColumn<UploadSessionDto>[] = [
        {
            key: 'session',
            header: 'Session',
            render: (s) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {s.originalFileName || s.id}
                    </Text>
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                        {s.mediaType} · {s.contentType}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'owner',
            header: 'Owner',
            render: (s) => <IdentityCell name={s.userName ?? 'Unknown'} size="xs" />,
        },
        { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
        {
            key: 'created',
            header: 'Started',
            render: (s) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(s.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <>
            <VStack align="stretch" gap={3}>
                <FilterBar
                    filters={[
                        {
                            key: 'status',
                            value: status ?? 'All',
                            onChange: (v) => {
                                setStatus(v === 'All' ? undefined : v);
                                setPage(1);
                            },
                            options: SESSION_STATUS_OPTIONS,
                            width: '170px',
                        },
                    ]}
                />
                {error ? (
                    <AdminError error={error} message="Could not load upload sessions." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(s) => s.id}
                        onRowClick={(s) => setSelectedSessionId(s.id)}
                        loading={isLoading && !data}
                        emptyIcon={FiUploadCloud}
                        emptyTitle="No upload sessions"
                        emptyDescription="No sessions match the current filter."
                        pagination={
                            data
                                ? { page: data.page, pageSize: data.pageSize, total: data.total, onPageChange: setPage }
                                : undefined
                        }
                    />
                )}
            </VStack>
            <SessionDetailDrawer
                sessionId={selectedSessionId}
                onClose={() => setSelectedSessionId(null)}
            />
        </>
    );
};

/* ---------------------------------- Page ---------------------------------- */

/** Upload workflow — processing vs failed items (with retry/reschedule) + sessions. */
const UploadWorkflowPage: React.FC = () => {
    const canManage = useHasPermission('ContentManage');
    const [reschedule, setReschedule] = React.useState<ProcessingItemDto | null>(null);
    const { data: uploadStats } = useUploadStats();

    const tabs: DetailTab[] = [
        {
            id: 'processing',
            label: 'Processing',
            icon: FiClock,
            content: (
                <ProcessingTable
                    status="processing"
                    canManage={canManage}
                    onReschedule={(item) => setReschedule(item)}
                />
            ),
        },
        {
            id: 'failed',
            label: 'Failed',
            icon: FiXCircle,
            content: (
                <ProcessingTable
                    status="failed"
                    canManage={canManage}
                    onReschedule={(item) => setReschedule(item)}
                />
            ),
        },
        {
            id: 'sessions',
            label: 'Upload sessions',
            icon: FiUploadCloud,
            content: <SessionsTable />,
        },
    ];

    const kpis = uploadStats
        ? [
              { label: 'Processing', value: uploadStats.processing, tone: 'info' as const },
              { label: 'Failed', value: uploadStats.failed, tone: 'danger' as const },
              { label: 'Active sessions', value: uploadStats.sessionsActive },
              { label: 'Sessions today', value: uploadStats.sessionsToday, tone: 'success' as const },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Upload Workflow"
            subtitle="Monitor processing, retry failures and review upload sessions"
            breadcrumbs={[{ label: 'Content' }, { label: 'Upload Workflow' }]}
        >
            {kpis.length > 0 && <KpiStrip items={kpis} />}
            <DetailTabs tabs={tabs} />
            <RescheduleModal
                open={reschedule !== null}
                trackId={reschedule?.id}
                trackTitle={reschedule?.title}
                onClose={() => setReschedule(null)}
            />
        </AdminPageLayout>
    );
};

export default UploadWorkflowPage;
