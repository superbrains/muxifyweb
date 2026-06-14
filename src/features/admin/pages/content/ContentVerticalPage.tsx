import React from 'react';
import type { IconType } from 'react-icons';
import { FiCheckCircle, FiSlash, FiTrash2, FiXCircle } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    BulkActionBar,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    KpiStrip,
} from '../../components/ui';
import type { Breadcrumb, BulkAction, KpiItem, SelectFilter } from '../../components/ui';
import { useContentStats } from '../../hooks/useContent';
import {
    CONTENT_PUBLISHED_OPTIONS,
    CONTENT_SORT_OPTIONS,
    CONTENT_STATUS_OPTIONS,
    useContentItems,
} from './useContentItems';
import type { BulkActionKind } from './useContentItems';
import type { ContentItemQuery } from '../../types/content';

interface ContentVerticalPageProps {
    title: string;
    subtitle: string;
    breadcrumbLabel: string;
    /** Fixed filters that pin this vertical (kind/releaseType/ownerRole/videoType). */
    baseQuery: Partial<ContentItemQuery>;
    emptyIcon: IconType;
    emptyNoun: string;
    /** Extra select filters rendered before the standard status/published pair. */
    leadingFilters?: (c: ReturnType<typeof useContentItems>) => SelectFilter[];
    /** KPI strip query params (mirrors baseQuery structure). */
    statsQuery?: Parameters<typeof useContentStats>[0];
}

/**
 * Shared body for the simple content verticals (DJ mixes, videos, albums,
 * singles, podcasts) — search + status + published filters, the standard
 * table, the row→detail drawer and the reason-capture action modal. Each
 * vertical stays a thin distinct page file that configures this via `baseQuery`
 * and optional `leadingFilters`; the full-filter Library and the form-bearing
 * pages compose the kit directly instead.
 */
export const ContentVerticalPage: React.FC<ContentVerticalPageProps> = ({
    title,
    subtitle,
    breadcrumbLabel,
    baseQuery,
    emptyIcon,
    emptyNoun,
    leadingFilters,
    statsQuery,
}) => {
    const c = useContentItems(baseQuery);
    const { data: stats } = useContentStats(statsQuery);
    const breadcrumbs: Breadcrumb[] = [{ label: 'Content' }, { label: breadcrumbLabel }];
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

    const statusFilters: SelectFilter[] = [
        {
            key: 'status',
            value: c.query.status ?? 'All',
            onChange: (v) => c.setQuery((q) => ({ ...q, status: v === 'All' ? undefined : v, page: 1 })),
            options: CONTENT_STATUS_OPTIONS,
        },
        {
            key: 'published',
            value: c.query.published === undefined ? 'All' : String(c.query.published),
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
            key: 'sort',
            value: c.query.sort ?? 'newest',
            onChange: (v) => c.setQuery((q) => ({ ...q, sort: v, page: 1 })),
            options: CONTENT_SORT_OPTIONS,
            width: '150px',
        },
    ];

    const bulkActions: BulkAction[] = [
        { label: 'Publish', icon: FiCheckCircle, tone: 'primary', onClick: () => c.runBulk('publish') },
        { label: 'Unpublish', icon: FiXCircle, onClick: () => c.runBulk('unpublish') },
        { label: 'Restrict', icon: FiSlash, onClick: () => setBulkReason('restrict') },
        { label: 'Remove', icon: FiTrash2, tone: 'danger', onClick: () => setBulkReason('remove') },
    ];

    return (
        <AdminPageLayout title={title} subtitle={subtitle} breadcrumbs={breadcrumbs}>
            {kpis.length > 0 && <KpiStrip items={kpis} />}
            <FilterBar
                search={{
                    value: c.query.search ?? '',
                    onChange: (v) => c.setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by title',
                }}
                filters={[...(leadingFilters?.(c) ?? []), ...statusFilters]}
            />

            {c.error ? (
                <AdminError error={c.error} message={`Could not load ${emptyNoun}.`} />
            ) : (
                <DataTable
                    columns={c.columns}
                    rows={c.data?.items ?? []}
                    rowKey={(it) => it.id}
                    onRowClick={(it) => c.navigateToDetail(it)}
                    loading={c.isLoading && !c.data}
                    emptyIcon={emptyIcon}
                    emptyTitle={`No ${emptyNoun} found`}
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
                    noun={emptyNoun.replace(/s$/, '')}
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
                        ? `Remove ${c.selectedKeys.size} ${emptyNoun}`
                        : `Restrict ${c.selectedKeys.size} ${emptyNoun}`
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
