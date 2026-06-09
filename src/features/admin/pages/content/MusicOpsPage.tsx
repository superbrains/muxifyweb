import React from 'react';
import { FiMusic } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar } from '../../components/ui';
import { ContentActionModal } from './ContentActionModal';
import { ContentDetailDrawer } from './ContentDetailDrawer';
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

    return (
        <AdminPageLayout
            title="Music"
            subtitle="Tracks across singles, EPs, albums and compilations"
            breadcrumbs={[{ label: 'Content' }, { label: 'Music' }]}
        >
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
                    onRowClick={(it) => c.setSelected(it)}
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

            <ContentDetailDrawer selected={c.selected} controller={c} />
            <ContentActionModal controller={c} />
        </AdminPageLayout>
    );
};

export default MusicOpsPage;
