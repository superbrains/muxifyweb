import React from 'react';
import { Box, Flex, VStack, Text } from '@chakra-ui/react';
import {
    FileUploadArea,
    UploadedFileCard,
    FormSelect,
    ReleaseYearInput,
    Artist,
} from '@upload/components';
import { AuthedImage } from '@shared/components/AuthedImage';
import { UploadFileIcon, UploadImageIcon } from '@/shared/icons/CustomIcons';
import { LyricsField } from './LyricsField';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file?: File;
    existingUrl?: string;
    remoteId?: string;
}

interface MixTabProps {
    tracks: UploadFile[];
    coverArt: UploadFile | null;
    trackTitle: string;
    selectedArtists: string[];
    genre: string[];
    releaseType: string[];
    unlockCost: string[];
    allowSponsorship: string[];
    releaseYear: string;
    lyrics: string;
    onAudioFileSelect: (file: File) => void;
    onAudioFileReady: (file: UploadFile) => void;
    onCoverArtSelect: (file: File) => void;
    onCoverArtReady: (file: UploadFile) => void;
    onRemoveTrack: (trackId: string) => void;
    onRemoveCoverArt: () => void;
    onTrackTitleChange: (value: string) => void;
    onAddArtist: (artist: string) => void;
    onUpdateArtist: (index: number, artist: string) => void;
    onRemoveArtist: (index: number) => void;
    onGenreChange: (value: string[]) => void;
    onReleaseTypeChange: (value: string[]) => void;
    onUnlockCostChange: (value: string[]) => void;
    onSponsorshipChange: (value: string[]) => void;
    onReleaseYearChange: (value: string) => void;
    onLyricsChange: (value: string) => void;
    genreOptions: { label: string; value: string }[];
    releaseTypeOptions: { label: string; value: string }[];
    unlockCostOptions: { label: string; value: string }[];
    sponsorshipOptions: { label: string; value: string }[];
    /** Editing an existing track: the audio binary can't be replaced, only shown. */
    isEditing?: boolean;
}

export const MixTab: React.FC<MixTabProps> = ({
    tracks,
    coverArt,
    trackTitle,
    selectedArtists,
    genre,
    releaseType,
    unlockCost,
    allowSponsorship,
    releaseYear,
    lyrics,
    onAudioFileSelect,
    onAudioFileReady,
    onCoverArtSelect,
    onCoverArtReady,
    onRemoveTrack,
    onRemoveCoverArt,
    onTrackTitleChange,
    onAddArtist,
    onUpdateArtist,
    onRemoveArtist,
    onGenreChange,
    onReleaseTypeChange,
    onUnlockCostChange,
    onSponsorshipChange,
    onReleaseYearChange,
    onLyricsChange,
    genreOptions,
    releaseTypeOptions,
    unlockCostOptions,
    sponsorshipOptions,
    isEditing = false,
}) => {

    return (
        <VStack align="stretch" gap={5}>
        <Flex gap={5} direction={{ base: 'column', lg: 'row' }}>
            {/* Left Section */}
            <Box flex="1" minW={0}>
                <VStack align="stretch" gap={5}>
                    {/* File Upload — hidden when editing: the audio binary can't be replaced. */}
                    {!isEditing && (
                        <FileUploadArea
                            accept=".mp3,.m4a"
                            maxSize={50}
                            onFileSelect={onAudioFileSelect}
                            onFileReady={onAudioFileReady}
                            title="Upload a new file"
                            supportedFormats="Support M4A, MP3"
                            Icon={UploadFileIcon}
                            fileType="audio"
                        />
                    )}

                    {/* Ready Tracks */}
                    {tracks.map((track) => {
                        const isExisting = !track.file;
                        return (
                            <Box key={track.id}>
                                <UploadedFileCard
                                    fileName={track.name}
                                    fileSize={track.size}
                                    progress={track.progress}
                                    status={track.status}
                                    // Existing (already-uploaded) audio can't be removed/replaced.
                                    onRemove={isExisting ? undefined : () => onRemoveTrack(track.id)}
                                    type="audio"
                                    file={track.file}
                                />
                                {isExisting && (
                                    <Text fontSize="11px" color="gray.500" mt={1}>
                                        This is the current audio file. It can&apos;t be replaced after upload.
                                    </Text>
                                )}
                            </Box>
                        );
                    })}

                    {/* Album Art Cover */}
                    <Box>
                        <FileUploadArea
                            accept=".jpg,.jpeg,.png,.gif"
                            maxSize={50}
                            onFileSelect={onCoverArtSelect}
                            onFileReady={onCoverArtReady}
                            title="Album Art Cover"
                            supportedFormats="Support JPG, JPEG, PNG, GIF"
                            Icon={UploadImageIcon}
                            fileType="image"
                        />
                        {coverArt && (
                            <Box mt={3}>
                                {coverArt.existingUrl && !coverArt.file ? (
                                    // Existing cover art rendered from its (auth-gated) proxy URL.
                                    <Box
                                        w="160px"
                                        aspectRatio={1}
                                        borderRadius="lg"
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor="gray.200"
                                    >
                                        <AuthedImage
                                            src={coverArt.existingUrl}
                                            w="full"
                                            h="full"
                                            objectFit="cover"
                                        />
                                    </Box>
                                ) : (
                                    <UploadedFileCard
                                        fileName={coverArt.name}
                                        fileSize={coverArt.size}
                                        progress={coverArt.progress}
                                        status={coverArt.status}
                                        onRemove={onRemoveCoverArt}
                                        type="image"
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </VStack>
            </Box>

            {/* Right Section */}
            <Box flex="1" w={{ base: 'full', lg: '400px' }} flexShrink={0}>
                <VStack align="stretch" gap={5}>
                    {/* Track Title and Artists */}
                    <Artist
                        trackTitle={trackTitle}
                        onTrackTitleChange={onTrackTitleChange}
                        selectedArtists={selectedArtists}
                        onAddArtist={onAddArtist}
                        onUpdateArtist={onUpdateArtist}
                        onRemoveArtist={onRemoveArtist}
                        showAddFeature={true}
                    />

                    {/* Genre */}
                    <FormSelect
                        label="Genre"
                        options={genreOptions}
                        value={genre}
                        onChange={onGenreChange}
                    />

                    {/* Release Type */}
                    <FormSelect
                        label="Release Type"
                        options={releaseTypeOptions}
                        value={releaseType}
                        onChange={onReleaseTypeChange}
                    />

                    {/* Unlock Cost */}
                    <FormSelect
                        label="Unlock Cost"
                        options={unlockCostOptions}
                        value={unlockCost}
                        onChange={onUnlockCostChange}
                    />

                    {/* Allow Song Sponsorship */}
                    <FormSelect
                        label="Allow Song Sponsorship?"
                        options={sponsorshipOptions}
                        value={allowSponsorship}
                        onChange={onSponsorshipChange}
                    />

                    {/* Release Year */}
                    <ReleaseYearInput value={releaseYear} onChange={onReleaseYearChange} />
                </VStack>
            </Box>
        </Flex>

            {/* Lyrics — full width below both columns since lyrics need room */}
            <LyricsField value={lyrics} onChange={onLyricsChange} />
        </VStack>
    );
};

