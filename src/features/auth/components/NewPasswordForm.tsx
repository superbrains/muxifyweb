import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Link,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useChakraToast } from '@shared/hooks';
// import { authService } from '@shared/services/auth';
import { PasswordInput } from "@/components/ui/password-input";

interface NewPasswordFormProps {
    email: string;
    verificationCode: string;
    onBack: () => void;
}

export const NewPasswordForm: React.FC<NewPasswordFormProps> = ({
    email: _email,
    verificationCode: _verificationCode,
    onBack
}) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    const toast = useChakraToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            // Here you would typically call your backend to reset the password
            // await authService.resetPassword(email, verificationCode, formData.newPassword);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Password updated!', 'Your password has been successfully reset.');
            navigate('/login');
        } catch (error: unknown) {
            let errorMessage = 'Failed to reset password';
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || 'Failed to reset password';
            }
            toast.error('Reset failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack gap={6} align="center">
                <Box textAlign="center">
                    <Text fontSize="lg" fontWeight="semibold" color="black" mb={2}>
                        Create New Password
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={6}>
                        Create new password you can remember
                    </Text>
                </Box>

                <Stack gap={4} w="full">
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={2}>
                            New Password
                        </Text>
                        <PasswordInput
                            name="newPassword"
                            variant="subtle"
                            size="xs"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Password"
                            borderColor={errors.newPassword ? 'red.300' : 'gray.300'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.newPassword && (
                            <Text color="red.500" fontSize="sm" mt={1}>
                                {errors.newPassword}
                            </Text>
                        )}
                    </Box>

                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={2}>
                            Repeat New Password
                        </Text>
                        <PasswordInput
                            name="confirmPassword"
                            variant="subtle"
                            size="xs"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Password"
                            borderColor={errors.confirmPassword ? 'red.300' : 'gray.300'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.confirmPassword && (
                            <Text color="red.500" fontSize="sm" mt={1}>
                                {errors.confirmPassword}
                            </Text>
                        )}
                    </Box>

                    <Box display="flex" justifyContent="end">
                        <Link
                            onClick={onBack}
                            fontSize="xs"
                            fontWeight="medium"
                            color="primary.500"
                            cursor="pointer"
                            _hover={{ color: 'primary.600' }}
                        >
                            Reset Password
                        </Link>
                    </Box>

                    <Button
                        type="submit"
                        loading={loading}
                        bg="primary.500"
                        color="white"
                        size="lg"
                        fontSize="sm"
                        width="full"
                        fontWeight="medium"
                        borderRadius="10px"
                        _hover={{ bg: 'primary.600' }}
                    >
                        Set New Password
                    </Button>
                </Stack>
            </VStack>
        </Box>
    );
};
