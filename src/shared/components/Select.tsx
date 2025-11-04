import React from 'react';
import { Box, Icon, SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem, createListCollection, SelectIndicatorGroup, SelectIndicator, SelectControl, Portal } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { Select as ChakraSelect } from '@chakra-ui/react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    width?: string | number;
    fontSize?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: string;
    iconColor?: string;
    placeholder?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Select: React.FC<SelectProps> = ({
    options,
    defaultValue,
    value,
    onChange,
    width = "120px",
    fontSize = "12px",
    backgroundColor = "white",
    textColor = "gray.800",
    borderColor = "gray.300",
    borderRadius = "md",
    iconColor,
    placeholder,
    disabled = false,
    size = "sm",
}) => {
    const collection = createListCollection({ items: options });

    const handleValueChange = (details: { value: string[] }) => {
        if (onChange && details.value.length > 0) {
            onChange(details.value[0]);
        }
    };

    const selectIconColor = iconColor || (backgroundColor === "primary.500" ? "white" : "gray.600");

    return (
        <Box width={width}>
            <SelectRoot
                collection={collection}
                size={size}
                value={value ? [value] : undefined}
                defaultValue={defaultValue ? [defaultValue] : undefined}
                onValueChange={handleValueChange}
                disabled={disabled}
            >
                <SelectControl>
                    <SelectTrigger
                        h="40px"
                        fontSize={fontSize}
                        bg={backgroundColor}
                        color={textColor}
                        borderColor={borderColor}
                        borderRadius={borderRadius}
                        _focus={{ borderColor: "primary.500", outline: "none" }}
                        opacity={disabled ? 0.6 : 1}
                        cursor={disabled ? "not-allowed" : "pointer"}
                    >
                        <SelectValueText placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectIndicatorGroup>
                        <SelectIndicator>
                            <Icon as={FaChevronDown} boxSize={3} color={selectIconColor} />
                        </SelectIndicator>
                    </SelectIndicatorGroup>
                </SelectControl>
                <Portal><ChakraSelect.Positioner>
                    <SelectContent fontSize={fontSize} maxH="300px">
                        {options.map((option) => (
                            <SelectItem item={option} key={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>

                </ChakraSelect.Positioner></Portal>

            </SelectRoot>
        </Box>
    );
};
