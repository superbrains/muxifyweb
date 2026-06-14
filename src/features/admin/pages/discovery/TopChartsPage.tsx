import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { AdminPageLayout, FilterBar } from '../../components/ui';
import { useTopCharts } from '../../hooks/useDiscovery';
import { DISCOVERY_CONTENT_TYPE_OPTIONS, DISCOVERY_PERIOD_OPTIONS } from '../../types/discovery';
import { useDiscoveryItems } from './useDiscoveryItems';
import { TrendingSurfaceView } from './TrendingSurfaceView';

/** Top charts — the ranked chart positions per content type, with curation overrides. */
const TopChartsPage: React.FC = () => {
    const c = useDiscoveryItems('TopCharts');
    const { data, isLoading, error } = useTopCharts(c.query);

    return (
        <AdminPageLayout
            title="Top Charts"
            subtitle="The official chart positions. Curate placement with pin / boost / suppress / exclude."
            breadcrumbs={[{ label: 'Discovery' }, { label: 'Top Charts' }]}
        >
            <TrendingSurfaceView
                controller={c}
                data={data}
                isLoading={isLoading}
                error={error}
                emptyIcon={FiBarChart2}
                emptyTitle="No chart entries"
                emptyDescription="Nothing matches the current period / content filters."
                errorMessage="Could not load chart positions."
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

export default TopChartsPage;
