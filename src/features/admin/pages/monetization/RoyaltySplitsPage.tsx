import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Input,
    Portal,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiEdit2, FiLayers, FiPlus, FiTrash2, FiUserPlus, FiUsers } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { Select } from '@shared/components';
import { ConfirmModal } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AuditTimeline,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    KpiStrip,
    StatusBadge,
    AdminPageLayout,
    IdentityCell,
} from '@shared/console';
import type { ActionTone, AuditEntry, DataColumn, KpiItem } from '@shared/console';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useAddContributor,
    useApplyTemplate,
    useCreateTemplate,
    useDeleteTemplate,
    useDisputeTrack,
    useEditContributor,
    useFreezeTrack,
    useRemoveContributor,
    useResolveTrackDispute,
    useRoyaltyTrack,
    useRoyaltyTracks,
    useSplitTemplates,
    useUnfreezeTrack,
    useUpdateSplits,
    useUpdateTemplate,
} from '../../hooks/useMonetization';
import { formatCount } from '@shared/console/lib/format';
import {
    SPLIT_RECIPIENT_ROLE_OPTIONS,
    type RoyaltyRecipientDto,
    type RoyaltyTrackListItemDto,
    type RoyaltyTracksQuery,
    type SplitTemplateDto,
} from '../../types/monetization';

const ACCENT = '#f94444';
const PAGE_SIZE = 20;

const CONTRIBUTOR_ROLE_OPTIONS = [
    { value: 'Producer', label: 'Producer' },
    { value: 'Songwriter', label: 'Songwriter' },
];

const FROZEN_OPTIONS = [
    { value: 'All', label: 'All tracks' },
    { value: 'true', label: 'Frozen only' },
    { value: 'false', label: 'Active only' },
];

type ActionKind = 'freeze' | 'unfreeze' | 'dispute' | 'resolve';

const ACTION_META: Record<ActionKind, { title: string; confirm: string; tone: ActionTone }> = {
    freeze: { title: 'Freeze splits', confirm: 'Freeze', tone: 'warning' },
    unfreeze: { title: 'Unfreeze splits', confirm: 'Unfreeze', tone: 'primary' },
    dispute: { title: 'Raise split dispute', confirm: 'Raise dispute', tone: 'warning' },
    resolve: { title: 'Resolve split dispute', confirm: 'Resolve', tone: 'info' },
};

const bpsPct = (bps: number) => `${(bps / 100).toFixed(2)}%`;

/** Royalty splits — track governance, per-track recipient editing, contributor
 * management (add / adjust / remove) and reusable split templates. */
