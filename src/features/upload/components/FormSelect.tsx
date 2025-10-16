import React from 'react';
import { Box, Text, SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem, createListCollection } from '@chakra-ui/react';

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
    const collection = createListCollection({ items: options });

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
                onValueChange={(details) => onChange?.(details.value)}
            >
                <SelectTrigger h="40px" fontSize="11px">
                    <SelectValueText placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent fontSize="11px">
                    {collection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </SelectRoot>
        </Box>
    );
};

