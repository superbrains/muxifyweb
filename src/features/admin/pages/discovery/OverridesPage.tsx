import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { FiSliders } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    CopyableId,
    DataTable,
    FilterBar,
    KpiStrip,
    StatusBadge,
    toneStyle,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { adminDate } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useDeleteOverride,
    useOverrides,
    useSetOverrideActive,
    useUpdateOverride,
} from '../../hooks/useDiscovery';
import type {
    AdminCurationOverrideDto,
    CurationAction,
    UpsertCurationOverrideRequest,
} from '../../types/discovery';
import { CurationOverrideModal } from './CurationOverrideModal';
import type { CurationOverrideDraft } from './CurationOverrideModal';
import { LinkBtn } from './discoveryShared';
import { CURATION_TONE } from './discoveryUtils';

const SURFACE_OPTIONS = [
    { value: 'All', label: 'All surfaces' },
    { value: 'Trending', label: 'Trending' },
    { value: 'TopCharts', label: 'Top Charts' },
    { value: 'HotReleases', label: 'Hot Releases' },
    { value: 'NewReleases', label: 'New Releases' },
    { value: 'MostGifted', label: 'Most Gifted' },
    { value: 'TopGivers', label: 'Top Givers' },
    { value: 'HomeFeed', label: 'Home Feed' },
];

const STATE_OPTIONS = [
    { value: 'all', label: 'All states' },
    { value: 'active', label: 'Active only' },
];

/**
 * Curation Overrides manager — the single place to see and manage every
 * pin/boost/suppress/exclude across all discovery surfaces (previously these
 * were write-only: created on a surface then invisible). Filter by surface and
 * state; edit weight/rank/schedule; activate/deactivate; delete.
 */
