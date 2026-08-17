import React from 'react';
import { Badge, Box, HStack, Icon, Input, Spinner, Text } from '@chakra-ui/react';
import { FiSearch, FiX } from 'react-icons/fi';
import { CoverThumb } from '@shared/console';
import { contentService } from '../services/contentService';
import { spotlightService } from '../services/spotlightService';
import type { ContentItemDto, ContentKind } from '../types/content';
import type { SpotlightArtistResult, SpotlightType } from '../types/spotlight';

const ACCENT = '#f94444';
const DEBOUNCE_MS = 250;
const nf = new Intl.NumberFormat('en-NG');

/** A normalized search row spanning both content items and artists. */
interface PickerEntity {
    id: string;
    title: string;
    /** Owner / release type / track count / followers — the muted second line. */
    secondary?: string;
    /** Cover-art or avatar proxy path; resolved by {@link CoverThumb}. */
    imageUrl?: string;
    /** Artist avatars render round. */
    round?: boolean;
    /** Verified tick for artists. */
    verified?: boolean;
    /** "Track" / "Album" badge for the merged NewRelease list. */
    kindLabel?: string;
}

/** Maps a content-backed spotlight type to its content-library kind (null = not a single content kind). */
function kindFor(type: SpotlightType): ContentKind | null {
    switch (type) {
        case 'Track':
            return 'track';
        case 'Album':
            return 'album';
        case 'Playlist':
            return 'playlist';
        case 'Video':
            return 'video';
        default:
            return null; // Artist and NewRelease are handled specially.
    }
}

function contentSecondary(item: ContentItemDto): string {
    const extra = item.releaseType ?? (item.trackCount != null ? `${item.trackCount} tracks` : undefined);
    return [item.ownerName, extra].filter(Boolean).join(' · ');
}

function mapContentItem(item: ContentItemDto, kindLabel?: string): PickerEntity {
    return {
        id: item.id,
        title: item.title,
        secondary: contentSecondary(item),
        imageUrl: item.coverArtUrl,
        kindLabel,
    };
}

function mapArtist(a: SpotlightArtistResult): PickerEntity {
    const bits: string[] = [];
    if (a.trackCount != null) bits.push(`${a.trackCount} tracks`);
    if (a.followerCount != null) bits.push(`${nf.format(a.followerCount)} followers`);
    return {
        id: a.id,
        title: a.name,
        secondary: bits.join(' · ') || undefined,
        imageUrl: a.avatarUrl ?? undefined,
        round: true,
        verified: a.isVerified,
    };
}

interface SpotlightEntityPickerProps {
    /** Current form type. Only content-backed types render the picker. */
    type: SpotlightType;
    /** Current contentId (GUID), '' when none chosen. */
    value: string;
    /** Stored spotlight title, used as the chip fallback in edit mode before rehydrate. */
    initialLabel?: string;
    onSelect: (p: { id: string; title: string; subtitle?: string; imageUrl?: string }) => void;
    onClear: () => void;
}

/**
 * Search-and-select picker for the Spotlight form. Replaces the raw GUID input:
 * the admin searches the right entity source for the chosen type (tracks/albums/
 * videos/playlists via the content library, artists via /search, NewRelease across
 * tracks+albums) and picks a real entity. Mirrors the debounce / outside-click /
 * mousedown-select pattern of the shared ArtistAutocomplete.
 */
