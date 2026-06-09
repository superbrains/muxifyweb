import React from 'react';
import type { IconType } from 'react-icons';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    FilterBar,
} from '../../components/ui';
import type { Breadcrumb, SelectFilter } from '../../components/ui';
import { ContentActionModal } from './ContentActionModal';
import { ContentDetailDrawer } from './ContentDetailDrawer';
import {
    CONTENT_PUBLISHED_OPTIONS,
    CONTENT_STATUS_OPTIONS,
    useContentItems,
} from './useContentItems';
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
}) => {
    const c = useContentItems(baseQuery);
    const breadcrumbs: Breadcrumb[] = [{ label: 'Content' }, { label: breadcrumbLabel }];

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
    ];

    return (
        <AdminPageLayout title={title} subtitle={subtitle} breadcrumbs={breadcrumbs}>
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
                    onRowClick={(it) => c.setSelected(it)}
                    loading={c.isLoading && !c.data}
                    emptyIcon={emptyIcon}
                    emptyTitle={`No ${emptyNoun} found`}
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
