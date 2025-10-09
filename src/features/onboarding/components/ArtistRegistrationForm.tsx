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
import { useToast } from '@shared/hooks';
import { PasswordInput } from "@/components/ui/password-input";

// Collections for select options
const userTypes = createListCollection({
    items: [
        { label: "Artist/Musician", value: "artist" },
        { label: "Creator", value: "creator" },
        { label: "DJ", value: "dj" },
    ],
});

const countryCodes = createListCollection({
    items: [
        { label: "🇳🇬 +234", value: "+234" },
        { label: "🇺🇸 +1", value: "+1" },
        { label: "🇬🇧 +44", value: "+44" },
        { label: "🇫🇷 +33", value: "+33" },
    ],
});

interface ArtistRegistrationData {
    userType: string;
    email: string;
    phoneNumber: string;
    countryCode: string;
    password: string;
    agreeToTerms: boolean;
}

interface ArtistRegistrationErrors {
    userType?: string;
    email?: string;
    phoneNumber?: string;
    countryCode?: string;
    password?: string;
    agreeToTerms?: string;
}

export const ArtistRegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState<ArtistRegistrationData>({
        userType: 'artist',
        email: '',
        phoneNumber: '',
        countryCode: '+234',
        password: '',
        agreeToTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ArtistRegistrationErrors>({});

    const { toast } = useToast();
    const navigate = useNavigate();

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

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
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
            // Here you would typically register the user
            // For now, we'll simulate success and navigate to email verification
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Registration successful!', 'Please verify your email to continue.');
            navigate('/onboarding/artist/verify-email', {
                state: { email: formData.email, userType: formData.userType }
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
                    Artists, Creators, & DJs
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
                        <HStack gap={2}>
                            <Select.Root
                                size="sm"
                                fontSize="xs"
                                collection={countryCodes}
                                flex={1}
                                value={[formData.countryCode]}
                                onValueChange={(details) => {
                                    setFormData(prev => ({ ...prev, countryCode: details.value[0] }));
                                    if (errors.countryCode) {
                                        setErrors(prev => ({ ...prev, countryCode: undefined }));
                                    }
                                }}
                            >
                                <Select.HiddenSelect name="countryCode" />
                                <Select.Control w="100px">
                                    <Select.Trigger>
                                        <Select.ValueText placeholder="+234" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {countryCodes.items.map((country) => (
                                                <Select.Item fontSize="xs" item={country} key={country.value}>
                                                    {country.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                            <Input
                                name="phoneNumber"
                                type="tel"
                                variant="subtle"
                                value={formData.phoneNumber}
                                size="sm"
                                fontSize="xs"
                                flex={9}
                                _placeholder={{
                                    fontSize: 'xs',
                                }}
                                onChange={handleChange}
                                placeholder="e.g 90 345 6789"
                                borderColor={errors.phoneNumber ? 'red.300' : 'transparent'}
                                _focus={{
                                    borderColor: 'primary.500',
                                    boxShadow: '0 0 0 1px #f94444',
                                }}
                            />
                        </HStack>
                        {errors.phoneNumber && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.phoneNumber}
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
