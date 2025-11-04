import React from 'react';
import { Box, Icon, Text } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ReleaseYearInputProps {
    value: string;
    onChange: (value: string) => void;
    dateFormat?: string;
    placeholder?: string;
}

export const ReleaseYearInput: React.FC<ReleaseYearInputProps> = ({
    value,
    onChange,
    dateFormat = "yyyy",
    placeholder = "Select Year"
}) => {
    const selectedDate = value ? new Date(value + '-01-01') : null;

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const year = date.getFullYear().toString();
            onChange(year);
        } else {
            onChange('');
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                Release Year
            </Text>
            <Box position="relative">
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat={dateFormat}
                    showYearPicker
                    yearItemNumber={12}
                    placeholderText={placeholder}
                    className="input bg-white border border-gray-200 w-full px-3 py-2 rounded-md text-xs h-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    wrapperClassName="w-full"
                    calendarClassName="text-xs"
                    maxDate={new Date(currentYear + 5, 11, 31)}
                    minDate={new Date(1950, 0, 1)}
                />
                <Icon
                    as={FiCalendar}
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    boxSize={4}
                    color="gray.400"
                    pointerEvents="none"
                    zIndex={1}
                />
            </Box>
        </Box>
    );
};