export const SpotlightEntityPicker: React.FC<SpotlightEntityPickerProps> = ({
    type,
    value,
    initialLabel,
    onSelect,
    onClear,
}) => {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<PickerEntity[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<PickerEntity | null>(null);

    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const debounceRef = React.useRef<number | undefined>(undefined);
    const abortRef = React.useRef<AbortController | null>(null);

    const noun = type === 'NewRelease' ? 'new release' : type.toLowerCase();

    // Reset transient search state whenever the type changes (a track id is not
    // valid for an album). The parent clears contentId separately.
    React.useEffect(() => {
        setQuery('');
        setResults([]);
        setOpen(false);
        setSelected(null);
    }, [type]);

    // Edit-mode rehydrate: we have a contentId but no entity metadata. Fetch it so
    // the chip shows the real title/cover instead of a bare GUID.
    React.useEffect(() => {
        if (!value || selected) return;
        const kind = kindFor(type);
        let cancelled = false;
        if (kind) {
            contentService
                .getItem(kind, value)
                .then((detail) => {
                    if (!cancelled) setSelected(mapContentItem(detail.item));
                })
                .catch(() => {
                    // Fall back to the stored title so the admin can still Change it.
                    if (!cancelled) setSelected({ id: value, title: initialLabel || value, secondary: value });
                });
        } else {
            // NewRelease / Artist have no get-by-id here — show the stored label.
            setSelected({ id: value, title: initialLabel || value, round: type === 'Artist' });
        }
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, type]);

    // Close on outside click.
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, []);

    // Debounced search.
    React.useEffect(() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        const term = query.trim();
        if (!term) {
            setResults([]);
            return;
        }
        debounceRef.current = window.setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            setLoading(true);
            try {
                let rows: PickerEntity[];
                if (type === 'Artist') {
                    rows = (await spotlightService.searchArtists(term, controller.signal)).map(mapArtist);
                } else if (type === 'NewRelease') {
                    const [tracks, albums] = await Promise.all([
                        contentService.getItems({ kind: 'track', search: term, pageSize: 5 }),
                        contentService.getItems({ kind: 'album', search: term, pageSize: 5 }),
                    ]);
                    rows = [
                        ...tracks.items.map((i) => mapContentItem(i, 'Track')),
                        ...albums.items.map((i) => mapContentItem(i, 'Album')),
                    ].slice(0, 8);
                } else {
                    const kind = kindFor(type)!;
                    const page = await contentService.getItems({ kind, search: term, pageSize: 8 });
                    rows = page.items.map((i) => mapContentItem(i));
                }
                if (!controller.signal.aborted) {
                    setResults(rows);
                    setOpen(true);
                }
            } catch {
                if (!controller.signal.aborted) setResults([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [query, type]);

    const choose = (entity: PickerEntity) => {
        setSelected(entity);
        setQuery('');
        setResults([]);
        setOpen(false);
        onSelect({ id: entity.id, title: entity.title, subtitle: entity.secondary, imageUrl: entity.imageUrl });
    };

    const clear = () => {
        setSelected(null);
        setQuery('');
        setResults([]);
        setOpen(false);
        onClear();
    };

    /* ----- Selected chip ----- */
    if (value && selected) {
        return (
            <HStack
                gap={3}
                p={2.5}
                borderRadius="10px"
                border="1px solid"
                borderColor="gray.200"
                bg="gray.50"
                align="center"
            >
                <CoverThumb src={selected.imageUrl} size="44px" radius={selected.round ? 'full' : '8px'} />
                <Box minW={0} flex={1}>
                    <HStack gap={1.5}>
                        <Text fontSize="13px" fontWeight="600" color="gray.900" truncate>
                            {selected.title}
                        </Text>
                        {selected.verified && (
                            <Text fontSize="11px" color={ACCENT} fontWeight="bold">
                                ✓
                            </Text>
                        )}
                    </HStack>
                    {selected.secondary && (
                        <Text fontSize="11px" color="gray.500" truncate>
                            {selected.secondary}
                        </Text>
                    )}
                </Box>
                <Text
                    as="button"
                    fontSize="11px"
                    fontWeight="medium"
                    color={ACCENT}
                    flexShrink={0}
                    onClick={clear}
                    _hover={{ textDecoration: 'underline' }}
                >
                    Change
                </Text>
            </HStack>
        );
    }

    /* ----- Search input + dropdown ----- */
    return (
        <Box position="relative" ref={wrapperRef} w="full">
            <HStack
                gap={2}
                px={3}
                borderRadius="10px"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                _focusWithin={{ borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` }}
            >
                <Icon as={FiSearch} color="gray.400" boxSize={4} flexShrink={0} />
                <Input
                    variant="subtle"
                    border="none"
                    px={0}
                    h="38px"
                    fontSize="13px"
                    bg="transparent"
                    _focusVisible={{ boxShadow: 'none' }}
                    placeholder={`Search ${noun}s…`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setOpen(false);
                    }}
                />
                {query && (
                    <Icon
                        as={FiX}
                        color="gray.400"
                        boxSize={4}
                        cursor="pointer"
                        flexShrink={0}
                        onClick={() => setQuery('')}
                        _hover={{ color: 'gray.600' }}
                    />
                )}
            </HStack>

            {open && (results.length > 0 || loading) && (
                <Box
                    position="absolute"
                    top="calc(100% + 4px)"
                    left={0}
                    right={0}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="10px"
                    shadow="lg"
                    zIndex={20}
                    maxH="280px"
                    overflowY="auto"
                >
                    {loading && (
                        <HStack px={3} py={2.5} color="gray.500">
                            <Spinner size="xs" />
                            <Text fontSize="12px">Searching…</Text>
                        </HStack>
                    )}
                    {!loading &&
                        results.map((entity) => (
                            <HStack
                                key={`${entity.kindLabel ?? ''}${entity.id}`}
                                gap={2.5}
                                px={3}
                                py={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.50' }}
                                onMouseDown={(e) => {
                                    // mousedown so the input blur doesn't swallow the click
                                    e.preventDefault();
                                    choose(entity);
                                }}
                            >
                                <CoverThumb
                                    src={entity.imageUrl}
                                    size="34px"
                                    radius={entity.round ? 'full' : '7px'}
                                />
                                <Box minW={0} flex={1}>
                                    <HStack gap={1.5}>
                                        <Text fontSize="13px" fontWeight="600" color="gray.800" truncate>
                                            {entity.title}
                                        </Text>
                                        {entity.verified && (
                                            <Text fontSize="11px" color={ACCENT} fontWeight="bold">
                                                ✓
                                            </Text>
                                        )}
                                    </HStack>
                                    {entity.secondary && (
                                        <Text fontSize="10px" color="gray.500" truncate>
                                            {entity.secondary}
                                        </Text>
                                    )}
                                </Box>
                                {entity.kindLabel && (
                                    <Badge size="sm" colorPalette="purple" variant="subtle" flexShrink={0}>
                                        {entity.kindLabel}
                                    </Badge>
                                )}
                            </HStack>
                        ))}
                    {!loading && results.length === 0 && (
                        <Box px={3} py={2.5}>
                            <Text fontSize="12px" color="gray.500">
                                No {noun}s found.
                            </Text>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};
