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
import { base64ToFile, getMimeTypeFromFilename } from '@shared/lib/fileUtils';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import { HStack } from '@chakra-ui/react';

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
        albumAddTrack,
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
                // Reset and populate all fields
                resetMix();
                mixSetTrackTitle(item.title || '');
                mixSetSelectedArtists(item.artists || []);
                if (item.genre) mixSetGenre(item.genre);
                if (item.releaseType) mixSetReleaseType(item.releaseType);
                if (item.unlockCost) mixSetUnlockCost(item.unlockCost);
                if (item.allowSponsorship) mixSetAllowSponsorship(item.allowSponsorship);
                if (item.releaseYear) mixSetReleaseYear(item.releaseYear);

                // Reconstruct files from base64 data
                try {
                    if (item.audioData && item.audioName) {
                        const audioFile = base64ToFile(item.audioData, item.audioName, getMimeTypeFromFilename(item.audioName));
                        const uploadTrack = {
                            id: item.id,
                            name: item.audioName,
                            size: ((audioFile.size / (1024 * 1024)).toFixed(2) + ' MB'),
                            progress: 100,
                            status: 'ready' as const,
                            file: audioFile,
                            title: item.title || item.audioName,
                        };
                        mixAddTrack(uploadTrack);
                    }

                    if (item.coverArtData && item.coverArtName) {
                        const coverArtFile = base64ToFile(item.coverArtData, item.coverArtName, getMimeTypeFromFilename(item.coverArtName));
                        const uploadCoverArt = {
                            id: `cover-${item.id}`,
                            name: item.coverArtName,
                            size: ((coverArtFile.size / (1024 * 1024)).toFixed(2) + ' MB'),
                            progress: 100,
                            status: 'ready' as const,
                            file: coverArtFile,
                        };
                        mixSetCoverArt(uploadCoverArt);
                    }
                } catch (error) {
                    console.error('Error reconstructing files:', error);
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

                if (item.genre) albumSetGenre(item.genre);
                if (item.releaseType) albumSetReleaseType(item.releaseType);
                if (item.unlockCost) albumSetUnlockCost(item.unlockCost);
                if (item.allowSponsorship) albumSetAllowSponsorship(item.allowSponsorship);
                if (item.releaseYear) albumSetReleaseYear(item.releaseYear);

                // Reconstruct files from base64 data
                try {
                    // Reconstruct album tracks
                    item.tracks?.forEach((t) => {
                        if (t.audioData && t.audioName) {
                            const audioFile = base64ToFile(t.audioData, t.audioName, getMimeTypeFromFilename(t.audioName));
                            const uploadTrack = {
                                id: t.id,
                                name: t.audioName,
                                size: ((audioFile.size / (1024 * 1024)).toFixed(2) + ' MB'),
                                progress: 100,
                                status: 'ready' as const,
                                file: audioFile,
                                title: t.title || t.audioName,
                            };
                            albumAddTrack(uploadTrack);
                        }
                    });

                    // Reconstruct cover art
                    if (item.coverArtData && item.coverArtName) {
                        const coverArtFile = base64ToFile(item.coverArtData, item.coverArtName, getMimeTypeFromFilename(item.coverArtName));
                        const uploadCoverArt = {
                            id: `cover-${item.id}`,
                            name: item.coverArtName,
                            size: ((coverArtFile.size / (1024 * 1024)).toFixed(2) + ' MB'),
                            progress: 100,
                            status: 'ready' as const,
                            file: coverArtFile,
                        };
                        albumSetCoverArt(uploadCoverArt);
                    }
                } catch (error) {
                    console.error('Error reconstructing files:', error);
                }
            }
        } else if (videoId) {
            setActiveTab('video');
            startEditing('video', videoId);
            const item = getVideoItemById(videoId);
            if (item) {
                // Reset video upload state
                resetVideoUpload();

                // Reconstruct files from base64 data
                try {
                    // Reconstruct video file
                    if (item.videoData && item.videoName) {
                        const videoFile = base64ToFile(item.videoData, item.videoName, getMimeTypeFromFilename(item.videoName));
                        const uploadFile = {
                            id: videoId,
                            name: item.videoName,
                            size: ((videoFile.size / (1024 * 1024)).toFixed(2) + ' MB'),
                            progress: 100,
                            status: 'ready' as const,
                            file: videoFile,
                            url: URL.createObjectURL(videoFile),
                        };
                        setVideoFile(uploadFile);
                    }

                    // Reconstruct thumbnails
                    if (item.thumbnailData && item.thumbnailNames) {
                        item.thumbnailData.forEach((data, index) => {
                            if (data && item.thumbnailNames?.[index]) {
                                const thumbnailFile = base64ToFile(data, item.thumbnailNames[index], getMimeTypeFromFilename(item.thumbnailNames[index]));
                                const uploadThumbnail = {
                                    id: `thumb-${videoId}-${index}`,
                                    name: item.thumbnailNames[index],
                                    size: ((thumbnailFile.size / (1024 * 1024)).toFixed(2) + ' MB'),
                                    progress: 100,
                                    status: 'ready' as const,
                                    file: thumbnailFile,
                                    url: URL.createObjectURL(thumbnailFile),
                                };
                                addThumbnail(uploadThumbnail);
                            }
                        });
                    }

                    // Populate form fields
                    if (item.trackLinks) {
                        item.trackLinks.forEach(link => {
                            if (link.trim()) {
                                addTrackLink();
                                updateTrackLink(0, link);
                            }
                        });
                    }
                    if (item.releaseType) setVideoReleaseType(item.releaseType);
                    if (item.unlockCost) setVideoUnlockCost(item.unlockCost);
                    if (item.allowSponsorship) setVideoAllowSponsorship(item.allowSponsorship);
                } catch (error) {
                    console.error('Error reconstructing video files:', error);
                }
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

