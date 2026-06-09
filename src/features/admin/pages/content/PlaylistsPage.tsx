import React from 'react';
import { FiList } from 'react-icons/fi';
import { ContentVerticalPage } from './ContentVerticalPage';

/**
 * Playlist operations — publish/unpublish (and restrict, which doubles as a
 * feature toggle) via the shared item actions. A dedicated feature endpoint is
 * not in the current backend contract, so feature gating is handled through the
 * standard publish/restrict actions in the detail drawer.
 */
const PlaylistsPage: React.FC = () => (
    <ContentVerticalPage
        title="Playlists"
        subtitle="Editorial and user playlists, with publish controls"
        breadcrumbLabel="Playlists"
        baseQuery={{ kind: 'playlist' }}
        emptyIcon={FiList}
        emptyNoun="playlists"
    />
);

export default PlaylistsPage;