const OverridesPage: React.FC = () => {
    const canManage = useHasPermission('DiscoveryManage');
    const [surface, setSurface] = React.useState('All');
    const [state, setState] = React.useState('all');

    const { data, isLoading, error } = useOverrides({
        surface: surface === 'All' ? undefined : surface,
        activeOnly: state === 'active' ? true : undefined,
    });

    const setActive = useSetOverrideActive();
    const update = useUpdateOverride();
    const del = useDeleteOverride();

    const [editing, setEditing] = React.useState<AdminCurationOverrideDto | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<AdminCurationOverrideDto | null>(null);

    const rows = data ?? [];
    const kpis: KpiItem[] = [
        { label: 'Overrides', value: rows.length, tone: 'info' },
        { label: 'Active', value: rows.filter((o) => o.isActive).length, tone: 'success' },
        { label: 'Live now', value: rows.filter((o) => o.isCurrentlyActive).length, tone: 'warning' },
        {
            label: 'Scheduled',
            value: rows.filter((o) => o.startDate && new Date(o.startDate).getTime() > Date.now()).length,
            tone: 'neutral',
        },
    ];

    const columns: DataColumn<AdminCurationOverrideDto>[] = [
        {
            key: 'surface',
            header: 'Surface',
            render: (o) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {o.surface}
                </Text>
            ),
        },
        {
            key: 'content',
            header: 'Content',
            render: (o) => (
                <VStack align="start" gap={0.5} minW={0}>
                    <Text fontSize="11px" color="gray.500" textTransform="capitalize">
                        {o.contentType}
                    </Text>
                    <CopyableId value={o.contentId} label="Content ID" truncate={14} />
                </VStack>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            render: (o) => <StatusBadge style={toneStyle(CURATION_TONE[o.action] ?? 'info', o.action)} />,
        },
        {
            key: 'params',
            header: 'Weight / Rank',
            align: 'center',
            render: (o) => (
                <Text fontSize="xs" color="gray.600">
                    {o.weight != null ? `w${o.weight}` : o.pinnedRank != null ? `#${o.pinnedRank}` : '—'}
                </Text>
            ),
        },
        {
            key: 'schedule',
            header: 'Schedule',
            render: (o) =>
                o.startDate || o.endDate ? (
                    <Text fontSize="11px" color="gray.600">
                        {o.startDate ? adminDate(o.startDate) : '—'} → {o.endDate ? adminDate(o.endDate) : '∞'}
                    </Text>
                ) : (
                    <Text fontSize="11px" color="gray.400">
                        Always
                    </Text>
                ),
        },
        {
            key: 'state',
            header: 'State',
            render: (o) => (
                <StatusBadge
                    status={o.isCurrentlyActive ? 'Active' : o.isActive ? 'Scheduled' : 'Inactive'}
                />
            ),
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (o) => (
                <Text fontSize="11px" color="gray.600" lineClamp={2} maxW="240px">
                    {o.reason}
                </Text>
            ),
        },
        {
            key: 'created',
            header: 'Created',
            render: (o) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(o.createdAt)}
                </Text>
            ),
        },
    ];

    if (canManage) {
        columns.push({
            key: 'actions',
            header: '',
            align: 'right',
            render: (o) => (
                <HStack gap={3} justify="flex-end">
                    <LinkBtn onClick={() => setEditing(o)}>Edit</LinkBtn>
                    <LinkBtn
                        color={o.isActive ? 'gray.500' : '#16A34A'}
                        onClick={() => setActive.mutate({ id: o.id, active: !o.isActive })}
                    >
                        {o.isActive ? 'Deactivate' : 'Activate'}
                    </LinkBtn>
                    <LinkBtn color="#E53E3E" onClick={() => setDeleteTarget(o)}>
                        Delete
                    </LinkBtn>
                </HStack>
            ),
        });
    }

    const submitEdit = (draft: CurationOverrideDraft) => {
        if (!editing) return;
        const payload: UpsertCurationOverrideRequest = {
            surface: editing.surface,
            contentType: editing.contentType,
            contentId: editing.contentId,
            action: draft.action,
            weight: draft.weight,
            pinnedRank: draft.pinnedRank,
            reason: draft.reason,
            startDate: draft.startDate,
            endDate: draft.endDate,
            isActive: editing.isActive,
        };
        update.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    };

    return (
        <AdminPageLayout
            title="Curation Overrides"
            subtitle="Every pin, boost, suppression and exclusion across the discovery surfaces, in one place."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Overrides' }]}
        >
            <VStack align="stretch" gap={4}>
                <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                <FilterBar
                    filters={[
                        { key: 'surface', value: surface, onChange: setSurface, options: SURFACE_OPTIONS, width: '180px' },
                        { key: 'state', value: state, onChange: setState, options: STATE_OPTIONS, width: '150px' },
                    ]}
                />

                {error ? (
                    <AdminError error={error} message="Could not load curation overrides." />
                ) : (
                    <DataTable
                        columns={columns}
                        rows={rows}
                        rowKey={(o) => o.id}
                        loading={isLoading && !data}
                        emptyIcon={FiSliders}
                        emptyTitle="No curation overrides"
                        emptyDescription="Pin, boost, suppress or exclude content from any discovery surface to see it here."
                    />
                )}
            </VStack>

            {editing && (
                <CurationOverrideModal
                    open
                    onClose={() => setEditing(null)}
                    action={editing.action as CurationAction}
                    actionEditable
                    title="Edit override"
                    contextLabel={`${editing.surface} · ${editing.contentType}`}
                    initial={{
                        action: editing.action as CurationAction,
                        weight: editing.weight,
                        pinnedRank: editing.pinnedRank,
                        startDate: editing.startDate,
                        endDate: editing.endDate,
                        reason: editing.reason,
                    }}
                    confirmText="Save changes"
                    loading={update.isPending}
                    onConfirm={submitEdit}
                />
            )}

            <ConfirmActionModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() =>
                    deleteTarget &&
                    del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
                }
                title="Delete curation override"
                message={`Remove this ${deleteTarget?.action ?? ''} override on ${deleteTarget?.surface ?? ''}? The item will rank organically again.`}
                requireReason={false}
                confirmText="Delete"
                tone="danger"
                isLoading={del.isPending}
            />
        </AdminPageLayout>
    );
};

export default OverridesPage;
