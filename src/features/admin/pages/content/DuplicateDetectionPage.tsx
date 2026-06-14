import React from 'react';
import { AdminPageLayout } from '../../components/ui';
import { DuplicateMatchesView } from './DuplicateMatchesView';

const DISPUTED_OPTIONS = [
    { value: 'All', label: 'All matches' },
    { value: 'true', label: 'Disputed only' },
];

/** Duplicate detection — every audio/video match across all tiers and statuses. */
const DuplicateDetectionPage: React.FC = () => (
    <AdminPageLayout
        title="Duplicate Detection"
        subtitle="Audio and video fingerprint matches flagged by the detection engine"
        breadcrumbs={[{ label: 'Content' }, { label: 'Duplicate Detection' }]}
    >
        <DuplicateMatchesView
            baseQuery={{}}
            showStats
            leadingFilters={(query, setQuery) => [
                {
                    key: 'disputedOnly',
                    value: query.disputedOnly ? 'true' : 'All',
                    onChange: (v) =>
                        setQuery((q) => ({
                            ...q,
                            disputedOnly: v === 'true' ? true : undefined,
                            page: 1,
                        })),
                    options: DISPUTED_OPTIONS,
                    width: '150px',
                },
            ]}
        />
    </AdminPageLayout>
);

export default DuplicateDetectionPage;
