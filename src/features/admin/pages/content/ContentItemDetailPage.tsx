import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    HStack,
    Skeleton,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    FiAlertCircle,
    FiBook,
    FiClock,
    FiExternalLink,
    FiGlobe,
    FiList,
    FiShield,
} from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    AuditTimeline,
    ConfirmActionModal,
    CopyableId,
    CoverThumb,
    DataTable,
    DetailTabs,
    IdentityCell,
    MetaGrid,
    StatusBadge,
    toneStyle,
} from '../../components/ui';
import { RescheduleModal } from '../../components/content/RescheduleModal';
import type { DataColumn, DetailTab, MetaField } from '../../components/ui';
import { adminDate, formatCount, formatDuration } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useContentItem,
    useContentItemAudit,
    usePublishItem,
    useUnpublishItem,
    useRemoveItem,
    useRestoreItem,
    useRestrictItem,
    useUnrestrictItem,
} from '../../hooks/useContent';
import type {
    ContentKind,
    ContentTrackRowDto,
    DuplicateMatchSummaryDto,
} from '../../types/content';

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const kindLabel: Record<ContentKind, string> = {
    track: 'Track',
    video: 'Video',
    album: 'Album',
    playlist: 'Playlist',
};

/* ─── Tracks sub-table (albums & playlists) ───────────────────────────── */

const TrackListTab: React.FC<{ tracks: ContentTrackRowDto[] }> = ({ tracks }) => {
    const navigate = useNavigate();

    const columns: DataColumn<ContentTrackRowDto>[] = [
        {
            key: 'track',
            header: 'Track',
            render: (t) => (
                <HStack gap={3}>
                    <CoverThumb src={t.coverArtUrl} alt={t.title} size="36px" radius="8px" fallbackFontSize="14px" />
                    <VStack align="start" gap={0} minW={0}>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                            {t.title || 'Untitled'}
                        </Text>
                        <Text fontSize="10px" color="gray.500" lineClamp={1}>
                            {t.artistName}
                        </Text>
                    </VStack>
                </HStack>
            ),
        },
        {
            key: 'number',
            header: '#',
            render: (t) => (
                <Text fontSize="xs" color="gray.500">
                    {t.trackNumber}
                </Text>
            ),
        },
        {
            key: 'duration',
            header: 'Duration',
            render: (t) => (
                <Text fontSize="xs" color="gray.500">
                    {formatDuration(t.durationSeconds)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (t) => <StatusBadge status={t.isPublished ? 'Published' : t.status} />,
        },
    ];

    return (
        <DataTable
            columns={columns}
            rows={tracks}
            rowKey={(t) => t.id}
            onRowClick={(t) => navigate(`/admin/content/track/${t.id}`)}
            emptyIcon={FiList}
            emptyTitle="No tracks"
            emptyDescription="This content has no tracks."
        />
    );
};

/* ─── Duplicate review tab ────────────────────────────────────────────── */

const TIER_TONE: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
    Exact: 'danger',
    High: 'danger',
    Medium: 'warning',
    Low: 'info',
};

const DuplicateTab: React.FC<{
    held: boolean;
    match?: DuplicateMatchSummaryDto;
}> = ({ held, match }) => {
    const navigate = useNavigate();

    return (
        <VStack align="stretch" gap={4}>
            {held && (
                <Box bg="#FFF9E6" border="1px solid" borderColor="#FDE68A" borderRadius="xl" p={4}>
                    <HStack gap={2} mb={1}>
                        <FiAlertCircle color="#D97706" />
                        <Text fontSize="sm" fontWeight="semibold" color="#92660C">
                            Held for duplicate review
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="#92660C">
                        This content is soft-blocked pending a copyright decision.
                    </Text>
                </Box>
            )}

            {match ? (
                <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} shadow="xs">
                    <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                        <HStack gap={2}>
                            <StatusBadge style={toneStyle(TIER_TONE[match.tier] ?? 'neutral', `${match.tier} match`)} />
                            <StatusBadge status={match.status} />
                            {match.isDisputed && <StatusBadge style={toneStyle('warning', 'Disputed')} />}
                        </HStack>
                        <Button
                            size="sm"
                            fontSize="xs"
                            borderRadius="10px"
                            variant="outline"
                            onClick={() => navigate(`/admin/content/duplicates/${match.id}`)}
                        >
                            <FiExternalLink /> Open match
                        </Button>
                    </HStack>
                    <MetaGrid
                        columns={3}
                        fields={[
                            { label: 'Confidence', value: `${Math.round(match.score * 100)}%` },
                            { label: 'Method', value: match.matchMethod },
                            { label: 'Status', value: match.status },
                        ]}
                    />
                    {match.artistDisputeNote && (
                        <Box mt={3} bg="gray.50" borderRadius="lg" p={3}>
                            <Text fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px" mb={1}>
                                Artist dispute note
                            </Text>
                            <Text fontSize="xs" color="gray.700">
                                {match.artistDisputeNote}
                            </Text>
                        </Box>
                    )}
                </Box>
            ) : (
                <Text fontSize="xs" color="gray.500" py={2}>
                    No duplicate match is associated with this content.
                </Text>
            )}
        </VStack>
    );
};

