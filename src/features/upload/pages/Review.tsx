import React, { useEffect } from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { FiMusic, FiVideo } from 'react-icons/fi';
import { MusicReview } from '../components/MusicReview';
import { VideoReview } from '../components/VideoReview';
import { AnimatedTabs } from '@shared/components';
import { useUploadStore } from '../store/useUploadStore';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { useUploadVideoStore } from '../../upload-video/store/useUploadVideoStore';
import { useMusicStore } from '@musicVideo/store/useMusicStore';
import { useVideoStore } from '@musicVideo/store/useVideoStore';
import { useNavigate } from 'react-router-dom';
import type { SingleItem, AlbumItem, VideoItem } from '@musicVideo/types';
import { fileToBase64 } from '@shared/lib/fileUtils';
import { useSearchParams } from 'react-router-dom';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import type { ArtistOnboardingData } from '@/features/auth/store/useUserManagementStore';

const isArtistData = (data: unknown): data is ArtistOnboardingData =>
    !!data && typeof (data as ArtistOnboardingData).performingName !== 'undefined';

export const Review: React.FC = () => {
    const { activeTab, setActiveTab, albumTab, setAlbumTab } = useUploadStore();
    const { mix, album, resetMix, resetAlbum } = useUploadMusicStore();
    const videoUpload = useUploadVideoStore();
    const { resetVideoUpload } = useUploadVideoStore();
    const { addSingle, addAlbum, updateSingle, updateAlbum } = useMusicStore();
    const { addVideoItem, updateVideoItem } = useVideoStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isPodcaster, isCreator, isRecordLabel } = useUserType();

    // Get editing params
    const mixId = searchParams.get('mixId');
    const albumId = searchParams.get('albumId');
    const videoId = searchParams.get('videoId');

    // Check if we're in editing mode - disable tabs only when editing
    const isEditingMode = !!(mixId || albumId || videoId);

    // Sync activeTab and albumTab based on editing params
    useEffect(() => {
        if (videoId) {
            setActiveTab('video');
        } else if (mixId) {
            setActiveTab('music');
            setAlbumTab('mix');
        } else if (albumId) {
            setActiveTab('music');
            setAlbumTab('album');
        }
    }, [mixId, albumId, videoId, setActiveTab, setAlbumTab]);

    const handlePublish = async () => {
        // TODO: Wire scheduler state; for now, save current date/time
        const releaseDate = new Date().toISOString();

        // Check if we're editing based on which ID param exists
        const isEditingMix = !!mixId;
        const isEditingAlbum = !!albumId;
        const isEditingVideo = !!videoId;

        if (activeTab === 'music') {

            // Publish Single/Mix
            if (mix.tracks.length > 0 || mix.trackTitle || mix.coverArt) {
                // Convert files to base64 for persistence
                const coverArtData = mix.coverArt ? await fileToBase64(mix.coverArt.file) : undefined;
                const audioData = mix.tracks[0]?.file ? await fileToBase64(mix.tracks[0].file) : undefined;

                const singleItem: SingleItem = {
                    id: isEditingMix ? mixId! : Date.now().toString(),
                    title: mix.trackTitle || mix.tracks[0]?.name?.split('.')[0] || 'Untitled',
                    artist: mix.selectedArtists.join(', ') || 'Unknown Artist',
                    artists: mix.selectedArtists,
                    releaseDate,
                    plays: 10243532,
                    unlocks: 50000000,
                    gifts: 500000000,
                    coverArt: mix.coverArt ? URL.createObjectURL(mix.coverArt.file) : '',
                    coverArtData,
                    coverArtName: mix.coverArt?.name,
                    audioFile: mix.tracks[0]?.file,
                    audioData,
                    audioName: mix.tracks[0]?.name,
                    genre: mix.genre,
                    releaseType: mix.releaseType,
                    unlockCost: mix.unlockCost,
                    allowSponsorship: mix.allowSponsorship,
                    releaseYear: mix.releaseYear,
                    createdAt: new Date().toISOString(),
                };

                if (isEditingMix) {
                    updateSingle(mixId!, singleItem);
                    console.log('Single updated:', singleItem);
                } else {
                    addSingle(singleItem);
                    console.log('Single published:', singleItem);
                }
            }

            // Publish Album
            if (album.tracks.length > 0 || album.coverArt) {
                // Convert files to base64 for persistence
                const coverArtData = album.coverArt ? await fileToBase64(album.coverArt.file) : undefined;
                const trackAudioData = await Promise.all(
                    album.tracks.map(track => fileToBase64(track.file))
                );

                const albumItem: AlbumItem = {
                    id: isEditingAlbum ? albumId! : Date.now().toString(),
                    title: album.selectedArtists[0]?.name || 'Untitled Album',
                    artist: album.selectedArtists.map(a => a.name).join(', ') || 'Unknown Artist',
                    artists: album.selectedArtists,
                    album: album.selectedArtists[0]?.name || 'Untitled Album',
                    releaseDate,
                    plays: 10243532,
                    unlocks: 50000000,
                    gifts: 500000000,
                    coverArt: album.coverArt ? URL.createObjectURL(album.coverArt.file) : '',
                    coverArtData,
                    coverArtName: album.coverArt?.name,
                    tracks: album.tracks.map((track, index) => ({
                        id: track.id,
                        title: album.trackTitles[track.id] || track.name?.split('.')[0] || `Track ${index + 1}`,
                        duration: '2:45',
                        audioFile: track.file,
                        audioData: trackAudioData[index],
                        audioName: track.name,
                        artists: album.trackArtists[track.id] || [],
                    })),
                    genre: album.genre,
                    releaseType: album.releaseType,
                    unlockCost: album.unlockCost,
                    allowSponsorship: album.allowSponsorship,
                    releaseYear: album.releaseYear,
                    createdAt: new Date().toISOString(),
                };

                if (isEditingAlbum) {
                    updateAlbum(albumId!, albumItem);
                    console.log('Album updated:', albumItem);
                } else {
                    addAlbum(albumItem);
                    console.log('Album published:', albumItem);
                }
            }
        } else {
            // Publish video
            const videoData = videoUpload.videoFile?.file ? await fileToBase64(videoUpload.videoFile.file) : undefined;
            const thumbnailData = await Promise.all(
                videoUpload.thumbnails.map(t => fileToBase64(t.file))
            );

            const videoItem: VideoItem = {
                id: isEditingVideo ? videoId! : Date.now().toString(),
                title: videoUpload.videoFile?.name.replace(/\.[^/.]+$/, '') || 'Untitled Video',
                artist: (() => {
                    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore.getState();
                    const currentUserData = getCurrentUserData();
                    const currentUserType = getCurrentUserType();
                    if (currentUserType === 'artist' && isArtistData(currentUserData)) {
                        return currentUserData.performingName || currentUserData.fullName || 'Artist';
                    }
                    return 'Artist';
                })(),
                releaseDate,
                plays: 10243532,
                unlocks: 50000000,
                gifts: 500000000,
                thumbnail: videoUpload.thumbnails[0]?.url || '',
                videoFile: videoUpload.videoFile?.file as File,
                videoData,
                videoName: videoUpload.videoFile?.name,
                thumbnails: videoUpload.thumbnails.map(t => t.url || '').filter(Boolean),
                thumbnailData,
                thumbnailNames: videoUpload.thumbnails.map(t => t.name),
                trackLinks: videoUpload.trackLinks,
                releaseType: videoUpload.releaseType,
                unlockCost: videoUpload.unlockCost,
                allowSponsorship: videoUpload.allowSponsorship,
                createdAt: new Date().toISOString(),
            };

            if (isEditingVideo) {
                updateVideoItem(videoId!, videoItem);
                console.log('Video updated:', videoItem);
            } else {
                addVideoItem(videoItem);
                console.log('Video published:', videoItem);
            }
        }

        // Clear upload storage after publishing
        if (activeTab === 'music') {
            if (isEditingMix || mix.tracks.length > 0 || mix.trackTitle || mix.coverArt) {
                resetMix();
            }
            if (isEditingAlbum || album.tracks.length > 0 || album.coverArt) {
                resetAlbum();
            }
        } else {
            resetVideoUpload();
        }

        // Navigate back to upload page
        navigate('/upload');
    };

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
                    isDisabled={isEditingMode}
                />
                    </Box>
                    {isRecordLabel && (
                        <Box ml={4}>
                            <ArtistDropdown />
                        </Box>
                    )}
                </HStack>
            </Box>



            {/* Content */}
            {activeTab === 'music' ? (
                <MusicReview
                    albumTab={albumTab}
                    setAlbumTab={setAlbumTab}
                    onPublish={handlePublish}
                    isDisabled={isEditingMode}
                />
            ) : (
                <VideoReview onPublish={handlePublish} />
            )}
        </Box>
    );
};

export default Review;

