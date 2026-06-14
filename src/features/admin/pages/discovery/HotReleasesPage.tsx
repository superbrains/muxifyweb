import React from 'react';
import { FiZap } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '../../components/ui';
import { useHotReleases } from '../../hooks/useDiscovery';
import { DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** Hot releases — recent releases gaining momentum, with curation overrides. */
const HotReleasesPage: React.FC = () => {
    const c = useDiscoveryItems('HotReleases');
    const { data, isLoading, error } = useHotReleases({
        period: c.query.period,
        page: c.query.page,
        pageSize: c.query.pageSize,
    });

    return (
        <AdminPageLayout
            title="Hot Releases"
            subtitle="Fresh releases gaining momentum. Curate the surface with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Hot Releases' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiZap}
                emptyTitle="No hot releases"
                emptyDescription="Nothing matches the current period."
                errorMessage="Could not load hot releases."
                filterBar={
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
                }
            />
        </AdminPageLayout>
    );
};

export default HotReleasesPage;
