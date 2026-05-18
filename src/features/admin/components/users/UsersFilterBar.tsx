import React from 'react';
import { Box, HStack, Input, Stack } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import { Select } from '@shared/components';
import type { UserQuery } from '../../types';

interface UsersFilterBarProps {
    query: UserQuery;
    onChange: (next: UserQuery) => void;
}

const ROLE_OPTIONS = [
    { value: 'All', label: 'All roles' },
    { value: 'artist', label: 'Artists' },
    { value: 'dj', label: 'DJs' },
    { value: 'creator', label: 'Creators' },
    { value: 'record_label', label: 'Record Labels' },
    { value: 'ad_manager', label: 'Ad Managers' },
    { value: 'fan', label: 'Fans' },
    { value: 'admin', label: 'Admins' },
];

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Deactivated', label: 'Deactivated' },
];

const VERIFICATION_OPTIONS = [
    { value: 'All', label: 'Any verification' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'NotSubmitted', label: 'Not submitted' },
];

/** Role / status / verification selects + debounced search for user management. */
export const UsersFilterBar: React.FC<UsersFilterBarProps> = ({ query, onChange }) => {
    const [search, setSearch] = React.useState(query.search ?? '');

    React.useEffect(() => {
        setSearch(query.search ?? '');
    }, [query.search]);

    React.useEffect(() => {
        const trimmed = search.trim();
        if (trimmed === (query.search ?? '')) return;
        const id = window.setTimeout(() => {
            onChange({ ...query, search: trimmed || undefined, page: 1 });
        }, 300);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email"
                    variant="subtle"
                    size="sm"
                    bg="transparent"
                    border="none"
                    fontSize="xs"
                    _focus={{ outline: 'none', boxShadow: 'none' }}
                />
                {search && (
                    <Box
                        as="button"
                        onClick={() => setSearch('')}
                        color="gray.400"
                        fontSize="14px"
                        _hover={{ color: 'gray.600' }}
                        aria-label="Clear search"
                    >
                        <FiX />
                    </Box>
                )}
            </HStack>

            <HStack gap={2} flexWrap="wrap">
                <Select
                    options={ROLE_OPTIONS}
                    value={(query.role ?? 'All') as string}
                    onChange={(v) =>
                        onChange({ ...query, role: v as UserQuery['role'], page: 1 })
                    }
                    width="140px"
                    borderColor="gray.200"
                    borderRadius="10px"
                />
                <Select
                    options={STATUS_OPTIONS}
                    value={(query.status ?? 'All') as string}
                    onChange={(v) =>
                        onChange({ ...query, status: v as UserQuery['status'], page: 1 })
                    }
                    width="150px"
                    borderColor="gray.200"
                    borderRadius="10px"
                />
                <Select
                    options={VERIFICATION_OPTIONS}
                    value={(query.verification ?? 'All') as string}
                    onChange={(v) =>
                        onChange({
                            ...query,
                            verification: v as UserQuery['verification'],
                            page: 1,
                        })
                    }
                    width="160px"
                    borderColor="gray.200"
                    borderRadius="10px"
                />
            </HStack>
        </Stack>
    );
};
