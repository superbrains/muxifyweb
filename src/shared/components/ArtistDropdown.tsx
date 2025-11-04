import React from 'react';
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Icon,
    Menu,
    Image,
} from '@chakra-ui/react';
import { useArtistStore } from '@/features/artists/store/useArtistStore';

interface ArtistDropdownProps {
    isCollapsed?: boolean;
}

export const ArtistDropdown: React.FC<ArtistDropdownProps> = ({ isCollapsed = false }) => {
    const { artists, selectedArtistId, setSelectedArtist, getSelectedArtist } = useArtistStore();
    const selectedArtist = getSelectedArtist();

    const handleSelectArtist = (artistId: string) => {
        setSelectedArtist(artistId);
    };

    if (artists.length === 0) {
        return null;
    }

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    variant="outline"
                    size="xs"
                    fontSize="xs"
                    fontWeight="medium"
                    borderColor="gray.200"
                    color="gray.700"
                    bg="white"
                    _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                    h="45px"
                    px={3}
                    minW={isCollapsed ? "auto" : "160px"}
                    justifyContent="space-between"
                >
                    <HStack gap={2} w="full" justify="space-between">
                        <HStack gap={2} flex={1}>
                            {selectedArtist?.avatar && (
                                <Image
                                    src={selectedArtist.avatar}
                                    alt={selectedArtist.name}
                                    boxSize={4}
                                    borderRadius="full"
                                    objectFit="cover"
                                />
                            )}
                            {!isCollapsed && (
                                <Text fontSize="xs" lineClamp={1} maxW="120px">
                                    {selectedArtist?.name || 'Select Artist'}
                                </Text>
                            )}
                        </HStack>
                        {!isCollapsed && (
                            <Icon
                                as={() => (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path
                                            d="M3 4.5L6 7.5L9 4.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                                boxSize={3}
                            />
                        )}
                    </HStack>
                </Button>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content
                    borderRadius="md"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    p={2}
                    minW="240px"
                    bg="white"
                    zIndex={1000}
                >
                    <VStack align="stretch" gap={1}>
                        <Box px={2} py={1.5} borderBottom="1px solid" borderColor="gray.200">
                            <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                Select Artist
                            </Text>
                        </Box>

                        {artists.map((artist) => (
                            <Menu.Item
                                key={artist.id}
                                value={artist.id}
                                onClick={() => handleSelectArtist(artist.id)}
                                _hover={{ bg: 'gray.50' }}
                                bg={selectedArtistId === artist.id ? 'primary.50' : 'transparent'}
                                px={2}
                                py={2}
                            >
                                <HStack gap={2} w="full">
                                    {artist.avatar ? (
                                        <Image
                                            src={artist.avatar}
                                            alt={artist.name}
                                            boxSize={8}
                                            borderRadius="full"
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <Box
                                            boxSize={8}
                                            borderRadius="full"
                                            bg="primary.100"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            color="primary.500"
                                            fontWeight="semibold"
                                            fontSize="xs"
                                        >
                                            {artist.name.charAt(0).toUpperCase()}
                                        </Box>
                                    )}
                                    <VStack align="start" gap={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                            {artist.name}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            Artist
                                        </Text>
                                    </VStack>
                                    {selectedArtistId === artist.id && (
                                        <Icon
                                            as={() => (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path
                                                        d="M13.3333 4L6 11.3333L2.66667 8"
                                                        stroke="#f94444"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                            boxSize={4}
                                            color="primary.500"
                                        />
                                    )}
                                </HStack>
                            </Menu.Item>
                        ))}
                    </VStack>
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

