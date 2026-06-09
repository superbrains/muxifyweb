import React from 'react';
import { Box, Button, HStack, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import { Select } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AuditTimeline,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    StatusBadge,
    AdminPageLayout,
} from '../../components/ui';
import type { ActionTone, AuditEntry, DataColumn } from '../../components/ui';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useDisputeTrack,
    useFreezeTrack,
    useResolveTrackDispute,
    useRoyaltyTrack,
    useRoyaltyTracks,
    useUnfreezeTrack,
    useUpdateSplits,
} from '../../hooks/useMonetization';
import {
    SPLIT_RECIPIENT_ROLE_OPTIONS,
    type RoyaltyRecipientDto,
    type RoyaltyTrackListItemDto,
    type RoyaltyTracksQuery,
} from '../../types/monetization';

const PAGE_SIZE = 20;

type ActionKind = 'freeze' | 'unfreeze' | 'dispute' | 'resolve';

const ACTION_META: Record<ActionKind, { title: string; confirm: string; tone: ActionTone }> = {
    freeze: { title: 'Freeze splits', confirm: 'Freeze', tone: 'warning' },
    unfreeze: { title: 'Unfreeze splits', confirm: 'Unfreeze', tone: 'primary' },
    dispute: { title: 'Raise split dispute', confirm: 'Raise dispute', tone: 'warning' },
    resolve: { title: 'Resolve split dispute', confirm: 'Resolve', tone: 'info' },
};

const FROZEN_OPTIONS = [
    { value: 'All', label: 'All tracks' },
    { value: 'true', label: 'Frozen only' },
    { value: 'false', label: 'Active only' },
];

/** Royalty splits — track list, an editable per-track recipient drawer with bps validation,
 * freeze/unfreeze/dispute/resolve actions and the split audit log. */
