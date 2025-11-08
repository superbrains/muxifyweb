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
import { useUserType } from '@/features/auth/hooks/useUserType';
import type {
    ArtistOnboardingData,
    CompanyOnboardingData,
    AdManagerOnboardingData,
} from '@/features/auth/store/useUserManagementStore';

const isArtistData = (data: unknown): data is ArtistOnboardingData =>
    !!data && typeof (data as ArtistOnboardingData).performingName !== 'undefined';

const isCompanyData = (data: unknown): data is CompanyOnboardingData =>
    !!data && typeof (data as CompanyOnboardingData).legalCompanyName !== 'undefined';

const isAdManagerData = (data: unknown): data is AdManagerOnboardingData =>
    !!data && typeof (data as AdManagerOnboardingData).fullName !== 'undefined';

export const AlbumReview: React.FC = () => {
    const { album } = useUploadMusicStore();
    const { isRecordLabelOnly, userData, userType } = useUserType();
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
    
    // Get artist name - for record labels, use selected artists; otherwise use logged in user
    const getArtistName = () => {
        if (selectedArtists.length > 0) {
            return selectedArtists.map(artist => artist.name).join(', ');
        }
        if (isRecordLabelOnly) {
            return 'Select Artist';
        }
        if (!userData) {
            return 'Artist';
        }
        if (userType === 'artist' && isArtistData(userData)) {
            return userData.performingName || userData.fullName || 'Artist';
        }
        if (userType === 'company' && isCompanyData(userData)) {
            return userData.companyName || userData.legalCompanyName || 'Artist';
        }
        if (userType === 'ad-manager' && isAdManagerData(userData)) {
            return userData.fullName || 'Artist';
        }
        return 'Artist';
    };

    const readyTracks = tracks.filter(track => track.status === 'ready');
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
                            {Object.values(trackTitles)[0] || firstTrack?.name?.split('.')[0] || 'Untitled Album'}
                        </Text>

                        {/* Release */}
                        <ReleaseScheduler />
                    </VStack>
                </Box>
            </Flex>
        </>
    );
};


