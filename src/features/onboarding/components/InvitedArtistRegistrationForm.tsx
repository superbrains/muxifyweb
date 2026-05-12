import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Input, Stack, Text, VStack, HStack, Link } from '@chakra-ui/react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useChakraToast } from '@shared/hooks';
import { PasswordInput } from '@/components/ui/password-input';
import {
    useUserManagementStore,
    type ArtistOnboardingData,
} from '@/features/auth/store/useUserManagementStore';
import { authService } from '@/features/auth/services/authService';
import { useUserStore } from '@/app/store/useUserStore';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';

interface FormState {
    phone: string;
    password: string;
    agreeToTerms: boolean;
}

interface FormErrors {
    phone?: string;
    password?: string;
    agreeToTerms?: string;
    general?: string;
}

export const InvitedArtistRegistrationForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useChakraToast();
    const { login } = useUserStore();
    const { getUserData, getCurrentUserData, saveArtistInformation, markEmailVerified } =
        useUserManagementStore();

    const stateUserId = (location.state as { userId?: string })?.userId;

    // The invitation context (email, token, label name) is sourced from the
    // onboarding store, which was seeded by InviteAcceptPage. Reading from the
    // store rather than from URL params keeps the token off every step's URL
    // and survives a reload mid-flow (IndexedDB-persisted).
    const data = useMemo<ArtistOnboardingData | null>(() => {
        if (stateUserId) {
            const d = getUserData(stateUserId);
            return d ? (d as ArtistOnboardingData) : null;
        }
        const d = getCurrentUserData();
        return d ? (d as ArtistOnboardingData) : null;
    }, [stateUserId, getUserData, getCurrentUserData]);

    const [formData, setFormData] = useState<FormState>({
        phone: '',
        password: '',
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // If the user landed here directly without going through the accept page,
    // bail back to /join. No invitation context means we can't safely register.
    useEffect(() => {
        if (!data?.invitationToken || !data?.email) {
            navigate('/join', { replace: true });
        }
    }, [data, navigate]);

    const validate = (): boolean => {
        const next: FormErrors = {};
        if (!formData.phone) next.phone = 'Phone number is required';
        if (!formData.password) next.password = 'Password is required';
        else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
        if (!formData.agreeToTerms) next.agreeToTerms = 'You must agree to the terms';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !data?.email || !data?.invitationToken) return;

        setLoading(true);
        try {
            const result = await authService.register({
                email: data.email,
                password: formData.password,
                phone: formData.phone,
                role: 'artist',
                invitationToken: data.invitationToken,
            });

            login(result.user);

            if (stateUserId) {
                // Backend already created the user as verified+active; mirror
                // that in the local store so the rest of the onboarding flow
                // doesn't try to surface the verify-email step.
                saveArtistInformation(stateUserId, { phone: formData.phone });
                markEmailVerified(stateUserId);
            }

            toast.success('Account created!', 'Tell us a bit more about you.');
            // Skip the verify-email step — the invitation token already proved
            // email ownership and the backend issued an active+verified user.
            navigate('/onboarding/artist/complete-information', {
                state: {
                    email: data.email,
                    userType: 'artist',
                    userId: stateUserId,
                    fromInvitation: true,
                },
            });
        } catch (error) {
            const message = getApiErrorMessage(error, 'Registration failed. Please try again.');
            toast.error('Registration failed', message);
            setErrors({ general: message });
        } finally {
            setLoading(false);
        }
    };

    if (!data?.email) {
        return null;
    }

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    You're invited to {data.invitedByLabelName ?? 'a record label'}
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Set a password to finish creating your artist account.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <Stack gap={3}>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Email Address
                        </Text>
                        <Input
                            type="email"
                            variant="subtle"
                            value={data.email}
                            size="sm"
                            fontSize="xs"
                            disabled
                            readOnly
                            _disabled={{ opacity: 0.85, cursor: 'not-allowed' }}
                        />
                        <Text fontSize="2xs" color="gray.500" mt={0.5}>
                            Locked — this invitation was sent to {data.email}.
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Phone Number
                        </Text>
                        <PhoneInput
                            defaultCountry="ng"
                            value={formData.phone}
                            showDisabledDialCodeAndPrefix
                            disableDialCodeAndPrefix
                            disableFormatting={false}
                            onChange={(phone) => {
                                setFormData((prev) => ({ ...prev, phone }));
                                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                            }}
                            style={{ width: '100%' }}
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
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, password: e.target.value }));
                                if (errors.password)
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                            }}
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

                    <Box>
                        <HStack align="start" gap={2}>
                            <input
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        agreeToTerms: e.target.checked,
                                    }));
                                    if (errors.agreeToTerms)
                                        setErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
                                }}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#f94444',
                                    cursor: 'pointer',
                                }}
                            />
                            <Text fontSize="xs" color="gray.600" lineHeight="1.4">
                                By signing up, you agree to the{' '}
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
                        disabled={loading}
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
                        Continue
                    </Button>
                </Stack>
            </Box>
        </VStack>
    );
};
