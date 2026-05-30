import React from 'react';
import { Box, Button, Flex, HStack, Input, Text } from '@chakra-ui/react';
import { FiDownload, FiSearch } from 'react-icons/fi';
import type { DateRange } from '../../types/finance';

/** White card wrapper that holds a row of filter controls. */
export function ToolbarCard({ children }: { children: React.ReactNode }) {
    return (
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
            {children}
        </Flex>
    );
}

/** Debounced search box matching the admin filter-bar look. */
export function SearchInput({
    value,
    onChange,
    placeholder = 'Search…',
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [local, setLocal] = React.useState(value);
    React.useEffect(() => setLocal(value), [value]);
    React.useEffect(() => {
        const t = setTimeout(() => {
            if (local !== value) onChange(local);
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local]);

    return (
        <HStack
            flex={{ base: 'none', lg: '1' }}
            minW={{ lg: '220px' }}
            gap={2}
            bg="gray.50"
            borderRadius="lg"
            px={3}
            py={1.5}
        >
            <Box as={FiSearch} color="gray.400" />
            <Input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder={placeholder}
                variant="subtle"
                border="none"
                bg="transparent"
                fontSize="xs"
                px={0}
                _focus={{ boxShadow: 'none' }}
            />
        </HStack>
    );
}

/** From/To date-range control (no date-picker dependency — native date inputs). */
export function DateRangeFilter({
    range,
    onChange,
}: {
    range: DateRange;
    onChange: (next: DateRange) => void;
}) {
    return (
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
                w="140px"
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
                w="140px"
            />
        </HStack>
    );
}

/** Right-aligned CSV export button. */
export function ExportButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            size="sm"
            variant="outline"
            borderColor="gray.200"
            borderRadius="lg"
            fontSize="xs"
            ml={{ lg: 'auto' }}
        >
            <Box as={FiDownload} mr={1.5} />
            Export CSV
        </Button>
    );
}
