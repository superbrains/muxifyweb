import { useEffect, useRef, useState } from 'react';
import {
  Box,
  HStack,
  Input,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FormSelect } from '@upload/components';
import type {
  AlbumManageDto,
  ReleaseTypeName,
  UpdateAlbumRequest,
} from '../../types/album';

const RELEASE_TYPE_OPTIONS = [
  { label: 'Album', value: 'Album' },
  { label: 'EP', value: 'EP' },
  { label: 'Single', value: 'Single' },
  { label: 'Mix', value: 'Mix' },
  { label: 'Compilation', value: 'Compilation' },
];

const GENRE_OPTIONS = [
  { label: 'Afrobeat', value: 'Afrobeat' },
  { label: 'Afro Pop', value: 'Afro Pop' },
  { label: 'Hip Hop', value: 'Hip Hop' },
  { label: 'R&B', value: 'R&B' },
  { label: 'Pop', value: 'Pop' },
  { label: 'Amapiano', value: 'Amapiano' },
  { label: 'Highlife', value: 'Highlife' },
  { label: 'Gospel', value: 'Gospel' },
  { label: 'Reggae', value: 'Reggae' },
  { label: 'Electronic', value: 'Electronic' },
  { label: 'Other', value: 'Other' },
];

interface AlbumDetailsFormProps {
  album: AlbumManageDto;
  /** Pushes the partial update to the server (debounced). */
  onSave: (changes: UpdateAlbumRequest) => Promise<void>;
  /** Whether changes should be disabled (e.g., the album is published). */
  readOnly?: boolean;
}

const SAVE_DEBOUNCE_MS = 800;

export const AlbumDetailsForm: React.FC<AlbumDetailsFormProps> = ({
  album,
  onSave,
  readOnly = false,
}) => {
  // Local state mirrors server. Auto-save on blur or after a typing pause.
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description ?? '');
  const [releaseType, setReleaseType] = useState<ReleaseTypeName>(album.releaseType);
  const [genre, setGenre] = useState(album.genreName ?? '');
  const [releaseDate, setReleaseDate] = useState(
    album.releaseDate ? album.releaseDate.slice(0, 10) : '',
  );

  const debounceRef = useRef<number | undefined>(undefined);

  // When album updates externally (initial load, after server response), sync local state.
  useEffect(() => {
    setTitle(album.title);
    setDescription(album.description ?? '');
    setReleaseType(album.releaseType);
    setGenre(album.genreName ?? '');
    setReleaseDate(album.releaseDate ? album.releaseDate.slice(0, 10) : '');
  }, [album.id, album.title, album.description, album.releaseType, album.genreName, album.releaseDate]);

  const queueSave = (changes: UpdateAlbumRequest) => {
    if (readOnly) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onSave(changes).catch(() => {/* parent surfaces a toast */});
    }, SAVE_DEBOUNCE_MS);
  };

  return (
    <VStack align="stretch" gap={4} w="full">
      <Text
        fontSize="11px"
        fontWeight="semibold"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="gray.blue.700"
      >
        Album details
      </Text>

      <Box>
        <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
          Title <Text as="span" color="primary.500">*</Text>
        </Text>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            queueSave({ title: e.target.value });
          }}
          onBlur={() => {
            if (title !== album.title) onSave({ title });
          }}
          placeholder="Untitled album"
          size="md"
          bg="white"
          fontSize="14px"
          disabled={readOnly}
          borderColor="gray.200"
          _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)' }}
        />
      </Box>

      <Box>
        <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
          Description
        </Text>
        <Textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            queueSave({ description: e.target.value || null });
          }}
          onBlur={() => {
            if ((description || null) !== album.description) onSave({ description: description || null });
          }}
          placeholder="Tell fans what this album is about…"
          size="sm"
          rows={3}
          bg="white"
          fontSize="13px"
          disabled={readOnly}
          borderColor="gray.200"
          _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)' }}
        />
      </Box>

      <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box flex="1" minW={0}>
          <FormSelect
            label="Release type"
            options={RELEASE_TYPE_OPTIONS}
            value={[releaseType]}
            onChange={(v) => {
              const next = (v[0] ?? 'Album') as ReleaseTypeName;
              setReleaseType(next);
              onSave({ releaseType: next });
            }}
          />
        </Box>
        <Box flex="1" minW={0}>
          <FormSelect
            label="Genre"
            options={GENRE_OPTIONS}
            value={genre ? [genre] : []}
            onChange={(v) => {
              const next = v[0] ?? '';
              setGenre(next);
              onSave({ genre: next });
            }}
          />
        </Box>
      </Stack>

      <Box>
        <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
          Release date
        </Text>
        <HStack>
          <Input
            type="date"
            value={releaseDate}
            onChange={(e) => {
              setReleaseDate(e.target.value);
              queueSave({ releaseDate: e.target.value ? new Date(e.target.value).toISOString() : null });
            }}
            onBlur={() => {
              const iso = releaseDate ? new Date(releaseDate).toISOString() : null;
              if ((iso ?? null) !== (album.releaseDate ?? null)) onSave({ releaseDate: iso });
            }}
            size="md"
            bg="white"
            fontSize="13px"
            disabled={readOnly}
            maxW="220px"
            borderColor="gray.200"
            _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)' }}
          />
          {releaseDate && (
            <Text fontSize="11px" color="gray.500">
              Will appear in &ldquo;new releases&rdquo; on this date
            </Text>
          )}
        </HStack>
      </Box>
    </VStack>
  );
};
