import React from 'react';
import { FiMic } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

/** Podcasts — tracks owned by podcaster accounts. */
const PodcastsOpsPage: React.FC = () => (
    <ContentVerticalPage
        title="Podcasts"
        subtitle="Episodes uploaded by podcaster accounts"
        breadcrumbLabel="Podcasts"
        baseQuery={{ kind: 'track', ownerRole: 'podcaster' }}
        statsQuery={{ kind: 'track', ownerRole: 'podcaster' }}
        emptyIcon={FiMic}
        emptyNoun="podcasts"
    />
);

export default PodcastsOpsPage;
