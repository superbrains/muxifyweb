import React from 'react';
import { Avatar, Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import type { RosterArtistDto } from '../types';

interface RosterArtistRowProps {
    artist: RosterArtistDto;
    onRemove: () => void;
}

export const RosterArtistRow: React.FC<RosterArtistRowProps> = ({ artist, onRemove }) => (
    <HStack
        py={3}
        px={3}
        borderRadius="md"
        _hover={{ bg: 'primary.50' }}
        transition="background 150ms ease"
        justify="space-between"
    >
        <HStack gap={3}>
            <Avatar.Root size="sm">
                <Avatar.Image src={artist.avatarUrl} />
                <Avatar.Fallback name={artist.performingName || artist.fullName} />
            </Avatar.Root>
            <VStack align="start" gap={0}>
                <HStack gap={2}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                        {artist.performingName || artist.fullName || 'Unnamed artist'}
                    </Text>
                    {artist.onboardingStatus === 'Active' ? (
                        <Box
                            bg="#E7FFF7"
                            color="green.600"
                            fontSize="9px"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontWeight="medium"
                        >
                            Active
                        </Box>
                    ) : (
                        <Box
                            bg="orange.50"
                            color="orange.600"
                            fontSize="9px"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontWeight="medium"
                        >
                            Pending onboarding
                        </Box>
                    )}
                    {artist.isVerified && (
                        <Box
                            bg="primary.70"
                            color="primary.600"
                            fontSize="9px"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                        >
                            Verified
                        </Box>
                    )}
                </HStack>
                <Text fontSize="10px" color="gray.500">
                    {artist.fullName || 'Awaiting profile setup'}
                </Text>
            </VStack>
        </HStack>

        <HStack gap={6}>
            <VStack align="end" gap={0} display={{ base: 'none', md: 'flex' }}>
                <Text fontSize="11px" color="gray.500">
                    30d streams
                </Text>
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {artist.monthlyStreams.toLocaleString()}
                </Text>
            </VStack>
            <Button
                onClick={onRemove}
                variant="ghost"
                size="xs"
                fontSize="xs"
                color="gray.500"
                _hover={{ color: 'primary.500' }}
            >
                Remove
            </Button>
        </HStack>
    </HStack>
);
