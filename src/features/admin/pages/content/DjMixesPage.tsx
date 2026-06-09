import React from 'react';
import { FiDisc } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

/** DJ mixes — tracks with releaseType = Mix. */
const DjMixesPage: React.FC = () => (
    <ContentVerticalPage
        title="DJ Mixes"
        subtitle="Long-form DJ mixes published as Mix releases"
        breadcrumbLabel="DJ Mixes"
        baseQuery={{ kind: 'track', releaseType: 'Mix' }}
        emptyIcon={FiDisc}
        emptyNoun="mixes"
    />
);

export default DjMixesPage;
