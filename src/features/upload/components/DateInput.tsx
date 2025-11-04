import React from 'react';
import { Box, Text, Icon } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateInputProps {
    value: string;
    onChange: (value: string) => void;
    dateFormat?: string;
    placeholder?: string;
    maxDate?: Date;
    minDate?: Date;
}

export const DateInput: React.FC<DateInputProps> = ({
    value,
    onChange,
    dateFormat = "dd MMM, yyyy",
    placeholder = "Select date",
    maxDate,
    minDate
}) => {
    const selectedDate = value ? new Date(value) : null;

    const handleDateChange = (date: Date | null) => {
        if (date) {
            // Format the date as ISO string for storage
            const isoString = date.toISOString().split('T')[0];
            onChange(isoString);
        } else {
            onChange('');
        }
    };

    return (
        <Box flex="1">
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                Release Date
            </Text>
            <Box position="relative">
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat={dateFormat}
                    placeholderText={placeholder}
                    maxDate={maxDate}
                    minDate={minDate}
                    className="date-picker-input"
                    wrapperClassName="w-full"
                    calendarClassName="text-xs"
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
