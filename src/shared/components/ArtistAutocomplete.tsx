import { useEffect, useRef, useState } from 'react';
import {
  Box,
  HStack,
  Input,
  Text,
  Spinner,
  VStack,
  Image,
} from '@chakra-ui/react';
import { axiosInstance } from '@app/lib/axiosInstance';

/**
 * Featured-artist autocomplete. Searches Muxify artists via /api/v1/search?type=artists,
 * with free-text Enter fallback for off-platform features.
 */

interface SearchArtistDto {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  followerCount?: number;
  trackCount?: number;
}

interface SearchResultDto {
  artists: SearchArtistDto[];
  totalArtists: number;
}

export interface ArtistPick {
  /** When picked from results, the Muxify userId. Null means free-text only. */
  userId: string | null;
  name: string;
}

interface ArtistAutocompleteProps {
  placeholder?: string;
  onPick: (pick: ArtistPick) => void;
  /** Disabled while a network call to add the artist is in flight. */
  isSubmitting?: boolean;
}

const DEBOUNCE_MS = 250;

export const ArtistAutocomplete: React.FC<ArtistAutocompleteProps> = ({
  placeholder = 'Search Muxify artists, or press Enter to add by name…',
  onPick,
  isSubmitting = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchArtistDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search.
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<SearchResultDto>('/search', {
          params: { q: query.trim(), type: 'artists', pageSize: 8 },
        });
        setResults(response.data.artists ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const submitFreeText = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onPick({ userId: null, name: trimmed });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <Box position="relative" ref={wrapperRef} w="full">
      <Input
        size="sm"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // If exactly one match, prefer it; otherwise free-text.
            if (results.length === 1) {
              const match = results[0];
              onPick({ userId: match.id, name: match.name });
              setQuery('');
              setResults([]);
              setOpen(false);
            } else {
              submitFreeText();
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        disabled={isSubmitting}
        fontSize="13px"
        bg="white"
        borderColor="gray.200"
        _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)' }}
      />

      {open && (results.length > 0 || loading) && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          shadow="md"
          zIndex={20}
          maxH="240px"
          overflowY="auto"
        >
          {loading && (
            <HStack px={3} py={2} color="gray.500">
              <Spinner size="xs" />
              <Text fontSize="12px">Searching…</Text>
            </HStack>
          )}
          {!loading &&
            results.map((artist) => (
              <Box
                key={artist.id}
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
                onMouseDown={(e) => {
                  // mousedown so the input doesn't blur first and swallow the click
                  e.preventDefault();
                  onPick({ userId: artist.id, name: artist.name });
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
              >
                <HStack>
                  <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    overflow="hidden"
                    bg="gray.100"
                    flexShrink={0}
                  >
                    {artist.avatarUrl ? (
                      <Image src={artist.avatarUrl} alt={artist.name} w="full" h="full" objectFit="cover" />
                    ) : null}
                  </Box>
                  <VStack align="start" gap={0}>
                    <HStack gap={1}>
                      <Text fontSize="13px" fontWeight="600" color="gray.800">
                        {artist.name}
                      </Text>
                      {artist.isVerified && (
                        <Text fontSize="11px" color="primary.500" fontWeight="bold">✓</Text>
                      )}
                    </HStack>
                    {artist.trackCount !== undefined && (
                      <Text fontSize="10px" color="gray.500">
                        {artist.trackCount} tracks · {artist.followerCount ?? 0} followers
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            ))}
          {!loading && query.trim() && (
            <Box
              px={3}
              py={2}
              borderTop="1px solid"
              borderColor="gray.100"
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              onMouseDown={(e) => {
                e.preventDefault();
                submitFreeText();
              }}
            >
              <Text fontSize="12px" color="gray.600">
                Add &ldquo;<Text as="span" fontWeight="600" color="gray.900">{query.trim()}</Text>&rdquo; as a free-text feature
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
