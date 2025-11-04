import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    Input,
    Link,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

interface PayoutAuthorizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const PayoutAuthorizationModal: React.FC<PayoutAuthorizationModalProps> = ({
    isOpen,
    onClose,
    onComplete,
}) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = verificationCode.split('');
            newCode[index] = value;
            const updatedCode = newCode.join('');
            setVerificationCode(updatedCode);

            // Auto-focus next input
            if (value && index < 3) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                nextInput?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        onComplete();
    };

    const handleResend = () => {
        // Handle resend logic
        console.log('Resending code...');
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="390px" p={7} position="relative" borderRadius="25px" display="flex" flexDirection="column" alignItems="center">
                    <Dialog.Header>
                        <HStack justify="center" w="full">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Payout Authorisation
                            </Text>
                            <IconButton
                                aria-label="Close"
                                variant="ghost"
                                size="sm"
                                color="red.500"
                                position="absolute"
                                right={4}
                                top={4}
                                onClick={onClose}
                            >
                                <Icon as={MdClose} />
                            </IconButton>
                        </HStack>
                    </Dialog.Header>

                    <Text fontSize="xs" color="gray.600" mb={4} textAlign="center" w="80%">
                        An authorisation code was sent to{' '}
                        <strong style={{ color: '#f94444' }}>j*****e@***j*.com</strong>
                    </Text>

                    <VStack gap={4} align="center" w="full">

                    <Box w="full">
                        <HStack justify="center" gap={2} mb={3}>
                            {[0, 1, 2, 3].map((index) => (
                                <Input
                                    key={index}
                                    value={verificationCode[index] || ''}
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

                    <Box textAlign="center" w="full">
                        <Text fontSize="xs" color="gray.600" mb={1}>
                            Didn't get code?
                        </Text>
                        <Link
                            onClick={handleResend}
                            fontSize="xs"
                            fontWeight="medium"
                            color="primary.500"
                            cursor="pointer"
                            _hover={{ color: 'primary.600' }}
                        >
                            Resend Code
                        </Link>
                    </Box>

                        <Button
                            onClick={handleSubmit}
                            loading={isLoading}
                            bg="primary.500"
                            color="white"
                            size="md"
                            fontSize="sm"
                            width="full"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                            disabled={verificationCode.length !== 4}
                        >
                            Complete Payout
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
