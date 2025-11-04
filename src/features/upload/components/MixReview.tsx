import React from 'react';
import {
    Box,
    Flex,
    Image,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { ReviewTrackItem, ReleaseScheduler } from './';

export const MixReview: React.FC = () => {
    const { mix } = useUploadMusicStore();
    const {
        tracks,
        coverArt,
        trackTitle,
        selectedArtists,
        genre,
        releaseType,
        unlockCost,
        allowSponsorship,
        releaseYear,
    } = mix;

    // Get artist name - Mix tab always uses selected artists (as it was before)
    const getArtistName = () => {
        if (selectedArtists.length > 0) {
            return selectedArtists.join(', ');
        }
        return 'Select Artist';
    };

    const firstTrack = tracks[0];
    const coverArtUrl = coverArt ? URL.createObjectURL(coverArt.file) : '';

    const genreLabels: Record<string, string> = {
        'afrobeat': 'Afrobeat',
        'hip-hop': 'Hip Hop',
        'pop': 'Pop',
        'rnb': 'R&B',
    };

    const releaseTypeLabels: Record<string, string> = {
        'new-release': 'New Release',
        'album': 'Album',
        'single': 'Single',
    };

    return (
        <>
            {/* Title */}
            <Text fontSize="32px" fontWeight="bold" color="gray.900" mb={6}>
                {trackTitle || firstTrack?.name?.split('.')[0] || 'Untitled Mix'}
            </Text>

            {/* Content */}
            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
                {/* Left Section */}
                <Box flex="1" minW={0}>
                    <VStack align="stretch" gap={5}>
                        {/* Music Player - map all mix tracks */}
                        {tracks.map((track, index) => (
                            <ReviewTrackItem
                                key={track.id}
                                index={index + 1}
                                trackTitle={trackTitle || track.name?.split('.')[0] || 'Untitled Track'}
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
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                fontSize="11px"
                                color="gray.700"
                            >
                                {genreLabels[genre[0]] || genre[0]}
                            </Box>
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
                            {getArtistName()}
                        </Text>
                        <Text
                            fontSize="16px"
                            fontWeight="medium"
                            color="primary.500"
                            textAlign="center"
                        >
                            {trackTitle || firstTrack?.name?.split('.')[0] || 'Fall'}
                        </Text>

                        {/* Release */}
                        <ReleaseScheduler />
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};

