import React from 'react';
import { AdminPageLayout } from '../../components/ui';
import { DuplicateMatchesView } from './DuplicateMatchesView';

/** Duplicate detection — every audio/video match across all tiers and statuses. */
const DuplicateDetectionPage: React.FC = () => (
    <AdminPageLayout
        title="Duplicate Detection"
        subtitle="Audio and video fingerprint matches flagged by the detection engine"
        breadcrumbs={[{ label: 'Content' }, { label: 'Duplicate Detection' }]}
    >
        <DuplicateMatchesView baseQuery={{}} showStats />
    </AdminPageLayout>
);

export default DuplicateDetectionPage;
