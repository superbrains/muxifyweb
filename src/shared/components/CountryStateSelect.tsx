import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Text,
    Select,
    Portal,
    createListCollection,
    Input,
} from '@chakra-ui/react';
import { useLocationStore } from '@shared/store/useLocationStore';
import type { CountryOption, StateOption } from '@shared/types/location';

interface CountryStateSelectProps {
    countryValue: string;
    stateValue: string;
    onCountryChange: (country: string) => void;
    onStateChange: (state: string) => void;
    countryError?: string;
    stateError?: string;
    disabled?: boolean;
}

export const CountryStateSelect: React.FC<CountryStateSelectProps> = ({
    countryValue,
    stateValue,
    onCountryChange,
    onStateChange,
    countryError,
    stateError,
    disabled = false,
}) => {
    const {
        countries,
        states,
        loading: locationLoading,
        error: locationError,
        fetchCountries,
        setSelectedCountry,
    } = useLocationStore();

    // Search states for country and state
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [stateSearchTerm, setStateSearchTerm] = useState('');

    // Fetch countries on component mount
    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    // Filter countries based on search term
    const filteredCountries = useMemo(() => {
        if (!countrySearchTerm) return countries;
        return countries.filter((country: CountryOption) =>
            country.label.toLowerCase().includes(countrySearchTerm.toLowerCase())
        );
    }, [countries, countrySearchTerm]);

    // Filter states based on search term
    const filteredStates = useMemo(() => {
        if (!stateSearchTerm) return states;
        return states.filter((state: StateOption) =>
            state.label.toLowerCase().includes(stateSearchTerm.toLowerCase())
        );
    }, [states, stateSearchTerm]);

    const handleCountryChange = (details: { value: string[] }) => {
        const selectedCountryValue = details.value[0] || '';
        const selectedCountryData = countries.find((c: CountryOption) => c.value === selectedCountryValue);

        onCountryChange(selectedCountryValue);

        // Update the store with selected country
        if (selectedCountryData) {
            setSelectedCountry(selectedCountryData);
        }

        // Clear search term when country changes
        setCountrySearchTerm('');
    };

    const handleStateChange = (details: { value: string[] }) => {
        onStateChange(details.value[0] || '');
        setStateSearchTerm('');
    };

    const handleCountryOpenChange = (details: { open: boolean }) => {
        if (!details.open) {
            setCountrySearchTerm('');
        }
    };

    const handleStateOpenChange = (details: { open: boolean }) => {
        if (!details.open) {
            setStateSearchTerm('');
        }
    };

    return (
        <>
            {/* Country */}
            <Box>
                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                    Country
                </Text>
                <Select.Root
                    size="sm"
                    fontSize="11px"
                    collection={createListCollection({
                        items: filteredCountries.map((country: CountryOption) => ({
                            label: `${country.emoji} ${country.label}`,
                            value: country.value,
                        }))
                    })}
                    value={countryValue ? [countryValue] : []}
                    onValueChange={handleCountryChange}
                    onOpenChange={handleCountryOpenChange}
                    disabled={locationLoading.countries || disabled}
                >
                    <Select.HiddenSelect name="country" />
                    <Select.Control>
                        <Select.Trigger h="40px" fontSize="11px">
                            <Select.ValueText placeholder={locationLoading.countries ? "Loading countries..." : "Select Country"} />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content fontSize="11px" maxH="300px">
                                {/* Search Input - Fixed at top */}
                                <Box
                                    p={2}
                                    borderBottom="1px solid"
                                    borderColor="gray.200"
                                    position="sticky"
                                    top={0}
                                    bg="white"
                                    zIndex={10}
                                >
                                    <Input
                                        size="sm"
                                        fontSize="11px"
                                        placeholder="Search countries..."
                                        value={countrySearchTerm}
                                        onChange={(e) => setCountrySearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        h="32px"
                                    />
                                </Box>

                                {/* Filtered Countries */}
                                <Box maxH="250px" overflowY="auto">
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((country: CountryOption) => (
                                            <Select.Item
                                                fontSize="11px"
                                                item={{
                                                    label: `${country.emoji} ${country.label}`,
                                                    value: country.value,
                                                }}
                                                key={country.value}
                                            >
                                                {country.emoji} {country.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))
                                    ) : (
                                        <Box p={3} fontSize="11px" color="gray.500" textAlign="center">
                                            No countries found
                                        </Box>
                                    )}
                                </Box>
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
                {locationError.countries && (
                    <Text color="red.500" fontSize="11px" mt={0.5}>
                        {locationError.countries}
                    </Text>
                )}
                {countryError && (
                    <Text color="red.500" fontSize="11px" mt={0.5}>
                        {countryError}
                    </Text>
                )}
            </Box>

            {/* State */}
            <Box>
                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                    State
                </Text>
                <Select.Root
                    size="sm"
                    fontSize="11px"
                    collection={createListCollection({
                        items: filteredStates.map((state: StateOption) => ({
                            label: state.label,
                            value: state.value,
                        }))
                    })}
                    value={stateValue ? [stateValue] : []}
                    onValueChange={handleStateChange}
                    onOpenChange={handleStateOpenChange}
                    disabled={!countryValue || locationLoading.states || disabled}
                >
                    <Select.HiddenSelect name="state" />
                    <Select.Control>
                        <Select.Trigger h="40px" fontSize="11px">
                            <Select.ValueText
                                placeholder={
                                    !countryValue
                                        ? "Select country first"
                                        : locationLoading.states
                                            ? "Loading states..."
                                            : "Select State"
                                }
                            />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content fontSize="11px" maxH="300px">
                                {/* Search Input - Fixed at top */}
                                <Box
                                    p={2}
                                    borderBottom="1px solid"
                                    borderColor="gray.200"
                                    position="sticky"
                                    top={0}
                                    bg="white"
                                    zIndex={10}
                                >
                                    <Input
                                        size="sm"
                                        fontSize="11px"
                                        placeholder="Search states..."
                                        value={stateSearchTerm}
                                        onChange={(e) => setStateSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        h="32px"
                                        disabled={!countryValue}
                                    />
                                </Box>

                                {/* Filtered States */}
                                <Box maxH="250px" overflowY="auto">
                                    {filteredStates.length > 0 ? (
                                        filteredStates.map((state: StateOption) => (
                                            <Select.Item
                                                fontSize="11px"
                                                item={{
                                                    label: state.label,
                                                    value: state.value,
                                                }}
                                                key={state.value}
                                            >
                                                {state.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))
                                    ) : (
                                        <Box p={3} fontSize="11px" color="gray.500" textAlign="center">
                                            {!countryValue ? "Select a country first" : "No states found"}
                                        </Box>
                                    )}
                                </Box>
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
                {locationError.states && (
                    <Text color="red.500" fontSize="11px" mt={0.5}>
                        {locationError.states}
                    </Text>
                )}
                {stateError && (
                    <Text color="red.500" fontSize="11px" mt={0.5}>
                        {stateError}
                    </Text>
                )}
            </Box>
        </>
    );
};
