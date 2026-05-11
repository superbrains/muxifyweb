import React from 'react';
import {
    Box,
    Center,
    HStack,
    Spinner,
    Stack,
    Text,
    VStack,
    Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useLabelReleases } from '../hooks/useLabelReleases';

const SplitsPage: React.FC = () => {
    const { data: releases, isLoading } = useLabelReleases();
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
            <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                    Royalty Splits
                </Text>
                <Text fontSize="11px" color="gray.600">
                    Configure how revenue from each release is divided.
                </Text>
            </Box>

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
                >
                    <Text fontSize="xs" color="gray.500">
                        Releases will appear here once you upload them.
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
                                        {r.artistName}
                                    </Text>
                                </VStack>
                                <Button
                                    size="xs"
                                    bg="primary.500"
                                    color="white"
                                    fontSize="10px"
                                    fontWeight="medium"
                                    borderRadius="8px"
                                    _hover={{ bg: 'primary.600' }}
                                    onClick={() => navigate(`/label/splits/${r.trackId}`)}
                                >
                                    Edit splits
                                </Button>
                            </HStack>
                        ))}
                    </Stack>
                </Box>
            )}
        </VStack>
    );
};

export default SplitsPage;
