import React from 'react';
import { Flex, HStack, Input, Text } from '@chakra-ui/react';
import type { DateWindow } from '../../types/platform';

interface DateWindowBarProps {
    range: DateWindow;
    onChange: (next: DateWindow) => void;
    /** Optional right-aligned slot (e.g. a granularity select). */
    right?: React.ReactNode;
}

/**
 * From/To window toolbar for the analytics pages. Wraps native date inputs in
 * the same white card chrome as the shared {@link FilterBar} so the analytics
 * towers read identically to the list pages. No date-picker dependency.
 */
export const DateWindowBar: React.FC<DateWindowBarProps> = ({ range, onChange, right }) => (
    <Flex
        gap={2}
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        px={{ base: 3, md: 4 }}
        py={3}
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'center' }}
        wrap="wrap"
    >
        <HStack gap={1.5}>
            <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                From
            </Text>
            <Input
                type="date"
                value={range.from ?? ''}
                onChange={(e) => onChange({ ...range, from: e.target.value || undefined })}
                size="sm"
                fontSize="xs"
                borderColor="gray.200"
                borderRadius="lg"
                w="150px"
            />
            <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase">
                To
            </Text>
            <Input
                type="date"
                value={range.to ?? ''}
                onChange={(e) => onChange({ ...range, to: e.target.value || undefined })}
                size="sm"
                fontSize="xs"
                borderColor="gray.200"
                borderRadius="lg"
                w="150px"
            />
        </HStack>
        {right}
    </Flex>
);
