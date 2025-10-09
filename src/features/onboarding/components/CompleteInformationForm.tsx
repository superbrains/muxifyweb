import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Select,
    Stack,
    Text,
    VStack,
    Portal,
    createListCollection,
} from '@chakra-ui/react';
import { useToast } from '@shared/hooks';

// Collection for location options
const locations = createListCollection({
    items: [
        { label: "Lagos, Nigeria", value: "lagos" },
        { label: "Abuja, Nigeria", value: "abuja" },
        { label: "London, UK", value: "london" },
        { label: "New York, USA", value: "new-york" },
        { label: "Los Angeles, USA", value: "los-angeles" },
        { label: "Toronto, Canada", value: "toronto" },
        { label: "Paris, France", value: "paris" },
        { label: "Berlin, Germany", value: "berlin" },
    ],
});

interface CompleteInformationData {
    fullName: string;
    performingName: string;
    recordLabel: string;
    location: string;
    residentAddress: string;
}

export const CompleteInformationForm: React.FC = () => {
    const [formData, setFormData] = useState<CompleteInformationData>({
        fullName: '',
        performingName: '',
        recordLabel: '',
        location: '',
        residentAddress: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<CompleteInformationData>>({});

    const { toast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof CompleteInformationData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CompleteInformationData> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.performingName.trim()) {
            newErrors.performingName = 'Performing name is required';
        }

        if (!formData.location) {
            newErrors.location = 'Location is required';
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
            // Here you would typically save the information
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Information saved!', 'Your profile information has been updated.');
            navigate('/onboarding/artist/display-picture');
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

                    {/* Performing Name */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Performing Name
                        </Text>
                        <Input
                            name="performingName"
                            type="text"
                            variant="subtle"
                            value={formData.performingName}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Performing Name"
                            borderColor={errors.performingName ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.performingName && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.performingName}
                            </Text>
                        )}
                    </Box>

                    {/* Record Label (Optional) */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Record Label <Text as="span" color="gray.400">(Optional)</Text>
                        </Text>
                        <Input
                            name="recordLabel"
                            type="text"
                            variant="subtle"
                            value={formData.recordLabel}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Record Label"
                            borderColor="transparent"
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                    </Box>

                    {/* Location */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Location
                        </Text>
                        <Select.Root
                            size="sm"
                            fontSize="xs"
                            collection={locations}
                            value={formData.location ? [formData.location] : []}
                            onValueChange={(details) => {
                                setFormData(prev => ({ ...prev, location: details.value[0] || '' }));
                                if (errors.location) {
                                    setErrors(prev => ({ ...prev, location: undefined }));
                                }
                            }}
                        >
                            <Select.HiddenSelect name="location" />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Select Location" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {locations.items.map((location) => (
                                            <Select.Item fontSize="xs" item={location} key={location.value}>
                                                {location.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                        {errors.location && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.location}
                            </Text>
                        )}
                    </Box>

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
                            placeholder="Address"
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