/* ─── Reports tab ─────────────────────────────────────────────────────── */

const ReportsTab: React.FC<{
    openReports: number;
    totalReports: number;
    kind: ContentKind;
    ownerRole: string;
}> = ({ openReports, totalReports, kind, ownerRole }) => {
    const navigate = useNavigate();
    const moderationPath = `/admin/content/moderation/${ownerRole.replace('_', '-')}s`;

    return (
        <VStack align="start" gap={4}>
            <HStack gap={6}>
                <VStack align="start" gap={0}>
                    <Text fontSize="xl" fontWeight="bold" color="gray.900">
                        {openReports}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                        Open reports
                    </Text>
                </VStack>
                <VStack align="start" gap={0}>
                    <Text fontSize="xl" fontWeight="bold" color="gray.900">
                        {totalReports}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                        Total reports
                    </Text>
                </VStack>
            </HStack>

            {openReports > 0 && (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    onClick={() => navigate(moderationPath)}
                >
                    <FiShield /> View in moderation queue
                </Button>
            )}

            {totalReports === 0 && (
                <Text fontSize="xs" color="gray.500">
                    No reports have been filed for this {kindLabel[kind]?.toLowerCase()}.
                </Text>
            )}
        </VStack>
    );
};

/* ─── Action button ───────────────────────────────────────────────────── */

type ActionModal =
    | { type: 'remove' | 'restrict' | 'unrestrict'; kind: ContentKind; id: string }
    | { type: 'reschedule'; kind: ContentKind; id: string }
    | null;

const MODAL_COPY = {
    remove: {
        title: 'Remove this content',
        message: 'The content will be taken down. This is recorded in the audit log.',
        confirmText: 'Remove',
        tone: 'danger' as const,
        reasonLabel: 'Removal reason',
        required: true,
    },
    restrict: {
        title: 'Restrict this content',
        message: 'Content will be limited (hidden from discovery) until the restriction is lifted.',
        confirmText: 'Restrict',
        tone: 'warning' as const,
        reasonLabel: 'Restriction reason',
        required: true,
    },
    unrestrict: {
        title: 'Lift restriction',
        message: 'The content returns to normal distribution.',
        confirmText: 'Lift restriction',
        tone: 'primary' as const,
        reasonLabel: 'Reason (optional)',
        required: false,
    },
};

/* ─── Main page ───────────────────────────────────────────────────────── */

