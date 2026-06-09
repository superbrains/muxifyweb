import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { useTopCharts } from '../../hooks/useDiscovery';
import { DISCOVERY_CONTENT_TYPE_OPTIONS, DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import type { AdminTrendingItemDto } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { DiscoveryActionModal } from './DiscoveryActionModal';
import { CurateActions } from './discoveryShared';

/** Top charts — the ranked chart positions per content type, with curation overrides. */
const TopChartsPage: React.FC = () => {
    const c = useDiscoveryItems('TopCharts');
    const { data, isLoading, error } = useTopCharts(c.query);

    const columns: DataColumn<AdminTrendingItemDto>[] = c.canManage
        ? [
              ...c.columns,
              {
                  key: 'actions',
                  header: '',
                  align: 'right',
                  render: (it) => (
                      <CurateActions onAction={(action) => c.setActionTarget({ item: it, action })} />
                  ),
              },
          ]
        : c.columns;

    return (
        <AdminPageLayout
            title="Top Charts"
            subtitle="The official chart positions. Curate placement with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Top Charts' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'period',
                        value: c.query.period,
                        onChange: (v) => c.setQuery((q) => ({ ...q, period: v, page: 1 })),
                        options: DISCOVERY_PERIOD_OPTIONS,
                    },
                    {
                        key: 'contentType',
                        value: c.query.contentType ?? 'All',
                        onChange: (v) =>
                            c.setQuery((q) => ({
                                ...q,
                                contentType: v === 'All' ? undefined : v,
                                page: 1,
                            })),
                        options: DISCOVERY_CONTENT_TYPE_OPTIONS,
                        width: '170px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load chart positions." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(it) => `${it.contentType}-${it.contentId}`}
                    loading={isLoading && !data}
                    emptyIcon={FiBarChart2}
                    emptyTitle="No chart entries"
                    emptyDescription="Nothing matches the current period / content filters."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => c.setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            <DiscoveryActionModal controller={c} />
        </AdminPageLayout>
    );
};

export default TopChartsPage;