const RoyaltySplitsPage: React.FC = () => {
    const canManage = useHasPermission('RoyaltiesManage');
    const canManageContributors = useHasPermission('ContributorsManage');
    const [query, setQuery] = React.useState<RoyaltyTracksQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useRoyaltyTracks(query);

    // Cheap aggregate counts for the KPI band (independent of the active filter).
    const frozenCount = useRoyaltyTracks({ frozen: true, page: 1, pageSize: 1 });
    const templates = useSplitTemplates();

    const kpis: KpiItem[] = [
        { label: 'Tracks with splits', value: formatCount(data?.total), tone: 'info' },
        { label: 'Frozen', value: formatCount(frozenCount.data?.total), tone: 'warning' },
        { label: 'Templates', value: formatCount(templates.data?.length) },
    ];

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
            subtitle="Per-track recipient splits, contributor management and reusable split templates."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Royalty Splits' }]}
        >
            <KpiStrip items={kpis} columns={{ base: 3, md: 3, xl: 3 }} />

            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by track or artist',
                }}
                filters={[
                    {
                        key: 'frozen',
                        value: query.frozen === undefined ? 'All' : query.frozen ? 'true' : 'false',
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

            <TemplatesCard canManage={canManage} />

            <TrackSplitsDrawer
                trackId={selectedId}
                canManage={canManage}
                canManageContributors={canManageContributors}
                templates={templates.data ?? []}
                onClose={() => setSelectedId(null)}
            />
        </AdminPageLayout>
    );
};

export default RoyaltySplitsPage;

/* ===================================================================== */
/* Track detail drawer                                                    */
/* ===================================================================== */

interface DraftRecipient {
    recipientUserId: string;
    role: string;
    percentBps: number;
}

const TrackSplitsDrawer: React.FC<{
    trackId: string | null;
    canManage: boolean;
    canManageContributors: boolean;
    templates: SplitTemplateDto[];
    onClose: () => void;
}> = ({ trackId, canManage, canManageContributors, templates, onClose }) => {
    const toast = useChakraToast();
    const { data, isLoading, error } = useRoyaltyTrack(trackId);

    const updateSplits = useUpdateSplits();
    const freeze = useFreezeTrack();
    const unfreeze = useUnfreezeTrack();
    const dispute = useDisputeTrack();
    const resolve = useResolveTrackDispute();
    const addContributor = useAddContributor();
    const editContributor = useEditContributor();
    const removeContributor = useRemoveContributor();
    const applyTemplate = useApplyTemplate();

    const [draft, setDraft] = React.useState<DraftRecipient[]>([]);
    const [reason, setReason] = React.useState('');
    const [action, setAction] = React.useState<ActionKind | null>(null);
    const [advanced, setAdvanced] = React.useState(false);
    const [showAdd, setShowAdd] = React.useState(false);
    const [adjusting, setAdjusting] = React.useState<RoyaltyRecipientDto | null>(null);
    const [removing, setRemoving] = React.useState<RoyaltyRecipientDto | null>(null);
    const [templateId, setTemplateId] = React.useState('');

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
            setAdvanced(false);
            setTemplateId('');
        }
    }, [data]);

    const totalBps = draft.reduce((sum, r) => sum + (Number.isFinite(r.percentBps) ? r.percentBps : 0), 0);
    const sumsTo10000 = totalBps === 10000;
    const allHaveIds = draft.every((r) => r.recipientUserId.trim().length > 0);

    const updateRow = (i: number, patch: Partial<DraftRecipient>) =>
        setDraft((d) => d.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    const removeRow = (i: number) => setDraft((d) => d.filter((_, idx) => idx !== i));
    const addRow = () => setDraft((d) => [...d, { recipientUserId: '', role: 'Artist', percentBps: 0 }]);

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
            { onSuccess: () => { toast.success('Splits saved'); setAdvanced(false); } },
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

    const actionPending = freeze.isPending || unfreeze.isPending || dispute.isPending || resolve.isPending;

    const auditEntries: AuditEntry[] = (data?.audit ?? []).map((a) => ({
        id: a.id,
        action: a.action,
        actor: a.actorUserId,
        timestamp: a.createdAt,
        detail: a.reason,
    }));

    const isDisputed = data?.disputeStatus && data.disputeStatus !== 'None';
    const isResolvable = data?.disputeStatus === 'UnderReview';
    const frozen = data?.isFrozen ?? false;

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
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setAction(frozen ? 'unfreeze' : 'freeze')}
                        >
                            {frozen ? 'Unfreeze' : 'Freeze'}
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setAction(isResolvable ? 'resolve' : 'dispute')}
                        >
                            {isResolvable ? 'Resolve dispute' : 'Raise dispute'}
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
                        <StatusBadge status={frozen ? 'Frozen' : 'Active'} />
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

                    {/* Recipients (display + quick contributor actions) */}
                    <Box>
                        <HStack justify="space-between" mb={2}>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                Recipients
                            </Text>
                            {canManageContributors && !frozen && (
                                <Button
                                    size="xs"
                                    fontSize="11px"
                                    variant="ghost"
                                    color={ACCENT}
                                    onClick={() => setShowAdd(true)}
                                >
                                    <FiUserPlus /> Add contributor
                                </Button>
                            )}
                        </HStack>

                        <VStack align="stretch" gap={1.5}>
                            {data.recipients.map((r) => (
                                <HStack
                                    key={r.recipientUserId}
                                    justify="space-between"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    borderRadius="lg"
                                    px={3}
                                    py={2}
                                >
                                    <HStack gap={2} minW={0}>
                                        <IdentityCell name={r.recipientName} secondary={r.role} />
                                    </HStack>
                                    <HStack gap={3}>
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                            {bpsPct(r.percentBps)}
                                        </Text>
                                        {canManageContributors && !frozen && r.role !== 'Artist' && (
                                            <HStack gap={1}>
                                                <IconButton
                                                    aria-label="Adjust share"
                                                    size="xs"
                                                    variant="ghost"
                                                    color="gray.400"
                                                    _hover={{ color: ACCENT }}
                                                    onClick={() => setAdjusting(r)}
                                                >
                                                    <FiEdit2 />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Remove contributor"
                                                    size="xs"
                                                    variant="ghost"
                                                    color="gray.400"
                                                    _hover={{ color: '#E53E3E' }}
                                                    onClick={() => setRemoving(r)}
                                                >
                                                    <FiTrash2 />
                                                </IconButton>
                                            </HStack>
                                        )}
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>

                        {/* Apply template */}
                        {canManage && !frozen && templates.length > 0 && (
                            <HStack gap={2} mt={3}>
                                <Box flex="1">
                                    <Select
                                        options={[
                                            { value: '', label: 'Apply a template…' },
                                            ...templates.map((t) => ({ value: t.id, label: t.name })),
                                        ]}
                                        value={templateId}
                                        onChange={(v) => setTemplateId(v as string)}
                                        width="100%"
                                    />
                                </Box>
                                <Button
                                    size="sm"
                                    fontSize="xs"
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    borderRadius="10px"
                                    disabled={!templateId || applyTemplate.isPending}
                                    loading={applyTemplate.isPending}
                                    onClick={() =>
                                        trackId &&
                                        applyTemplate.mutate(
                                            { trackId, payload: { templateId } },
                                            { onSuccess: () => setTemplateId('') },
                                        )
                                    }
                                >
                                    Apply
                                </Button>
                            </HStack>
                        )}
                    </Box>

                    {/* Advanced: full split editor (rebalance everything) */}
                    {canManage && (
                        <Box>
                            <HStack
                                justify="space-between"
                                as="button"
                                w="100%"
                                onClick={() => setAdvanced((v) => !v)}
                                py={1}
                            >
                                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                    Advanced: edit all splits
                                </Text>
                                <Text fontSize="11px" color={ACCENT}>
                                    {advanced ? 'Hide' : 'Show'}
                                </Text>
                            </HStack>

                            {advanced && (
                                <VStack align="stretch" gap={2} mt={2}>
                                    <HStack justify="space-between">
                                        <Text fontSize="10px" color="gray.400">
                                            Edit the full set — must total 100%.
                                        </Text>
                                        <Text
                                            fontSize="11px"
                                            fontWeight="semibold"
                                            color={sumsTo10000 ? '#16A34A' : '#E53E3E'}
                                        >
                                            {(totalBps / 100).toFixed(2)}% ({totalBps} bps)
                                        </Text>
                                    </HStack>
                                    {draft.map((r, i) => (
                                        <HStack key={i} gap={2} align="center">
                                            <Input
                                                value={r.recipientUserId}
                                                onChange={(e) => updateRow(i, { recipientUserId: e.target.value })}
                                                size="sm"
                                                fontSize="11px"
                                                placeholder="Recipient user ID"
                                                flex="1"
                                                disabled={frozen}
                                            />
                                            <Box w="140px">
                                                <Select
                                                    options={SPLIT_RECIPIENT_ROLE_OPTIONS}
                                                    value={r.role}
                                                    onChange={(v) => updateRow(i, { role: v as string })}
                                                    width="140px"
                                                    disabled={frozen}
                                                />
                                            </Box>
                                            <Input
                                                type="number"
                                                value={String(r.percentBps)}
                                                onChange={(e) => updateRow(i, { percentBps: parseInt(e.target.value, 10) || 0 })}
                                                size="sm"
                                                fontSize="11px"
                                                w="90px"
                                                textAlign="right"
                                                placeholder="bps"
                                                disabled={frozen}
                                            />
                                            {!frozen && (
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
                                    {!frozen && (
                                        <Button size="xs" fontSize="11px" variant="ghost" color={ACCENT} alignSelf="flex-start" onClick={addRow}>
                                            <FiPlus /> Add recipient
                                        </Button>
                                    )}
                                    {!frozen && (
                                        <Input
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            size="sm"
                                            fontSize="11px"
                                            placeholder="Reason for change (recorded in the audit log)"
                                        />
                                    )}
                                    <Button
                                        size="sm"
                                        fontSize="xs"
                                        bg={ACCENT}
                                        color="white"
                                        borderRadius="10px"
                                        alignSelf="flex-start"
                                        _hover={{ bg: '#e53939' }}
                                        loading={updateSplits.isPending}
                                        disabled={frozen || !sumsTo10000}
                                        onClick={saveSplits}
                                    >
                                        Save all splits
                                    </Button>
                                </VStack>
                            )}
                        </Box>
                    )}

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
                    requireReason={action === 'freeze' || action === 'dispute'}
                    isLoading={actionPending}
                />
            )}

            {showAdd && trackId && (
                <AddContributorDialog
                    trackId={trackId}
                    onClose={() => setShowAdd(false)}
                    addContributor={addContributor}
                />
            )}

            {adjusting && trackId && (
                <AdjustContributorDialog
                    trackId={trackId}
                    recipient={adjusting}
                    onClose={() => setAdjusting(null)}
                    editContributor={editContributor}
                />
            )}

            <ConfirmModal
                isOpen={removing !== null}
                onClose={() => setRemoving(null)}
                onConfirm={() =>
                    trackId &&
                    removing &&
                    removeContributor.mutate(
                        { trackId, contributorUserId: removing.recipientUserId },
                        { onSuccess: () => setRemoving(null) },
                    )
                }
                title="Remove contributor?"
                message={`${removing?.recipientName ?? 'This contributor'}'s ${removing ? bpsPct(removing.percentBps) : ''} share will be re-merged into the artist split.`}
                confirmText="Remove"
                confirmColor="red"
                isLoading={removeContributor.isPending}
            />
        </DetailDrawer>
    );
};

/* ===================================================================== */
/* Dialogs                                                                */
/* ===================================================================== */

const DialogShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
    title,
    onClose,
    children,
}) => (
    <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
        <Portal>
            <Dialog.Backdrop bg="blackAlpha.500" />
            <Dialog.Positioner>
                <Dialog.Content maxW="480px" p={6} borderRadius="20px" position="relative">
                    <IconButton aria-label="Close" variant="ghost" size="sm" color="gray.500" position="absolute" right={3} top={3} onClick={onClose}>
                        <Icon as={MdClose} />
                    </IconButton>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins" mb={4}>
                        {title}
                    </Text>
                    {children}
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.Root>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
        {hint && (
            <Text fontSize="10px" color="gray.400" mt={1}>
                {hint}
            </Text>
        )}
    </Box>
);

const DialogFooter: React.FC<{ onClose: () => void; onConfirm: () => void; disabled: boolean; loading: boolean; confirmText?: string }> = ({
    onClose,
    onConfirm,
    disabled,
    loading,
    confirmText = 'Save',
}) => (
    <HStack gap={3} justify="flex-end" pt={1}>
        <Button onClick={onClose} variant="outline" borderColor="gray.300" color="gray.700" size="sm" fontSize="xs" borderRadius="10px" disabled={loading}>
            Cancel
        </Button>
        <Button
            onClick={onConfirm}
            bg={ACCENT}
            color="white"
            size="sm"
            fontSize="xs"
            borderRadius="10px"
            disabled={disabled || loading}
            _hover={{ bg: '#e53939' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
            {loading ? <Spinner size="xs" color="white" /> : confirmText}
        </Button>
    </HStack>
);

const AddContributorDialog: React.FC<{
    trackId: string;
    onClose: () => void;
    addContributor: ReturnType<typeof useAddContributor>;
}> = ({ trackId, onClose, addContributor }) => {
    const [email, setEmail] = React.useState('');
    const [displayName, setDisplayName] = React.useState('');
    const [role, setRole] = React.useState('Producer');
    const [bps, setBps] = React.useState('500');

    const bpsNum = Number(bps) || 0;
    const valid = email.includes('@') && displayName.trim().length > 0 && bpsNum > 0 && bpsNum < 10000;

    return (
        <DialogShell title="Add contributor" onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <Field label="Invitee email" hint="They'll receive a claim link to set up payouts.">
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} size="sm" placeholder="producer@example.com" />
                </Field>
                <Field label="Display name">
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} size="sm" />
                </Field>
                <SimpleGrid columns={2} gap={3}>
                    <Field label="Role">
                        <Select options={CONTRIBUTOR_ROLE_OPTIONS} value={role} onChange={(v) => setRole(v as string)} width="100%" />
                    </Field>
                    <Field label="Share (bps)" hint={`${bpsPct(bpsNum)} · carved from artist`}>
                        <Input type="number" value={bps} onChange={(e) => setBps(e.target.value)} size="sm" />
                    </Field>
                </SimpleGrid>
                <DialogFooter
                    onClose={onClose}
                    onConfirm={() =>
                        addContributor.mutate(
                            { trackId, inviteeEmail: email.trim(), displayName: displayName.trim(), recipientRole: role, percentBps: bpsNum },
                            { onSuccess: onClose },
                        )
                    }
                    disabled={!valid}
                    loading={addContributor.isPending}
                    confirmText="Add & invite"
                />
            </VStack>
        </DialogShell>
    );
};

const AdjustContributorDialog: React.FC<{
    trackId: string;
    recipient: RoyaltyRecipientDto;
    onClose: () => void;
    editContributor: ReturnType<typeof useEditContributor>;
}> = ({ trackId, recipient, onClose, editContributor }) => {
    const [bps, setBps] = React.useState(String(recipient.percentBps));
    const bpsNum = Number(bps) || 0;
    const valid = bpsNum > 0 && bpsNum < 10000;

    return (
        <DialogShell title={`Adjust ${recipient.recipientName}`} onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <Field label="New share (bps)" hint={`${bpsPct(bpsNum)} · the artist split absorbs the difference`}>
                    <Input type="number" value={bps} onChange={(e) => setBps(e.target.value)} size="sm" />
                </Field>
                <DialogFooter
                    onClose={onClose}
                    onConfirm={() =>
                        editContributor.mutate(
                            { trackId, contributorUserId: recipient.recipientUserId, percentBps: bpsNum },
                            { onSuccess: onClose },
                        )
                    }
                    disabled={!valid}
                    loading={editContributor.isPending}
                />
            </VStack>
        </DialogShell>
    );
};

/* ===================================================================== */
/* Templates management card                                              */
/* ===================================================================== */

interface TemplateDraftRecipient {
    recipientUserId: string;
    role: string;
    percentBps: number;
}

const TemplatesCard: React.FC<{ canManage: boolean }> = ({ canManage }) => {
    const { data, isLoading, error } = useSplitTemplates();
    const del = useDeleteTemplate();
    const [editing, setEditing] = React.useState<SplitTemplateDto | null>(null);
    const [creating, setCreating] = React.useState(false);
    const [toDelete, setToDelete] = React.useState<SplitTemplateDto | null>(null);

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
            <HStack justify="space-between" mb={4}>
                <HStack gap={2}>
                    <Icon as={FiLayers} color={ACCENT} />
                    <Text fontSize="xs" fontWeight="semibold" color="gray.800" fontFamily="Poppins">
                        Split templates
                    </Text>
                </HStack>
                {canManage && (
                    <Button size="xs" fontSize="11px" bg={ACCENT} color="white" borderRadius="999px" _hover={{ bg: '#e53939' }} onClick={() => setCreating(true)}>
                        <FiPlus /> New template
                    </Button>
                )}
            </HStack>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message="Could not load templates." />
            ) : (data?.length ?? 0) === 0 ? (
                <Text fontSize="xs" color="gray.400" py={6} textAlign="center">
                    No saved templates. Create a reusable split layout to apply across tracks.
                </Text>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    {data!.map((t) => (
                        <Box key={t.id} border="1px solid" borderColor="gray.100" borderRadius="lg" p={3}>
                            <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                    {t.name}
                                </Text>
                                {canManage && (
                                    <HStack gap={2}>
                                        <Text as="button" fontSize="11px" color={ACCENT} onClick={() => setEditing(t)} _hover={{ textDecoration: 'underline' }}>
                                            Edit
                                        </Text>
                                        <Text as="button" fontSize="11px" color="#C53030" onClick={() => setToDelete(t)} _hover={{ textDecoration: 'underline' }}>
                                            Delete
                                        </Text>
                                    </HStack>
                                )}
                            </HStack>
                            {t.description && (
                                <Text fontSize="10px" color="gray.500" mb={2}>
                                    {t.description}
                                </Text>
                            )}
                            <VStack align="stretch" gap={0.5}>
                                {t.recipients.map((r, i) => (
                                    <HStack key={i} justify="space-between">
                                        <Text fontSize="10px" color="gray.600">
                                            {r.role}
                                        </Text>
                                        <Text fontSize="10px" color="gray.500">
                                            {bpsPct(r.percentBps)}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            {(creating || editing) && (
                <TemplateDialog template={editing} onClose={() => { setCreating(false); setEditing(null); }} />
            )}

            <ConfirmModal
                isOpen={toDelete !== null}
                onClose={() => setToDelete(null)}
                onConfirm={() => toDelete && del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
                title="Delete template?"
                message={`"${toDelete?.name}" will be removed. Tracks it was applied to keep their splits.`}
                confirmText="Delete"
                confirmColor="red"
                isLoading={del.isPending}
            />
        </Box>
    );
};

const TemplateDialog: React.FC<{ template: SplitTemplateDto | null; onClose: () => void }> = ({ template, onClose }) => {
    const create = useCreateTemplate();
    const update = useUpdateTemplate();
    const isEdit = template !== null;

    const [name, setName] = React.useState(template?.name ?? '');
    const [description, setDescription] = React.useState(template?.description ?? '');
    const [rows, setRows] = React.useState<TemplateDraftRecipient[]>(
        template?.recipients.map((r) => ({ ...r })) ?? [
            { recipientUserId: '', role: 'Artist', percentBps: 10000 },
        ],
    );

    const total = rows.reduce((s, r) => s + (Number.isFinite(r.percentBps) ? r.percentBps : 0), 0);
    const valid =
        name.trim().length > 0 &&
        total === 10000 &&
        rows.every((r) => r.recipientUserId.trim().length > 0);
    const pending = create.isPending || update.isPending;

    const patch = (i: number, p: Partial<TemplateDraftRecipient>) =>
        setRows((d) => d.map((r, idx) => (idx === i ? { ...r, ...p } : r)));

    const submit = () => {
        const payload = {
            name: name.trim(),
            description: description.trim() || null,
            recipients: rows.map((r) => ({ recipientUserId: r.recipientUserId.trim(), role: r.role, percentBps: r.percentBps })),
        };
        const opts = { onSuccess: onClose };
        if (isEdit && template) update.mutate({ id: template.id, payload }, opts);
        else create.mutate(payload, opts);
    };

    return (
        <DialogShell title={isEdit ? 'Edit template' : 'New split template'} onClose={onClose}>
            <VStack align="stretch" gap={3}>
                <Field label="Name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} size="sm" placeholder="e.g. Standard label 70/30" />
                </Field>
                <Field label="Description (optional)">
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} size="sm" />
                </Field>
                <Box>
                    <HStack justify="space-between" mb={1.5}>
                        <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                            Recipients
                        </Text>
                        <Text fontSize="11px" fontWeight="semibold" color={total === 10000 ? '#16A34A' : '#E53E3E'}>
                            {(total / 100).toFixed(2)}%
                        </Text>
                    </HStack>
                    <VStack align="stretch" gap={2}>
                        {rows.map((r, i) => (
                            <HStack key={i} gap={2}>
                                <Input
                                    value={r.recipientUserId}
                                    onChange={(e) => patch(i, { recipientUserId: e.target.value })}
                                    size="sm"
                                    fontSize="11px"
                                    placeholder="Recipient user ID"
                                    flex="1"
                                />
                                <Box w="130px">
                                    <Select options={SPLIT_RECIPIENT_ROLE_OPTIONS} value={r.role} onChange={(v) => patch(i, { role: v as string })} width="130px" />
                                </Box>
                                <Input
                                    type="number"
                                    value={String(r.percentBps)}
                                    onChange={(e) => patch(i, { percentBps: parseInt(e.target.value, 10) || 0 })}
                                    size="sm"
                                    fontSize="11px"
                                    w="80px"
                                    textAlign="right"
                                />
                                <IconButton
                                    aria-label="Remove row"
                                    size="sm"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ color: '#E53E3E' }}
                                    onClick={() => setRows((d) => d.filter((_, idx) => idx !== i))}
                                >
                                    <FiTrash2 />
                                </IconButton>
                            </HStack>
                        ))}
                    </VStack>
                    <Button
                        size="xs"
                        fontSize="11px"
                        variant="ghost"
                        color={ACCENT}
                        mt={2}
                        onClick={() => setRows((d) => [...d, { recipientUserId: '', role: 'Producer', percentBps: 0 }])}
                    >
                        <FiPlus /> Add recipient
                    </Button>
                </Box>
                <DialogFooter onClose={onClose} onConfirm={submit} disabled={!valid} loading={pending} />
            </VStack>
        </DialogShell>
    );
};
