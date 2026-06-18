import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { FiMusic, FiVideo } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { MusicUploadTab } from '@uploadMusic/components/MusicUploadTab';
import { VideoUploadTab } from '@uploadVideo/components/VideoUploadTab';
import { useUploadStore } from '@upload/store/useUploadStore';
import { useSearchParams } from 'react-router-dom';
import { useMusicStore } from '@musicVideo/store/useMusicStore';
import { useVideoStore } from '@musicVideo/store/useVideoStore';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { useUploadVideoStore } from '@uploadVideo/store/useUploadVideoStore';
import { formatFileSize } from '@uploadMusic/services/uploadMusicService';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import { HStack } from '@chakra-ui/react';

// Map a genre display string from the API (e.g. "Afrobeat", "Hip Hop", "R&B") onto the
// option `value` used by the upload FormSelects so it shows as selected on edit. Falls back
// to a lowercased/hyphenated form when no special-case applies.
const normalizeGenre = (genre: string): string => {
    const key = genre.trim().toLowerCase();
    const specials: Record<string, string> = {
        'r&b': 'rnb',
        'rnb': 'rnb',
        'hip hop': 'hip-hop',
        'hip-hop': 'hip-hop',
    };
    return specials[key] ?? key.replace(/\s+/g, '-');
};

