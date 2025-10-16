import React from 'react';
import { Box, Text, VStack, Button, Input } from '@chakra-ui/react';
import { ArtistInput } from './ArtistInput';

interface ArtistProps {
    selectedArtists?: string[];
    onAddArtist?: (artist: string) => void;
    onUpdateArtist?: (index: number, artist: string) => void;
    onRemoveArtist?: (index: number) => void;
    showAddFeature?: boolean;
    trackTitle?: string;
    onTrackTitleChange?: (title: string) => void;
}

export const Artist: React.FC<ArtistProps> = ({
    selectedArtists = [],
    onAddArtist,
    onUpdateArtist,
    onRemoveArtist,
    showAddFeature = false,
    trackTitle = '',
    onTrackTitleChange,
}) => {
    const handleAddFeatureClick = () => {
        // Add empty string to the artists array when New Feature button is clicked
        if (onAddArtist) {
            onAddArtist('');
        }
    };

    return (
        <VStack align="stretch" gap={3}>
            {/* Featured Artists Section with New Feature Button */}
            <VStack gap={2}>
                <Box display="flex" w="full" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                    <Text fontSize="12px" fontWeight="semibold" color="gray.900">
                        Track Title
                    </Text>
                    {showAddFeature && (
                        <Button
                            size="xs"
                            variant="outline"
                            fontSize="10px"
                            color="gray.700"
                            borderColor="gray.300"
                            rounded="full"
                            h="auto"
                            py={1.5}
                            px={3}
                            flexShrink={0}
                            fontWeight="medium"
                            onClick={handleAddFeatureClick}
                            _hover={{ bg: 'gray.50' }}
                        >
                            <Box as="span" fontSize="13px" mr={1}>+</Box>
                            New Feature
                        </Button>
                    )}
                </Box>

                {/* Track Title Input */}
                <Input
                    placeholder="Track title"
                    value={trackTitle}
                    onChange={(e) => onTrackTitleChange?.(e.target.value)}
                    size="sm"
                    fontSize="11px"
                    h="40px"
                    w="full"
                    borderColor="gray.200"
                    _placeholder={{ fontSize: '11px', color: 'gray.400' }}
                />

                {/* Selected Artists */}

                <VStack align="stretch" gap={2} w="full">
                    {selectedArtists.map((artistName, index) => (
                        <ArtistInput
                            key={`artist-${index}`}
                            value={artistName}
                            onChange={(value) => onUpdateArtist?.(index, value)}
                            onRemove={() => onRemoveArtist?.(index)}
                            placeholder="Name of Musician: Olamide"
                        />
                    ))}
                </VStack>
            </VStack>


        </VStack>
    );
};

