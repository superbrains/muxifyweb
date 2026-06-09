import React from 'react';
import { FiZap } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { useHotReleases } from '../../hooks/useDiscovery';
import { DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import type { AdminTrendingItemDto } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { DiscoveryActionModal } from './DiscoveryActionModal';
import { CurateActions } from './discoveryShared';

/** Hot releases — recent releases gaining momentum, with curation overrides. */
const HotReleasesPage: React.FC = () => {
    const c = useDiscoveryItems('HotReleases');
    const { data, isLoading, error } = useHotReleases({
        period: c.query.period,
        page: c.query.page,
        pageSize: c.query.pageSize,
    });

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
            title="Hot Releases"
            subtitle="Fresh releases gaining momentum. Curate the surface with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Hot Releases' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'period',
                        value: c.query.period,
                        onChange: (v) => c.setQuery((q) => ({ ...q, period: v, page: 1 })),
                        options: DISCOVERY_PERIOD_OPTIONS,
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load hot releases." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(it) => `${it.contentType}-${it.contentId}`}
                    loading={isLoading && !data}
                    emptyIcon={FiZap}
                    emptyTitle="No hot releases"
                    emptyDescription="Nothing matches the current period."
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

export default HotReleasesPage;
