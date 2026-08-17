import React from 'react';
import { FiZap } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '@shared/console';
import { useHotReleases } from '../../hooks/useDiscovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { useTrendingFamilyFilters } from './useTrendingFamilyFilters';
import { GenreFilterInput } from './GenreFilterInput';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** Hot Releases — mirrors the mobile Hot Releases lane (recently published, ranked by plays/views). */
const HotReleasesPage: React.FC = () => {
    const c = useDiscoveryItems('HotReleases');
    const { data, isLoading, error } = useHotReleases(c.query);
    const filters = useTrendingFamilyFilters(c);

    return (
        <AdminPageLayout
            title="Hot Releases"
            subtitle="Exactly what the mobile Hot Releases lane shows for the chosen vertical & creator category. Curate with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Hot Releases' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiZap}
                emptyTitle="No hot releases"
                emptyDescription="Nothing matches the current vertical / category filters."
                errorMessage="Could not load hot releases."
                filterBar={<FilterBar filters={filters} right={<GenreFilterInput controller={c} />} />}
            />
        </AdminPageLayout>
    );
};

export default HotReleasesPage;
