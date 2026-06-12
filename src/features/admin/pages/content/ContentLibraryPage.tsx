import React from 'react';
import { FiMusic } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar, KpiStrip } from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { useContentStats } from '../../hooks/useContent';
import {
    CONTENT_OWNER_ROLE_OPTIONS,
    CONTENT_PUBLISHED_OPTIONS,
    CONTENT_STATUS_OPTIONS,
    useContentItems,
} from './useContentItems';

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

    const kpis: KpiItem[] = stats
        ? [
              { label: 'Total', value: stats.total },
              { label: 'Published', value: stats.published, tone: 'success' },
              { label: 'Restricted', value: stats.restricted, tone: 'warning' },
              { label: 'New (7d)', value: stats.newLast7Days, tone: 'info' },
          ]
        : [];

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
                ]}
            />

            {c.error ? (
                <AdminError error={c.error} message="Could not load the content library." />
            ) : (
                <DataTable
                    columns={c.columns}
                    rows={c.data?.items ?? []}
                    rowKey={(it) => `${it.kind}-${it.id}`}
                    onRowClick={(it) => c.navigateToDetail(it)}
                    loading={c.isLoading && !c.data}
                    emptyIcon={FiMusic}
                    emptyTitle="No content found"
                    emptyDescription="Nothing matches the current filters."
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

        </AdminPageLayout>
    );
};

export default ContentLibraryPage;
