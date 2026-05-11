import React, { useState } from 'react';
import {
    Box,
    Button,
    Center,
    HStack,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useLabelReleases } from '../hooks/useLabelReleases';
import { useRoster } from '../hooks/useRoster';
import { PickRosterArtistDialog } from '../components/PickRosterArtistDialog';

const ReleasesPage: React.FC = () => {
    const [pickerOpen, setPickerOpen] = useState(false);
    const { data: releases, isLoading } = useLabelReleases();
    const { data: roster } = useRoster();
    const navigate = useNavigate();

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <HStack justify="space-between" align="center">
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Releases
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        Music released by your roster
                    </Text>
                </Box>
                <Button
                    onClick={() => setPickerOpen(true)}
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="xs"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    New Release
                </Button>
            </HStack>

            {isLoading ? (
                <Center py={10}>
                    <Spinner size="md" color="primary.500" />
                </Center>
            ) : !releases || releases.length === 0 ? (
                <Center
                    bg="white"
                    borderRadius="20px"
                    py={10}
                    px={4}
                    minH="40vh"
                    flexDirection="column"
                    gap={2}
                >
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        No releases yet
                    </Text>
                    <Text fontSize="xs" color="gray.500" textAlign="center" maxW="320px">
                        Pick a roster artist and upload their first release to see it here.
                    </Text>
                </Center>
            ) : (
                <Box bg="white" borderRadius="xl" p={2}>
                    <Stack gap={0}>
                        {releases.map((r) => (
                            <HStack
                                key={r.trackId}
                                py={3}
                                px={3}
                                borderRadius="md"
                                _hover={{ bg: 'primary.50' }}
                                justify="space-between"
                            >
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                        {r.title}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500">
                                        {r.artistName} • {new Date(r.releasedAt).toLocaleDateString()}
                                    </Text>
                                </VStack>
                                <HStack gap={4}>
                                    <Text fontSize="11px" color="gray.500">
                                        {r.streams.toLocaleString()} streams
                                    </Text>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        fontSize="10px"
                                        onClick={() => navigate(`/label/splits/${r.trackId}`)}
                                    >
                                        Splits
                                    </Button>
                                </HStack>
                            </HStack>
                        ))}
                    </Stack>
                </Box>
            )}

            <PickRosterArtistDialog
                open={pickerOpen}
                roster={roster || []}
                onClose={() => setPickerOpen(false)}
                onPick={(artistId) => {
                    setPickerOpen(false);
                    navigate(`/upload/album/new?onBehalfOf=${artistId}`);
                }}
            />
        </VStack>
    );
};

export default ReleasesPage;
