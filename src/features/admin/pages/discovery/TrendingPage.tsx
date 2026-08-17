import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '@shared/console';
import { useTrending } from '../../hooks/useDiscovery';
import { DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { useTrendingFamilyFilters } from './useTrendingFamilyFilters';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** Trending — mirrors the mobile Trending lane (music or video) with curation overrides overlaid. */
const TrendingPage: React.FC = () => {
    const c = useDiscoveryItems('Trending');
    const { data, isLoading, error } = useTrending(c.query);
    const filters = useTrendingFamilyFilters(c, {
        period: { options: DISCOVERY_PERIOD_OPTIONS },
    });

    return (
        <AdminPageLayout
            title="Trending"
            subtitle="Exactly what the mobile Trending lane shows for the chosen vertical & creator category. Pin, boost, suppress or exclude to curate."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Trending' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiTrendingUp}
                emptyTitle="No trending items"
                emptyDescription="Nothing matches the current vertical / category / period filters."
                errorMessage="Could not load trending items."
                filterBar={<FilterBar filters={filters} />}
            />
        </AdminPageLayout>
    );
};

export default TrendingPage;
