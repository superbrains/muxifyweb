import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { useChakraToast } from '@shared/hooks';
import { VerifyIcon } from '@/shared/icons/CustomIcons';
import {
    useUserManagementStore,
    type ArtistOnboardingData,
} from '@/features/auth/store/useUserManagementStore';
import { profileService } from '../services/profileService';
import { recordLabelService } from '@/features/record-label/services/recordLabelService';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const MAX_BYTES = 5 * 1024 * 1024;

export const IdentityVerificationPrompt: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { markIdentityVerified, completeOnboarding, setCurrentUser, getUserData } =
        useUserManagementStore();

    const userId = (location.state as { userId?: string })?.userId;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setFileError('Only PNG, JPEG, or PDF documents are accepted.');
            setSelectedFile(null);
            return;
        }
        if (file.size > MAX_BYTES) {
            setFileError('Document must be 5 MB or smaller.');
            setSelectedFile(null);
            return;
        }
        setFileError(null);
        setSelectedFile(file);
    };

    const handleStartVerification = async () => {
        if (!selectedFile) {
            setFileError('Select an identity document to continue.');
            return;
        }

        setLoading(true);
        try {
            await profileService.uploadVerificationDocs(selectedFile);
            await profileService.completeProfileOnboarding();

            if (userId) {
                setCurrentUser(userId);
                markIdentityVerified(userId);
                completeOnboarding(userId);
            }

            // If the artist arrived via a label invitation, auto-accept now
            // that onboarding is complete. Failures here don't block: the
            // account is fully set up, only the roster-join didn't happen.
            const invitationToken = userId
                ? (getUserData(userId) as ArtistOnboardingData | null)?.invitationToken
                : undefined;
            if (invitationToken) {
                try {
                    const res = await recordLabelService.acceptInvitation({
                        token: invitationToken,
                    });
                    toast.success(
                        `Welcome to ${res.labelName}!`,
                        'You are now on their roster.',
                    );
                } catch (acceptError) {
                    toast.error(
                        'Could not join the label',
                        getApiErrorMessage(
                            acceptError,
                            'Your account is set up, but joining the label failed. Contact support.',
                        ),
                    );
                }
            } else {
                toast.success(
                    'Verification submitted!',
                    'We will review your document and notify you shortly.',
                );
            }

            navigate('/');
        } catch (error) {
            const errorMessage = getApiErrorMessage(error, 'Verification failed. Please try again.');
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
                    Upload a business-registration document or government-issued ID so our team can verify
                    this account.
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
                        <VerifyIcon color="primary.500" h="full" w="full" />
                    </Box>
                </Box>
            </Box>

            <VStack gap={2} w="full">
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    onChange={handleFileSelect}
                    display="none"
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    variant="outline"
                    borderColor="primary.500"
                    color="primary.500"
                    size="md"
                    fontSize="xs"
                    width="full"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.50' }}
                >
                    {selectedFile ? selectedFile.name : 'Choose document'}
                </Button>
                {fileError && (
                    <Text color="red.500" fontSize="xs">
                        {fileError}
                    </Text>
                )}

                <Button
                    onClick={handleStartVerification}
                    loading={loading}
                    disabled={!selectedFile}
                    bg="primary.500"
                    color="white"
                    size="md"
                    fontSize="xs"
                    width="full"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Submit for verification
                </Button>
            </VStack>
        </VStack>
    );
};
