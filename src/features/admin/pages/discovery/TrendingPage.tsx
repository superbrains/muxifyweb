import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '../../components/ui';
import { useTrending } from '../../hooks/useDiscovery';
import { DISCOVERY_CONTENT_TYPE_OPTIONS, DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** Trending content — the cross-vertical ranked trending list with curation overrides. */
const TrendingPage: React.FC = () => {
    const c = useDiscoveryItems('Trending');
    const { data, isLoading, error } = useTrending(c.query);

    return (
        <AdminPageLayout
            title="Trending"
            subtitle="Cross-vertical trending ranking. Pin, boost, suppress or exclude items to curate the surface."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Trending' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiTrendingUp}
                emptyTitle="No trending items"
                emptyDescription="Nothing matches the current period / content filters."
                errorMessage="Could not load trending items."
                filterBar={
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
                }
            />
        </AdminPageLayout>
    );
};

export default TrendingPage;
