import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Link,
    Stack,
    Text,
} from '@chakra-ui/react';
import { useAuth } from '@app/hooks/useAuth';
import { useChakraToast } from '@shared/hooks';
import { authService } from '@shared/services/auth';
import type { LoginCredentials } from '@shared/services/auth';
import { PasswordInput } from "@/components/ui/password-input"

export const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

    const { login } = useAuth();
    const toast = useChakraToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof LoginCredentials]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<LoginCredentials> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await authService.login(formData);
            const { user, token } = response.data;

            localStorage.setItem('auth_token', token);
            login(user);

            toast.success('Welcome back!', 'You have been successfully logged in.');
            navigate('/dashboard');
        } catch (error: unknown) {
            let errorMessage = 'Invalid credentials';
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || 'Invalid credentials';
            }
            toast.error('Login failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} w="full">
            <Stack gap={3}>
                <Box>
                    <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                        Email Address or Phone Number
                    </Text>
                    <Input
                        name="email"
                        type="email"
                        variant="subtle"
                        value={formData.email}
                        size="sm"
                        fontSize="xs"
                        onChange={handleChange}
                        placeholder="Email Address"
                        borderColor={errors.email ? 'red.300' : 'transparent'}
                        _focus={{
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px #f94444',
                        }}
                    />
                    {errors.email && (
                        <Text color="red.500" fontSize="xs" mt={0.5}>
                            {errors.email}
                        </Text>
                    )}
                </Box>

                <Box>
                    <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                        Password
                    </Text>
                    <PasswordInput
                        name="password"
                        type="password"
                        variant="subtle"
                        size="sm"
                        fontSize="xs"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        borderColor={errors.password ? 'red.300' : 'transparent'}
                        _focus={{
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px #f94444',
                        }}
                    />
                    {errors.password && (
                        <Text color="red.500" fontSize="xs" mt={0.5}>
                            {errors.password}
                        </Text>
                    )}
                </Box>

                <Box display="flex" alignItems="center" justifyContent="end">

                    <Link
                        href="/forgot-password"
                        fontSize="xs"
                        fontWeight="medium"
                        color="primary.500"
                        _hover={{ color: 'primary.600' }}
                    >
                        Reset password
                    </Link>
                </Box>

                <Button
                    type="submit"
                    loading={loading}
                    bg="primary.500"
                    color="white"
                    size="md"
                    fontSize="xs"
                    width="full"
                    fontWeight="medium"
                    borderRadius="10px"
                    mt="30px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Login
                </Button>
            </Stack>
        </Box>
    );
};
