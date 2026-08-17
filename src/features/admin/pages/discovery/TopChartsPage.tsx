import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '@shared/console';
import { useTopCharts } from '../../hooks/useDiscovery';
import { DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { useTrendingFamilyFilters } from './useTrendingFamilyFilters';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** Top Charts — mirrors the mobile Top Charts lane (music or video) with curation overrides overlaid. */
const TopChartsPage: React.FC = () => {
    const c = useDiscoveryItems('TopCharts');
    const { data, isLoading, error } = useTopCharts(c.query);
    const filters = useTrendingFamilyFilters(c, {
        period: { options: DISCOVERY_PERIOD_OPTIONS },
    });

    return (
        <AdminPageLayout
            title="Top Charts"
            subtitle="Exactly what the mobile Top Charts lane shows for the chosen vertical & creator category. Curate with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Top Charts' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiBarChart2}
                emptyTitle="No chart entries"
                emptyDescription="Nothing matches the current vertical / category / period filters."
                errorMessage="Could not load chart positions."
                filterBar={<FilterBar filters={filters} />}
            />
        </AdminPageLayout>
    );
};

export default TopChartsPage;
