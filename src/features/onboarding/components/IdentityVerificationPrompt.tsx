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
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useArtistStore } from '@/features/artists/store/useArtistStore';

export const IdentityVerificationPrompt: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { markIdentityVerified, completeOnboarding, setCurrentUser } = useUserManagementStore();
    const { isRecordLabel } = useUserType();
    const { artists } = useArtistStore();

    const userId = (location.state as { userId?: string })?.userId;

    const handleStartVerification = async () => {
        setLoading(true);
        try {
            // Mark identity as verified and complete onboarding
            if (userId) {
                setCurrentUser(userId);
                markIdentityVerified(userId);
                completeOnboarding(userId);

                // Log user data after onboarding completion (without large images)
                const { getUserData, getCurrentUserType } = useUserManagementStore.getState();
                const userData = getUserData(userId);
                const userType = getCurrentUserType();

                console.log('=== Onboarding Completed ===');
                console.log('User ID:', userId);
                console.log('User Type:', userType);

                // Log user data without base64 images to avoid console slowdown
                if (userData) {
                    const dataToLog = { ...userData };
                    // Remove large base64 image fields
                    if ('displayPicture' in dataToLog) {
                        dataToLog.displayPicture = '[Image data removed for logging]';
                    }
                    if ('labelLogo' in dataToLog) {
                        dataToLog.labelLogo = '[Image data removed for logging]';
                    }
                    if ('companyLogo' in dataToLog) {
                        dataToLog.companyLogo = '[Image data removed for logging]';
                    }
                    console.log('User Data:', dataToLog);
                }
                console.log('===========================');
            }

            // Here you would typically start the identity verification process
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Verification started!', 'Please follow the instructions to complete verification.');
            // Navigate based on user type - record labels without artists go to add artist page
            if (isRecordLabel && artists.length === 0) {
                navigate('/add-artist');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Verification failed', 'Please try again.');
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
                    We want to verify this account so no one can impersonate you fraudulently
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
