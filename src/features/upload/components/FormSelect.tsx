import React, { useState, useMemo } from 'react';
import { Box, Text, SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem, createListCollection, Input, SelectIndicatorGroup, SelectIndicator, SelectControl } from '@chakra-ui/react';

interface SelectOption {
    label: string;
    value: string;
}

interface FormSelectProps {
    label: string;
    options: SelectOption[];
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    label,
    options,
    value,
    defaultValue,
    onChange,
    placeholder = 'Select option',
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const collection = createListCollection({ items: filteredOptions });

    const handleValueChange = (details: { value: string[] }) => {
        onChange?.(details.value);
        setSearchTerm('');
    };

    const handleOpenChange = (details: { open: boolean }) => {
        if (!details.open) {
            setSearchTerm('');
        }
    };

    return (
        <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                {label}
            </Text>
            <SelectRoot
                collection={collection}
                size="sm"
                value={value}
                defaultValue={defaultValue}
                onValueChange={handleValueChange}
                onOpenChange={handleOpenChange}
            >
                <SelectControl>
                    <SelectTrigger h="40px" fontSize="11px">
                        <SelectValueText placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectIndicatorGroup>
                        <SelectIndicator />
                    </SelectIndicatorGroup>
                </SelectControl>

                <SelectContent fontSize="11px" maxH="300px">
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
                            placeholder="Search options..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            h="32px"
                        />
                    </Box>

                    {/* Filtered Options */}
                    <Box maxH="250px" overflowY="auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((item) => (
                                <SelectItem item={item} key={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))
                        ) : (
                            <Box p={3} fontSize="11px" color="gray.500" textAlign="center">
                                No options found
                            </Box>
                        )}
                    </Box>
                </SelectContent>
            </SelectRoot>
        </Box>
    );
};

