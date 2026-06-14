import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Input,
    Portal,
    Stack,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { FiFileText, FiPlus } from 'react-icons/fi';
import { Select } from '@shared/components';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    CopyableId,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    KpiStrip,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useApproveLyrics,
    useCreateLyrics,
    useLyrics,
    useLyricsById,
    useLyricsStats,
    useRejectLyrics,
} from '../../hooks/useContent';
import type { LyricsDto, LyricsQuery } from '../../types/content';

const PAGE_SIZE = 15;

const LYRICS_STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
];

const FORMAT_OPTIONS = [
    { value: 'Plain', label: 'Plain text' },
    { value: 'LRC', label: 'LRC (timed)' },
];

/* --------------------------------- Add form -------------------------------- */

const AddLyricsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const create = useCreateLyrics();
    const [trackId, setTrackId] = React.useState('');
    const [content, setContent] = React.useState('');
    const [language, setLanguage] = React.useState('en');
    const [format, setFormat] = React.useState('Plain');

    React.useEffect(() => {
        if (open) {
            setTrackId('');
            setContent('');
            setLanguage('en');
            setFormat('Plain');
        }
    }, [open]);

    const canSubmit = trackId.trim() && content.trim() && language.trim();

    return (
        <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="520px" p={6} borderRadius="20px">
                        <VStack align="stretch" gap={4}>
                            <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                                Add lyrics
                            </Text>
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Track ID
                                </Text>
                                <Input
                                    value={trackId}
                                    onChange={(e) => setTrackId(e.target.value)}
                                    placeholder="Track GUID"
                                    size="sm"
                                    fontSize="xs"
                                />
                            </Box>
                            <HStack gap={3} align="flex-end">
                                <Box flex="1">
                                    <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                        Language
                                    </Text>
                                    <Input
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        placeholder="e.g. en"
                                        size="sm"
                                        fontSize="xs"
                                    />
                                </Box>
                                <Box flex="1">
                                    <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                        Format
                                    </Text>
                                    <Select
                                        options={FORMAT_OPTIONS}
                                        value={format}
                                        onChange={(v) => setFormat(v as string)}
                                        width="100%"
                                    />
                                </Box>
                            </HStack>
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Lyrics
                                </Text>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste the lyrics here…"
                                    rows={8}
                                    fontSize="xs"
                                    resize="vertical"
                                />
                            </Box>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={create.isPending}
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
                                    disabled={!canSubmit || create.isPending}
                                    onClick={() =>
                                        create.mutate(
                                            { trackId: trackId.trim(), content, format, language: language.trim() },
                                            { onSuccess: onClose },
                                        )
                                    }
                                >
                                    Add lyrics
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

/* -------------------------------- Preview drawer --------------------------- */

/** Strip leading `[mm:ss.xx]` / `[mm:ss]` synchronisation tags from LRC lines. */
const stripLrcTimestamps = (lrc: string): string =>
    lrc
        .split('\n')
        .map((line) => line.replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trimStart())
        .join('\n')
        .trim();

const LyricsBlock: React.FC<{ content: string }> = ({ content }) => (
    <Box
        fontFamily="monospace"
        fontSize="xs"
        color="gray.800"
        whiteSpace="pre-wrap"
        bg="gray.50"
        borderRadius="10px"
        p={4}
        maxH="60vh"
        overflowY="auto"
        flex="1"
        minW={0}
    >
        {content || '—'}
    </Box>
);

const LyricsPreviewDrawer: React.FC<{
    lyricsId: string | null;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (l: LyricsDto) => void;
    canManage: boolean;
}> = ({ lyricsId, onClose, onApprove, onReject, canManage }) => {
    const { data: lyrics, isLoading } = useLyricsById(lyricsId);
    const approve = useApproveLyrics();
    const isPending = lyrics?.status?.toLowerCase() === 'pending';

    return (
        <DetailDrawer
            open={!!lyricsId}
            onClose={onClose}
            title="Lyrics preview"
            subtitle={lyrics?.trackTitle}
            footer={
                canManage && isPending && lyrics ? (
                    <HStack gap={3} justify="flex-end">
                        <Button
                            size="sm"
                            fontSize="xs"
                            borderRadius="10px"
                            variant="outline"
                            borderColor="#FECACA"
                            color="#C53030"
                            onClick={() => {
                                onReject(lyrics);
                                onClose();
                            }}
                        >
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            borderRadius="10px"
                            bg="primary.500"
                            color="white"
                            _hover={{ bg: 'primary.600' }}
                            disabled={approve.isPending}
                            onClick={() => {
                                onApprove(lyrics.id);
                                onClose();
                            }}
                        >
                            Approve
                        </Button>
                    </HStack>
                ) : undefined
            }
        >
            {isLoading ? (
                <Text fontSize="xs" color="gray.500">Loading…</Text>
            ) : lyrics ? (
                <VStack align="stretch" gap={4}>
                    <HStack gap={3} flexWrap="wrap" justify="space-between">
                        <HStack gap={3} flexWrap="wrap">
                            <StatusBadge status={lyrics.status} />
                            <Text fontSize="11px" color="gray.500">
                                {lyrics.language?.toUpperCase()} · {lyrics.format} · {lyrics.source}
                            </Text>
                        </HStack>
                        <CopyableId value={lyrics.trackId} label="Track ID" truncate={12} />
                    </HStack>
                    {lyrics.format?.toLowerCase() === 'lrc' ? (
                        <Stack direction={{ base: 'column', md: 'row' }} gap={3} align="stretch">
                            <VStack align="stretch" gap={1.5} flex="1" minW={0}>
                                <Text fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">
                                    LRC (timed)
                                </Text>
                                <LyricsBlock content={lyrics.content} />
                            </VStack>
                            <VStack align="stretch" gap={1.5} flex="1" minW={0}>
                                <Text fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">
                                    Plain text
                                </Text>
                                <LyricsBlock content={stripLrcTimestamps(lyrics.content)} />
                            </VStack>
                        </Stack>
                    ) : (
                        <LyricsBlock content={lyrics.content} />
                    )}
                    {lyrics.rejectionReason && (
                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="#C53030" mb={0.5}>
                                Rejection reason
                            </Text>
                            <Text fontSize="xs" color="#C53030">
                                {lyrics.rejectionReason}
                            </Text>
                        </Box>
                    )}
                </VStack>
            ) : (
                <Text fontSize="xs" color="gray.500">Lyrics not found.</Text>
            )}
        </DetailDrawer>
    );
};

/* ---------------------------------- Page ---------------------------------- */

/** Lyrics management — review queue with approve/reject and an add-lyrics form. */
const LyricsManagementPage: React.FC = () => {
    const canManage = useHasPermission('ContentManage');
    const [query, setQuery] = React.useState<LyricsQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [rejectTarget, setRejectTarget] = React.useState<LyricsDto | null>(null);
    const [addOpen, setAddOpen] = React.useState(false);
    const [previewId, setPreviewId] = React.useState<string | null>(null);
    const { data: lyricsStats } = useLyricsStats();

    const { data, isLoading, error } = useLyrics(query);
    const approve = useApproveLyrics();
    const reject = useRejectLyrics();

    const isPending = (l: LyricsDto) => l.status.toLowerCase() === 'pending';

    const columns: DataColumn<LyricsDto>[] = [
        {
            key: 'track',
            header: 'Track',
            render: (l) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {l.trackTitle}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {l.language?.toUpperCase()} · {l.format} · {l.source}
                    </Text>
                </VStack>
            ),
        },
        { key: 'owner', header: 'Owner', render: (l) => <IdentityCell name={l.ownerName} size="xs" /> },
        {
            key: 'status',
            header: 'Status',
            render: (l) => (
                <VStack align="start" gap={0.5}>
                    <StatusBadge status={l.status} />
                    {l.rejectionReason && (
                        <Text fontSize="10px" color="#C53030" lineClamp={2}>
                            {l.rejectionReason}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'created',
            header: 'Submitted',
            render: (l) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(l.createdAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (l) => {
                if (!canManage || !isPending(l)) return null;
                return (
                    <HStack gap={1.5} justify="flex-end">
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.200"
                            color="#0F7B5C"
                            borderRadius="md"
                            fontSize="11px"
                            disabled={approve.isPending}
                            onClick={() => approve.mutate(l.id)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="#FECACA"
                            color="#C53030"
                            borderRadius="md"
                            fontSize="11px"
                            disabled={reject.isPending}
                            onClick={() => setRejectTarget(l)}
                        >
                            Reject
                        </Button>
                    </HStack>
                );
            },
        },
    ];

    const kpis = lyricsStats
        ? [
              { label: 'Total', value: lyricsStats.total },
              { label: 'Pending', value: lyricsStats.pending, tone: 'warning' as const },
              { label: 'Approved', value: lyricsStats.approved, tone: 'success' as const },
              { label: 'Rejected', value: lyricsStats.rejected, tone: 'danger' as const },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Lyrics"
            subtitle="Review submitted lyrics and add lyrics to tracks"
            breadcrumbs={[{ label: 'Content' }, { label: 'Lyrics' }]}
            actions={
                canManage ? (
                    <Button
                        size="sm"
                        bg="primary.500"
                        color="white"
                        fontSize="xs"
                        borderRadius="10px"
                        _hover={{ bg: 'primary.600' }}
                        onClick={() => setAddOpen(true)}
                    >
                        <FiPlus /> Add lyrics
                    </Button>
                ) : undefined
            }
        >
            {kpis.length > 0 && <KpiStrip items={kpis} />}
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by track',
                }}
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, status: v === 'All' ? undefined : v, page: 1 })),
                        options: LYRICS_STATUS_OPTIONS,
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load lyrics." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(l) => l.id}
                    onRowClick={(l) => setPreviewId(l.id)}
                    loading={isLoading && !data}
                    emptyIcon={FiFileText}
                    emptyTitle="No lyrics found"
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

            <ConfirmActionModal
                isOpen={rejectTarget !== null}
                onClose={() => setRejectTarget(null)}
                onConfirm={(reason) =>
                    rejectTarget &&
                    reject.mutate(
                        { id: rejectTarget.id, reason },
                        { onSuccess: () => setRejectTarget(null) },
                    )
                }
                title="Reject these lyrics"
                message={
                    rejectTarget
                        ? `Reject the lyrics submitted for “${rejectTarget.trackTitle}”.`
                        : undefined
                }
                reasonLabel="Rejection reason"
                confirmText="Reject lyrics"
                tone="danger"
                isLoading={reject.isPending}
            />

            <AddLyricsModal open={addOpen} onClose={() => setAddOpen(false)} />
            <LyricsPreviewDrawer
                lyricsId={previewId}
                onClose={() => setPreviewId(null)}
                onApprove={(id) => approve.mutate(id)}
                onReject={(l) => setRejectTarget(l)}
                canManage={canManage}
            />
        </AdminPageLayout>
    );
};

export default LyricsManagementPage;
