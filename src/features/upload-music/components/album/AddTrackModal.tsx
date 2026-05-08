import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Progress,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiUpload, FiX } from 'react-icons/fi';
import { ArtistAutocomplete, type ArtistPick } from '@shared/components';
import { useResumableUpload } from '../../hooks/useResumableUpload';
import type { FeaturedArtistInput } from '../../types/album';
import type { TrackDto } from '../../types';
import { formatBytes } from './format';

const ACCEPTED = '.mp3,.m4a,.wav,.aac,.ogg,.flac';
const ACCEPTED_LABEL = 'MP3, M4A, WAV, AAC, OGG, FLAC';
const MAX_BYTES = 2 * 1024 * 1024 * 1024;

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId: string;
  /** Track number (1-based). Pass current track count + 1 from the parent. */
  defaultTrackNumber: number;
  /** Called once the chunked upload + complete succeeds. */
  onTrackAdded: (track: TrackDto) => void;
}

export const AddTrackModal: React.FC<AddTrackModalProps> = ({
  isOpen,
  onClose,
  albumId,
  defaultTrackNumber,
  onTrackAdded,
}) => {
  const upload = useResumableUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [featured, setFeatured] = useState<FeaturedArtistInput[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset everything when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setTitle('');
      setFeatured([]);
      setError(null);
      upload.reset();
    }
  }, [isOpen, upload]);

  if (!isOpen) return null;

  const isUploading =
    upload.phase === 'staging' ||
    upload.phase === 'uploading' ||
    upload.phase === 'committing' ||
    upload.phase === 'finalizing';

  const startUpload = async () => {
    if (!file) {
      setError('Pick an audio file first.');
      return;
    }
    if (!title.trim()) {
      setError('Give the track a title.');
      return;
    }
    setError(null);
    try {
      const created = await upload.start(file, {
        title: title.trim(),
        albumId,
        trackNumber: defaultTrackNumber,
        featuredArtists: featured.length > 0 ? featured : undefined,
      });
      onTrackAdded(created);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    }
  };

  const onPickFile = (f: File) => {
    if (f.size > MAX_BYTES) {
      setError(`File too large. Max is ${formatBytes(MAX_BYTES)}.`);
      return;
    }
    setFile(f);
    if (!title.trim()) {
      // Suggest a title from the filename (strip extension).
      setTitle(f.name.replace(/\.[^.]+$/, ''));
    }
  };

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.600"
      zIndex={50}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={() => !isUploading && onClose()}
    >
      <Box
        bg="white"
        borderRadius="xl"
        shadow="2xl"
        w="full"
        maxW="600px"
        p={6}
        onClick={(e) => e.stopPropagation()}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="18px" fontWeight="700" color="gray.900">Add a track</Text>
          <Box
            as="button"
            color="gray.400"
            _hover={{ color: 'gray.600' }}
            onClick={() => !isUploading && onClose()}
            cursor={isUploading ? 'not-allowed' : 'pointer'}
          >
            <FiX size={20} />
          </Box>
        </HStack>

        <VStack align="stretch" gap={5}>
          {/* File dropzone */}
          {!file ? (
            <Box
              as="label"
              w="full"
              bg="red.400"
              border="2px dashed"
              borderColor="red.200"
              borderRadius="lg"
              py={8}
              px={6}
              textAlign="center"
              cursor="pointer"
              _hover={{ bg: 'red.300' }}
              transition="all 0.15s"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onPickFile(f);
              }}
            >
              <VStack gap={2}>
                <Icon as={FiUpload} color="white" boxSize={8} />
                <Text fontSize="14px" fontWeight="600" color="white">
                  Click or drag an audio file
                </Text>
                <Text fontSize="11px" color="white" opacity={0.85}>
                  {ACCEPTED_LABEL} · up to {formatBytes(MAX_BYTES)}
                </Text>
              </VStack>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                  e.target.value = '';
                }}
              />
            </Box>
          ) : (
            <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg" px={4} py={3}>
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={0} flex="1" minW={0}>
                  <Text fontSize="13px" fontWeight="600" color="gray.900" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {file.name}
                  </Text>
                  <Text fontSize="11px" color="gray.500">
                    {formatBytes(file.size)}
                  </Text>
                </VStack>
                {!isUploading && (
                  <Box
                    as="button"
                    color="gray.400"
                    _hover={{ color: 'red.500' }}
                    onClick={() => {
                      setFile(null);
                      upload.reset();
                    }}
                  >
                    <FiX size={16} />
                  </Box>
                )}
              </HStack>

              {(isUploading || upload.phase === 'done') && (
                <Box mt={3}>
                  <Progress.Root value={upload.progress} size="sm">
                    <Progress.Track bg="gray.200" borderRadius="full">
                      <Progress.Range bg="primary.500" />
                    </Progress.Track>
                  </Progress.Root>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="11px" color="gray.600">
                      {upload.phase === 'staging' && 'Preparing…'}
                      {upload.phase === 'uploading' && `${upload.progress}% uploaded`}
                      {upload.phase === 'committing' && 'Committing blocks…'}
                      {upload.phase === 'finalizing' && 'Finalizing…'}
                      {upload.phase === 'done' && 'Done'}
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                      {formatBytes(upload.bytesUploaded)} / {formatBytes(upload.totalBytes)}
                    </Text>
                  </HStack>
                </Box>
              )}
            </Box>
          )}

          {/* Title */}
          <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
              Track title <Text as="span" color="primary.500">*</Text>
            </Text>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lagos Lights"
              size="md"
              bg="white"
              fontSize="14px"
              disabled={isUploading}
              borderColor="gray.200"
              _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)' }}
            />
          </Box>

          {/* Featured artists (optional, can be edited inline after) */}
          <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
              Featured artists <Text as="span" color="gray.400" fontWeight="normal" fontSize="11px">(optional)</Text>
            </Text>
            {featured.length > 0 && (
              <HStack flexWrap="wrap" gap={2} mb={2}>
                {featured.map((fa, i) => (
                  <HStack
                    key={`${fa.artistName}-${i}`}
                    bg="gray.100"
                    borderRadius="full"
                    px={3}
                    py={1}
                    gap={2}
                  >
                    <Text fontSize="12px">{fa.artistName}</Text>
                    <Box
                      as="button"
                      color="gray.500"
                      onClick={() => setFeatured(featured.filter((_, j) => j !== i))}
                    >
                      <FiX size={12} />
                    </Box>
                  </HStack>
                ))}
              </HStack>
            )}
            <ArtistAutocomplete
              isSubmitting={isUploading}
              onPick={(pick: ArtistPick) =>
                setFeatured([...featured, {
                  artistUserId: pick.userId,
                  artistName: pick.name,
                  role: 'Featured',
                }])
              }
            />
          </Box>

          {error && (
            <Text fontSize="12px" color="red.500" bg="red.50" px={3} py={2} borderRadius="md">
              {error}
            </Text>
          )}

          {/* Footer actions */}
          <Stack direction="row" justify="flex-end" gap={2} mt={2}>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              onClick={startUpload}
              loading={isUploading}
              disabled={isUploading || !file || !title.trim()}
            >
              {isUploading ? 'Uploading…' : 'Add to album'}
            </Button>
          </Stack>
        </VStack>
      </Box>
    </Box>
  );
};
