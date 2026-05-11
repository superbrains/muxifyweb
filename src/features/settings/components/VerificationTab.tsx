import React, { useMemo, useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
} from '@chakra-ui/react';
import { EmailVerificationModal } from './EmailVerificationModal';
import {
    useUserManagementStore,
    type ArtistOnboardingData,
    type CompanyOnboardingData,
    type AdManagerOnboardingData,
} from '@/features/auth/store/useUserManagementStore';

type VerificationStatus = 'verified' | 'pending' | 'not_verified';

const STATUS_LABEL: Record<VerificationStatus, string> = {
    verified: 'Verified',
    pending: 'Pending Review',
    not_verified: 'Not Verified',
};

const STATUS_COLOR: Record<VerificationStatus, string> = {
    verified: 'green.500',
    pending: 'orange.500',
    not_verified: 'red.500',
};

const isArtistData = (data: unknown): data is ArtistOnboardingData =>
    !!data && typeof (data as ArtistOnboardingData).userType === 'string';

const isCompanyData = (data: unknown): data is CompanyOnboardingData =>
    !!data && typeof (data as CompanyOnboardingData).userType === 'string'
        && (data as CompanyOnboardingData).legalCompanyName !== undefined;

const isAdManagerData = (data: unknown): data is AdManagerOnboardingData =>
    !!data && typeof (data as AdManagerOnboardingData).userType === 'string'
        && (data as AdManagerOnboardingData).fullName !== undefined;

export const VerificationTab: React.FC = () => {
    const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
    const userData = getCurrentUserData();
    const userType = getCurrentUserType();

    const { emailVerified, identityVerified, hasDocuments, email } = useMemo(() => {
        if (!userData) {
            return { emailVerified: false, identityVerified: false, hasDocuments: false, email: '' };
        }

        if (userType === 'artist' && isArtistData(userData)) {
            return {
                emailVerified: !!userData.emailVerified,
                identityVerified: !!userData.identityVerified,
                hasDocuments: !!userData.identityVerificationDocuments?.idDocument,
                email: userData.email,
            };
        }
        if (userType === 'company' && isCompanyData(userData)) {
            return {
                emailVerified: !!userData.emailVerified,
                identityVerified: !!userData.identityVerified,
                hasDocuments: (userData.identityVerificationDocuments?.registrationDocuments?.length ?? 0) > 0,
                email: userData.email,
            };
        }
        if (userType === 'ad-manager' && isAdManagerData(userData)) {
            return {
                emailVerified: !!userData.emailVerified,
                identityVerified: false,
                hasDocuments: false,
                email: userData.email,
            };
        }

        return { emailVerified: false, identityVerified: false, hasDocuments: false, email: '' };
    }, [userData, userType]);

    const identityStatus: VerificationStatus = identityVerified ? 'verified' : 'not_verified';
    const documentsStatus: VerificationStatus = hasDocuments
        ? identityVerified ? 'verified' : 'pending'
        : 'not_verified';
    const emailStatus: VerificationStatus = emailVerified ? 'verified' : 'not_verified';

    const handleEmailVerificationSuccess = () => {
        setIsEmailVerificationOpen(false);
    };

    return (
        <>
            <VStack align="stretch" gap={6}>
                <VStack align="start" gap={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        Account Verification
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                        Verify account to keep your accounts active.
                    </Text>
                </VStack>

                <VStack align="stretch" gap={3}>
                    {/* Identity Verification */}
                    <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={3}
                    >
                        <HStack justify="space-between" align="center">
                            <VStack align="start" gap={0.5}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    Identity Verification
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                    Verify your identity with government issued ID
                                </Text>
                            </VStack>
                            <Text fontSize="xs" fontWeight="medium" color={STATUS_COLOR[identityStatus]}>
                                {STATUS_LABEL[identityStatus]}
                            </Text>
                        </HStack>
                    </Box>

                    {/* Documents Verification */}
                    <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={3}
                    >
                        <HStack justify="space-between" align="center">
                            <VStack align="start" gap={0.5}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    Documents Verification
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                    Upload required documents for verification
                                </Text>
                            </VStack>
                            <Text fontSize="xs" fontWeight="medium" color={STATUS_COLOR[documentsStatus]}>
                                {STATUS_LABEL[documentsStatus]}
                            </Text>
                        </HStack>
                    </Box>

                    {/* Email Verification */}
                    <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={3}
                    >
                        <HStack justify="space-between" align="center">
                            <VStack align="start" gap={0.5}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    Email Verification
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                    Confirm the email address linked to your account
                                </Text>
                            </VStack>
                            <HStack gap={2}>
                                <Text fontSize="xs" fontWeight="medium" color={STATUS_COLOR[emailStatus]}>
                                    {STATUS_LABEL[emailStatus]}
                                </Text>
                                {!emailVerified && email && (
                                    <Button
                                        size="xs"
                                        bg="primary.500"
                                        color="white"
                                        fontSize="2xs"
                                        fontWeight="medium"
                                        borderRadius="md"
                                        _hover={{ bg: 'primary.600' }}
                                        onClick={() => setIsEmailVerificationOpen(true)}
                                    >
                                        Verify Now
                                    </Button>
                                )}
                            </HStack>
                        </HStack>
                    </Box>
                </VStack>
            </VStack>

            <EmailVerificationModal
                isOpen={isEmailVerificationOpen}
                onClose={() => setIsEmailVerificationOpen(false)}
                onSuccess={handleEmailVerificationSuccess}
                email={email}
            />
        </>
    );
};
