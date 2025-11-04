import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
} from '@chakra-ui/react';
import { EmailVerificationModal } from './EmailVerificationModal';

export const VerificationTab: React.FC = () => {
    const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);

    const handleEmailVerificationSuccess = () => {
        setIsEmailVerificationOpen(false);
        // Handle success logic here
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
                            <Text fontSize="xs" fontWeight="medium" color="green.500">
                                Approved
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
                            <Text fontSize="xs" fontWeight="medium" color="green.500">
                                Approved
                            </Text>
                        </HStack>
                    </Box>

                    {/* Face Verification */}
                    <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={3}
                    >
                        <HStack justify="space-between" align="center">
                            <VStack align="start" gap={0.5}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    Face Verification
                                </Text>
                                <Text fontSize="2xs" color="gray.500">
                                    Complete face verification process
                                </Text>
                            </VStack>
                            <HStack gap={2}>
                                <Text fontSize="xs" fontWeight="medium" color="red.500">
                                    Not Verified
                                </Text>
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
                            </HStack>
                        </HStack>
                    </Box>
                </VStack>
            </VStack>

            <EmailVerificationModal
                isOpen={isEmailVerificationOpen}
                onClose={() => setIsEmailVerificationOpen(false)}
                onSuccess={handleEmailVerificationSuccess}
                email="johndoe@gmail.com"
            />
        </>
    );
};
