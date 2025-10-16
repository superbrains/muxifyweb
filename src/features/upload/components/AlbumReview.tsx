import React, { useState } from 'react';
import {
    Box,
    Flex,
    Icon,
    Image,
    Text,
    VStack,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    SelectContent,
    SelectItem,
    createListCollection,
    HStack,
} from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { ReviewTrackItem } from './ReviewTrackItem';

export const AlbumReview: React.FC = () => {
    const { album } = useUploadMusicStore();
    const {
        tracks,
        coverArt,
        genre,
        releaseType,
        unlockCost,
        allowSponsorship,
        releaseYear,
        trackTitles,
        selectedArtists,
    } = album;

    console.log('[AlbumReview] Rendering with:', {
        tracksCount: tracks.length,
        tracks,
        coverArt: coverArt?.name,
        trackTitles,
        selectedArtists,
    });

    const [releaseOption, setReleaseOption] = useState<string[]>(['now']);
    const [selectedGenre, setSelectedGenre] = useState<string[]>(genre);

    const releaseOptions = createListCollection({
        items: [
            { label: 'Now', value: 'now' },
            { label: 'Schedule Release', value: 'schedule' },
        ],
    });

    const genreOptions = createListCollection({
        items: [
            { label: 'Afrobeat', value: 'afrobeat' },
            { label: 'Hip Hop', value: 'hip-hop' },
            { label: 'Pop', value: 'pop' },
            { label: 'R&B', value: 'rnb' },
        ],
    });

    const readyTracks = tracks.filter(track => track.status === 'ready');
    const firstTrack = tracks[0];
    const coverArtUrl = coverArt ? URL.createObjectURL(coverArt.file) : '';

    const releaseTypeLabels: Record<string, string> = {
        'new-release': 'New Release',
        'album': 'Album',
        'single': 'Single',
    };

    return (
        <>
            {/* Title */}
            <Text fontSize="32px" fontWeight="bold" color="gray.900" mb={6}>
                {selectedArtists.length > 0 ? selectedArtists[0].name : 'Untitled Album'}
            </Text>

            {/* Content */}
            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                {/* Left Section */}
                <Box flex="1" minW={0}>
                    <VStack align="stretch" gap={5}>
                        {/* Song Items */}
                        {readyTracks.map((track, index) => (
                            <ReviewTrackItem
                                key={track.id}
                                index={index + 1}
                                trackTitle={trackTitles[track.id] || track.name?.split('.')[0] || 'Untitled Track'}
                                duration="2:45" // This would typically come from the audio file metadata
                                file={track.file}
                            />
                        ))}

                        {/* Form Fields */}
                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Release Type
                            </Text>
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                fontSize="11px"
                                color="gray.700"
                            >
                                {releaseTypeLabels[releaseType[0]] || releaseType[0]}
                            </Box>
                        </Box>

                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Unlock Cost
                            </Text>
                            <Flex
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                justify="space-between"
                                align="center"
                            >
                                <Text fontSize="11px" color="gray.700">
                                    ₦{unlockCost[0] || '100.00'}
                                </Text>
                                <Text fontSize="11px" color="gray.400">
                                    m{unlockCost[0] || '100.00'}
                                </Text>
                            </Flex>
                        </Box>

                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Allow Sponsorship?
                            </Text>
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                fontSize="11px"
                                color="gray.700"
                            >
                                {allowSponsorship[0] || 'yes'}
                            </Box>
                        </Box>

                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Genre
                            </Text>
                            <SelectRoot
                                collection={genreOptions}
                                size="sm"
                                value={selectedGenre}
                                onValueChange={(details) => setSelectedGenre(details.value)}
                            >
                                <SelectTrigger h="40px" fontSize="11px">
                                    <SelectValueText placeholder="Select genre" />
                                </SelectTrigger>
                                <SelectContent fontSize="11px">
                                    {genreOptions.items.map((item) => (
                                        <SelectItem item={item} key={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </Box>

                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Release Year
                            </Text>
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                fontSize="11px"
                                color="gray.700"
                            >
                                {releaseYear || '2025'}
                            </Box>
                        </Box>
                    </VStack>
                </Box>

                {/* Right Section */}
                <Box flex="1" w={{ base: 'full', lg: '400px' }} flexShrink={0}>
                    <VStack align="stretch" gap={5}>
                        {/* Album Art Cover */}
                        <Box>
                            {coverArtUrl ? (
                                <Image
                                    src={coverArtUrl}
                                    alt="Album Cover"
                                    w="full"
                                    h="400px"
                                    objectFit="cover"
                                    borderRadius="lg"
                                />
                            ) : (
                                <Box
                                    w="full"
                                    h="400px"
                                    bg="gray.100"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Text color="gray.400">No cover art</Text>
                                </Box>
                            )}
                        </Box>

                        {/* Artist Name */}
                        <Text
                            fontSize="20px"
                            fontWeight="bold"
                            color="gray.900"
                            textAlign="center"
                        >
                            {selectedArtists.length > 0 ? selectedArtists[0].name : 'Davido'}
                        </Text>
                        <Text
                            fontSize="16px"
                            fontWeight="medium"
                            color="primary.500"
                            textAlign="center"
                        >
                            {firstTrack?.title || firstTrack?.name?.split('.')[0] || '5ive'}
                        </Text>

                        {/* Release */}
                        <Box>
                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                Release
                            </Text>
                            <SelectRoot
                                collection={releaseOptions}
                                size="sm"
                                value={releaseOption}
                                onValueChange={(details) => setReleaseOption(details.value)}
                            >
                                <SelectTrigger h="40px" fontSize="11px">
                                    <SelectValueText placeholder="Select release option" />
                                </SelectTrigger>
                                <SelectContent fontSize="11px">
                                    {releaseOptions.items.map((item) => (
                                        <SelectItem item={item} key={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </Box>

                        {/* Schedule Release */}
                        {releaseOption[0] === 'schedule' && (
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={4}
                            >
                                <VStack align="stretch" gap={2}>
                                    <Text fontSize="11px" color="gray.700">
                                        Now
                                    </Text>
                                    <HStack
                                        cursor="pointer"
                                        color="primary.500"
                                        _hover={{ color: 'primary.600' }}
                                    >
                                        <Text fontSize="11px">Schedule Release</Text>
                                        <Icon as={FiArrowRight} boxSize={3} />
                                        <Text fontSize="11px">Calendar</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};


