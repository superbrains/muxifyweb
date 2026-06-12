import React from 'react';
import { FiMusic } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

/** Singles operations — tracks with releaseType = Single. */
const SinglesOpsPage: React.FC = () => (
    <ContentVerticalPage
        title="Singles"
        subtitle="Standalone single releases"
        breadcrumbLabel="Singles"
        baseQuery={{ kind: 'track', releaseType: 'Single' }}
        statsQuery={{ kind: 'track', releaseType: 'Single' }}
        emptyIcon={FiMusic}
        emptyNoun="singles"
    />
);

export default SinglesOpsPage;
