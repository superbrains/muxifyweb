import React from 'react';
import { FiClock } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '@shared/console';
import { useNewReleases } from '../../hooks/useDiscovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { useTrendingFamilyFilters } from './useTrendingFamilyFilters';
import { GenreFilterInput } from './GenreFilterInput';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** New Releases — mirrors the mobile New Releases lane (freshly published, last N days). */
const NewReleasesPage: React.FC = () => {
    const c = useDiscoveryItems('NewReleases');
    const { data, isLoading, error } = useNewReleases(c.query);
    const filters = useTrendingFamilyFilters(c);

    return (
        <AdminPageLayout
            title="New Releases"
            subtitle="Exactly what the mobile New Releases lane shows for the chosen vertical & creator category. Curate with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'New Releases' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiClock}
                emptyTitle="No new releases"
                emptyDescription="Nothing matches the current vertical / category / genre filters."
                errorMessage="Could not load new releases."
                filterBar={<FilterBar filters={filters} right={<GenreFilterInput controller={c} />} />}
            />
        </AdminPageLayout>
    );
};

export default NewReleasesPage;
