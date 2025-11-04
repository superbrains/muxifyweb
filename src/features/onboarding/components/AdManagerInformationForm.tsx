import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useChakraToast } from '@shared/hooks';
import { CountryStateSelect } from '@shared/components/CountryStateSelect';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';


interface AdManagerInformationData {
    fullName: string;
    cacRegistrationNumber: string;
    yearOfRegistration: string;
    country: string;
    state: string;
    residentAddress: string;
}

interface AdManagerInformationErrors {
    fullName?: string;
    cacRegistrationNumber?: string;
    yearOfRegistration?: string;
    country?: string;
    state?: string;
    residentAddress?: string;
}

export const AdManagerInformationForm: React.FC = () => {
    const [formData, setFormData] = useState<AdManagerInformationData>({
        fullName: '',
        cacRegistrationNumber: '',
        yearOfRegistration: '',
        country: '',
        state: '',
        residentAddress: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<AdManagerInformationErrors>({});

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { saveAdManagerInformation, setCurrentUser } = useUserManagementStore();
    
    // Get userId from location state or use current user
    const userId = (location.state as { userId?: string })?.userId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof AdManagerInformationErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: AdManagerInformationErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.cacRegistrationNumber.trim()) {
            newErrors.cacRegistrationNumber = 'CAC registration number is required';
        }

        if (!formData.yearOfRegistration.trim()) {
            newErrors.yearOfRegistration = 'Year of registration is required';
        }

        if (!formData.country) {
            newErrors.country = 'Country is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (!formData.residentAddress.trim()) {
            newErrors.residentAddress = 'Resident address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Save information to store
            if (userId) {
                setCurrentUser(userId);
                saveAdManagerInformation(userId, {
                    fullName: formData.fullName,
                    cacRegistrationNumber: formData.cacRegistrationNumber,
                    yearOfRegistration: formData.yearOfRegistration,
                    country: formData.country,
                    state: formData.state,
                    residentAddress: formData.residentAddress,
                });
            }

            // Here you would typically save the ad manager information
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Information saved!', 'Your details have been updated.');
            navigate('/onboarding/ad-manager/director-information', {
                state: { userId }
            });
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Please try again.'
                : 'Please try again.';
            toast.error('Failed to save information', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    Complete Information
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Lorem ipsum dolor sit amet consectetur. Mauris placerat nulla sit duis.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <Stack gap={3}>
                    {/* Full Name */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Full Name
                        </Text>
                        <Input
                            name="fullName"
                            type="text"
                            variant="subtle"
                            value={formData.fullName}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Full Name"
                            borderColor={errors.fullName ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.fullName && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.fullName}
                            </Text>
                        )}
                    </Box>

                    {/* CAC Registration Number */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            CAC Registration Number
                        </Text>
                        <Input
                            name="cacRegistrationNumber"
                            type="text"
                            variant="subtle"
                            value={formData.cacRegistrationNumber}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="CAC Number"
                            borderColor={errors.cacRegistrationNumber ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.cacRegistrationNumber && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.cacRegistrationNumber}
                            </Text>
                        )}
                    </Box>

                    {/* Year of Registration */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Year of Registration
                        </Text>
                        <DatePicker
                            selected={formData.yearOfRegistration ? new Date(formData.yearOfRegistration) : null}
                            onChange={(date: Date | null) => {
                                if (date) {
                                    const year = date.getFullYear().toString();
                                    setFormData(prev => ({ ...prev, yearOfRegistration: year }));
                                    if (errors.yearOfRegistration) {
                                        setErrors(prev => ({ ...prev, yearOfRegistration: '' }));
                                    }
                                } else {
                                    setFormData(prev => ({ ...prev, yearOfRegistration: '' }));
                                }
                            }}
                            dateFormat="yyyy"
                            showYearPicker
                            yearItemNumber={12}
                            placeholderText="Select year of registration"
                            className="date-picker-input"
                            wrapperClassName="w-full"
                            calendarClassName="text-xs"
                            maxDate={new Date()}
                        />
                        {errors.yearOfRegistration && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.yearOfRegistration}
                            </Text>
                        )}
                    </Box>

                    {/* Country and State */}
                    <CountryStateSelect
                        countryValue={formData.country}
                        stateValue={formData.state}
                        onCountryChange={(country) => {
                            setFormData(prev => ({
                                ...prev,
                                country,
                                state: '' // Reset state when country changes
                            }));
                            if (errors.country) {
                                setErrors(prev => ({ ...prev, country: undefined }));
                            }
                        }}
                        onStateChange={(state) => {
                            setFormData(prev => ({ ...prev, state }));
                            if (errors.state) {
                                setErrors(prev => ({ ...prev, state: undefined }));
                            }
                        }}
                        countryError={errors.country}
                        stateError={errors.state}
                    />

                    {/* Resident Address */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Resident Address
                        </Text>
                        <Input
                            name="residentAddress"
                            type="text"
                            variant="subtle"
                            value={formData.residentAddress}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="House Address"
                            borderColor={errors.residentAddress ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.residentAddress && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.residentAddress}
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
                        Continue
                    </Button>
                </Stack>
            </Box>
        </VStack>
    );
};
