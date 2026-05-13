import React from 'react';
import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import type { PayoutStatus, PayoutsFilters } from '../types';
import { PAYOUT_STATUSES, payoutStatusStyle } from '../lib/payoutStatusColor';

interface PayoutsFilterBarProps {
    filters: PayoutsFilters;
    onChange: (next: PayoutsFilters) => void;
}

type TabKey = 'all' | PayoutStatus;

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: 'All' },
    ...PAYOUT_STATUSES.map((s) => ({ key: s, label: s })),
];

function toIsoDate(value: string): string | undefined {
    return value ? new Date(value).toISOString() : undefined;
}

function fromIsoDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

export const PayoutsFilterBar: React.FC<PayoutsFilterBarProps> = ({ filters, onChange }) => {
    const [search, setSearch] = React.useState(filters.search ?? '');
    const activeTab: TabKey = (filters.status ?? 'all') as TabKey;

    React.useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    // Debounce search → filters
    React.useEffect(() => {
        const trimmed = search.trim();
        if (trimmed === (filters.search ?? '')) return;
        const id = window.setTimeout(() => {
            onChange({ ...filters, search: trimmed || undefined, page: 1 });
        }, 300);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyTab = (tab: TabKey) => {
        const next: PayoutsFilters = {
            ...filters,
            status: tab === 'all' ? undefined : tab,
            page: 1,
        };
        onChange(next);
    };

    return (
        <Stack
            gap={3}
            bg="white"
            borderRadius="20px"
            border="1px solid"
            borderColor="gray.100"
            px={{ base: 3, md: 4 }}
            py={3}
        >
            <HStack gap={1} overflowX={{ base: 'auto', md: 'visible' }} flexWrap={{ base: 'nowrap', md: 'wrap' }}>
                {TABS.map((t) => {
                    const isActive = t.key === activeTab;
                    const style = t.key === 'all' ? null : payoutStatusStyle(t.key);
                    return (
                        <Button
                            key={t.key}
                            onClick={() => applyTab(t.key)}
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
                                <Text>{t.label}</Text>
                            </HStack>
                        </Button>
                    );
                })}
            </HStack>

            <HStack gap={2} wrap={{ base: 'wrap', md: 'nowrap' }}>
                <HStack
                    bg="gray.50"
                    borderRadius="10px"
                    px={3}
                    flex={{ base: '1 1 100%', md: '1' }}
                    minW="180px"
                    border="1px solid"
                    borderColor="gray.100"
                >
                    <Box color="gray.400" fontSize="14px">
                        <FiSearch />
                    </Box>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by recipient"
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

                <HStack gap={2}>
                    <DateField
                        label="From"
                        value={fromIsoDate(filters.from)}
                        onChange={(v) =>
                            onChange({ ...filters, from: toIsoDate(v), page: 1 })
                        }
                    />
                    <DateField
                        label="To"
                        value={fromIsoDate(filters.to)}
                        onChange={(v) =>
                            onChange({ ...filters, to: toIsoDate(v), page: 1 })
                        }
                    />
                </HStack>

                {(filters.from || filters.to || filters.status || filters.search) && (
                    <Button
                        onClick={() =>
                            onChange({
                                ...filters,
                                status: undefined,
                                from: undefined,
                                to: undefined,
                                search: undefined,
                                page: 1,
                            })
                        }
                        size="sm"
                        variant="ghost"
                        fontSize="xs"
                        color="gray.500"
                        _hover={{ color: 'primary.500', bg: 'primary.50' }}
                        ml={{ base: 0, md: 'auto' }}
                    >
                        Reset
                    </Button>
                )}
            </HStack>
        </Stack>
    );
};

const DateField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
    <HStack
        bg="gray.50"
        borderRadius="10px"
        px={3}
        border="1px solid"
        borderColor="gray.100"
        gap={2}
    >
        <Text fontSize="10px" color="gray.500" fontWeight="medium" textTransform="uppercase">
            {label}
        </Text>
        <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            variant="subtle"
            size="sm"
            bg="transparent"
            border="none"
            fontSize="xs"
            _focus={{ outline: 'none', boxShadow: 'none' }}
            width="130px"
        />
    </HStack>
);
