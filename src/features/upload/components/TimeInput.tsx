import React from 'react';
import { Box, Text, Input, HStack, Button } from '@chakra-ui/react';

interface TimeInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    period: 'AM' | 'PM';
    onPeriodChange: (period: 'AM' | 'PM') => void;
}

export const TimeInput: React.FC<TimeInputProps> = ({ label, value, onChange, period, onPeriodChange }) => {
    return (
        <Box flex="1">
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                {label || "Release Time"}
            </Text>
            <HStack gap={2}>
                <Input
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    size="sm"
                    fontSize="11px"
                    h="40px"
                    borderColor="gray.200"
                    _placeholder={{ fontSize: '11px', color: 'gray.400' }}
                />
                <Button
                    size="sm"
                    h="40px"
                    px={3}
                    fontSize="11px"
                    bg={period === 'AM' ? 'pink.100' : 'white'}
                    color={period === 'AM' ? 'red.500' : 'gray.600'}
                    border="1px solid"
                    borderColor={period === 'AM' ? 'pink.200' : 'gray.200'}
                    _hover={{
                        bg: period === 'AM' ? 'pink.200' : 'gray.50',
                    }}
                    onClick={() => onPeriodChange('AM')}
                >
                    AM
                </Button>
                <Button
                    size="sm"
                    h="40px"
                    px={3}
                    fontSize="11px"
                    bg={period === 'PM' ? 'pink.100' : 'white'}
                    color={period === 'PM' ? 'red.500' : 'gray.600'}
                    border="1px solid"
                    borderColor={period === 'PM' ? 'pink.200' : 'gray.200'}
                    _hover={{
                        bg: period === 'PM' ? 'pink.200' : 'gray.50',
                    }}
                    onClick={() => onPeriodChange('PM')}
                >
                    PM
                </Button>
            </HStack>
        </Box>
    );
};
