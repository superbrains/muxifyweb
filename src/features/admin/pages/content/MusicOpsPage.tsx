import React from 'react';
import { FiMusic } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar, KpiStrip } from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { useContentStats } from '../../hooks/useContent';
import { CONTENT_PUBLISHED_OPTIONS, CONTENT_STATUS_OPTIONS, useContentItems } from './useContentItems';

const RELEASE_TYPE_OPTIONS = [
    { value: 'All', label: 'All releases' },
    { value: 'Single', label: 'Single' },
    { value: 'EP', label: 'EP' },
    { value: 'Album', label: 'Album' },
    { value: 'Compilation', label: 'Compilation' },
];

/** Music operations — tracks across Single/EP/Album/Compilation release types. */
const MusicOpsPage: React.FC = () => {
    const c = useContentItems({ kind: 'track' });
    const { data: stats } = useContentStats({ kind: 'track' });

    const kpis: KpiItem[] = stats
        ? [
              { label: 'Total tracks', value: stats.total },
              { label: 'Published', value: stats.published, tone: 'success' },
              { label: 'Restricted', value: stats.restricted, tone: 'warning' },
              { label: 'New (7d)', value: stats.newLast7Days, tone: 'info' },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Music"
            subtitle="Tracks across singles, EPs, albums and compilations"
            breadcrumbs={[{ label: 'Content' }, { label: 'Music' }]}
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
                        key: 'releaseType',
                        value: c.query.releaseType ?? 'All',
                        onChange: (v) =>
                            c.setQuery((q) => ({
                                ...q,
                                releaseType: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: RELEASE_TYPE_OPTIONS,
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
                ]}
            />

            {c.error ? (
                <AdminError error={c.error} message="Could not load tracks." />
            ) : (
                <DataTable
                    columns={c.columns}
                    rows={c.data?.items ?? []}
                    rowKey={(it) => it.id}
                    onRowClick={(it) => c.navigateToDetail(it)}
                    loading={c.isLoading && !c.data}
                    emptyIcon={FiMusic}
                    emptyTitle="No tracks found"
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

export default MusicOpsPage;
