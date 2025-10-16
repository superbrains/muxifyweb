import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { HiOutlineTrash } from 'react-icons/hi';
import { useChakraToast } from '@shared/hooks';

// Collection for ID types
const idTypes = createListCollection({
    items: [
        { label: "National ID", value: "national_id" },
        { label: "Driver's License", value: "drivers_license" },
        { label: "International Passport", value: "passport" },
        { label: "Voter's Card", value: "voters_card" },
        { label: "Bank Verification Number", value: "bvn" },
    ],
});

interface DirectorData {
    name: string;
    meansOfIdentification: string;
    identityNumber: string;
}

interface DirectorInformationData {
    directors: DirectorData[];
}

interface DirectorInformationErrors {
    directors?: {
        name?: string;
        meansOfIdentification?: string;
        identityNumber?: string;
    }[];
}

interface DirectorInformationFormProps {
    nextRoute?: string;
}

export const DirectorInformationForm: React.FC<DirectorInformationFormProps> = ({
    nextRoute = '/onboarding/company/label-logo'
}) => {
    const [formData, setFormData] = useState<DirectorInformationData>({
        directors: [
            {
                name: '',
                meansOfIdentification: '',
                identityNumber: '',
            }
        ]
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<DirectorInformationErrors>({});

    const toast = useChakraToast();
    const navigate = useNavigate();

    const handleDirectorChange = (index: number, field: keyof DirectorData, value: string) => {
        const newDirectors = [...formData.directors];
        newDirectors[index] = { ...newDirectors[index], [field]: value };
        setFormData(prev => ({ ...prev, directors: newDirectors }));

        // Clear error for this field
        if (errors.directors?.[index]?.[field]) {
            const newErrors = { ...errors };
            if (newErrors.directors?.[index]) {
                newErrors.directors[index] = { ...newErrors.directors[index], [field]: undefined };
            }
            setErrors(newErrors);
        }
    };

    const addDirector = () => {
        setFormData(prev => ({
            ...prev,
            directors: [
                ...prev.directors,
                {
                    name: '',
                    meansOfIdentification: '',
                    identityNumber: '',
                }
            ]
        }));
    };

    const removeDirector = (index: number) => {
        if (formData.directors.length > 1) {
            const newDirectors = formData.directors.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, directors: newDirectors }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: DirectorInformationErrors = {
            directors: []
        };

        let hasErrors = false;

        formData.directors.forEach((director, index) => {
            const directorErrors: { name?: string; meansOfIdentification?: string; identityNumber?: string } = {};

            if (!director.name.trim()) {
                directorErrors.name = 'Director name is required';
                hasErrors = true;
            }

            if (!director.meansOfIdentification) {
                directorErrors.meansOfIdentification = 'Means of identification is required';
                hasErrors = true;
            }

            if (!director.identityNumber.trim()) {
                directorErrors.identityNumber = 'Identity number is required';
                hasErrors = true;
            }

            newErrors.directors![index] = directorErrors;
        });

        setErrors(newErrors);
        return !hasErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Here you would typically save the director information
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Director information saved!', 'Director details have been updated.');
            navigate(nextRoute);
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
                    Directors Information
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Lorem ipsum dolor sit amet consectetur. Mauris placerat nulla sit duis.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <Stack gap={4}>
                    {formData.directors.map((director, index) => (
                        <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                            <VStack gap={3} align="stretch">
                                {/* Director Name */}
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Text fontSize="xs" fontWeight="medium" color="grey.500">
                                            Director Name
                                        </Text>
                                        {formData.directors.length > 1 && (
                                            <IconButton
                                                size="xs"
                                                variant="ghost"
                                                color="primary.500"
                                                onClick={() => removeDirector(index)}
                                                aria-label="Delete director"
                                            >
                                                <Icon as={HiOutlineTrash} boxSize={4} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Input
                                        type="text"
                                        variant="subtle"
                                        value={director.name}
                                        size="sm"
                                        fontSize="xs"
                                        _placeholder={{
                                            fontSize: 'xs',
                                        }}
                                        onChange={(e) => handleDirectorChange(index, 'name', e.target.value)}
                                        placeholder="Director Name"
                                        borderColor={errors.directors?.[index]?.name ? 'red.300' : 'transparent'}
                                        _focus={{
                                            borderColor: 'primary.500',
                                            boxShadow: '0 0 0 1px #f94444',
                                        }}
                                    />
                                    {errors.directors?.[index]?.name && (
                                        <Text color="red.500" fontSize="xs" mt={0.5}>
                                            {errors.directors[index].name}
                                        </Text>
                                    )}
                                </Box>

                                {/* Means of Identification */}
                                <Box>
                                    <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                        Means of Identification
                                    </Text>
                                    <Select.Root
                                        size="sm"
                                        fontSize="xs"
                                        collection={idTypes}
                                        value={director.meansOfIdentification ? [director.meansOfIdentification] : []}
                                        onValueChange={(details) => {
                                            handleDirectorChange(index, 'meansOfIdentification', details.value[0] || '');
                                        }}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Select ID Type" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {idTypes.items.map((idType) => (
                                                        <Select.Item fontSize="xs" item={idType} key={idType.value}>
                                                            {idType.label}
                                                            <Select.ItemIndicator />
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                    {errors.directors?.[index]?.meansOfIdentification && (
                                        <Text color="red.500" fontSize="xs" mt={0.5}>
                                            {errors.directors[index].meansOfIdentification}
                                        </Text>
                                    )}
                                </Box>

                                {/* Identity Number */}
                                <Box>
                                    <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                        Identity Number
                                    </Text>
                                    <Input
                                        type="text"
                                        variant="subtle"
                                        value={director.identityNumber}
                                        size="sm"
                                        fontSize="xs"
                                        _placeholder={{
                                            fontSize: 'xs',
                                        }}
                                        onChange={(e) => handleDirectorChange(index, 'identityNumber', e.target.value)}
                                        placeholder="Identity Number"
                                        borderColor={errors.directors?.[index]?.identityNumber ? 'red.300' : 'transparent'}
                                        _focus={{
                                            borderColor: 'primary.500',
                                            boxShadow: '0 0 0 1px #f94444',
                                        }}
                                    />
                                    {errors.directors?.[index]?.identityNumber && (
                                        <Text color="red.500" fontSize="xs" mt={0.5}>
                                            {errors.directors[index].identityNumber}
                                        </Text>
                                    )}
                                </Box>

                                {/* Add Director Button */}
                                {index === formData.directors.length - 1 && (
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            type="button"
                                            onClick={addDirector}
                                            variant="ghost"
                                            fontSize="xs"
                                            fontWeight="medium"
                                            bg="primary.25"
                                            color="primary.500"
                                            _hover={{ color: 'primary.600' }}
                                            rounded="full"
                                            py={2}
                                            px={4}
                                            h="auto"
                                        >
                                            Add Director
                                        </Button>
                                    </Box>
                                )}
                            </VStack>
                        </Box>
                    ))}

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
