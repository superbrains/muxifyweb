import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Input,
    Portal,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiClock, FiRefreshCw, FiUploadCloud, FiXCircle } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    DetailTabs,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, DetailTab } from '../../components/ui';
import { adminDateTime } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useProcessingItems,
    useRescheduleTrack,
    useRetryProcessing,
    useUploadSessions,
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

/* ------------------------------ Reschedule modal ------------------------------ */

interface RescheduleState {
    item: ProcessingItemDto;
}

const RescheduleModal: React.FC<{
    target: RescheduleState | null;
    onClose: () => void;
}> = ({ target, onClose }) => {
    const reschedule = useRescheduleTrack();
    const [date, setDate] = React.useState('');

    React.useEffect(() => {
        if (target) setDate('');
    }, [target]);

    return (
        <Dialog.Root open={target !== null} onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="420px" p={6} borderRadius="20px">
                        <VStack align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                                    Reschedule release
                                </Text>
                                <Text fontSize="xs" color="gray.600" mt={1}>
                                    Set a new release date for “{target?.item.title}”.
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Release date
                                </Text>
                                <Input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    size="sm"
                                    fontSize="xs"
                                />
                            </Box>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={reschedule.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                    disabled={!date || reschedule.isPending}
                                    onClick={() =>
                                        target &&
                                        reschedule.mutate(
                                            { id: target.item.id, releaseDate: new Date(date).toISOString() },
                                            { onSuccess: onClose },
                                        )
                                    }
                                >
                                    Reschedule
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

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
        { key: 'owner', header: 'Owner', render: (p) => <IdentityCell name={p.ownerName} size="xs" /> },
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

/* ------------------------------- Sessions table ------------------------------ */

const SessionsTable: React.FC = () => {
    const [status, setStatus] = React.useState<string | undefined>(undefined);
    const [page, setPage] = React.useState(1);
    const { data, isLoading, error } = useUploadSessions({ status, page, pageSize: PAGE_SIZE });

    const columns: DataColumn<UploadSessionDto>[] = [
        {
            key: 'session',
            header: 'Session',
            render: (s) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {s.title || s.id}
                    </Text>
                    <Text fontSize="10px" color="gray.500" textTransform="capitalize">
                        {s.kind}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'owner',
            header: 'Owner',
            render: (s) => <IdentityCell name={s.ownerName} secondary={s.ownerRole} size="xs" />,
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
        {
            key: 'completed',
            header: 'Completed',
            render: (s) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(s.completedAt)}
                </Text>
            ),
        },
    ];

    return (
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
    );
};

/* ---------------------------------- Page ---------------------------------- */

/** Upload workflow — processing vs failed items (with retry/reschedule) + sessions. */
const UploadWorkflowPage: React.FC = () => {
    const canManage = useHasPermission('ContentManage');
    const [reschedule, setReschedule] = React.useState<RescheduleState | null>(null);

    const tabs: DetailTab[] = [
        {
            id: 'processing',
            label: 'Processing',
            icon: FiClock,
            content: (
                <ProcessingTable
                    status="processing"
                    canManage={canManage}
                    onReschedule={(item) => setReschedule({ item })}
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
                    onReschedule={(item) => setReschedule({ item })}
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

    return (
        <AdminPageLayout
            title="Upload Workflow"
            subtitle="Monitor processing, retry failures and review upload sessions"
            breadcrumbs={[{ label: 'Content' }, { label: 'Upload Workflow' }]}
        >
            <DetailTabs tabs={tabs} />
            <RescheduleModal target={reschedule} onClose={() => setReschedule(null)} />
        </AdminPageLayout>
    );
};

export default UploadWorkflowPage;
