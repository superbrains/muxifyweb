import React from 'react';
import { FiClock } from 'react-icons/fi';
import { Input } from '@chakra-ui/react';
import { AdminPageLayout, FilterBar } from '../../components/ui';
import { useNewReleases } from '../../hooks/useDiscovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** New releases — the freshly-published feed, optionally filtered by genre, with curation overrides. */
const NewReleasesPage: React.FC = () => {
    const c = useDiscoveryItems('NewReleases');
    const { data, isLoading, error } = useNewReleases({
        genreId: c.query.genreId,
        page: c.query.page,
        pageSize: c.query.pageSize,
    });

    return (
        <AdminPageLayout
            title="New Releases"
            subtitle="The freshly-published feed. Optionally narrow by genre, then curate with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'New Releases' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiClock}
                emptyTitle="No new releases"
                emptyDescription="Nothing matches the current genre filter."
                errorMessage="Could not load new releases."
                filterBar={
                    <FilterBar
                        right={
                            <Input
                                size="sm"
                                fontSize="xs"
                                maxW="220px"
                                placeholder="Filter by genre ID"
                                value={c.query.genreId ?? ''}
                                onChange={(e) =>
                                    c.setQuery((q) => ({
                                        ...q,
                                        genreId: e.target.value || undefined,
                                        page: 1,
                                    }))
                                }
                            />
                        }
                    />
                }
            />
        </AdminPageLayout>
    );
};

export default NewReleasesPage;
