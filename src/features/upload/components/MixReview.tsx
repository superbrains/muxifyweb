import React from 'react';
import {
    Avatar,
    Box,
    Flex,
    HStack,
    Image,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { AuthedImage } from '@shared/components/AuthedImage';
import { ReviewTrackItem, ReleaseScheduler } from './';
import { formatPercentBps } from '@/features/record-label/lib/format';
import { detectLyricsFormat } from '@uploadMusic/lib/lyricsFormat';
import { LyricsFormatBadge } from '@uploadMusic/components/LyricsField';

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
        lyrics,
        splits,
        rights,
    } = mix;

    const lyricsFormat = detectLyricsFormat(lyrics);

    // Get artist name - Mix tab always uses selected artists (as it was before)
    const getArtistName = () => {
        if (selectedArtists.length > 0) {
            return selectedArtists.join(', ');
        }
        return 'Select Artist';
    };

    const firstTrack = tracks[0];
    // A newly-picked cover yields an object URL; an existing cover uses its (auth-gated) proxy URL.
    const coverArtUrl = coverArt?.file ? URL.createObjectURL(coverArt.file) : '';
    const coverArtExistingUrl = !coverArt?.file ? coverArt?.existingUrl : undefined;

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

                        <Box>
                            <Flex justify="space-between" align="center" mb={2} gap={2}>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900">
                                    Lyrics
                                </Text>
                                <LyricsFormatBadge format={lyricsFormat} />
                            </Flex>
                            <Box
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                                maxH="220px"
                                overflowY="auto"
                                fontSize="11px"
                                lineHeight="1.6"
                                whiteSpace="pre-wrap"
                                color={lyrics?.trim() ? 'gray.700' : 'gray.400'}
                            >
                                {lyrics?.trim() || 'No lyrics added'}
                            </Box>
                        </Box>

                        {splits.length > 0 && (
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Royalty Splits
                                </Text>
                                <Box
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    p={3}
                                >
                                    <Stack gap={2} separator={<Box h="1px" bg="gray.200" />}>
                                        {splits.map((row) => (
                                            <HStack key={row.recipientUserId} gap={3}>
                                                <Avatar.Root size="xs">
                                                    {row.recipientAvatarUrl && (
                                                        <Avatar.Image
                                                            src={row.recipientAvatarUrl}
                                                            alt={row.recipientName}
                                                        />
                                                    )}
                                                    <Avatar.Fallback name={row.recipientName} />
                                                </Avatar.Root>
                                                <VStack align="start" gap={0} flex={1} minW={0}>
                                                    <HStack gap={1} align="center">
                                                        <Text fontSize="11px" fontWeight="medium" color="gray.900">
                                                            {row.recipientName}
                                                        </Text>
                                                        {row.isVerified && (
                                                            <Box color="primary.500" lineHeight={0}>
                                                                <FiCheck size={10} strokeWidth={3} />
                                                            </Box>
                                                        )}
                                                    </HStack>
                                                    <Text fontSize="10px" color="gray.500">
                                                        {row.recipientRole}
                                                    </Text>
                                                </VStack>
                                                <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                                                    {formatPercentBps(row.percentBps)}%
                                                </Text>
                                            </HStack>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        )}

                        {(rights.isrc || rights.upc || rights.iswc) && (
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Rights & Metadata
                                </Text>
                                <Stack
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    p={3}
                                    gap={2}
                                >
                                    <HStack justify="space-between" gap={3}>
                                        <Text fontSize="11px" color="gray.500">ISRC</Text>
                                        <HStack gap={2}>
                                            <Text fontSize="11px" color="gray.800" fontFamily="mono">
                                                {rights.isrc || '—'}
                                            </Text>
                                            {rights.isrcIsProvisional && (
                                                <Box
                                                    bg="primary.70"
                                                    color="primary.600"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="full"
                                                    fontSize="9px"
                                                    fontWeight="semibold"
                                                >
                                                    Provisional
                                                </Box>
                                            )}
                                        </HStack>
                                    </HStack>
                                    <HStack justify="space-between" gap={3}>
                                        <Text fontSize="11px" color="gray.500">UPC</Text>
                                        <Text fontSize="11px" color="gray.800" fontFamily="mono">
                                            {rights.upc || '—'}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between" gap={3}>
                                        <Text fontSize="11px" color="gray.500">ISWC</Text>
                                        <Text fontSize="11px" color="gray.800" fontFamily="mono">
                                            {rights.iswc || '—'}
                                        </Text>
                                    </HStack>
                                </Stack>
                            </Box>
                        )}
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
                            ) : coverArtExistingUrl ? (
                                <AuthedImage
                                    src={coverArtExistingUrl}
                                    alt="Album Cover"
                                    w="full"
                                    h="400px"
                                    objectFit="cover"
                                    borderRadius="lg"
                                    fallback={
                                        <Box
                                            w="full"
                                            h="400px"
                                            bg="gray.100"
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Text color="gray.400">Loading cover…</Text>
                                        </Box>
                                    }
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

