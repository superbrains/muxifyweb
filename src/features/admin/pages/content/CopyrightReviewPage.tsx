import React from 'react';
import { AdminPageLayout } from '../../components/ui';
import { DuplicateMatchesView } from './DuplicateMatchesView';

const COPYRIGHT_TIER_OPTIONS = [
    { value: 'High', label: 'High tier' },
    { value: 'Exact', label: 'Exact tier' },
];

const DISPUTED_OPTIONS = [
    { value: 'All', label: 'All matches' },
    { value: 'true', label: 'Disputed only' },
];

/**
 * Copyright review — the same duplicate-match data narrowed to High/Exact-tier
 * matches with a disputed-only toggle. Confirm/dismiss is gated by
 * CopyrightReview (enforced inside DuplicateMatchesView).
 */
const CopyrightReviewPage: React.FC = () => (
    <AdminPageLayout
        title="Copyright Review"
        subtitle="High-confidence and disputed matches awaiting a copyright decision"
        breadcrumbs={[{ label: 'Content' }, { label: 'Copyright Review' }]}
    >
        <DuplicateMatchesView
            baseQuery={{ tier: 'High' }}
            hideTierFilter
            leadingFilters={(query, setQuery) => [
                {
                    key: 'tier',
                    value: query.tier ?? 'High',
                    onChange: (v) => setQuery((q) => ({ ...q, tier: v, page: 1 })),
                    options: COPYRIGHT_TIER_OPTIONS,
                    width: '150px',
                },
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

export default CopyrightReviewPage;
