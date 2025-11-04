import React from 'react';
import { Button, Flex, Icon } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedTabs } from '@shared/components';
import { MixTab } from './MixTab';
import { AlbumTab } from './AlbumTab';
import { useUploadStore } from '@upload/store/useUploadStore';
import { useUploadMusicStore } from '../store/useUploadMusicStore';
import { useUserType } from '@/features/auth/hooks/useUserType';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file: File;
}

interface Track extends UploadFile {
    title: string;
}


interface MusicUploadTabProps {
    albumTab: 'mix' | 'album';
    setAlbumTab: (tab: 'mix' | 'album') => void;
}

const genreOptions = [
    { label: 'Afrobeat', value: 'afrobeat' },
    { label: 'Hip Hop', value: 'hip-hop' },
    { label: 'Pop', value: 'pop' },
    { label: 'R&B', value: 'rnb' },
];

const releaseTypeOptions = [
    { label: 'New Release', value: 'new-release' },
    { label: 'Album', value: 'album' },
    { label: 'Single', value: 'single' },
];

const unlockCostOptions = [
    { label: '₦100.00', value: '100.00' },
    { label: '₦200.00', value: '200.00' },
    { label: '₦500.00', value: '500.00' },
];

const sponsorshipOptions = [
    { label: 'yes', value: 'yes' },
    { label: 'no', value: 'no' },
];

