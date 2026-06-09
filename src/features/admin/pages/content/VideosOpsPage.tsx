import React from 'react';
import { FiVideo } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

const VIDEO_TYPE_OPTIONS = [
    { value: 'All', label: 'All video types' },
    { value: 'MusicVideo', label: 'Music video' },
    { value: 'Visualizer', label: 'Visualizer' },
    { value: 'LiveSession', label: 'Live session' },
    { value: 'BehindTheScenes', label: 'Behind the scenes' },
];

/** Video operations — every video, filterable by video type. */
const VideosOpsPage: React.FC = () => (
    <ContentVerticalPage
        title="Videos"
        subtitle="Music videos, visualizers and live sessions"
        breadcrumbLabel="Videos"
        baseQuery={{ kind: 'video' }}
        emptyIcon={FiVideo}
        emptyNoun="videos"
        leadingFilters={(c) => [
            {
                key: 'videoType',
                value: c.query.videoType ?? 'All',
                onChange: (v) =>
                    c.setQuery((q) => ({
                        ...q,
                        videoType: v === 'All' ? undefined : v,
                        page: 1,
                    })),
                options: VIDEO_TYPE_OPTIONS,
                width: '170px',
            },
        ]}
    />
);

export default VideosOpsPage;
