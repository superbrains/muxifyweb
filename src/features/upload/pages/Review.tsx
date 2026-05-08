import React, { useEffect, useState } from 'react';
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
import { useUploadMusic } from '@uploadMusic/hooks/useUploadMusic';
import { useUploadVideo } from '@/features/upload-video/hooks/useUploadVideo';
import { useChakraToast } from '@shared/hooks';

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
    const {
        uploadMusic,
        loading: uploadLoading,
        uploadProgress: musicUploadProgress,
        resetUploadProgress: resetMusicUploadProgress,
    } = useUploadMusic();
    const {
        uploadVideo,
        loading: videoUploadLoading,
        uploadProgress: videoUploadProgress,
        resetUploadProgress: resetVideoUploadProgress,
    } = useUploadVideo();
    const toast = useChakraToast();
    const [isPublishing, setIsPublishing] = useState(false);
    const [albumProgress, setAlbumProgress] = useState<{ current: number; total: number } | undefined>(undefined);

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

        setIsPublishing(true);

        // Get current logged-in user's artist name
        const getCurrentArtistName = (): string => {
            const { getCurrentUserData, getCurrentUserType } = useUserManagementStore.getState();
            const currentUserData = getCurrentUserData();
            const currentUserType = getCurrentUserType();
            if (currentUserType === 'artist' && isArtistData(currentUserData)) {
                return currentUserData.performingName || currentUserData.fullName || 'Artist';
            }
            return 'Artist';
        };

        try {
            if (activeTab === 'music') {
                const currentArtistName = getCurrentArtistName();

                // Publish Single/Mix
                if (mix.tracks.length > 0 || mix.trackTitle || mix.coverArt) {
                    const audioFile = mix.tracks[0]?.file;

                    if (!audioFile) {
                        toast.error('Upload Error', 'No audio file selected');
                        setIsPublishing(false);
                        return;
                    }

                    // Upload to backend API
                    const trackResult = await uploadMusic({
                        title: mix.trackTitle || mix.tracks[0]?.name?.split('.')[0] || 'Untitled',
                        artist: mix.selectedArtists.join(', ') || currentArtistName,
                        genre: mix.genre.join(', '),
                        releaseDate,
                        file: audioFile,
                        coverArt: mix.coverArt?.file,
                    });

                    if (trackResult) {
                        // Also save to local store for offline access/caching
                        const coverArtData = mix.coverArt ? await fileToBase64(mix.coverArt.file) : undefined;
                        const audioData = await fileToBase64(audioFile);

                        const singleItem: SingleItem = {
                            id: trackResult.id || (isEditingMix ? mixId! : Date.now().toString()),
                            title: trackResult.title || mix.trackTitle || mix.tracks[0]?.name?.split('.')[0] || 'Untitled',
                            artist: trackResult.artist || mix.selectedArtists.join(', ') || currentArtistName,
                            artists: mix.selectedArtists,
                            releaseDate: trackResult.releaseDate || releaseDate,
                            plays: 0,
                            unlocks: 0,
                            gifts: 0,
                            coverArt: trackResult.thumbnail || (mix.coverArt ? URL.createObjectURL(mix.coverArt.file) : ''),
                            coverArtData,
                            coverArtName: mix.coverArt?.name,
                            audioFile: audioFile,
                            audioData,
                            audioName: mix.tracks[0]?.name,
                            genre: trackResult.genre ? [trackResult.genre] : mix.genre,
                            releaseType: mix.releaseType,
                            unlockCost: mix.unlockCost,
                            allowSponsorship: mix.allowSponsorship,
                            releaseYear: mix.releaseYear,
                            createdAt: trackResult.createdAt || new Date().toISOString(),
                        };

                        if (isEditingMix) {
                            updateSingle(mixId!, singleItem);
                            console.log('Single updated (backend + local):', singleItem);
                        } else {
                            addSingle(singleItem);
                            console.log('Single published (backend + local):', singleItem);
                        }
                    } else {
                        // Upload failed - error already shown by useUploadMusic hook
                        setIsPublishing(false);
                        return;
                    }
                }

                // Publish Album - upload each track to backend
                if (album.tracks.length > 0 || album.coverArt) {
                    const uploadedTracks: Array<{ id: string; name?: string; file: File; backendId?: string; backendUrl?: string }> = [];

                    // Upload each track in the album to the backend
                    for (let i = 0; i < album.tracks.length; i++) {
                        const track = album.tracks[i];
                        const trackTitle = album.trackTitles[track.id] || track.name?.split('.')[0] || `Track ${i + 1}`;
                        const trackArtists = album.trackArtists[track.id] || album.selectedArtists.map(a => a.name);

                        setAlbumProgress({ current: i + 1, total: album.tracks.length });

                        const trackResult = await uploadMusic({
                            title: trackTitle,
                            artist: trackArtists.join(', ') || currentArtistName,
                            album: album.selectedArtists[0]?.name || 'Untitled Album',
                            genre: album.genre.join(', '),
                            releaseDate,
                            file: track.file,
                            coverArt: i === 0 ? album.coverArt?.file : undefined, // Only send cover art with first track
                        });

                        if (trackResult) {
                            uploadedTracks.push({
                                id: track.id,
                                name: track.name,
                                file: track.file,
                                backendId: trackResult.id,
                                backendUrl: trackResult.thumbnail,
                            });
                        } else {
                            toast.error('Album Upload Error', `Failed to upload track: ${trackTitle}`);
                            setIsPublishing(false);
                            return;
                        }
                    }

                    // All tracks uploaded successfully - save album to local store
                    const coverArtData = album.coverArt ? await fileToBase64(album.coverArt.file) : undefined;
                    const trackAudioData = await Promise.all(
                        album.tracks.map(track => fileToBase64(track.file))
                    );

                    const albumItem: AlbumItem = {
                        id: isEditingAlbum ? albumId! : Date.now().toString(),
                        title: album.selectedArtists[0]?.name || 'Untitled Album',
                        artist: album.selectedArtists.map(a => a.name).join(', ') || currentArtistName,
                        artists: album.selectedArtists,
                        album: album.selectedArtists[0]?.name || 'Untitled Album',
                        releaseDate,
                        plays: 0,
                        unlocks: 0,
                        gifts: 0,
                        coverArt: album.coverArt ? URL.createObjectURL(album.coverArt.file) : '',
                        coverArtData,
                        coverArtName: album.coverArt?.name,
                        tracks: album.tracks.map((track, index) => ({
                            id: uploadedTracks[index]?.backendId || track.id,
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
                        console.log('Album updated (backend + local):', albumItem);
                    } else {
                        addAlbum(albumItem);
                        console.log('Album published (backend + local):', albumItem);
                    }
                }
            } else {
                // Publish video — upload to backend, then mirror to local store
                if (!videoUpload.videoFile?.file) {
                    toast.error('Upload Error', 'No video file selected');
                    setIsPublishing(false);
                    return;
                }

                const videoFile = videoUpload.videoFile.file;
                const thumbnailFile = videoUpload.thumbnails[0]?.file;
                const titleFromFilename = videoUpload.videoFile.name.replace(/\.[^/.]+$/, '') || 'Untitled Video';

                const currentArtistName = (() => {
                    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore.getState();
                    const currentUserData = getCurrentUserData();
                    const currentUserType = getCurrentUserType();
                    if (currentUserType === 'artist' && isArtistData(currentUserData)) {
                        return currentUserData.performingName || currentUserData.fullName || 'Artist';
                    }
                    return 'Artist';
                })();

                const videoResult = await uploadVideo({
                    title: titleFromFilename,
                    file: videoFile,
                    thumbnail: thumbnailFile,
                    artistName: currentArtistName,
                });

                if (!videoResult) {
                    setIsPublishing(false);
                    return;
                }

                // Backend now hosts the file — store metadata only. Persisting base64
                // video data here previously caused OOM crashes on /music-videos hydration.
                const videoItem: VideoItem = {
                    id: videoResult.id || (isEditingVideo ? videoId! : Date.now().toString()),
                    title: videoResult.title || titleFromFilename,
                    artist: videoResult.artist || currentArtistName,
                    releaseDate: videoResult.createdAt || releaseDate,
                    plays: 0,
                    unlocks: 0,
                    gifts: 0,
                    thumbnail: videoResult.thumbnail || videoUpload.thumbnails[0]?.url || '',
                    videoFile: undefined as unknown as File,
                    videoName: videoUpload.videoFile.name,
                    thumbnails: videoUpload.thumbnails.map(t => t.url || '').filter(Boolean),
                    thumbnailNames: videoUpload.thumbnails.map(t => t.name),
                    trackLinks: videoUpload.trackLinks,
                    releaseType: videoUpload.releaseType,
                    unlockCost: videoUpload.unlockCost,
                    allowSponsorship: videoUpload.allowSponsorship,
                    createdAt: videoResult.createdAt || new Date().toISOString(),
                };

                if (isEditingVideo) {
                    updateVideoItem(videoId!, videoItem);
                } else {
                    addVideoItem(videoItem);
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
        } catch (error) {
            console.error('Publish error:', error);
            toast.error('Publish Error', 'An unexpected error occurred while publishing.');
        } finally {
            setIsPublishing(false);
            setAlbumProgress(undefined);
        }
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
                    isPublishing={isPublishing || uploadLoading}
                    uploadProgress={musicUploadProgress}
                    albumProgress={albumProgress}
                    onResetUploadProgress={resetMusicUploadProgress}
                />
            ) : (
                <VideoReview
                    onPublish={handlePublish}
                    isPublishing={isPublishing || videoUploadLoading}
                    uploadProgress={videoUploadProgress}
                    onResetUploadProgress={resetVideoUploadProgress}
                />
            )}
        </Box>
    );
};

export default Review;

