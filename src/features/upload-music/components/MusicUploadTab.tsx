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
    
    // Upload session store — only the Mix slice is used here. The Album sub-tab funnels into
    // the dedicated draft-album editor at /upload/album/:id and manages its own state.
    const {
        mix,
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

    // Mix-only computed state.
    const tracks = mix.tracks;
    const coverArt = mix.coverArt;
    const trackTitle = mix.trackTitle;
    const selectedArtists = mix.selectedArtists;
    const genre = mix.genre;
    const releaseType = mix.releaseType;
    const unlockCost = mix.unlockCost;
    const allowSponsorship = mix.allowSponsorship;
    const releaseYear = mix.releaseYear;

    const handleAudioFileSelect = () => {
        // FileUploadArea will handle the upload progress internally
    };

    const handleAudioFileReady = (file: UploadFile) => {
        const newTrack: Track = {
            ...file,
            title: '',
        };
        mixAddTrack(newTrack);
    };

    const handleCoverArtSelect = () => {
        // FileUploadArea will handle the upload progress internally
    };

    const handleCoverArtReady = (file: UploadFile) => {
        mixSetCoverArt(file);
    };

    const handleRemoveTrack = (trackId: string) => {
        mixRemoveTrack(trackId);
    };

    const handleRemoveCoverArt = () => {
        mixSetCoverArt(null);
    };

    const handleContinue = () => {
        setActiveTab('music');

        setReviewTracks(mix.tracks);
        setReviewCoverArt(mix.coverArt);
        setReviewSelectedArtists(mix.selectedArtists.map(name => ({ id: Date.now().toString(), name, role: 'artist' })));
        setReviewTrackTitles({ [mix.tracks[0]?.id || '']: mix.trackTitle });
        setReviewGenre(mix.genre);
        setReviewReleaseType(mix.releaseType);
        setReviewUnlockCost(mix.unlockCost);
        setReviewAllowSponsorship(mix.allowSponsorship);
        setReviewReleaseYear(mix.releaseYear);

        const mixId = searchParams.get('mixId');
        let reviewUrl = '/upload/review';
        if (isEditing && editingId && mixId) {
            reviewUrl += `?mixId=${mixId}`;
        }
        navigate(reviewUrl);
    };

    const handleSaveChanges = () => {
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

                {/* The album sub-tab uses its own draft → publish flow, no Continue here. */}
                {albumTab !== 'album' && (
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
                )}
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
                /* Album tab funnels to the dedicated draft → tracks → publish editor.
                   The legacy AlbumTab props are no longer used here. */
                <AlbumTab />
            )}
        </>
    );
};
