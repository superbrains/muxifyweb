import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, VStack, Text, Icon, HStack, Grid, Image } from '@chakra-ui/react';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileUploadArea, FormSelect } from '@upload/components';
import { UploadFileIcon, UploadImageIcon, GalleryIcon } from '@/shared/icons/CustomIcons';
import { useUploadVideoStore } from '../store/useUploadVideoStore';
import { useUploadStore } from '@upload/store/useUploadStore';
import { VideoPlayer } from './VideoPlayer';
import { URLInput } from '@shared/components';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file: File;
    url?: string;
}

const releaseTypeOptions = [
    { label: 'New Release', value: 'new-release' },
    { label: 'Re-release', value: 're-release' },
    { label: 'Remix', value: 'remix' },
];

const unlockCostOptions = [
    { label: '<₦100.00', value: '100.00' },
    { label: '₦200.00', value: '200.00' },
    { label: '₦500.00', value: '500.00' },
];

const sponsorshipOptions = [
    { label: 'yes', value: 'yes' },
    { label: 'no', value: 'no' },
];


// Selected Thumbnail Detail Card Component
const SelectedThumbnailDetailCard: React.FC<{ thumbnail: UploadFile }> = ({ thumbnail }) => {
    if (!thumbnail) return null;

    return (
        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={3} mt={3}>
            <HStack justify="space-between" align="center">

                <VStack align="start" gap={0} flex="1" ml={2}>
                    <Text fontSize="12px" color="gray.900" fontWeight="normal">
                        {thumbnail.name}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {thumbnail.size}
                    </Text>
                </VStack>
                <GalleryIcon boxSize={6} color="primary.500" />
            </HStack>
        </Box>
    );
};

// Thumbnail Grid Component
const ThumbnailGrid: React.FC<{
    thumbnails: UploadFile[];
    onRemove: (index: number) => void;
    selectedThumbnailIndex: number | null;
    onSelect: (index: number) => void;
}> = ({ thumbnails, onRemove, selectedThumbnailIndex, onSelect }) => {
    console.log('[ThumbnailGrid] Rendering with thumbnails count:', thumbnails.length);
    console.log('[ThumbnailGrid] Thumbnails:', thumbnails.map(t => ({ id: t.id, name: t.name })));

    // Only show grid if there are thumbnails
    if (thumbnails.length === 0) {
        return null;
    }

    return (
        <Grid templateColumns="repeat(4, 1fr)" gap={2} mt={3}>
            {thumbnails.map((thumbnail, index) => (
                <Box
                    key={thumbnail.id}
                    w="full"
                    h="80px"
                    bg="gray.100"
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                    border="2px solid"
                    borderColor={index === selectedThumbnailIndex ? 'primary.500' : 'transparent'}
                    cursor="pointer"
                    onClick={() => onSelect(index)}
                    _hover={{
                        borderColor: index === selectedThumbnailIndex ? 'primary.500' : 'gray.300'
                    }}
                >
                    <Image
                        src={thumbnail.url}
                        alt={`Thumbnail ${index + 1}`}
                        w="full"
                        h="full"
                        objectFit="cover"
                    />
                    <Icon
                        as={MdClose}
                        position="absolute"
                        top={1}
                        right={1}
                        boxSize={3}
                        color="white"
                        bg="rgba(0,0,0,0.6)"
                        borderRadius="full"
                        p="2px"
                        cursor="pointer"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent selecting when clicking remove
                            onRemove(index);
                        }}
                        _hover={{ bg: 'rgba(0,0,0,0.8)' }}
                    />
                </Box>
            ))}
        </Grid>
    );
};

