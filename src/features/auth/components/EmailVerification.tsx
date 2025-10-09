import React from 'react';
import {
    Box,
    Button,
    Input,
    Link,
    Text,
    VStack,
    HStack,
} from '@chakra-ui/react';

interface EmailVerificationProps {
    email: string;
    verificationCode: string;
    error: string;
    loading: boolean;
    resendTimer: number;
    onCodeChange: (value: string) => void;
    onSubmit: () => void;
    onResend: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
    email,
    verificationCode,
    error,
    loading,
    resendTimer,
    onCodeChange,
    onSubmit,
    onResend,
}) => {
    const handleInputChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = verificationCode.split('');
            newCode[index] = value;
            const updatedCode = newCode.join('');
            onCodeChange(updatedCode);

            // Auto-focus next input
            if (value && index < 4) {
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

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="md" fontWeight="semibold" color="black" mb={1}>
                    Verify Email
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    A verification code has sent to <strong style={{ color: '#f94444' }}>{email}</strong>
                </Text>
            </Box>

            <Box w="full">
                <HStack justify="center" gap={2} mb={3}>
                    {[0, 1, 2, 3, 4].map((index) => (
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
                {error && (
                    <Text color="red.500" fontSize="xs" textAlign="center" mb={3}>
                        {error}
                    </Text>
                )}
            </Box>

            <Box textAlign="center">
                <Text fontSize="xs" color="gray.600" mb={1}>
                    Didn't get code?
                </Text>
                <Link
                    onClick={onResend}
                    fontSize="xs"
                    fontWeight="medium"
                    color={resendTimer > 0 ? "gray.400" : "primary.500"}
                    cursor={resendTimer > 0 ? "not-allowed" : "pointer"}
                    _hover={resendTimer > 0 ? {} : { color: 'primary.600' }}
                >
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                </Link>
            </Box>

            <Button
                onClick={onSubmit}
                loading={loading}
                bg="primary.500"
                color="white"
                size="md"
                fontSize="xs"
                width="full"
                fontWeight="medium"
                borderRadius="10px"
                _hover={{ bg: 'primary.600' }}
                disabled={verificationCode.length !== 5}
            >
                Verify Now
            </Button>
        </VStack>
    );
};
