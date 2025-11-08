import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    Input,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
    Link,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { toaster } from '@/components/ui/toaster-instance';

interface RepeatPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const RepeatPinModal: React.FC<RepeatPinModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const handleInputChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newPin = pin.split('');
            newPin[index] = value;
            const updatedPin = newPin.join('');
            setPin(updatedPin);

            // Auto-focus next input
            if (value && index < 3) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                nextInput?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    const handleSubmit = async () => {
        if (pin.length !== 4) {
            toaster.create({
                title: 'Invalid PIN',
                description: 'Please enter a complete 4-digit PIN',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toaster.create({
                title: 'PIN Confirmed',
                description: 'Your transaction PIN has been confirmed successfully',
                type: 'success',
                duration: 3000,
            });
            onSuccess();
        } catch (error) {
            console.error('repeat pin error', error);
            toaster.create({
                title: 'PIN Confirmation Failed',
                description: 'Failed to confirm PIN. Please try again.',
                type: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (resendTimer > 0) return;

        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        toaster.create({
            title: 'Code Sent',
            description: 'A new verification code has been sent',
            type: 'success',
            duration: 3000,
        });
    };

    const handleClose = () => {
        setPin('');
        setResendTimer(0);
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="390px" p={7} position="relative" borderRadius="25px" display="flex" flexDirection="column" alignItems="center">
                    <Dialog.Header>
                        <HStack justify="center" w="full">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Repeat PIN
                            </Text>
                            <IconButton
                                aria-label="Close"
                                variant="ghost"
                                size="sm"
                                color="red.500"
                                position="absolute"
                                right={4}
                                top={4}
                                onClick={handleClose}
                            >
                                <Icon as={MdClose} />
                            </IconButton>
                        </HStack>
                    </Dialog.Header>

                    <VStack gap={2} mb={6} textAlign="center">
                        <Text fontSize="sm" color="gray.600">
                            Repeat your authorisation
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            4 Digit Transaction PIN
                        </Text>
                    </VStack>

                    <VStack gap={4} w="full">
                        <Box w="full">
                            <HStack justify="center" gap={2} mb={3}>
                                {[0, 1, 2, 3].map((index) => (
                                    <Input
                                        key={index}
                                        value={pin[index] || ''}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        data-index={index}
                                        maxLength={1}
                                        textAlign="center"
                                        fontSize="lg"
                                        fontWeight="bold"
                                        width="40px"
                                        height="40px"
                                        borderColor="gray.300"
                                        _focus={{
                                            borderColor: 'primary.500',
                                            boxShadow: '0 0 0 1px #f94444',
                                        }}
                                        _hover={{
                                            borderColor: 'gray.400',
                                        }}
                                    />
                                ))}
                            </HStack>
                        </Box>

                        <Box textAlign="center">
                            <Text fontSize="xs" color="gray.600" mb={1}>
                                Didn't get code?
                            </Text>
                            <Link
                                onClick={handleResend}
                                fontSize="xs"
                                fontWeight="medium"
                                color={resendTimer > 0 ? "gray.400" : "red.500"}
                                cursor={resendTimer > 0 ? "not-allowed" : "pointer"}
                                _hover={resendTimer > 0 ? {} : { color: 'red.600' }}
                            >
                                {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                            </Link>
                        </Box>

                        <Button
                            onClick={handleSubmit}
                            loading={loading}
                            bg="primary.500"
                            color="white"
                            w="full"
                            size="sm"
                            fontSize="sm"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                            disabled={pin.length !== 4}
                        >
                            Confirm PIN
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
