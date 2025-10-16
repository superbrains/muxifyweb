import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Text,
    VStack,
    HStack,
} from '@chakra-ui/react';
import { useChakraToast } from '@shared/hooks';

interface ReusableEmailVerificationProps {
    title?: string;
    description?: string;
    nextRoute: string;
    email?: string;
}

export const ReusableEmailVerification: React.FC<ReusableEmailVerificationProps> = ({
    title = "Verify Email Address",
    description,
    nextRoute,
    email: propEmail
}) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();

    const email = propEmail || location.state?.email || 'johndoe@gmail.com';

    // Resend timer effect
    React.useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = verificationCode.split('');
            newCode[index] = value;
            const updatedCode = newCode.join('');
            setVerificationCode(updatedCode);

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

    const handleVerificationSubmit = async () => {
        if (verificationCode.length !== 5) {
            setError('Please enter the complete verification code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Here you would typically verify the code with your backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Verification successful!', 'Your email has been verified.');
            navigate(nextRoute);
        } catch {
            const errorMessage = 'Invalid verification code';
            setError(errorMessage);
            toast.error('Verification failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        setError('');

        try {
            // Here you would typically resend the verification code
            await new Promise(resolve => setTimeout(resolve, 1000));
            setResendTimer(60);
            toast.success('Code resent!', 'Check your email for the new verification code.');
        } catch {
            const errorMessage = 'Failed to resend code';
            setError(errorMessage);
            toast.error('Resend failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="md" fontWeight="semibold" color="black" mb={1}>
                    {title}
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    {description || `An verification code has sent to`}{' '}
                    <Text as="span" color="primary.500" fontWeight="medium">
                        {email}
                    </Text>
                </Text>
            </Box>

            <VStack gap={10} align="center" w="full">
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
                                fontSize="xs"
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
                    <Button
                        onClick={handleResendCode}
                        fontSize="xs"
                        fontWeight="medium"
                        color={resendTimer > 0 ? "gray.400" : "primary.500"}
                        cursor={resendTimer > 0 ? "not-allowed" : "pointer"}
                        _hover={resendTimer > 0 ? {} : { color: 'primary.600' }}
                        variant="ghost"
                        p={0}
                        h="auto"
                        disabled={resendTimer > 0}
                    >
                        {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                    </Button>
                </Box>

                <Button
                    onClick={handleVerificationSubmit}
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
        </VStack>
    );
};
