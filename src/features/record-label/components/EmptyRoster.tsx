import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';

interface EmptyRosterProps {
    onInvite: () => void;
}

export const EmptyRoster: React.FC<EmptyRosterProps> = ({ onInvite }) => (
    <Box
        bg="white"
        borderRadius="20px"
        minH="60vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
    >
        <Box
            bg="primary.500"
            borderRadius="10px"
            position="relative"
            overflow="hidden"
            px={6}
            py={8}
            w="100%"
            maxW="360px"
        >
            <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="160px"
                h="160px"
                borderRadius="full"
                bg="whiteAlpha.200"
                pointerEvents="none"
            />
            <VStack gap={4} position="relative" align="center">
                <Box
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="lg"
                >
                    🎤
                </Box>
                <VStack gap={1}>
                    <Text fontSize="xl" color="white" textAlign="center" fontWeight="semibold">
                        Build your label's roster
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.800" textAlign="center">
                        Invite your first artist to start releasing music together.
                    </Text>
                </VStack>
                <Button
                    onClick={onInvite}
                    bg="white"
                    color="primary.500"
                    size="md"
                    fontSize="sm"
                    fontWeight="semibold"
                    borderRadius="10px"
                    _hover={{ bg: 'gray.50' }}
                >
                    Invite an artist
                </Button>
            </VStack>
        </Box>
    </Box>
);