export const MusicUploadTab: React.FC<MusicUploadTabProps> = ({ albumTab, setAlbumTab }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isPodcaster, isDJ, isMusician } = useUserType();
    
    // Get sub tabs based on user type
    const getSubTabs = () => {
        if (isPodcaster) {
            return [
                { id: 'episode', label: 'Episode' },
                { id: 'topic', label: 'Topic' },
            ];
        }
        if (isDJ) {
            return [
                { id: 'mix', label: 'Mix' },
                { id: 'album', label: 'Album' },
            ];
        }
        if (isMusician) {
            return [
                { id: 'single', label: 'Single' },
                { id: 'album', label: 'Album' },
            ];
        }
        // Default
        return [
            { id: 'mix', label: 'Mix' },
            { id: 'album', label: 'Album' },
        ];
    };
    
    const subTabs = getSubTabs();
    
    // Map podcast/musician tabs to internal tabs
    const mapTabId = (tabId: string) => {
        if (isPodcaster) {
            return tabId === 'episode' ? 'mix' : 'album';
        }
        if (isMusician) {
            return tabId === 'single' ? 'mix' : 'album';
        }
        return tabId;
    };
    
    const mapInternalToDisplay = (internalTab: string) => {
        if (isPodcaster) {
            return internalTab === 'mix' ? 'episode' : 'topic';
        }
        if (isMusician) {
            return internalTab === 'mix' ? 'single' : 'album';
        }
        return internalTab;
    };
    
    // Upload session store (separate slices for mix and album)
    const {
        mix,
        album,
        mixAddTrack,
        mixRemoveTrack,
        mixSetCoverArt,
        mixSetTrackTitle,
        mixAddArtist,
        mixUpdateArtist,
        mixRemoveArtist,
        mixSetGenre,
        mixSetReleaseType,
        mixSetUnlockCost,
        mixSetAllowSponsorship,
        mixSetReleaseYear,
        albumAddTrack,
        albumRemoveTrack,
        albumSetCoverArt,
        albumSetTrackArtists,
        albumSetTrackTitle,
        albumSetTrackTitles,
        albumSetGenre,
        albumSetReleaseType,
        albumSetUnlockCost,
        albumSetAllowSponsorship,
        albumSetReleaseYear,
    } = useUploadMusicStore();

    // Review store (consumed by review pages) - we will sync active slice here on Continue
    const {
        setTracks: setReviewTracks,
        setCoverArt: setReviewCoverArt,
        setSelectedArtists: setReviewSelectedArtists,
        setTrackTitles: setReviewTrackTitles,
        setGenre: setReviewGenre,
        setReleaseType: setReviewReleaseType,
        setUnlockCost: setReviewUnlockCost,
        setAllowSponsorship: setReviewAllowSponsorship,
        setReleaseYear: setReviewReleaseYear,
        setActiveTab,
        isEditing,
        editingId,
    } = useUploadStore();

    // Computed slice-specific state
    const tracks = albumTab === 'mix' ? mix.tracks : album.tracks;
    const coverArt = albumTab === 'mix' ? mix.coverArt : album.coverArt;
    const trackTitle = mix.trackTitle;
    const selectedArtists = mix.selectedArtists;
    const trackTitles = album.trackTitles;
    const genre = albumTab === 'mix' ? mix.genre : album.genre;
    const releaseType = albumTab === 'mix' ? mix.releaseType : album.releaseType;
    const unlockCost = albumTab === 'mix' ? mix.unlockCost : album.unlockCost;
    const allowSponsorship = albumTab === 'mix' ? mix.allowSponsorship : album.allowSponsorship;
    const releaseYear = albumTab === 'mix' ? mix.releaseYear : album.releaseYear;

    const handleAudioFileSelect = () => {
        // FileUploadArea will handle the upload progress internally
    };

    const handleAudioFileReady = (file: UploadFile) => {
        const newTrack: Track = {
            ...file,
            title: '',
        };

        if (albumTab === 'mix') {
            mixAddTrack(newTrack);
        } else {
            albumAddTrack(newTrack);
        }
    };

    const handleCoverArtSelect = () => {
        // FileUploadArea will handle the upload progress internally
    };

    const handleCoverArtReady = (file: UploadFile) => {
        if (albumTab === 'mix') {
            mixSetCoverArt(file);
        } else {
            albumSetCoverArt(file);
        }
    };

    const handleRemoveTrack = (trackId: string) => {
        if (albumTab === 'mix') {
            mixRemoveTrack(trackId);
        } else {
            albumRemoveTrack(trackId);
            const newTitles = { ...trackTitles };
            delete newTitles[trackId];
            albumSetTrackTitles(newTitles);
        }
    };

    const handleRemoveCoverArt = () => {
        if (albumTab === 'mix') {
            mixSetCoverArt(null);
        } else {
            albumSetCoverArt(null);
        }
    };


    // Track artists are stored separately in the store
    const trackArtists = album.trackArtists || {};

    const handleAddTrackArtist = (trackId: string, artist: string) => {
        const currentArtists = trackArtists[trackId] || [];
        albumSetTrackArtists({
            ...trackArtists,
            [trackId]: [...currentArtists, artist]
        });
    };

    const handleUpdateTrackArtist = (trackId: string, index: number, artist: string) => {
        const currentArtists = trackArtists[trackId] || [];
        const updatedArtists = [...currentArtists];
        updatedArtists[index] = artist;
        albumSetTrackArtists({
            ...trackArtists,
            [trackId]: updatedArtists
        });
    };

    const handleRemoveTrackArtist = (trackId: string, index: number) => {
        const currentArtists = trackArtists[trackId] || [];
        const updatedArtists = currentArtists.filter((_: string, i: number) => i !== index);
        albumSetTrackArtists({
            ...trackArtists,
            [trackId]: updatedArtists
        });
    };

    const handleTrackTitleChange = (trackId: string, title: string) => {
        albumSetTrackTitle(trackId, title);
    };

    const handleContinue = () => {
        // Set active tab to music before navigating
        setActiveTab('music');

        // Sync active slice into review store, then navigate
        if (albumTab === 'mix') {
            setReviewTracks(mix.tracks);
            setReviewCoverArt(mix.coverArt);
            setReviewSelectedArtists(mix.selectedArtists.map(name => ({ id: Date.now().toString(), name, role: 'artist' })));
            setReviewTrackTitles({ [mix.tracks[0]?.id || '']: mix.trackTitle });
            setReviewGenre(mix.genre);
            setReviewReleaseType(mix.releaseType);
            setReviewUnlockCost(mix.unlockCost);
            setReviewAllowSponsorship(mix.allowSponsorship);
            setReviewReleaseYear(mix.releaseYear);
        } else {
            setReviewTracks(album.tracks);
            setReviewCoverArt(album.coverArt);
            setReviewSelectedArtists(album.selectedArtists);
            setReviewTrackTitles(album.trackTitles);
            setReviewGenre(album.genre);
            setReviewReleaseType(album.releaseType);
            setReviewUnlockCost(album.unlockCost);
            setReviewAllowSponsorship(album.allowSponsorship);
            setReviewReleaseYear(album.releaseYear);
        }

        // Build review URL with editing params if present
        const mixId = searchParams.get('mixId');
        const albumId = searchParams.get('albumId');

        let reviewUrl = '/upload/review';

        if (isEditing && editingId) {
            // Add editing params to review URL
            if (albumTab === 'mix' && mixId) {
                reviewUrl += `?mixId=${mixId}`;
            } else if (albumTab === 'album' && albumId) {
                reviewUrl += `?albumId=${albumId}`;
            }
        }

        navigate(reviewUrl);
    };

    const handleSaveChanges = () => {
        // Navigate to review page just like Continue
        handleContinue();
    };

    return (
        <>
            {/* Sub Tabs and Continue Button */}
            <Flex justify="space-between" align="center" mb={{ base: 5, md: 7 }}>
                <AnimatedTabs
                    tabs={subTabs}
                    activeTab={mapInternalToDisplay(albumTab)}
                    onTabChange={(tab) => setAlbumTab(mapTabId(tab) as 'mix' | 'album')}
                    size="sm"
                    tabWidth={isPodcaster ? "100px" : "80px"}
                    isDisabled={isEditing}
                />

                <Button
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="12px"
                    fontWeight="semibold"
                    px={{ base: 5, md: 7 }}
                    h="38px"
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={isEditing ? handleSaveChanges : handleContinue}
                >
                    {isEditing ? 'Save Changes' : 'Continue'}
                    <Icon as={FiArrowRight} boxSize={4} ml={2} />
                </Button>
            </Flex>

            {/* Content */}
            {albumTab === 'mix' ? (
                <MixTab
                    tracks={tracks}
                    coverArt={coverArt}
                    trackTitle={trackTitle}
                    selectedArtists={selectedArtists}
                    genre={genre}
                    releaseType={releaseType}
                    unlockCost={unlockCost}
                    allowSponsorship={allowSponsorship}
                    releaseYear={releaseYear}
                    onAudioFileSelect={handleAudioFileSelect}
                    onAudioFileReady={handleAudioFileReady}
                    onCoverArtSelect={handleCoverArtSelect}
                    onCoverArtReady={handleCoverArtReady}
                    onRemoveTrack={handleRemoveTrack}
                    onRemoveCoverArt={handleRemoveCoverArt}
                    onTrackTitleChange={mixSetTrackTitle}
                    onAddArtist={mixAddArtist}
                    onUpdateArtist={mixUpdateArtist}
                    onRemoveArtist={mixRemoveArtist}
                    onGenreChange={mixSetGenre}
                    onReleaseTypeChange={mixSetReleaseType}
                    onUnlockCostChange={mixSetUnlockCost}
                    onSponsorshipChange={mixSetAllowSponsorship}
                    onReleaseYearChange={mixSetReleaseYear}
                    genreOptions={genreOptions}
                    releaseTypeOptions={releaseTypeOptions}
                    unlockCostOptions={unlockCostOptions}
                    sponsorshipOptions={sponsorshipOptions}
                />
            ) : (
                <AlbumTab
                    tracks={tracks}
                    coverArt={coverArt}
                    trackTitles={trackTitles}
                    trackArtists={trackArtists}
                    genre={genre}
                    releaseType={releaseType}
                    unlockCost={unlockCost}
                    allowSponsorship={allowSponsorship}
                    releaseYear={releaseYear}
                    onAudioFileSelect={handleAudioFileSelect}
                    onAudioFileReady={handleAudioFileReady}
                    onCoverArtSelect={handleCoverArtSelect}
                    onCoverArtReady={handleCoverArtReady}
                    onRemoveTrack={handleRemoveTrack}
                    onRemoveCoverArt={handleRemoveCoverArt}
                    onTrackTitleChange={handleTrackTitleChange}
                    onAddTrackArtist={handleAddTrackArtist}
                    onUpdateTrackArtist={handleUpdateTrackArtist}
                    onRemoveTrackArtist={handleRemoveTrackArtist}
                    onGenreChange={albumSetGenre}
                    onReleaseTypeChange={albumSetReleaseType}
                    onUnlockCostChange={albumSetUnlockCost}
                    onSponsorshipChange={albumSetAllowSponsorship}
                    onReleaseYearChange={albumSetReleaseYear}
                    genreOptions={genreOptions}
                    releaseTypeOptions={releaseTypeOptions}
                    unlockCostOptions={unlockCostOptions}
                    sponsorshipOptions={sponsorshipOptions}
                />
            )}
        </>
    );
};
