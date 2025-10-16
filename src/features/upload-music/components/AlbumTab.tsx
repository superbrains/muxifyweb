import React from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';
import {
    FileUploadArea,
    UploadedFileCard,
    FormSelect,
    ReleaseYearInput,
    TrackItem,
} from '@upload/components';
import { UploadFileIcon, UploadImageIcon } from '@/shared/icons/CustomIcons';

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


interface AlbumTabProps {
    tracks: Track[];
    coverArt: UploadFile | null;
    trackTitles: Record<string, string>;
    trackArtists: Record<string, string[]>;
    genre: string[];
    releaseType: string[];
    unlockCost: string[];
    allowSponsorship: string[];
    releaseYear: string;
    onAudioFileSelect: (file: File) => void;
    onCoverArtSelect: (file: File) => void;
    onRemoveTrack: (trackId: string) => void;
    onRemoveCoverArt: () => void;
    onTrackTitleChange: (trackId: string, title: string) => void;
    onAddTrackArtist: (trackId: string, artist: string) => void;
    onUpdateTrackArtist: (trackId: string, index: number, artist: string) => void;
    onRemoveTrackArtist: (trackId: string, index: number) => void;
    onGenreChange: (value: string[]) => void;
    onReleaseTypeChange: (value: string[]) => void;
    onUnlockCostChange: (value: string[]) => void;
    onSponsorshipChange: (value: string[]) => void;
    onReleaseYearChange: (value: string) => void;
    genreOptions: { label: string; value: string }[];
    releaseTypeOptions: { label: string; value: string }[];
    unlockCostOptions: { label: string; value: string }[];
    sponsorshipOptions: { label: string; value: string }[];
}

export const AlbumTab: React.FC<AlbumTabProps> = ({
    tracks,
    coverArt,
    trackTitles,
    trackArtists,
    genre,
    releaseType,
    unlockCost,
    allowSponsorship,
    releaseYear,
    onAudioFileSelect,
    onCoverArtSelect,
    onRemoveTrack,
    onRemoveCoverArt,
    onTrackTitleChange,
    onAddTrackArtist,
    onUpdateTrackArtist,
    onRemoveTrackArtist,
    onGenreChange,
    onReleaseTypeChange,
    onUnlockCostChange,
    onSponsorshipChange,
    onReleaseYearChange,
    genreOptions,
    releaseTypeOptions,
    unlockCostOptions,
    sponsorshipOptions,
}) => {
    const uploadingTracks = tracks.filter(track => track.status === 'uploading');
    const readyTracks = tracks.filter(track => track.status === 'ready');

    return (
        <Flex gap={5} direction={{ base: 'column', lg: 'row' }}>
            {/* Left Section */}
            <Box flex="1" minW={0}>
                <VStack align="stretch" gap={5}>
                    {/* File Upload */}
                    <FileUploadArea
                        accept=".mp3,.m4a"
                        maxSize={50}
                        onFileSelect={onAudioFileSelect}
                        title="Upload a new file"
                        supportedFormats="Support M4A, MP3"
                        Icon={UploadFileIcon}
                    />

                    {/* Uploading Files */}
                    {uploadingTracks.map((track) => (
                        <UploadedFileCard
                            key={track.id}
                            fileName={track.name}
                            fileSize={track.size}
                            progress={track.progress}
                            status={track.status}
                            onRemove={() => onRemoveTrack(track.id)}
                            type="audio"
                            file={track.file}
                        />
                    ))}

                    {/* Uploaded Items */}
                    <VStack align="stretch" gap={4}>
                        {readyTracks.map((track, index) => (
                            <TrackItem
                                key={track.id}
                                fileName={track.name}
                                fileSize={track.size}
                                progress={track.progress}
                                status={track.status}
                                file={track.file}
                                showIndex={index + 1}
                                onRemove={() => onRemoveTrack(track.id)}
                                trackTitle={trackTitles[track.id] || ''}
                                onTrackTitleChange={(title) => onTrackTitleChange(track.id, title)}
                                selectedArtists={trackArtists[track.id] || []}
                                onAddArtist={(artist) => onAddTrackArtist(track.id, artist)}
                                onUpdateArtist={(index, artist) => onUpdateTrackArtist(track.id, index, artist)}
                                onRemoveArtist={(artistIndex) => onRemoveTrackArtist(track.id, artistIndex)}
                            />
                        ))}
                    </VStack>

                </VStack>
            </Box>

            {/* Right Section */}
            <Box flex="1" w={{ base: 'full', lg: '400px' }} flexShrink={0}>
                <VStack align="stretch" gap={5}>
                    {/* Cover Art Upload */}
                    <Box>
                        <FileUploadArea
                            accept=".jpg,.jpeg,.png,.gif"
                            maxSize={50}
                            onFileSelect={onCoverArtSelect}
                            title="Album Art Cover"
                            supportedFormats="Support JPG, JPEG, PNG, GIF"
                            Icon={UploadImageIcon}
                        />
                        {coverArt && (
                            <Box mt={3}>
                                <UploadedFileCard
                                    fileName={coverArt.name}
                                    fileSize={coverArt.size}
                                    progress={coverArt.progress}
                                    status={coverArt.status}
                                    onRemove={onRemoveCoverArt}
                                    type="image"
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Form Fields */}
                    <FormSelect
                        label="Genre"
                        options={genreOptions}
                        value={genre}
                        onChange={onGenreChange}
                    />

                    <FormSelect
                        label="Release Type"
                        options={releaseTypeOptions}
                        value={releaseType}
                        onChange={onReleaseTypeChange}
                    />

                    <FormSelect
                        label="Unlock Cost"
                        options={unlockCostOptions}
                        value={unlockCost}
                        onChange={onUnlockCostChange}
                    />

                    <FormSelect
                        label="Allow Song Sponsorship?"
                        options={sponsorshipOptions}
                        value={allowSponsorship}
                        onChange={onSponsorshipChange}
                    />

                    <ReleaseYearInput value={releaseYear} onChange={onReleaseYearChange} />
                </VStack>
            </Box>
        </Flex>
    );
};

