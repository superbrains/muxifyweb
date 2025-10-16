import React from 'react';
import { Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { MixTab } from './MixTab';
import { AlbumTab } from './AlbumTab';
import { useUploadStore } from '@upload/store/useUploadStore';
import { useUploadMusicStore } from '../store/useUploadMusicStore';

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
    // Upload session store (separate slices for mix and album)
    const {
        mix,
        album,
        mixAddTrack,
        mixUpdateTrack,
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
        albumUpdateTrack,
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

    const handleAudioFileSelect = (file: File) => {
        const newTrack: Track = {
            id: Date.now().toString(),
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            progress: 0,
            status: 'uploading',
            file,
            title: '',
        };

        if (albumTab === 'mix') {
            mixAddTrack(newTrack);
        } else {
            albumAddTrack(newTrack);
        }

        // Simulate upload
        simulateUpload(newTrack.id);
    };

    const handleCoverArtSelect = (file: File) => {
        const newCoverArt: UploadFile = {
            id: Date.now().toString(),
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            progress: 100,
            status: 'ready',
            file,
        };

        if (albumTab === 'mix') {
            mixSetCoverArt(newCoverArt);
        } else {
            albumSetCoverArt(newCoverArt);
        }
    };

    const simulateUpload = (trackId: string) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (albumTab === 'mix') {
                mixUpdateTrack(trackId, {
                    progress,
                    status: progress >= 100 ? 'ready' : 'uploading',
                });
            } else {
                albumUpdateTrack(trackId, {
                    progress,
                    status: progress >= 100 ? 'ready' : 'uploading',
                });
            }
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 300);
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
        navigate('/upload/review');
    };

    return (
        <>
            {/* Sub Tabs and Continue Button */}
            <Flex justify="space-between" align="center" mb={{ base: 5, md: 7 }}>
                <HStack gap={0}>
                    <Button
                        size="xs"
                        variant="ghost"
                        bg={albumTab === 'mix' ? 'primary.500' : 'transparent'}
                        color={albumTab === 'mix' ? 'white' : 'gray.500'}
                        fontSize="11px"
                        fontWeight={albumTab === 'mix' ? 'semibold' : 'medium'}
                        px={4}
                        h="auto"
                        w="90px"
                        py={2}
                        borderRadius="md"
                        onClick={() => setAlbumTab('mix')}
                        _hover={{ bg: albumTab === 'mix' ? 'primary.600' : 'transparent' }}
                    >
                        Mix
                    </Button>
                    <Button
                        size="xs"
                        variant="solid"
                        bg={albumTab === 'album' ? 'primary.500' : 'transparent'}
                        color={albumTab === 'album' ? 'white' : 'gray.500'}
                        fontSize="11px"
                        fontWeight={albumTab === 'album' ? 'semibold' : 'medium'}
                        px={4}
                        h="auto"
                        w="90px"
                        py={2}
                        borderRadius="md"
                        onClick={() => setAlbumTab('album')}
                        _hover={{ bg: albumTab === 'album' ? 'primary.600' : 'transparent' }}
                    >
                        Album
                    </Button>
                </HStack>

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
                    onClick={handleContinue}
                >
                    Continue
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
                    onCoverArtSelect={handleCoverArtSelect}
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
                    onCoverArtSelect={handleCoverArtSelect}
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
