import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Stack,
    Text,
    VStack,
    Select,
    Portal,
    createListCollection,
} from '@chakra-ui/react';
import { useChakraToast } from '@shared/hooks';
import { CountryStateSelect } from '@shared/components/CountryStateSelect';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';

// Collections for select options
const businessTypes = createListCollection({
    items: [
        { label: "Record Label", value: "record_label" },
        { label: "Distribution", value: "distribution" },
        { label: "Music Publishing", value: "publishing" },
        { label: "Artist Management", value: "management" },
        { label: "Music Production", value: "production" },
        { label: "Event Management", value: "events" },
    ],
});

interface CompanyInformationData {
    legalCompanyName: string;
    companyName: string;
    natureOfBusiness: string;
    country: string;
    state: string;
    companyAddress: string;
}

interface CompanyInformationErrors {
    legalCompanyName?: string;
    companyName?: string;
    natureOfBusiness?: string;
    country?: string;
    state?: string;
    companyAddress?: string;
}

export const CompanyInformationForm: React.FC = () => {
    const [formData, setFormData] = useState<CompanyInformationData>({
        legalCompanyName: '',
        companyName: '',
        natureOfBusiness: '',
        country: '',
        state: '',
        companyAddress: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<CompanyInformationErrors>({});

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { saveCompanyInformation, setCurrentUser } = useUserManagementStore();
    
    // Get userId from location state or use current user
    const userId = (location.state as { userId?: string })?.userId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof CompanyInformationErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: CompanyInformationErrors = {};

        if (!formData.legalCompanyName.trim()) {
            newErrors.legalCompanyName = 'Legal company name is required';
        }

        if (!formData.natureOfBusiness) {
            newErrors.natureOfBusiness = 'Nature of business is required';
        }

        if (!formData.country) {
            newErrors.country = 'Country is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (!formData.companyAddress.trim()) {
            newErrors.companyAddress = 'Company address is required';
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
                saveCompanyInformation(userId, {
                    legalCompanyName: formData.legalCompanyName,
                    companyName: formData.companyName || undefined,
                    natureOfBusiness: formData.natureOfBusiness,
                    country: formData.country,
                    state: formData.state,
                    companyAddress: formData.companyAddress,
                });
            }

            // Here you would typically save the company information
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Company information saved!', 'Your company details have been updated.');
            navigate('/onboarding/company/director-information', {
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
                    Company Information
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Lorem ipsum dolor sit amet consectetur. Mauris placerat nulla sit duis.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <Stack gap={3}>
                    {/* Legal Company Name */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Legal Company Name
                        </Text>
                        <Input
                            name="legalCompanyName"
                            type="text"
                            variant="subtle"
                            value={formData.legalCompanyName}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Company Name"
                            borderColor={errors.legalCompanyName ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.legalCompanyName && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.legalCompanyName}
                            </Text>
                        )}
                    </Box>

                    {/* Company Name (Optional) */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Company Name <Text as="span" color="gray.400">(Optional)</Text>
                        </Text>
                        <Input
                            name="companyName"
                            type="text"
                            variant="subtle"
                            value={formData.companyName}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Company Name"
                            borderColor="transparent"
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                    </Box>

                    {/* Nature of Business */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Nature of Business
                        </Text>
                        <Select.Root
                            size="sm"
                            fontSize="xs"
                            collection={businessTypes}
                            value={formData.natureOfBusiness ? [formData.natureOfBusiness] : []}
                            onValueChange={(details) => {
                                setFormData(prev => ({ ...prev, natureOfBusiness: details.value[0] || '' }));
                                if (errors.natureOfBusiness) {
                                    setErrors(prev => ({ ...prev, natureOfBusiness: undefined }));
                                }
                            }}
                        >
                            <Select.HiddenSelect name="natureOfBusiness" />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Nature of Business" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {businessTypes.items.map((business) => (
                                            <Select.Item fontSize="xs" item={business} key={business.value}>
                                                {business.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                        {errors.natureOfBusiness && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.natureOfBusiness}
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

                    {/* Company Address */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Company Address
                        </Text>
                        <Input
                            name="companyAddress"
                            type="text"
                            variant="subtle"
                            value={formData.companyAddress}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Address"
                            borderColor={errors.companyAddress ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.companyAddress && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.companyAddress}
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
