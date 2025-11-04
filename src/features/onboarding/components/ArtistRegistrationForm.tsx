import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Stack,
    Text,
    VStack,
    HStack,
    Link,
    Select,
    Portal,
    createListCollection,
} from '@chakra-ui/react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useChakraToast } from '@shared/hooks';
import { PasswordInput } from "@/components/ui/password-input";
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';

// Collections for select options
const userTypes = createListCollection({
    items: [
        { label: "Artist", value: "artist" },
        { label: "Musician", value: "musician" },
        { label: "Creator", value: "creator" },
        { label: "DJ", value: "dj" },
        { label: "Podcaster", value: "podcaster" },
    ],
});

interface ArtistRegistrationData {
    userType: string;
    email: string;
    phone: string;
    password: string;
    agreeToTerms: boolean;
}

interface ArtistRegistrationErrors {
    userType?: string;
    email?: string;
    phone?: string;
    password?: string;
    agreeToTerms?: string;
}

export const ArtistRegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState<ArtistRegistrationData>({
        userType: 'artist', // Default to 'artist'
        email: '',
        phone: '',
        password: '',
        agreeToTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ArtistRegistrationErrors>({});

    const toast = useChakraToast();
    const navigate = useNavigate();
    const { initializeUser } = useUserManagementStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof ArtistRegistrationErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };


    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }));
        if (errors.agreeToTerms) {
            setErrors(prev => ({ ...prev, agreeToTerms: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ArtistRegistrationErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Initialize user in the store
            const userId = initializeUser('artist', formData.email, formData.phone, formData.userType);

            // Here you would typically register the user
            // For now, we'll simulate success and navigate to email verification
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Registration successful!', 'Please verify your email to continue.');
            navigate('/onboarding/artist/verify-email', {
                state: { email: formData.email, userType: formData.userType, userId }
            });
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Something went wrong'
                : 'Something went wrong';
            toast.error('Registration failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    Artists, Creators, DJs & Podcasters
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Lorem ipsum dolor sit amet consectetur. Mauris placerat nulla sit duis.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <Stack gap={3}>
                    {/* User Type */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            What type of user are you?
                        </Text>
                        <Select.Root
                            size="sm"
                            fontSize="xs"
                            collection={userTypes}
                            value={[formData.userType]}
                            onValueChange={(details) => {
                                setFormData(prev => ({ ...prev, userType: details.value[0] }));
                                if (errors.userType) {
                                    setErrors(prev => ({ ...prev, userType: undefined }));
                                }
                            }}
                        >
                            <Select.HiddenSelect name="userType" />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Select user type" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {userTypes.items.map((userType) => (
                                            <Select.Item fontSize="xs" item={userType} key={userType.value}>
                                                {userType.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Box>

                    {/* Email */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Email Address
                        </Text>
                        <Input
                            name="email"
                            type="email"
                            variant="subtle"
                            value={formData.email}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
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

                    {/* Phone Number */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Phone Number
                        </Text>
                        <PhoneInput
                            defaultCountry="ng"
                            value={formData.phone}
                            showDisabledDialCodeAndPrefix={true}
                            disableDialCodeAndPrefix={true}
                            disableFormatting={false}
                            onChange={(phone) => {
                                setFormData(prev => ({ ...prev, phone }));
                                if (errors.phone) {
                                    setErrors(prev => ({ ...prev, phone: undefined }));
                                }
                            }}
                            style={{
                                width: '100%',
                            }}
                            inputStyle={{
                                width: '100%',
                                height: '36px',
                                fontSize: '12px',
                                borderColor: errors.phone ? '#fc8181' : 'transparent',
                                backgroundColor: '#f7fafc',
                                borderRadius: '6px',
                            }}
                            countrySelectorStyleProps={{
                                buttonStyle: {
                                    height: '36px',
                                    backgroundColor: '#f7fafc',
                                    borderColor: 'transparent',
                                    borderRadius: '6px',
                                },
                            }}
                        />
                        {errors.phone && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.phone}
                            </Text>
                        )}
                    </Box>

                    {/* Password */}
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
                            _placeholder={{
                                fontSize: 'xs',
                            }}
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

                    {/* Terms and Privacy */}
                    <Box>
                        <HStack align="start" gap={2}>
                            <input
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={handleCheckboxChange}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#f94444',
                                    cursor: 'pointer'
                                }}
                            />
                            <Text fontSize="xs" color="gray.600" lineHeight="1.4">
                                By Signing up, you agree to the{' '}
                                <Link color="primary.500" href="#" _hover={{ color: 'primary.600' }}>
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link color="primary.500" href="#" _hover={{ color: 'primary.600' }}>
                                    Privacy Policy
                                </Link>
                            </Text>
                        </HStack>
                        {errors.agreeToTerms && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.agreeToTerms}
                            </Text>
                        )}
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
                        mt="20px"
                        _hover={{ bg: 'primary.600' }}
                    >
                        Create Account
                    </Button>
                </Stack>
            </Box>

        </VStack>
    );
};