export const VideoUploadTab: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setActiveTab } = useUploadStore();
    const { isEditing } = useUploadStore();
    const {
        videoFile,
        thumbnails,
        trackLinks,
        releaseType,
        unlockCost,
        allowSponsorship,
        setVideoFile,
        addThumbnail,
        removeThumbnail,
        addTrackLink,
        updateTrackLink,
        removeTrackLink,
        setReleaseType,
        setUnlockCost,
        setAllowSponsorship,
    } = useUploadVideoStore();

    // State for selected thumbnail
    const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<number | null>(null);

    // Effect to manage selected thumbnail index
    useEffect(() => {
        if (thumbnails.length > 0 && selectedThumbnailIndex === null) {
            // Auto-select first thumbnail when thumbnails are available
            setSelectedThumbnailIndex(0);
        } else if (thumbnails.length === 0 && selectedThumbnailIndex !== null) {
            // Reset selection when no thumbnails
            setSelectedThumbnailIndex(null);
        } else if (selectedThumbnailIndex !== null && selectedThumbnailIndex >= thumbnails.length) {
            // Adjust selection if current index is out of bounds
            setSelectedThumbnailIndex(thumbnails.length > 0 ? thumbnails.length - 1 : null);
        }
    }, [thumbnails.length, selectedThumbnailIndex]);

    const handleVideoFileSelect = () => {
        // FileUploadArea will handle the upload progress internally
    };

    const handleVideoFileReady = (file: UploadFile) => {
        const videoWithUrl = {
            ...file,
            url: URL.createObjectURL(file.file),
        };
        setVideoFile(videoWithUrl);
    };

    const handleThumbnailSelect = () => {
        console.log('[VideoUploadTab] handleThumbnailSelect called');
        // FileUploadArea will handle the upload progress internally
    };

    const handleThumbnailReady = (file: UploadFile) => {
        console.log('[VideoUploadTab] handleThumbnailReady called for:', file.id, file.name);
        const thumbnailWithUrl = {
            ...file,
            url: URL.createObjectURL(file.file),
        };
        console.log('[VideoUploadTab] Adding thumbnail to store:', thumbnailWithUrl.id);
        addThumbnail(thumbnailWithUrl);
    };

    const handleRemoveVideo = () => {
        if (videoFile?.url) {
            URL.revokeObjectURL(videoFile.url);
        }
        setVideoFile(null);
    };

    const handleRemoveThumbnail = (index: number) => {
        console.log('[VideoUploadTab] handleRemoveThumbnail called for index:', index);
        if (thumbnails[index]?.url) {
            URL.revokeObjectURL(thumbnails[index].url!);
        }
        removeThumbnail(index);
        // The useEffect will handle adjusting the selected index
    };

    const handleSelectThumbnail = useCallback((index: number) => {
        setSelectedThumbnailIndex(index);
    }, []);

    // Handle track link change
    const handleTrackLinkChange = (index: number, value: string) => {
        updateTrackLink(index, value);
    };

    const handleContinue = () => {
        console.log({
            videoFile,
            thumbnails,
            trackLinks,
            releaseType,
            unlockCost,
            allowSponsorship,
        });

        // Set active tab to video before navigating
        setActiveTab('video');

        // Build review URL with videoId if editing
        const videoId = searchParams.get('videoId');
        const reviewUrl = isEditing && videoId
            ? `/upload/review?videoId=${videoId}`
            : '/upload/review';

        navigate(reviewUrl);
    };

    const handleSaveChanges = () => {
        // Navigate to review page just like Continue
        handleContinue();
    };

    return (
        <>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="18px" fontWeight="semibold" color="gray.900">
                    Upload new video
                </Text>
                <Button
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="11px"
                    fontWeight="semibold"
                    px={6}
                    h="34px"
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={isEditing ? handleSaveChanges : handleContinue}
                >
                    {isEditing ? 'Save Changes' : 'Continue'}
                    <Icon as={FiArrowRight} boxSize={3.5} ml={2} />
                </Button>
            </Flex>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                {/* Left Section */}
                <Box flex="1" minW={0}>
                    <VStack align="stretch" gap={6}>
                        {/* Upload a new file */}
                        <Box>
                            <FileUploadArea
                                accept=".mp4,.mov"
                                maxSize={50}
                                onFileSelect={handleVideoFileSelect}
                                onFileReady={handleVideoFileReady}
                                title="Upload a new file"
                                supportedFormats="Support MP4, Mov"
                                Icon={UploadFileIcon}
                                fileType="video"
                            />

                            {/* Video Player */}
                            {videoFile && (
                                <Box mt={4}>
                                    <VideoPlayer videoFile={videoFile} onRemove={handleRemoveVideo} />
                                </Box>
                            )}
                        </Box>

                        {/* Song Credits */}
                        <Box>
                            <HStack justify="space-between" align="center" mb={2}>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900">
                                    Track Link{trackLinks.length > 1 ? 's' : ''}
                                </Text>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    h="32px"
                                    px={4}
                                    fontSize="11px"
                                    fontWeight="medium"
                                    borderColor="gray.300"
                                    borderRadius="full"
                                    color="gray.700"
                                    _hover={{ bg: 'gray.50' }}
                                    onClick={addTrackLink}
                                >
                                    <Icon as={FiPlus} boxSize={3} mr={1} />
                                    Add New
                                </Button>
                            </HStack>

                            <VStack align="stretch" gap={3}>
                                {trackLinks.map((link, index) => (
                                    <Box key={index}>
                                        <HStack gap={2}>
                                            <Box flex="1">
                                                <URLInput
                                                    placeholder="https://muxify.app/...."
                                                value={link}
                                                    onChange={(value) => handleTrackLinkChange(index, value)}
                                                size="sm"
                                                fontSize="11px"
                                                h="40px"
                                                borderRadius="md"
                                                />
                                            </Box>
                                            {trackLinks.length > 1 && (
                                                <Icon
                                                    as={MdClose}
                                                    boxSize={5}
                                                    color="gray.600"
                                                    cursor="pointer"
                                                    onClick={() => removeTrackLink(index)}
                                                    _hover={{ color: 'red.500' }}
                                                />
                                            )}
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        </Box>

                    </VStack>
                </Box>

                {/* Right Section */}
                <Box flex="1" w={{ base: 'full', lg: '380px' }} flexShrink={0}>
                    <VStack align="stretch" gap={6}>
                        {/* Video Thumbnail */}
                        <Box>
                            <FileUploadArea
                                accept=".jpg,.jpeg,.png,.gif"
                                maxSize={50}
                                onFileSelect={handleThumbnailSelect}
                                onFileReady={handleThumbnailReady}
                                title="Video Thumbnail"
                                supportedFormats="Support JPG, JPEG, PNG, GIF"
                                Icon={UploadImageIcon}
                                fileType="image"
                            />

                            {/* Selected Thumbnail Detail Card - Only show when thumbnails exist and one is selected */}
                            {thumbnails.length > 0 && selectedThumbnailIndex !== null && (
                                <SelectedThumbnailDetailCard
                                    thumbnail={thumbnails[selectedThumbnailIndex]}
                                />
                            )}

                            {/* Thumbnail Grid - Only show when there are ready thumbnails */}
                            {thumbnails.length > 0 && (
                                <ThumbnailGrid
                                    thumbnails={thumbnails}
                                    onRemove={handleRemoveThumbnail}
                                    selectedThumbnailIndex={selectedThumbnailIndex}
                                    onSelect={handleSelectThumbnail}
                                />
                            )}
                        </Box>

                        {/* Form Fields */}
                        <FormSelect
                            label="Release Type"
                            options={releaseTypeOptions}
                            value={releaseType}
                            onChange={setReleaseType}
                        />

                        <FormSelect
                            label="Unlock Cost"
                            options={unlockCostOptions}
                            value={unlockCost}
                            onChange={setUnlockCost}
                        />

                        <FormSelect
                            label="Allow Sponsorship?"
                            options={sponsorshipOptions}
                            value={allowSponsorship}
                            onChange={setAllowSponsorship}
                        />
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};
