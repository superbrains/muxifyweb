import React from 'react';
import { FiClock } from 'react-icons/fi';
import { Input } from '@chakra-ui/react';
import { AdminError, AdminPageLayout, DataTable, FilterBar } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { useNewReleases } from '../../hooks/useDiscovery';
import type { AdminTrendingItemDto } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { DiscoveryActionModal } from './DiscoveryActionModal';
import { CurateActions } from './discoveryShared';

/** New releases — the freshly-published feed, optionally filtered by genre, with curation overrides. */
const NewReleasesPage: React.FC = () => {
    const c = useDiscoveryItems('NewReleases');
    const { data, isLoading, error } = useNewReleases({
        genreId: c.query.genreId,
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
            title="New Releases"
            subtitle="The freshly-published feed. Optionally narrow by genre, then curate with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'New Releases' }]}
        >
            <FilterBar
                right={
                    <Input
                        size="sm"
                        fontSize="xs"
                        maxW="220px"
                        placeholder="Filter by genre ID"
                        value={c.query.genreId ?? ''}
                        onChange={(e) =>
                            c.setQuery((q) => ({ ...q, genreId: e.target.value || undefined, page: 1 }))
                        }
                    />
                }
            />

            {error ? (
                <AdminError error={error} message="Could not load new releases." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(it) => `${it.contentType}-${it.contentId}`}
                    loading={isLoading && !data}
                    emptyIcon={FiClock}
                    emptyTitle="No new releases"
                    emptyDescription="Nothing matches the current genre filter."
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

export default NewReleasesPage;
