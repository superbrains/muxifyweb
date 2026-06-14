import React from 'react';
import { FiMusic } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

const RELEASE_TYPE_OPTIONS = [
    { value: 'All', label: 'All releases' },
    { value: 'Single', label: 'Single' },
    { value: 'EP', label: 'EP' },
    { value: 'Album', label: 'Album' },
    { value: 'Compilation', label: 'Compilation' },
];

/** Music operations — tracks across Single/EP/Album/Compilation release types. */
const MusicOpsPage: React.FC = () => (
    <ContentVerticalPage
        title="Music"
        subtitle="Tracks across singles, EPs, albums and compilations"
        breadcrumbLabel="Music"
        baseQuery={{ kind: 'track' }}
        statsQuery={{ kind: 'track' }}
        emptyIcon={FiMusic}
        emptyNoun="tracks"
        leadingFilters={(c) => [
            {
                key: 'releaseType',
                value: c.query.releaseType ?? 'All',
                onChange: (v) =>
                    c.setQuery((q) => ({
                        ...q,
                        releaseType: v === 'All' ? undefined : v,
                        page: 1,
                    })),
                options: RELEASE_TYPE_OPTIONS,
            },
        ]}
    />
);

export default MusicOpsPage;
