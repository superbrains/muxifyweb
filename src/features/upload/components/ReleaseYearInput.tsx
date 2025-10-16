import React from 'react';
import { Box, Icon, Input, Text } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';

interface ReleaseYearInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const ReleaseYearInput: React.FC<ReleaseYearInputProps> = ({ value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Only allow numbers and limit to 4 digits
        if (/^\d{0,4}$/.test(inputValue)) {
            onChange(inputValue);
        }
    };

    return (
        <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                Release Year
            </Text>
            <Box position="relative">
                <Input
                    placeholder="YYYY"
                    value={value}
                    onChange={handleChange}
                    size="sm"
                    fontSize="11px"
                    h="40px"
                    borderColor="gray.200"
                    pr={10}
                    _placeholder={{ fontSize: '11px', color: 'gray.400' }}
                    maxLength={4}
                />
                <Icon
                    as={FiCalendar}
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    boxSize={4.5}
                    color="gray.400"
                    pointerEvents="none"
                />
            </Box>
        </Box>
    );
};

