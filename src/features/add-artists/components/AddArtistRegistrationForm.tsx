import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    VStack,
    Text,
    HStack,
    Select,
    Portal,
    createListCollection,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useChakraToast } from '@shared/hooks';
import { useArtistStore } from '@/features/artists/store/useArtistStore';
import { CountryStateSelect } from '@shared/components/CountryStateSelect';

// Collections for select options
const musicGenres = createListCollection({
    items: [
        { label: "Afrobeat", value: "afrobeat" },
        { label: "Hip-Hop", value: "hip-hop" },
        { label: "R&B", value: "r&b" },
        { label: "Pop", value: "pop" },
        { label: "Reggae", value: "reggae" },
        { label: "Gospel", value: "gospel" },
        { label: "Jazz", value: "jazz" },
        { label: "Blues", value: "blues" },
    ],
});

interface AddArtistRegistrationData {
    artistFullName: string;
    performingName: string;
    contractStartDate: Date | null;
    contractEndDate: Date | null;
    musicGenre: string;
    country: string;
    state: string;
}

interface AddArtistRegistrationErrors {
    artistFullName?: string;
    performingName?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    musicGenre?: string;
    country?: string;
    state?: string;
}

export const AddArtistRegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState<AddArtistRegistrationData>({
        artistFullName: '',
        performingName: '',
        contractStartDate: null,
        contractEndDate: null,
        musicGenre: '',
        country: '',
        state: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<AddArtistRegistrationErrors>({});

    const toast = useChakraToast();
    const navigate = useNavigate();
    const { addArtist } = useArtistStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof AddArtistRegistrationErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleDateChange = (name: 'contractStartDate' | 'contractEndDate', date: Date | null) => {
        setFormData(prev => ({ ...prev, [name]: date }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (name: 'musicGenre', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: AddArtistRegistrationErrors = {};

        if (!formData.artistFullName.trim()) {
            newErrors.artistFullName = 'Artist full name is required';
        }

        if (!formData.performingName.trim()) {
            newErrors.performingName = 'Performing name is required';
        }

        if (!formData.contractStartDate) {
            newErrors.contractStartDate = 'Contract start date is required';
        }

        if (!formData.contractEndDate) {
            newErrors.contractEndDate = 'Contract end date is required';
        }

        if (formData.contractStartDate && formData.contractEndDate && formData.contractEndDate < formData.contractStartDate) {
            newErrors.contractEndDate = 'End date must be after start date';
        }

        if (!formData.musicGenre) {
            newErrors.musicGenre = 'Music genre is required';
        }

        if (!formData.country) {
            newErrors.country = 'Country is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Add artist to store
            const newArtist = addArtist({
                name: formData.performingName,
                genre: formData.musicGenre,
                userType: 'Artist/Musician',
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Artist added successfully!', 'Please continue with the onboarding process.');
            navigate('/add-artist/display-picture', {
                state: { artistId: newArtist.id }
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
                    Artist Information
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    Lorem ipsum dolor sit amet consectetur. Mauris placerat nulla sit duis.
                </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit} w="full">
                <VStack gap={3} align="stretch">
                    {/* Artist Full Name */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Artist Full Name
                        </Text>
                        <Input
                            name="artistFullName"
                            type="text"
                            variant="subtle"
                            value={formData.artistFullName}
                            size="sm"
                            fontSize="xs"
                            _placeholder={{
                                fontSize: 'xs',
                            }}
                            onChange={handleChange}
                            placeholder="Full Name"
                            borderColor={errors.artistFullName ? 'red.300' : 'transparent'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {errors.artistFullName && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.artistFullName}
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

                    {/* Contract Dates */}
                    <HStack gap={4} align="start">
                        {/* Contract Start Date */}
                        <Box flex="1">
                            <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                Contract Date - Start
                            </Text>
                            <Box position="relative">
                                <style>{`
                                    .contract-date-picker {
                                        width: 100%;
                                        height: 36px;
                                        padding: 0 12px;
                                        font-size: 12px;
                                        background-color: #f7fafc;
                                        border: 1px solid ${errors.contractStartDate ? '#fc8181' : 'transparent'};
                                        border-radius: 6px;
                                        color: #2d3748;
                                        font-family: inherit;
                                    }
                                    .contract-date-picker::placeholder {
                                        color: #9ca3af;
                                    }
                                    .contract-date-picker:focus {
                                        outline: none;
                                        border-color: #f94444;
                                        box-shadow: 0 0 0 1px #f94444;
                                    }
                                `}</style>
                                <DatePicker
                                    selected={formData.contractStartDate}
                                    onChange={(date: Date | null) => handleDateChange('contractStartDate', date)}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    className="contract-date-picker"
                                    wrapperClassName="w-full"
                                />
                            </Box>
                            {errors.contractStartDate && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                    {errors.contractStartDate}
                            </Text>
                        )}
                    </Box>

                        {/* Contract End Date */}
                        <Box flex="1">
                            <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                                Contract Date - Ends
                            </Text>
                            <Box position="relative">
                                <DatePicker
                                    selected={formData.contractEndDate}
                                    onChange={(date: Date | null) => handleDateChange('contractEndDate', date)}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    className="contract-date-picker"
                                    wrapperClassName="w-full"
                                />
                            </Box>
                            {errors.contractEndDate && (
                                <Text color="red.500" fontSize="xs" mt={0.5}>
                                    {errors.contractEndDate}
                                </Text>
                            )}
                        </Box>
                    </HStack>

                    {/* Music Genre */}
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Music Genre
                        </Text>
                        <Select.Root
                            size="sm"
                            fontSize="xs"
                            collection={musicGenres}
                            value={formData.musicGenre ? [formData.musicGenre] : []}
                            onValueChange={(details) => {
                                handleSelectChange('musicGenre', details.value[0] || '');
                            }}
                        >
                            <Select.HiddenSelect name="musicGenre" />
                            <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Select Genre" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                        {musicGenres.items.map((genre) => (
                                            <Select.Item fontSize="xs" item={genre} key={genre.value}>
                                                {genre.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                        {errors.musicGenre && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {errors.musicGenre}
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

                    {/* Continue Button */}
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
                </VStack>
            </Box>
        </VStack>
    );
};
