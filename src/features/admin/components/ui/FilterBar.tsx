import React from 'react';
import { Box, HStack, Input, Stack } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import { Select } from '@shared/components';

export interface SelectFilter {
    /** Stable id (used as React key). */
    key: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    width?: string;
}

interface FilterBarProps {
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        /** Debounce in ms before `onChange` fires (default 300). */
        debounceMs?: number;
    };
    filters?: SelectFilter[];
    /** Right-aligned slot, e.g. an export button. */
    right?: React.ReactNode;
}

/**
 * Generic filter row used by every list page: a debounced search input plus an
 * arbitrary set of select filters. Generalises the bespoke `UsersFilterBar` so
 * each tower configures its own filters without restyling.
 */
export const FilterBar: React.FC<FilterBarProps> = ({ search, filters, right }) => {
    const [local, setLocal] = React.useState(search?.value ?? '');
    const debounce = search?.debounceMs ?? 300;

    React.useEffect(() => {
        setLocal(search?.value ?? '');
    }, [search?.value]);

    React.useEffect(() => {
        if (!search) return;
        const trimmed = local.trim();
        if (trimmed === (search.value ?? '')) return;
        const id = window.setTimeout(() => search.onChange(trimmed), debounce);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local]);

    return (
        <Stack
            gap={2}
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            px={{ base: 3, md: 4 }}
            py={3}
            direction={{ base: 'column', lg: 'row' }}
            align={{ base: 'stretch', lg: 'center' }}
        >
            {search && (
                <HStack
                    bg="gray.50"
                    borderRadius="10px"
                    px={3}
                    border="1px solid"
                    borderColor="gray.100"
                    flex="1"
                    minW="200px"
                >
                    <Box color="gray.400" fontSize="14px">
                        <FiSearch />
                    </Box>
                    <Input
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        placeholder={search.placeholder ?? 'Search'}
                        variant="subtle"
                        size="sm"
                        bg="transparent"
                        border="none"
                        fontSize="xs"
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                    />
                    {local && (
                        <Box
                            as="button"
                            onClick={() => setLocal('')}
                            color="gray.400"
                            fontSize="14px"
                            _hover={{ color: 'gray.600' }}
                            aria-label="Clear search"
                        >
                            <FiX />
                        </Box>
                    )}
                </HStack>
            )}

            {filters && filters.length > 0 && (
                <HStack gap={2} flexWrap="wrap">
                    {filters.map((f) => (
                        <Select
                            key={f.key}
                            options={f.options}
                            value={f.value}
                            onChange={(v) => f.onChange(v as string)}
                            width={f.width ?? '150px'}
                            borderColor="gray.200"
                            borderRadius="10px"
                        />
                    ))}
                </HStack>
            )}

            {right && <Box ml={{ lg: 'auto' }}>{right}</Box>}
        </Stack>
    );
};
