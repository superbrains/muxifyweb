import React from 'react';
import {
    Box,
    Button,
    HStack,
    Input,
    Menu,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';
import { FiCheck, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import type {
    ReleaseFilters,
    ReleaseSortKey,
    ReleaseStatus,
    RosterArtistDto,
} from '../types';

type TabKey = 'all' | 'music' | 'video' | 'drafts' | 'scheduled';

interface ReleasesFilterBarProps {
    filters: ReleaseFilters;
    onChange: (next: ReleaseFilters) => void;
    roster: RosterArtistDto[];
}

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'music', label: 'Music' },
    { key: 'video', label: 'Music Videos' },
    { key: 'drafts', label: 'Drafts' },
    { key: 'scheduled', label: 'Scheduled' },
];

const STATUS_OPTIONS: ReleaseStatus[] = ['Live', 'Scheduled', 'Draft', 'Processing', 'Failed'];

const SORT_OPTIONS: Array<{ key: ReleaseSortKey; label: string }> = [
    { key: 'recent', label: 'Recent' },
    { key: 'streams', label: 'Most streams' },
    { key: 'title', label: 'Title A–Z' },
];

function deriveTab(filters: ReleaseFilters): TabKey {
    const status = filters.status ?? [];
    if (filters.kind === 'video') return 'video';
    if (filters.kind === 'track') return 'music';
    if (status.length === 1 && status[0] === 'Draft') return 'drafts';
    if (status.length === 1 && status[0] === 'Scheduled') return 'scheduled';
    return 'all';
}

function applyTab(filters: ReleaseFilters, tab: TabKey): ReleaseFilters {
    const base: ReleaseFilters = { ...filters, page: 1 };
    switch (tab) {
        case 'all':
            return { ...base, kind: 'all', status: undefined };
        case 'music':
            return { ...base, kind: 'track', status: undefined };
        case 'video':
            return { ...base, kind: 'video', status: undefined };
        case 'drafts':
            return { ...base, kind: 'all', status: ['Draft'] };
        case 'scheduled':
            return { ...base, kind: 'all', status: ['Scheduled'] };
    }
}

