import React from 'react';
import { Box, HStack, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiCheck, FiImage } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { AuthedImage } from '@shared/components/AuthedImage';
import type { CatalogItem } from '../config/roleConfig';

interface CatalogPickerProps {
    /** Stable cache key (e.g. "artist:Track") so each catalog is fetched once. */
    cacheKey: string;
    load: () => Promise<CatalogItem[]>;
    placeholder?: string;
    selectedId?: string | null;
    onSelect: (item: CatalogItem) => void;
}

/**
 * A searchable list of the user's own catalogue (tracks, videos, releases or
 * campaigns) used to pin a copyright dispute to a specific item. Loads the
 * catalogue once via react-query and filters client-side.
 */
export const CatalogPicker: React.FC<CatalogPickerProps> = ({
    cacheKey,
    load,
    placeholder = 'Search…',
    selectedId,
    onSelect,
}) => {
    const [query, setQuery] = React.useState('');
    const { data, isLoading, isError } = useQuery({
        queryKey: ['disputeCatalog', cacheKey],
        queryFn: load,
        staleTime: 60_000,
    });

    const items = data ?? [];
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                (i.subtitle?.toLowerCase().includes(q) ?? false),
        );
    }, [items, query]);

    return (
        <VStack align="stretch" gap={2}>
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                size="sm"
                bg="gray.50"
                borderColor="gray.200"
                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
            />

            <Box
                maxH="220px"
                overflowY="auto"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="10px"
            >
                {isLoading ? (
                    <HStack justify="center" py={6} color="gray.400">
                        <Spinner size="sm" />
                        <Text fontSize="xs">Loading your catalogue…</Text>
                    </HStack>
                ) : isError ? (
                    <Text fontSize="xs" color="red.500" textAlign="center" py={6}>
                        Couldn't load your catalogue. Please try again.
                    </Text>
                ) : filtered.length === 0 ? (
                    <Text fontSize="xs" color="gray.400" textAlign="center" py={6}>
                        {items.length === 0 ? 'Nothing to dispute here yet.' : 'No matches.'}
                    </Text>
                ) : (
                    <VStack align="stretch" gap={0}>
                        {filtered.map((item) => {
                            const selected = item.id === selectedId;
                            return (
                                <HStack
                                    key={item.id}
                                    px={2.5}
                                    py={2}
                                    gap={3}
                                    cursor="pointer"
                                    bg={selected ? 'primary.50' : 'transparent'}
                                    _hover={{ bg: selected ? 'primary.50' : 'gray.50' }}
                                    onClick={() => onSelect(item)}
                                    borderBottom="1px solid"
                                    borderColor="gray.100"
                                >
                                    <Box
                                        boxSize="36px"
                                        borderRadius="8px"
                                        overflow="hidden"
                                        bg="gray.100"
                                        flexShrink={0}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        color="gray.400"
                                    >
                                        <AuthedImage
                                            src={item.coverUrl}
                                            alt={item.title}
                                            boxSize="36px"
                                            objectFit="cover"
                                            fallback={<FiImage />}
                                        />
                                    </Box>
                                    <VStack align="start" gap={0} minW={0} flex={1}>
                                        <Text fontSize="xs" fontWeight="medium" color="gray.900" truncate>
                                            {item.title}
                                        </Text>
                                        {item.subtitle && (
                                            <Text fontSize="11px" color="gray.500" truncate>
                                                {item.subtitle}
                                            </Text>
                                        )}
                                    </VStack>
                                    {selected && (
                                        <Box color="primary.500" flexShrink={0}>
                                            <FiCheck />
                                        </Box>
                                    )}
                                </HStack>
                            );
                        })}
                    </VStack>
                )}
            </Box>
        </VStack>
    );
};