const RoyaltySplitsPage: React.FC = () => {
    const canManage = useHasPermission('RoyaltiesManage');
    const [query, setQuery] = React.useState<RoyaltyTracksQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useRoyaltyTracks(query);

    const columns: DataColumn<RoyaltyTrackListItemDto>[] = [
        {
            key: 'track',
            header: 'Track',
            render: (t) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                        {t.trackTitle}
                    </Text>
                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                        {t.artistName}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'recipients',
            header: 'Recipients',
            align: 'right',
            render: (t) => (
                <Text fontSize="xs" color="gray.700">
                    {t.recipientCount}
                </Text>
            ),
        },
        {
            key: 'frozen',
            header: 'Splits',
            render: (t) => <StatusBadge status={t.isFrozen ? 'Frozen' : 'Active'} />,
        },
        {
            key: 'dispute',
            header: 'Dispute',
            render: (t) =>
                t.disputeStatus && t.disputeStatus !== 'None' ? (
                    <StatusBadge status={t.disputeStatus} />
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        —
                    </Text>
                ),
        },
    ];

    return (
        <AdminPageLayout
            title="Royalty Splits"
            subtitle="Per-track recipient splits. Edit allocations, freeze splits and manage disputes."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Royalty Splits' }]}
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by track or artist',
                }}
                filters={[
                    {
                        key: 'frozen',
                        value:
                            query.frozen === undefined ? 'All' : query.frozen ? 'true' : 'false',
                        onChange: (v) =>
                            setQuery((q) => ({
                                ...q,
                                frozen: v === 'All' ? undefined : v === 'true',
                                page: 1,
                            })),
                        options: FROZEN_OPTIONS,
                        width: '150px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load royalty tracks." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(t) => t.trackId}
                    loading={isLoading && !data}
                    onRowClick={(t) => setSelectedId(t.trackId)}
                    emptyIcon={FiUsers}
                    emptyTitle="No tracks"
                    emptyDescription="No tracks match the current filters."
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

            <TrackSplitsDrawer
                trackId={selectedId}
                canManage={canManage}
                onClose={() => setSelectedId(null)}
            />
        </AdminPageLayout>
    );
};

export default RoyaltySplitsPage;

/* ------------------------------ Detail drawer ----------------------------- */

interface DraftRecipient {
    recipientUserId: string;
    role: string;
    percentBps: number;
}

const TrackSplitsDrawer: React.FC<{
    trackId: string | null;
    canManage: boolean;
    onClose: () => void;
}> = ({ trackId, canManage, onClose }) => {
    const toast = useChakraToast();
    const { data, isLoading, error } = useRoyaltyTrack(trackId);

    const updateSplits = useUpdateSplits();
    const freeze = useFreezeTrack();
    const unfreeze = useUnfreezeTrack();
    const dispute = useDisputeTrack();
    const resolve = useResolveTrackDispute();

    const [draft, setDraft] = React.useState<DraftRecipient[]>([]);
    const [reason, setReason] = React.useState('');
    const [action, setAction] = React.useState<ActionKind | null>(null);

    // Re-seed the editable draft whenever a fresh track loads.
    React.useEffect(() => {
        if (data) {
            setDraft(
                data.recipients.map((r) => ({
                    recipientUserId: r.recipientUserId,
                    role: r.role,
                    percentBps: r.percentBps,
                })),
            );
            setReason('');
        }
    }, [data]);

    const nameFor = (userId: string): string =>
        data?.recipients.find((r: RoyaltyRecipientDto) => r.recipientUserId === userId)?.recipientName ??
        userId;

    const totalBps = draft.reduce((sum, r) => sum + (Number.isFinite(r.percentBps) ? r.percentBps : 0), 0);
    const sumsTo10000 = totalBps === 10000;
    const allHaveIds = draft.every((r) => r.recipientUserId.trim().length > 0);

    const updateRow = (i: number, patch: Partial<DraftRecipient>) =>
        setDraft((d) => d.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

    const removeRow = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));
    const addRow = () =>
        setDraft((d) => [...d, { recipientUserId: '', role: 'Artist', percentBps: 0 }]);

    const saveSplits = () => {
        if (!trackId) return;
        if (!sumsTo10000) {
            toast.error('Invalid splits', `Percentages must sum to 100% (10000 bps). Current: ${totalBps}.`);
            return;
        }
        if (!allHaveIds) {
            toast.error('Missing recipient', 'Every row needs a recipient user ID.');
            return;
        }
        updateSplits.mutate(
            {
                trackId,
                payload: {
                    recipients: draft.map((r) => ({
                        recipientUserId: r.recipientUserId.trim(),
                        role: r.role,
                        percentBps: r.percentBps,
                    })),
                    reason: reason.trim() || undefined,
                },
            },
            { onSuccess: () => toast.success('Splits saved') },
        );
    };

    const runAction = (capturedReason: string) => {
        if (!trackId || !action) return;
        const payload = { trackId, payload: { reason: capturedReason } };
        const done = () => setAction(null);
        if (action === 'freeze') freeze.mutate(payload, { onSuccess: done });
        else if (action === 'unfreeze') unfreeze.mutate(payload, { onSuccess: done });
        else if (action === 'dispute') dispute.mutate(payload, { onSuccess: done });
        else if (action === 'resolve') resolve.mutate(payload, { onSuccess: done });
    };

    const actionPending =
        freeze.isPending || unfreeze.isPending || dispute.isPending || resolve.isPending;

    const auditEntries: AuditEntry[] = (data?.audit ?? []).map((a) => ({
        id: a.id,
        action: a.action,
        actor: a.actorUserId,
        timestamp: a.createdAt,
        detail: a.reason,
    }));

    const isDisputed = data?.disputeStatus && data.disputeStatus !== 'None';
    const isResolvable = data?.disputeStatus === 'UnderReview';

    return (
        <DetailDrawer
            open={trackId !== null}
            onClose={onClose}
            title={data?.trackTitle ?? 'Track splits'}
            subtitle={data?.artistName ?? undefined}
            size="lg"
            footer={
                canManage && data ? (
                    <HStack gap={2} justify="flex-end" w="100%" flexWrap="wrap">
                        {data.isFrozen ? (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                onClick={() => setAction('unfreeze')}
                            >
                                Unfreeze
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                onClick={() => setAction('freeze')}
                            >
                                Freeze
                            </Button>
                        )}
                        {isResolvable ? (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                onClick={() => setAction('resolve')}
                            >
                                Resolve dispute
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                fontSize="xs"
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                borderRadius="10px"
                                onClick={() => setAction('dispute')}
                            >
                                Raise dispute
                            </Button>
                        )}
                        <Button
                            size="sm"
                            fontSize="xs"
                            bg="primary.500"
                            color="white"
                            borderRadius="10px"
                            _hover={{ bg: '#E61E45' }}
                            loading={updateSplits.isPending}
                            disabled={data.isFrozen || !sumsTo10000}
                            onClick={saveSplits}
                        >
                            Save splits
                        </Button>
                    </HStack>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load this track." />
            ) : isLoading || !data ? (
                <AdminLoading />
            ) : (
                <VStack align="stretch" gap={5}>
                    <HStack gap={2} flexWrap="wrap">
                        <StatusBadge status={data.isFrozen ? 'Frozen' : 'Active'} />
                        {isDisputed && <StatusBadge status={data.disputeStatus} />}
                    </HStack>

                    {data.freezeReason && (
                        <Text fontSize="11px" color="gray.600">
                            Frozen: {data.freezeReason}
                        </Text>
                    )}
                    {data.disputeReason && (
                        <Text fontSize="11px" color="gray.600">
                            Dispute: {data.disputeReason}
                        </Text>
                    )}

                    <Box>
                        <HStack justify="space-between" mb={2}>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                Recipients
                            </Text>
                            <Text
                                fontSize="11px"
                                fontWeight="semibold"
                                color={sumsTo10000 ? '#16A34A' : '#E53E3E'}
                            >
                                {(totalBps / 100).toFixed(2)}% ({totalBps} bps)
                            </Text>
                        </HStack>

                        <VStack align="stretch" gap={2}>
                            {draft.map((r, i) => (
                                <HStack key={i} gap={2} align="center">
                                    <Input
                                        value={r.recipientUserId}
                                        onChange={(e) => updateRow(i, { recipientUserId: e.target.value })}
                                        size="sm"
                                        fontSize="11px"
                                        placeholder="Recipient user ID"
                                        flex="1"
                                        disabled={!canManage || data.isFrozen}
                                        title={nameFor(r.recipientUserId)}
                                    />
                                    <Box w="140px">
                                        <Select
                                            options={SPLIT_RECIPIENT_ROLE_OPTIONS}
                                            value={r.role}
                                            onChange={(v) => updateRow(i, { role: v as string })}
                                            width="140px"
                                            disabled={!canManage || data.isFrozen}
                                        />
                                    </Box>
                                    <Input
                                        type="number"
                                        value={String(r.percentBps)}
                                        onChange={(e) =>
                                            updateRow(i, { percentBps: parseInt(e.target.value, 10) || 0 })
                                        }
                                        size="sm"
                                        fontSize="11px"
                                        w="90px"
                                        textAlign="right"
                                        placeholder="bps"
                                        disabled={!canManage || data.isFrozen}
                                    />
                                    {canManage && !data.isFrozen && (
                                        <IconButton
                                            aria-label="Remove recipient"
                                            size="sm"
                                            variant="ghost"
                                            color="gray.400"
                                            _hover={{ color: '#E53E3E' }}
                                            onClick={() => removeRow(i)}
                                        >
                                            <FiTrash2 />
                                        </IconButton>
                                    )}
                                </HStack>
                            ))}
                        </VStack>

                        {canManage && !data.isFrozen && (
                            <Button
                                size="xs"
                                fontSize="11px"
                                variant="ghost"
                                color="primary.500"
                                mt={2}
                                onClick={addRow}
                            >
                                <FiPlus /> Add recipient
                            </Button>
                        )}

                        {canManage && !data.isFrozen && (
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                size="sm"
                                fontSize="11px"
                                mt={3}
                                placeholder="Reason for change (recorded in the audit log)"
                            />
                        )}
                    </Box>

                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={2}>
                            Audit log
                        </Text>
                        <AuditTimeline entries={auditEntries} />
                    </Box>
                </VStack>
            )}

            {action && (
                <ConfirmActionModal
                    isOpen
                    onClose={() => setAction(null)}
                    onConfirm={runAction}
                    title={ACTION_META[action].title}
                    confirmText={ACTION_META[action].confirm}
                    tone={ACTION_META[action].tone}
                    isLoading={actionPending}
                />
            )}
        </DetailDrawer>
    );
};
