import React, { useCallback, useEffect, useState } from 'react';
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
import { userService } from '@/shared/services/userService';

export const SecurityTab: React.FC = () => {
    const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
    const [isUpdatePinOpen, setIsUpdatePinOpen] = useState(false);
    const [hasPin, setHasPin] = useState<boolean | null>(null);

    const refreshPinStatus = useCallback(async () => {
        try {
            const status = await userService.getPinStatus();
            setHasPin(status.hasPin);
        } catch (error) {
            console.warn('Failed to fetch pin status', error);
            setHasPin(false);
        }
    }, []);

    useEffect(() => {
        refreshPinStatus();
    }, [refreshPinStatus]);

    const handlePasswordUpdateSuccess = () => {
        setIsUpdatePasswordOpen(false);
    };

    const handlePinUpdateSuccess = () => {
        setIsUpdatePinOpen(false);
        refreshPinStatus();
    };

    const pinButtonLabel = hasPin === null
        ? 'Loading…'
        : hasPin ? 'Change PIN' : 'Set PIN';

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
                                value={hasPin ? '••••' : 'Not set'}
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
                                disabled={hasPin === null}
                            >
                                {pinButtonLabel}
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
                isInitialSetup={hasPin === false}
            />
        </>
    );
};