export const Upload: React.FC = () => {
    const { activeTab, setActiveTab, albumTab, setAlbumTab, startEditing, isEditing, stopEditing } = useUploadStore();
    const { isPodcaster, isCreator, isRecordLabel } = useUserType();
    const [searchParams] = useSearchParams();
    const { getSingleById, getAlbumById } = useMusicStore();
    const { getVideoItemById } = useVideoStore();
    const {
        // mix setters
        mixSetTrackTitle,
        mixSetSelectedArtists,
        mixSetGenre,
        mixSetReleaseType,
        mixSetUnlockCost,
        mixSetAllowSponsorship,
        mixSetReleaseYear,
        mixSetLyrics,
        mixSetIsrc,
        mixAddTrack,
        mixSetCoverArt,
        resetMix,
        // album setters
        albumSetSelectedArtists,
        albumSetTrackArtists,
        albumSetTrackTitles,
        albumSetGenre,
        albumSetReleaseType,
        albumSetUnlockCost,
        albumSetAllowSponsorship,
        albumSetReleaseYear,
        albumSetCoverArt,
        resetAlbum,
    } = useUploadMusicStore();
    const {
        setVideoFile,
        addThumbnail,
        updateTrackLink,
        addTrackLink,
        setReleaseType: setVideoReleaseType,
        setUnlockCost: setVideoUnlockCost,
        setAllowSponsorship: setVideoAllowSponsorship,
        resetVideoUpload
    } = useUploadVideoStore();

    useEffect(() => {
        const mixId = searchParams.get('mixId');
        const albumId = searchParams.get('albumId');
        const videoId = searchParams.get('videoId');
        const tabParam = searchParams.get('tab');
        const albumTabParam = searchParams.get('albumTab');

        // Handle tab selection from URL params (for new uploads)
        if (tabParam === 'music') {
            setActiveTab('music');
            if (albumTabParam === 'mix' || albumTabParam === 'album') {
                setAlbumTab(albumTabParam);
            }
        } else if (tabParam === 'video') {
            setActiveTab('video');
        }

        if (mixId) {
            setActiveTab('music');
            setAlbumTab('mix');
            startEditing('mix', mixId);
            const item = getSingleById(mixId);
            if (item) {
                // Reset, then prepopulate from the cached record. The underlying audio file
                // can't be swapped (no backend endpoint) so it's shown read-only; cover art,
                // metadata and lyrics remain editable.
                resetMix();
                mixSetTrackTitle(item.title || '');
                mixSetSelectedArtists(item.artists || []);
                if (item.genre?.length) mixSetGenre(item.genre.map(normalizeGenre));
                if (item.releaseType?.length) mixSetReleaseType(item.releaseType);
                if (item.unlockCost?.length) mixSetUnlockCost(item.unlockCost);
                if (item.allowSponsorship?.length) mixSetAllowSponsorship(item.allowSponsorship);
                if (item.releaseYear) mixSetReleaseYear(item.releaseYear);
                mixSetLyrics(item.lrcContent ?? '');
                if (item.isrc) mixSetIsrc(item.isrc);

                // Existing uploaded audio — display only (filename + size), not replaceable.
                mixAddTrack({
                    id: item.id,
                    remoteId: item.id,
                    name: item.filename || item.title || 'Current audio file',
                    size: item.fileSize ? formatFileSize(item.fileSize) : '',
                    progress: 100,
                    status: 'ready' as const,
                    title: item.title || item.filename || '',
                });

                // Existing cover art — rendered from its proxy URL, replaceable.
                if (item.coverArt) {
                    mixSetCoverArt({
                        id: `cover-${item.id}`,
                        remoteId: item.id,
                        name: item.coverArtName || 'Current cover',
                        size: '',
                        progress: 100,
                        status: 'ready' as const,
                        existingUrl: item.coverArt,
                    });
                }
            }
        } else if (albumId) {
            setActiveTab('music');
            setAlbumTab('album');
            startEditing('album', albumId);
            const item = getAlbumById(albumId);
            if (item) {
                // Reset and populate all fields
                resetAlbum();
                albumSetSelectedArtists(item.artists || []);

                // Build track titles and artists maps
                const titles: Record<string, string> = {};
                const artistsByTrack: Record<string, string[]> = {};
                item.tracks?.forEach((t) => {
                    titles[t.id] = t.title;
                    artistsByTrack[t.id] = t.artists || [];
                });
                albumSetTrackTitles(titles);
                albumSetTrackArtists(artistsByTrack);

                if (item.genre?.length) albumSetGenre(item.genre.map(normalizeGenre));
                if (item.releaseType?.length) albumSetReleaseType(item.releaseType);
                if (item.unlockCost?.length) albumSetUnlockCost(item.unlockCost);
                if (item.allowSponsorship?.length) albumSetAllowSponsorship(item.allowSponsorship);
                if (item.releaseYear) albumSetReleaseYear(item.releaseYear);

                // Existing cover art — rendered from its proxy URL, replaceable. (Album track
                // binaries are managed by the dedicated album editor at /upload/album/:id.)
                if (item.coverArt) {
                    albumSetCoverArt({
                        id: `cover-${item.id}`,
                        remoteId: item.id,
                        name: item.coverArtName || 'Current cover',
                        size: '',
                        progress: 100,
                        status: 'ready' as const,
                        existingUrl: item.coverArt,
                    });
                }
            }
        } else if (videoId) {
            setActiveTab('video');
            startEditing('video', videoId);
            const item = getVideoItemById(videoId);
            if (item) {
                resetVideoUpload();

                // Existing uploaded video — display only (filename + size), not replaceable.
                setVideoFile({
                    id: videoId,
                    remoteId: videoId,
                    name: item.filename || item.title || 'Current video file',
                    size: item.fileSize ? formatFileSize(item.fileSize) : '',
                    progress: 100,
                    status: 'ready' as const,
                });

                // Existing thumbnail — rendered from its proxy URL, replaceable.
                if (item.thumbnail) {
                    addThumbnail({
                        id: `thumb-${videoId}`,
                        remoteId: videoId,
                        name: 'Current thumbnail',
                        size: '',
                        progress: 100,
                        status: 'ready' as const,
                        existingUrl: item.thumbnail,
                    });
                }

                if (item.trackLinks?.length) {
                    item.trackLinks.forEach((link, index) => {
                        if (!link.trim()) return;
                        if (index > 0) addTrackLink();
                        updateTrackLink(index, link);
                    });
                }
                if (item.releaseType?.length) setVideoReleaseType(item.releaseType);
                if (item.unlockCost?.length) setVideoUnlockCost(item.unlockCost);
                if (item.allowSponsorship?.length) setVideoAllowSponsorship(item.allowSponsorship);
            }
        } else if (isEditing) {
            // Ensure we clear editing if navigated without params
            stopEditing();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Get tabs based on user type
    const getMainTabs = () => {
        if (isPodcaster) {
            return [
                { id: 'audio', label: 'Audio', icon: FiMusic },
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        if (isCreator) {
            // Creators only have video tab
            return [
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        return [
            { id: 'music', label: 'Music', icon: FiMusic },
            { id: 'video', label: 'Video', icon: FiVideo },
        ];
    };

    const mainTabs = getMainTabs();

    // For creators, force video tab
    useEffect(() => {
        if (isCreator && activeTab !== 'video') {
            setActiveTab('video');
        }
    }, [isCreator, activeTab, setActiveTab]);

    return (
        <Box bg="white" minH="100vh" p={{ base: 4, md: 6 }}>
            {/* Main Tabs */}
            <Box mb={6}>
                <HStack justify="space-between" align="center">
                    <Box flex={1}>
                        <AnimatedTabs
                            tabs={mainTabs}
                            activeTab={isPodcaster && activeTab === 'music' ? 'audio' : activeTab}
                            onTabChange={(tab) => {
                                const actualTab = isPodcaster && tab === 'audio' ? 'music' : tab;
                                setActiveTab(actualTab as 'music' | 'video');
                            }}
                            size="lg"
                            isDisabled={isEditing}
                        />
                    </Box>
                    {isRecordLabel && (
                        <Box ml={4}>
                            <ArtistDropdown />
                        </Box>
                    )}
                </HStack>
            </Box>

            {/* Tab Content */}
            {activeTab === 'music' ? (
                <MusicUploadTab albumTab={albumTab} setAlbumTab={setAlbumTab} />
            ) : (
                <VideoUploadTab />
            )}
        </Box>
    );
};

export default Upload;

