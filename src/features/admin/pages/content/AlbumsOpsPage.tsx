import React from 'react';
import { FiDisc } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

/** Album operations — every album release. */
const AlbumsOpsPage: React.FC = () => (
    <ContentVerticalPage
        title="Albums"
        subtitle="Full album releases and their publication state"
        breadcrumbLabel="Albums"
        baseQuery={{ kind: 'album' }}
        statsQuery={{ kind: 'album' }}
        emptyIcon={FiDisc}
        emptyNoun="albums"
    />
);

export default AlbumsOpsPage;
