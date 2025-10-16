import React from 'react';
import { VStack } from '@chakra-ui/react';
import { UploadedFileCard } from './UploadedFileCard';
import { Artist } from './Artist';

interface TrackItemProps {
    // File props
    fileName: string;
    fileSize: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file?: File;
    showIndex?: number;
    onRemove?: () => void;

    // Track title props
    trackTitle: string;
    onTrackTitleChange: (title: string) => void;

    // Artist props
    selectedArtists?: string[];
    onAddArtist?: (artist: string) => void;
    onUpdateArtist?: (index: number, artist: string) => void;
    onRemoveArtist?: (index: number) => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
    fileName,
    fileSize,
    progress,
    status,
    file,
    showIndex,
    onRemove,
    trackTitle,
    onTrackTitleChange,
    selectedArtists,
    onAddArtist,
    onUpdateArtist,
    onRemoveArtist,
}) => {
    return (
        <VStack align="stretch" gap={4}>
            {/* Uploaded File Card */}
            <UploadedFileCard
                fileName={fileName}
                fileSize={fileSize}
                progress={progress}
                status={status}
                onRemove={onRemove}
                showIndex={showIndex}
                type="audio"
                file={file}
            />

            {/* Featured Artists Section */}
            <Artist
                trackTitle={trackTitle}
                onTrackTitleChange={onTrackTitleChange}
                selectedArtists={selectedArtists}
                onAddArtist={onAddArtist}
                onUpdateArtist={onUpdateArtist}
                onRemoveArtist={onRemoveArtist}
                showAddFeature={true}
            />
        </VStack>
    );
};
