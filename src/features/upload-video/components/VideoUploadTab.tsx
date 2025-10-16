import React, { useState } from 'react';
import { Box, Button, Flex, VStack, Input, Text, Icon } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import {
    FileUploadArea,
    UploadedFileCard,
    Artist,
    FormSelect,
    ReleaseYearInput,
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

// Artist interface removed - now using string[] for selectedArtists

const genreOptions = [
    { label: 'Afrobeat', value: 'afrobeat' },
    { label: 'Hip Hop', value: 'hip-hop' },
    { label: 'Pop', value: 'pop' },
    { label: 'R&B', value: 'rnb' },
];

const videoTypeOptions = [
    { label: 'Music Video', value: 'music-video' },
    { label: 'Behind the Scenes', value: 'bts' },
    { label: 'Live Performance', value: 'live' },
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

export const VideoUploadTab: React.FC = () => {
    const [videoFile, setVideoFile] = useState<UploadFile | null>(null);
    const [thumbnail, setThumbnail] = useState<UploadFile | null>(null);
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [videoTitle, setVideoTitle] = useState('');

    // Form state
    const [videoType, setVideoType] = useState<string[]>(['music-video']);
    const [genre, setGenre] = useState<string[]>(['afrobeat']);
    const [unlockCost, setUnlockCost] = useState<string[]>(['100.00']);
    const [allowSponsorship, setAllowSponsorship] = useState<string[]>(['yes']);
    const [releaseYear, setReleaseYear] = useState('');

    const handleVideoFileSelect = (file: File) => {
        const newVideo: UploadFile = {
            id: Date.now().toString(),
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            progress: 0,
            status: 'uploading',
            file,
        };

        setVideoFile(newVideo);

        // Simulate upload
        simulateUpload(newVideo.id);
    };

    const handleThumbnailSelect = (file: File) => {
        const newThumbnail: UploadFile = {
            id: Date.now().toString(),
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            progress: 100,
            status: 'ready',
            file,
        };

        setThumbnail(newThumbnail);
    };

    const simulateUpload = (fileId: string) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5; // Slower for video files
            if (videoFile && videoFile.id === fileId) {
                setVideoFile((prev) =>
                    prev
                        ? { ...prev, progress, status: progress >= 100 ? 'ready' : 'uploading' }
                        : prev
                );
            }
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 500);
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoTitle('');
    };

    const handleRemoveThumbnail = () => {
        setThumbnail(null);
    };

    const handleAddArtist = (artist: string) => {
        setSelectedArtists((prev) => [...prev, artist]);
    };

    const handleUpdateArtist = (index: number, artist: string) => {
        setSelectedArtists((prev) => {
            const updated = [...prev];
            updated[index] = artist;
            return updated;
        });
    };

    const handleRemoveArtist = (index: number) => {
        setSelectedArtists((prev) => prev.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
        // TODO: Implement continue logic
        console.log({
            videoFile,
            thumbnail,
            videoTitle,
            selectedArtists,
            videoType,
            genre,
            unlockCost,
            allowSponsorship,
            releaseYear,
        });
    };

    return (
        <>
            <Flex justify="flex-end" align="center" mb={{ base: 4, md: 6 }}>
                <Button
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="11px"
                    fontWeight="semibold"
                    px={{ base: 4, md: 6 }}
                    h="34px"
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={handleContinue}
                >
                    Continue
                    <Icon as={FiArrowRight} boxSize={3.5} ml={2} />
                </Button>
            </Flex>

            <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                {/* Left Section */}
                <Box flex="1" minW={0}>
                    <VStack align="stretch" gap={4}>
                        {/* Video Upload */}
                        <FileUploadArea
                            accept=".mp4,.mov,.avi,.mkv"
                            maxSize={500}
                            onFileSelect={handleVideoFileSelect}
                            title="Upload video file"
                            supportedFormats="Support MP4, MOV, AVI, MKV"
                            Icon={UploadFileIcon}
                        />

                        {/* Video File Card */}
                        {videoFile && (
                            <Box>
                                <UploadedFileCard
                                    fileName={videoFile.name}
                                    fileSize={videoFile.size}
                                    progress={videoFile.progress}
                                    status={videoFile.status}
                                    onRemove={handleRemoveVideo}
                                    type="video"
                                />

                                {videoFile.status === 'ready' && (
                                    <Box mt={3}>
                                        <Text fontSize="9px" fontWeight="medium" color="gray.700" mb={1}>
                                            Video Title
                                        </Text>
                                        <Input
                                            placeholder="Video title"
                                            value={videoTitle}
                                            onChange={(e) => setVideoTitle(e.target.value)}
                                            size="sm"
                                            fontSize="9px"
                                            h="32px"
                                            borderColor="gray.200"
                                            _placeholder={{ fontSize: '9px', color: 'gray.400' }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Artist Search */}
                        <Artist
                            selectedArtists={selectedArtists}
                            onAddArtist={handleAddArtist}
                            onUpdateArtist={handleUpdateArtist}
                            onRemoveArtist={handleRemoveArtist}
                            showAddFeature={true}
                        />
                    </VStack>
                </Box>

                {/* Right Section */}
                <Box w={{ base: 'full', lg: '380px' }} flexShrink={0}>
                    <VStack align="stretch" gap={4}>
                        {/* Thumbnail Upload */}
                        <Box>
                            <FileUploadArea
                                accept=".jpg,.jpeg,.png"
                                maxSize={10}
                                onFileSelect={handleThumbnailSelect}
                                title="Video Thumbnail"
                                supportedFormats="Support JPG, JPEG, PNG"
                                Icon={UploadImageIcon}
                            />
                            {thumbnail && (
                                <Box mt={3}>
                                    <UploadedFileCard
                                        fileName={thumbnail.name}
                                        fileSize={thumbnail.size}
                                        progress={thumbnail.progress}
                                        status={thumbnail.status}
                                        onRemove={handleRemoveThumbnail}
                                        type="image"
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Form Fields */}
                        <FormSelect
                            label="Video Type"
                            options={videoTypeOptions}
                            value={videoType}
                            onChange={setVideoType}
                        />

                        <FormSelect
                            label="Genre"
                            options={genreOptions}
                            value={genre}
                            onChange={setGenre}
                        />

                        <FormSelect
                            label="Unlock Cost"
                            options={unlockCostOptions}
                            value={unlockCost}
                            onChange={setUnlockCost}
                        />

                        <FormSelect
                            label="Allow Video Sponsorship?"
                            options={sponsorshipOptions}
                            value={allowSponsorship}
                            onChange={setAllowSponsorship}
                        />

                        <ReleaseYearInput value={releaseYear} onChange={setReleaseYear} />
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};