const ContentItemDetailPage: React.FC = () => {
    const { kind: kindParam, id } = useParams<{ kind: string; id: string }>();
    const navigate = useNavigate();
    const canManage = useHasPermission('ContentManage');

    const kind = kindParam as ContentKind;

    const { data: detail, isLoading, error } = useContentItem(kind ?? null, id ?? null);
    const { data: auditEntries = [] } = useContentItemAudit(kind ?? null, id ?? null);

    const [modal, setModal] = React.useState<ActionModal>(null);
    const [activeTab, setActiveTab] = React.useState('overview');

    const publish = usePublishItem();
    const unpublish = useUnpublishItem();
    const restore = useRestoreItem();
    const remove = useRemoveItem();
    const restrict = useRestrictItem();
    const unrestrict = useUnrestrictItem();
    const item = detail?.item;

    const handleConfirm = (reason: string) => {
        if (!modal || !id || !kind) return;
        const args = { kind, id, reason };
        const onSuccess = () => setModal(null);
        if (modal.type === 'remove') remove.mutate(args, { onSuccess });
        else if (modal.type === 'restrict') restrict.mutate(args, { onSuccess });
        else if (modal.type === 'unrestrict') unrestrict.mutate(args, { onSuccess });
    };

    const actionPending =
        publish.isPending ||
        unpublish.isPending ||
        restore.isPending ||
        remove.isPending ||
        restrict.isPending ||
        unrestrict.isPending;

    if (error) {
        return (
            <AdminPageLayout
                title="Content"
                breadcrumbs={[{ label: 'Content', to: '/admin/content' }, { label: 'Detail' }]}
            >
                <AdminError error={error} message="Could not load content details." />
            </AdminPageLayout>
        );
    }

    if (isLoading || !item) {
        return (
            <AdminPageLayout
                title="Content"
                breadcrumbs={[{ label: 'Content', to: '/admin/content' }, { label: 'Detail' }]}
            >
                <VStack align="stretch" gap={4}>
                    <Skeleton h="100px" borderRadius="16px" />
                    <Skeleton h="300px" borderRadius="16px" />
                </VStack>
            </AdminPageLayout>
        );
    }

    /* ── Metadata fields ── */
    const overviewFields: MetaField[] = [
        { label: 'Kind', value: kindLabel[item.kind] ?? item.kind },
        item.releaseType && { label: 'Release type', value: item.releaseType },
        item.videoType && { label: 'Video type', value: item.videoType },
        item.genreName && { label: 'Genre', value: item.genreName },
        detail.bpm && { label: 'BPM', value: String(detail.bpm) },
        detail.musicalKey && { label: 'Key', value: detail.musicalKey },
        detail.bitrate && { label: 'Bitrate', value: `${detail.bitrate} kbps` },
        detail.resolution && { label: 'Resolution', value: detail.resolution },
        detail.fps && { label: 'FPS', value: String(detail.fps) },
        detail.label && { label: 'Label', value: detail.label },
        detail.copyright && { label: 'Copyright', value: detail.copyright },
        (item.kind === 'track' || item.kind === 'video') && {
            label: 'Unlock cost',
            value: detail.unlockCostCoins ? `${formatCount(detail.unlockCostCoins)} coins` : 'Free',
        },
        item.durationSeconds && { label: 'Duration', value: formatDuration(item.durationSeconds) },
        item.trackCount !== undefined && { label: 'Tracks', value: String(item.trackCount) },
        { label: 'Plays', value: formatCount(item.metricCount) },
        { label: 'Likes', value: formatCount(item.likeCount) },
        item.releaseDate && { label: 'Released', value: adminDate(item.releaseDate) },
        { label: 'Created', value: adminDate(item.createdAt) },
        { label: 'Status', value: item.status },
    ].filter(Boolean) as MetaField[];

    /** Copyable identifiers (content ID + recording codes). */
    const identifiers: Array<{ label: string; value?: string }> = [
        { label: 'Content ID', value: item.id },
        { label: 'ISRC', value: detail.isrc },
        { label: 'ISWC', value: detail.iswc },
        { label: 'UPC', value: detail.upc },
        detail.albumId ? { label: 'Album ID', value: detail.albumId } : { label: '', value: undefined },
    ].filter((f) => f.label && f.value) as Array<{ label: string; value?: string }>;

    /* ── Tabs ── */
    const tabs: DetailTab[] = [
        {
            id: 'overview',
            label: 'Overview',
            icon: FiGlobe,
            content: (
                <VStack align="stretch" gap={5}>
                    {detail.description && (
                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={1}>
                                Description
                            </Text>
                            <Text fontSize="xs" color="gray.700">
                                {detail.description}
                            </Text>
                        </Box>
                    )}
                    <MetaGrid fields={overviewFields} columns={3} />
                    {identifiers.length > 0 && (
                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={2}>
                                Identifiers
                            </Text>
                            <VStack align="stretch" gap={1.5}>
                                {identifiers.map((f) => (
                                    <HStack key={f.label} justify="space-between" gap={3}>
                                        <Text fontSize="10px" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">
                                            {f.label}
                                        </Text>
                                        <CopyableId value={f.value} label={f.label} />
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    )}
                    <Box>
                        <Text
                            fontSize="11px"
                            fontWeight="semibold"
                            color="gray.600"
                            mb={2}
                        >
                            Owner
                        </Text>
                        <Box
                            as="button"
                            onClick={() => navigate(`/admin/users/${item.ownerId}`)}
                            _hover={{ opacity: 0.8 }}
                            textAlign="left"
                        >
                            <IdentityCell
                                name={item.ownerName}
                                secondary={item.ownerRole}
                                avatarUrl={detail.ownerAvatarUrl}
                                size="sm"
                            />
                        </Box>
                    </Box>
                    {detail.featuredArtists?.length > 0 && (
                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={2}>
                                Featured artists
                            </Text>
                            <HStack gap={2} flexWrap="wrap">
                                {detail.featuredArtists.map((a) => (
                                    <Text
                                        key={a}
                                        fontSize="xs"
                                        bg="gray.100"
                                        color="gray.700"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                    >
                                        {a}
                                    </Text>
                                ))}
                            </HStack>
                        </Box>
                    )}
                </VStack>
            ),
        },
    ];

    if ((item.kind === 'album' || item.kind === 'playlist') && detail.tracks?.length > 0) {
        tabs.push({
            id: 'tracks',
            label: 'Tracks',
            icon: FiList,
            content: <TrackListTab tracks={detail.tracks} />,
        });
    }

    if (item.heldForDuplicateReview || detail.duplicateMatch) {
        tabs.push({
            id: 'duplicate',
            label: 'Duplicate Review',
            icon: FiAlertCircle,
            content: <DuplicateTab held={item.heldForDuplicateReview} match={detail.duplicateMatch} />,
        });
    }

    tabs.push({
        id: 'reports',
        label: `Reports${detail.openReportCount > 0 ? ` (${detail.openReportCount})` : ''}`,
        icon: FiShield,
        content: (
            <ReportsTab
                openReports={detail.openReportCount}
                totalReports={detail.reportCount}
                kind={item.kind}
                ownerRole={item.ownerRole}
            />
        ),
    });

    tabs.push({
        id: 'audit',
        label: 'Audit Trail',
        icon: FiBook,
        content: (
            <AuditTimeline
                entries={auditEntries.map((e) => ({
                    id: e.id,
                    action: e.action,
                    detail: e.summary,
                    actor: e.actorName,
                    timestamp: e.timestamp,
                }))}
                emptyText="No audit history recorded yet."
            />
        ),
    });

    /* ── Header actions ── */
    const headerActions = canManage ? (
        <HStack gap={2} flexWrap="wrap">
            {item.isPublished ? (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    disabled={actionPending}
                    onClick={() => unpublish.mutate({ kind: item.kind, id: item.id })}
                >
                    Unpublish
                </Button>
            ) : (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    bg="primary.500"
                    color="white"
                    _hover={{ bg: 'primary.600' }}
                    disabled={actionPending}
                    onClick={() => publish.mutate({ kind: item.kind, id: item.id })}
                >
                    Publish
                </Button>
            )}
            {item.status === 'Removed' ? (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    disabled={actionPending}
                    onClick={() => restore.mutate({ kind: item.kind, id: item.id })}
                >
                    Restore
                </Button>
            ) : (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    borderColor="#FECACA"
                    color="#C53030"
                    disabled={actionPending}
                    onClick={() => setModal({ type: 'remove', kind: item.kind, id: item.id })}
                >
                    Remove
                </Button>
            )}
            {item.isRestricted ? (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    disabled={actionPending}
                    onClick={() =>
                        setModal({ type: 'unrestrict', kind: item.kind, id: item.id })
                    }
                >
                    Unrestrict
                </Button>
            ) : (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    disabled={actionPending}
                    onClick={() =>
                        setModal({ type: 'restrict', kind: item.kind, id: item.id })
                    }
                >
                    Restrict
                </Button>
            )}
            {item.kind === 'track' && (
                <Button
                    size="sm"
                    fontSize="xs"
                    borderRadius="10px"
                    variant="outline"
                    disabled={actionPending}
                    onClick={() =>
                        setModal({ type: 'reschedule', kind: item.kind, id: item.id })
                    }
                >
                    <FiClock /> Reschedule
                </Button>
            )}
        </HStack>
    ) : undefined;

    const kindPath: Record<ContentKind, string> = {
        track: 'music',
        video: 'videos',
        album: 'albums',
        playlist: 'playlists',
    };

    return (
        <>
            <AdminPageLayout
                title={item.title || 'Content detail'}
                breadcrumbs={[
                    { label: 'Content', to: '/admin/content' },
                    {
                        label: kindLabel[item.kind] ?? item.kind,
                        to: `/admin/content/${kindPath[item.kind] ?? ''}`,
                    },
                    { label: item.title || 'Detail' },
                ]}
                actions={headerActions}
            >
                {/* Hero card */}
                <Box
                    bg="white"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="gray.100"
                    p={{ base: 4, md: 5 }}
                    shadow="xs"
                    mb={4}
                >
                    <HStack gap={4} align="flex-start">
                        <CoverThumb
                            src={item.coverArtUrl}
                            alt={item.title}
                            size={{ base: '64px', md: '80px' }}
                            radius="12px"
                            fallbackFontSize="28px"
                        />
                        <VStack align="start" gap={1} flex="1" minW={0}>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                fontWeight="bold"
                                color="gray.900"
                                fontFamily="Poppins"
                                lineClamp={2}
                            >
                                {item.title || 'Untitled'}
                            </Text>
                            <Text fontSize="sm" color="gray.500" lineClamp={1}>
                                {item.ownerName} · {item.releaseType ?? item.videoType ?? kindLabel[item.kind]}
                            </Text>
                            <HStack gap={2} flexWrap="wrap" mt={1}>
                                <StatusBadge
                                    status={item.isPublished ? 'Published' : item.status}
                                />
                                {item.isRestricted && (
                                    <StatusBadge style={toneStyle('warning', 'Restricted')} />
                                )}
                                {item.heldForDuplicateReview && (
                                    <StatusBadge style={toneStyle('warning', 'Duplicate review')} />
                                )}
                            </HStack>
                        </VStack>
                    </HStack>
                </Box>

                <DetailTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </AdminPageLayout>

            {modal && modal.type !== 'reschedule' && (
                <ConfirmActionModal
                    isOpen={true}
                    onClose={() => setModal(null)}
                    onConfirm={handleConfirm}
                    title={MODAL_COPY[modal.type].title}
                    message={MODAL_COPY[modal.type].message}
                    reasonLabel={MODAL_COPY[modal.type].reasonLabel}
                    confirmText={MODAL_COPY[modal.type].confirmText}
                    tone={MODAL_COPY[modal.type].tone}
                    isLoading={actionPending}
                />
            )}

            <RescheduleModal
                open={modal?.type === 'reschedule'}
                trackId={id}
                trackTitle={item.title}
                onClose={() => setModal(null)}
            />
        </>
    );
};

export default ContentItemDetailPage;
