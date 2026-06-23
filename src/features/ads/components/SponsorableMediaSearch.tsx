import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, VStack, HStack, Text, Input, Icon, Avatar, Spinner } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { adsService } from '../services/adsService';
import type { SponsorableMediaItem } from '../types';

/** A selected sponsorable media item carried in form state. */
export interface SelectedMedia {
    id: string;
    title: string;
    artistName: string;
    coverArtUrl?: string;
}

interface SponsorableMediaSearchProps {
    /** Determines whether tracks (music) or videos are searched. */
    targetType: 'music' | 'video';
    /**
     * Campaign genre slug (e.g. "afrobeat", "hip-hop") used to scope the picker
     * to media of that genre. Must come from the shared GENRE_OPTIONS so it
     * matches the GenreName upload persisted.
     */
    genre?: string;
    selected: SelectedMedia[];
    onChange: (items: SelectedMedia[]) => void;
}

/** Avatar that resolves a (possibly auth-gated) cover-art URL. */
const MediaCover: React.FC<{ src?: string; label: string; size?: 'xs' | 'sm' }> = ({
    src,
    label,
    size = 'sm',
}) => {
    const resolved = useAuthedImageSrc(src);
    return (
        <Avatar.Root size={size} flexShrink={0}>
            {resolved && <Avatar.Image src={resolved} alt={label} />}
            <Avatar.Fallback fontSize={size === 'xs' ? '10px' : '12px'} bg="primary.100" color="primary.500">
                {label.charAt(0).toUpperCase()}
            </Avatar.Fallback>
        </Avatar.Root>
    );
};

/**
 * Searches the Muxify database for sponsorable media (tracks/videos with
 * AllowSponsorship=true) and lets the advertiser select items to target.
 * Replaces the previous mock artist list.
 */
export const SponsorableMediaSearch: React.FC<SponsorableMediaSearchProps> = ({
    targetType,
    genre,
    selected,
    onChange,
}) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<SponsorableMediaItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    // Monotonic request id so stale (out-of-order) responses are ignored.
    const requestIdRef = useRef(0);

    const heading = targetType === 'video' ? 'Sponsorable Videos' : 'Sponsorable Music';

    // Debounced live search whenever the query, target type or genre changes.
    // The genre slug comes from the shared GENRE_OPTIONS, so it matches the
    // GenreName upload persisted; the backend uses a case-insensitive contains
    // match so it stays robust to slug-vs-display variance.
    useEffect(() => {
        const term = input.trim();
        if (term.length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        const reqId = ++requestIdRef.current;
        const handle = setTimeout(async () => {
            try {
                const res = await adsService.searchSponsorableMedia({
                    type: targetType,
                    q: term,
                    genre: genre || undefined,
                    pageSize: 8,
                });
                if (reqId !== requestIdRef.current) return; // stale
                setSuggestions(res.items);
                setShowSuggestions(true);
            } catch {
                if (reqId !== requestIdRef.current) return;
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                if (reqId === requestIdRef.current) setLoading(false);
            }
        }, 300);

        return () => clearTimeout(handle);
    }, [input, targetType, genre]);

    const handleSelect = useCallback(
        (item: SponsorableMediaItem) => {
            if (!selected.some((m) => m.id === item.id)) {
                onChange([
                    ...selected,
                    { id: item.id, title: item.title, artistName: item.artistName, coverArtUrl: item.coverArtUrl },
                ]);
            }
            setInput('');
            setSuggestions([]);
            setShowSuggestions(false);
        },
        [selected, onChange]
    );

    const handleRemove = useCallback(
        (id: string) => {
            onChange(selected.filter((m) => m.id !== id));
        },
        [selected, onChange]
    );

    const handleBlur = () => {
        // Delay so a suggestion click can fire first.
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
            }
        }, 200);
    };

    // Hide already-selected items from suggestions.
    const visibleSuggestions = suggestions.filter((s) => !selected.some((m) => m.id === s.id));

    return (
        <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                {heading}
            </Text>
            <Box position="relative" w="full">
                <Box position="relative">
                    <Input
                        placeholder="Search"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => visibleSuggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={handleBlur}
                        size="xs"
                        h="40px"
                        borderRadius="10px"
                        pl="40px"
                    />
                    <Icon
                        as={FiSearch}
                        position="absolute"
                        left="12px"
                        top="50%"
                        transform="translateY(-50%)"
                        color="gray.400"
                        boxSize={4}
                        pointerEvents="none"
                    />
                    {loading && (
                        <Spinner
                            size="sm"
                            color="primary.500"
                            position="absolute"
                            right="12px"
                            top="50%"
                            transform="translateY(-50%)"
                        />
                    )}
                </Box>

                {/* Suggestions Dropdown */}
                {showSuggestions && visibleSuggestions.length > 0 && (
                    <Box
                        ref={suggestionsRef}
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        bg="white"
                        w="full"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        boxShadow="lg"
                        zIndex={10}
                        mt={1}
                        maxH="240px"
                        overflowY="auto"
                    >
                        <VStack align="stretch" gap={0}>
                            {visibleSuggestions.map((item) => (
                                <Box
                                    key={item.id}
                                    p={3}
                                    cursor="pointer"
                                    w="full"
                                    _hover={{ bg: 'gray.50' }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelect(item)}
                                >
                                    <HStack gap={3}>
                                        <MediaCover src={item.coverArtUrl} label={item.title} />
                                        <VStack align="start" gap={0} minW={0} flex="1">
                                            <Text fontSize="12px" fontWeight="semibold" color="gray.900" lineClamp={1}>
                                                {item.title}
                                            </Text>
                                            <Text fontSize="11px" color="gray.500" lineClamp={1}>
                                                {item.artistName}
                                                {item.genreName ? ` · ${item.genreName}` : ''}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                )}

                {/* Empty state when a query returns nothing */}
                {showSuggestions && !loading && visibleSuggestions.length === 0 && input.trim().length > 0 && (
                    <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        boxShadow="lg"
                        zIndex={10}
                        mt={1}
                        p={3}
                    >
                        <Text fontSize="12px" color="gray.500">
                            No sponsorable {targetType === 'video' ? 'videos' : 'music'} found
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Selected media chips */}
            {selected.length > 0 && (
                <HStack flexWrap="wrap" gap={2} mt={3}>
                    {selected.map((item) => (
                        <Box
                            key={item.id}
                            bg="gray.100"
                            px={3}
                            py={2}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >
                            <MediaCover src={item.coverArtUrl} label={item.title} size="xs" />
                            <Text fontSize="xs" color="gray.900" lineClamp={1} maxW="160px">
                                {item.title}
                            </Text>
                            <Icon
                                as={FiX}
                                cursor="pointer"
                                onClick={() => handleRemove(item.id)}
                                color="rgba(249,68,68,1)"
                                boxSize={3.5}
                                _hover={{ color: 'rgba(249,68,68,0.8)' }}
                            />
                        </Box>
                    ))}
                </HStack>
            )}
        </Box>
    );
};
