import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useChakraToast } from '@shared/hooks';
import { VerifyIcon } from '@/shared/icons/CustomIcons';
import { useArtistStore } from '@/features/artists/store/useArtistStore';

export const AddArtistIdentityVerificationPrompt: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { updateArtist } = useArtistStore();

    const artistId = (location.state as { artistId?: string })?.artistId;

    const handleStartVerification = async () => {
        setLoading(true);
        try {
            if (!artistId) {
                throw new Error('Artist ID missing. Please restart the process.');
            }

            // Mark artist as verified
            updateArtist(artistId, {
                // Add verification status if needed
            });

            // Here you would typically start the identity verification process
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Artist added successfully!', 'The artist has been added to your record label.');
            // Navigate to dashboard
            navigate('/');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Please try again.';
            toast.error('Verification failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    Identity Verification
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    We want to verify this artist so no one can impersonate them fraudulently
                </Text>
            </Box>

            <Box w="full" display="flex" justifyContent="center">
                <Box
                    w="150px"
                    h="150px"
                    borderRadius="full"
                    bg="primary.50"
                    borderColor="primary.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                        <VerifyIcon
                            color="primary.500"
                            h="full"
                            w="full"
                        />
                    </Box>
                </Box>
            </Box>

            <VStack gap={2} w="full">
                <Button
                    onClick={handleStartVerification}
                    loading={loading}
                    bg="primary.500"
                    color="white"
                    size="md"
                    fontSize="xs"
                    width="full"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Start Verification
                </Button>

            </VStack>

        </VStack>
    );
};

