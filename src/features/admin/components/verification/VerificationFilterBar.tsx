import React from 'react';
import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import { verificationStatusStyle } from '../../lib/statusColor';
import type { VerificationQuery, VerificationStatus } from '../../types';

type StatusFilter = 'All' | Extract<VerificationStatus, 'Pending' | 'Verified' | 'Rejected'>;

const STATUS_TABS: StatusFilter[] = ['Pending', 'Verified', 'Rejected', 'All'];

interface VerificationFilterBarProps {
    query: VerificationQuery;
    onChange: (next: VerificationQuery) => void;
}

/** Status pills + debounced search for the Verification Center list. */
export const VerificationFilterBar: React.FC<VerificationFilterBarProps> = ({
    query,
    onChange,
}) => {
    const [search, setSearch] = React.useState(query.search ?? '');
    const activeStatus: StatusFilter = (query.status ?? 'Pending') as StatusFilter;

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
            gap={3}
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            px={{ base: 3, md: 4 }}
            py={3}
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
        >
            <HStack gap={1} overflowX="auto">
                {STATUS_TABS.map((tab) => {
                    const isActive = tab === activeStatus;
                    const style = tab === 'All' ? null : verificationStatusStyle(tab);
                    return (
                        <Button
                            key={tab}
                            onClick={() =>
                                onChange({
                                    ...query,
                                    status: tab === 'All' ? 'All' : tab,
                                    page: 1,
                                })
                            }
                            size="xs"
                            fontSize="11px"
                            fontWeight="medium"
                            borderRadius="full"
                            px={3}
                            bg={isActive ? 'primary.500' : 'gray.50'}
                            color={isActive ? 'white' : 'gray.700'}
                            _hover={{ bg: isActive ? 'primary.600' : 'gray.100' }}
                            flexShrink={0}
                        >
                            <HStack gap={1.5}>
                                {style && (
                                    <Box
                                        boxSize="6px"
                                        borderRadius="full"
                                        bg={isActive ? 'whiteAlpha.800' : style.dot}
                                    />
                                )}
                                <Text>{tab === 'All' ? 'All' : style?.label}</Text>
                            </HStack>
                        </Button>
                    );
                })}
            </HStack>

            <HStack
                bg="gray.50"
                borderRadius="10px"
                px={3}
                border="1px solid"
                borderColor="gray.100"
                minW={{ base: 'full', md: '260px' }}
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
        </Stack>
    );
};