export const ReleasesFilterBar: React.FC<ReleasesFilterBarProps> = ({
    filters,
    onChange,
    roster,
}) => {
    const activeTab = deriveTab(filters);
    const [searchInput, setSearchInput] = React.useState(filters.search ?? '');

    // Keep local input in sync if filters reset externally
    React.useEffect(() => {
        setSearchInput(filters.search ?? '');
    }, [filters.search]);

    // Debounce search input → filters
    React.useEffect(() => {
        const trimmed = searchInput.trim();
        if (trimmed === (filters.search ?? '')) return;
        const id = window.setTimeout(() => {
            onChange({ ...filters, search: trimmed || undefined, page: 1 });
        }, 300);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const selectedStatuses = new Set(filters.status ?? []);
    const selectedArtists = new Set(filters.artistIds ?? []);
    const currentSort = filters.sort ?? 'recent';

    const toggleStatus = (s: ReleaseStatus) => {
        const next = new Set(selectedStatuses);
        if (next.has(s)) next.delete(s);
        else next.add(s);
        onChange({
            ...filters,
            status: next.size === 0 ? undefined : Array.from(next),
            page: 1,
        });
    };

    const toggleArtist = (id: string) => {
        const next = new Set(selectedArtists);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange({
            ...filters,
            artistIds: next.size === 0 ? undefined : Array.from(next),
            page: 1,
        });
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
            {/* Tabs */}
            <HStack gap={1} overflowX={{ base: 'auto', md: 'visible' }} flexWrap={{ base: 'nowrap', md: 'wrap' }}>
                {TABS.map((t) => {
                    const isActive = t.key === activeTab;
                    return (
                        <Button
                            key={t.key}
                            onClick={() => onChange(applyTab(filters, t.key))}
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
                            {t.label}
                        </Button>
                    );
                })}
            </HStack>

            <HStack gap={2} wrap={{ base: 'wrap', md: 'nowrap' }}>
                {/* Search */}
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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by title or artist"
                        variant="subtle"
                        size="sm"
                        bg="transparent"
                        border="none"
                        fontSize="xs"
                        _focus={{ outline: 'none', boxShadow: 'none' }}
                    />
                    {searchInput && (
                        <Box
                            as="button"
                            onClick={() => setSearchInput('')}
                            color="gray.400"
                            fontSize="14px"
                            _hover={{ color: 'gray.600' }}
                            aria-label="Clear search"
                        >
                            <FiX />
                        </Box>
                    )}
                </HStack>

                {/* Artist filter */}
                <Menu.Root>
                    <Menu.Trigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            borderRadius="10px"
                            borderColor="gray.200"
                            color="gray.700"
                        >
                            <HStack gap={1}>
                                <Text>
                                    Artist
                                    {selectedArtists.size > 0 ? ` (${selectedArtists.size})` : ''}
                                </Text>
                                <FiChevronDown />
                            </HStack>
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content
                                minW="220px"
                                maxH="320px"
                                overflowY="auto"
                                borderRadius="md"
                                boxShadow="lg"
                                p={1}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.100"
                                zIndex={1500}
                            >
                                {roster.length === 0 ? (
                                    <Text fontSize="xs" color="gray.500" px={3} py={2}>
                                        No artists yet
                                    </Text>
                                ) : (
                                    roster.map((a) => {
                                        const checked = selectedArtists.has(a.artistUserId);
                                        return (
                                            <Menu.Item
                                                key={a.artistUserId}
                                                value={a.artistUserId}
                                                onClick={() => toggleArtist(a.artistUserId)}
                                                fontSize="xs"
                                                _hover={{ bg: 'gray.50' }}
                                                closeOnSelect={false}
                                            >
                                                <HStack justify="space-between" width="100%">
                                                    <Text>{a.performingName}</Text>
                                                    {checked && (
                                                        <Box color="primary.500">
                                                            <FiCheck />
                                                        </Box>
                                                    )}
                                                </HStack>
                                            </Menu.Item>
                                        );
                                    })
                                )}
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>

                {/* Status filter — only meaningful on tabs that don't lock status */}
                {(activeTab === 'all' || activeTab === 'music' || activeTab === 'video') && (
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                borderColor="gray.200"
                                color="gray.700"
                            >
                                <HStack gap={1}>
                                    <Text>
                                        Status
                                        {selectedStatuses.size > 0 ? ` (${selectedStatuses.size})` : ''}
                                    </Text>
                                    <FiChevronDown />
                                </HStack>
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content
                                    minW="180px"
                                    borderRadius="md"
                                    boxShadow="lg"
                                    p={1}
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    zIndex={1500}
                                >
                                    {STATUS_OPTIONS.map((s) => {
                                        const checked = selectedStatuses.has(s);
                                        return (
                                            <Menu.Item
                                                key={s}
                                                value={s}
                                                onClick={() => toggleStatus(s)}
                                                fontSize="xs"
                                                _hover={{ bg: 'gray.50' }}
                                                closeOnSelect={false}
                                            >
                                                <HStack justify="space-between" width="100%">
                                                    <Text>{s}</Text>
                                                    {checked && (
                                                        <Box color="primary.500">
                                                            <FiCheck />
                                                        </Box>
                                                    )}
                                                </HStack>
                                            </Menu.Item>
                                        );
                                    })}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                )}

                {/* Sort */}
                <Menu.Root>
                    <Menu.Trigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            borderRadius="10px"
                            borderColor="gray.200"
                            color="gray.700"
                            ml={{ base: 0, md: 'auto' }}
                        >
                            <HStack gap={1}>
                                <Text>
                                    Sort: {SORT_OPTIONS.find((o) => o.key === currentSort)?.label}
                                </Text>
                                <FiChevronDown />
                            </HStack>
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content
                                minW="160px"
                                borderRadius="md"
                                boxShadow="lg"
                                p={1}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.100"
                                zIndex={1500}
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <Menu.Item
                                        key={o.key}
                                        value={o.key}
                                        onClick={() => onChange({ ...filters, sort: o.key, page: 1 })}
                                        fontSize="xs"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        <HStack justify="space-between" width="100%">
                                            <Text>{o.label}</Text>
                                            {o.key === currentSort && (
                                                <Box color="primary.500">
                                                    <FiCheck />
                                                </Box>
                                            )}
                                        </HStack>
                                    </Menu.Item>
                                ))}
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </HStack>
        </Stack>
    );
};
