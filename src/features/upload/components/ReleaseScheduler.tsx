import React, { useState } from 'react';
import { Box, HStack, Icon, Text } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { DateInput, TimeInput } from './';

interface ReleaseSchedulerProps {
    defaultOption?: 'now' | 'schedule';
    onOptionChange?: (option: 'now' | 'schedule') => void;
    onDateChange?: (date: string) => void;
    onTimeChange?: (time: string) => void;
    onPeriodChange?: (period: 'AM' | 'PM') => void;
}

export const ReleaseScheduler: React.FC<ReleaseSchedulerProps> = ({
    defaultOption = 'now',
    onOptionChange,
    onDateChange,
    onTimeChange,
    onPeriodChange,
}) => {
    const [releaseOption, setReleaseOption] = useState<'now' | 'schedule'>(defaultOption);
    const [releaseDate, setReleaseDate] = useState('');
    const [releaseTime, setReleaseTime] = useState('');
    const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');

    const handleOptionChange = (option: 'now' | 'schedule') => {
        setReleaseOption(option);
        onOptionChange?.(option);
    };

    const handleDateChange = (date: string) => {
        setReleaseDate(date);
        onDateChange?.(date);
    };

    const handleTimeChange = (time: string) => {
        setReleaseTime(time);
        onTimeChange?.(time);
    };

    const handlePeriodChange = (period: 'AM' | 'PM') => {
        setTimePeriod(period);
        onPeriodChange?.(period);
    };

    return (
        <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                Release
            </Text>
            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                overflow="hidden"
            >
                {/* Now Option */}
                <HStack
                    p={3}
                    cursor="pointer"
                    onClick={() => handleOptionChange('now')}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    bg={releaseOption === 'now' ? 'gray.50' : 'white'}
                    _hover={{ bg: 'gray.50' }}
                >
                    <Box
                        w={4}
                        h={4}
                        border="1px solid"
                        borderColor="pink.200"
                        borderRadius="sm"
                        bg={releaseOption === 'now' ? 'pink.100' : 'white'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {releaseOption === 'now' && (
                            <Icon as={FiCheck} color="red.500" boxSize={3} />
                        )}
                    </Box>
                    <Text fontSize="11px" color="gray.900">
                        Now
                    </Text>
                </HStack>

                {/* Schedule Release Option */}
                <HStack
                    p={3}
                    cursor="pointer"
                    onClick={() => handleOptionChange('schedule')}
                    bg={releaseOption === 'schedule' ? 'gray.50' : 'white'}
                    _hover={{ bg: 'gray.50' }}
                >
                    <Box
                        w={4}
                        h={4}
                        border="1px solid"
                        borderColor="pink.200"
                        borderRadius="sm"
                        bg={releaseOption === 'schedule' ? 'pink.100' : 'white'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {releaseOption === 'schedule' && (
                            <Icon as={FiCheck} color="red.500" boxSize={3} />
                        )}
                    </Box>
                    <Text fontSize="11px" color="gray.900">
                        Schedule Release
                    </Text>
                </HStack>
            </Box>

            {/* Schedule Release Fields */}
            {releaseOption === 'schedule' && (
                <HStack gap={4} mt={4} w="full">
                    <DateInput
                        value={releaseDate}
                        onChange={handleDateChange}
                    />
                    <TimeInput
                        value={releaseTime}
                        onChange={handleTimeChange}
                        period={timePeriod}
                        onPeriodChange={handlePeriodChange}
                    />
                </HStack>
            )}
        </Box>
    );
};

