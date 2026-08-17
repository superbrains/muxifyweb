import React from 'react';
import { FiCheckCircle, FiMusic, FiSlash, FiTrash2, FiXCircle } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    BulkActionBar,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    KpiStrip,
} from '@shared/console';
import type { BulkAction, KpiItem } from '@shared/console';
import { useContentStats } from '../../hooks/useContent';
import {
    CONTENT_OWNER_ROLE_OPTIONS,
    CONTENT_PUBLISHED_OPTIONS,
    CONTENT_SORT_OPTIONS,
    CONTENT_STATUS_OPTIONS,
    useContentItems,
} from './useContentItems';
import type { BulkActionKind } from './useContentItems';

const KIND_OPTIONS = [
    { value: 'All', label: 'All kinds' },
    { value: 'track', label: 'Tracks' },
    { value: 'video', label: 'Videos' },
    { value: 'album', label: 'Albums' },
    { value: 'playlist', label: 'Playlists' },
];

/** Unified content library across every kind — Tower 5/6/7 entry point. */
const ContentLibraryPage: React.FC = () => {
    const c = useContentItems({});
    const { data: stats } = useContentStats();
    const [bulkReason, setBulkReason] = React.useState<BulkActionKind | null>(null);

    const kpis: KpiItem[] = stats
        ? [
              { label: 'Total', value: stats.total },
              { label: 'Published', value: stats.published, tone: 'success' },
              { label: 'Restricted', value: stats.restricted, tone: 'warning' },
              { label: 'Held for review', value: stats.heldForReview, tone: 'warning' },
              { label: 'Failed', value: stats.failed, tone: 'danger' },
              { label: 'New (7d)', value: stats.newLast7Days, tone: 'info' },
          ]
        : [];

    const bulkActions: BulkAction[] = [
        { label: 'Publish', icon: FiCheckCircle, tone: 'primary', onClick: () => c.runBulk('publish') },
        { label: 'Unpublish', icon: FiXCircle, onClick: () => c.runBulk('unpublish') },
        { label: 'Restrict', icon: FiSlash, onClick: () => setBulkReason('restrict') },
        { label: 'Remove', icon: FiTrash2, tone: 'danger', onClick: () => setBulkReason('remove') },
    ];

    return (
        <AdminPageLayout
            title="Content Library"
            subtitle="Every track, video, album and playlist on the platform"
            breadcrumbs={[{ label: 'Content' }, { label: 'Content Library' }]}
        >
            {kpis.length > 0 && <KpiStrip items={kpis} />}
            <FilterBar
                search={{
                    value: c.query.search ?? '',
                    onChange: (v) => c.setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by title',
                }}
                filters={[
                    {
                        key: 'kind',
                        value: c.query.kind ?? 'All',
                        onChange: (v) =>
                            c.setQuery((q) => ({
                                ...q,
                                kind: v === 'All' ? undefined : (v as typeof q.kind),
                                page: 1,
                            })),
                        options: KIND_OPTIONS,
                    },
                    {
                        key: 'status',
                        value: c.query.status ?? 'All',
                        onChange: (v) =>
                            c.setQuery((q) => ({ ...q, status: v === 'All' ? undefined : v, page: 1 })),
                        options: CONTENT_STATUS_OPTIONS,
                    },
                    {
                        key: 'published',
                        value:
                            c.query.published === undefined ? 'All' : String(c.query.published),
                        onChange: (v) =>
                            c.setQuery((q) => ({
                                ...q,
                                published: v === 'All' ? undefined : v === 'true',
                                page: 1,
                            })),
                        options: CONTENT_PUBLISHED_OPTIONS,
                        width: '160px',
                    },
                    {
                        key: 'ownerRole',
                        value: c.query.ownerRole ?? 'All',
                        onChange: (v) =>
                            c.setQuery((q) => ({
                                ...q,
                                ownerRole: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: CONTENT_OWNER_ROLE_OPTIONS,
                        width: '150px',
                    },
                    {
                        key: 'sort',
                        value: c.query.sort ?? 'newest',
                        onChange: (v) => c.setQuery((q) => ({ ...q, sort: v, page: 1 })),
                        options: CONTENT_SORT_OPTIONS,
                        width: '150px',
                    },
                ]}
            />

            {c.error ? (
                <AdminError error={c.error} message="Could not load the content library." />
            ) : (
                <DataTable
                    columns={c.columns}
                    rows={c.data?.items ?? []}
                    rowKey={(it) => it.id}
                    onRowClick={(it) => c.navigateToDetail(it)}
                    loading={c.isLoading && !c.data}
                    emptyIcon={FiMusic}
                    emptyTitle="No content found"
                    emptyDescription="Nothing matches the current filters."
                    selectable={c.canManage}
                    selectedKeys={c.selectedKeys}
                    onToggleRow={c.toggleRow}
                    onToggleAll={c.toggleAll}
                    pagination={
                        c.data
                            ? {
                                  page: c.data.page,
                                  pageSize: c.data.pageSize,
                                  total: c.data.total,
                                  onPageChange: (page) => c.setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            {c.canManage && (
                <BulkActionBar
                    count={c.selectedKeys.size}
                    actions={bulkActions}
                    onClear={c.clearSelection}
                    busy={c.bulkBusy}
                    noun="item"
                />
            )}

            <ConfirmActionModal
                isOpen={bulkReason !== null}
                onClose={() => setBulkReason(null)}
                onConfirm={(reason) => {
                    if (bulkReason) c.runBulk(bulkReason, reason);
                    setBulkReason(null);
                }}
                title={
                    bulkReason === 'remove'
                        ? `Remove ${c.selectedKeys.size} items`
                        : `Restrict ${c.selectedKeys.size} items`
                }
                message={
                    bulkReason === 'remove'
                        ? 'The selected content will be taken down. This is recorded in the audit log.'
                        : 'The selected content will be limited until the restriction is lifted.'
                }
                reasonLabel={bulkReason === 'remove' ? 'Removal reason' : 'Restriction reason'}
                confirmText={bulkReason === 'remove' ? 'Remove' : 'Restrict'}
                tone={bulkReason === 'remove' ? 'danger' : 'warning'}
                isLoading={c.bulkBusy}
            />
        </AdminPageLayout>
    );
};

export default ContentLibraryPage;
