import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Input,
    Button,
} from '@chakra-ui/react';
import { UpdatePasswordModal } from './UpdatePasswordModal';
import { UpdateTransactionPinModal } from './UpdateTransactionPinModal';

export const SecurityTab: React.FC = () => {
    const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
    const [isUpdatePinOpen, setIsUpdatePinOpen] = useState(false);

    const handlePasswordUpdateSuccess = () => {
        setIsUpdatePasswordOpen(false);
        // Handle success logic here
    };

    const handlePinUpdateSuccess = () => {
        setIsUpdatePinOpen(false);
        // Handle success logic here
    };

    return (
        <>
            <VStack align="stretch" gap={6}>
                <VStack align="start" gap={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        Security Settings
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                        Keep your account safe, set Password and PIN
                    </Text>
                </VStack>

                <VStack align="stretch" gap={4}>
                    {/* Account Password */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Account Password
                        </Text>
                        <HStack gap={2}>
                            <Input
                                type="password"
                                value="••••••••"
                                size="sm"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                readOnly
                            />
                            <Button
                                size="xs"
                                bg="primary.500"
                                color="white"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="md"
                                _hover={{ bg: 'primary.600' }}
                                onClick={() => setIsUpdatePasswordOpen(true)}
                            >
                                Change Password
                            </Button>
                        </HStack>
                    </Box>

                    {/* Payout PIN */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Payout PIN
                        </Text>
                        <HStack gap={2}>
                            <Input
                                type="password"
                                value="••••"
                                size="sm"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                readOnly
                            />
                            <Button
                                size="xs"
                                bg="primary.500"
                                color="white"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="md"
                                _hover={{ bg: 'primary.600' }}
                                onClick={() => setIsUpdatePinOpen(true)}
                            >
                                Change PIN
                            </Button>
                        </HStack>
                    </Box>
                </VStack>
            </VStack>

            <UpdatePasswordModal
                isOpen={isUpdatePasswordOpen}
                onClose={() => setIsUpdatePasswordOpen(false)}
                onSuccess={handlePasswordUpdateSuccess}
            />

            <UpdateTransactionPinModal
                isOpen={isUpdatePinOpen}
                onClose={() => setIsUpdatePinOpen(false)}
                onSuccess={handlePinUpdateSuccess}
            />
        </>
    );
};
