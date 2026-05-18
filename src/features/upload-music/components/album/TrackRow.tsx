import { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Spinner,
  Stack,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiFlag,
  FiMoreVertical,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { ArtistAutocomplete, DisputeModal } from '@shared/components';
import { toaster } from '@/components/ui/toaster-instance';
import type {
  AlbumManageTrackDto,
  FeaturedArtistDto,
  FeaturedArtistInput,
} from '../../types/album';
import { trackService } from '../../services/trackService';
import { formatDuration } from './format';

interface TrackRowProps {
  track: AlbumManageTrackDto;
  /** 1-based display index. */
  position: number;
  isDragging?: boolean;
  /** Persist title change. */
  onUpdateTitle: (title: string) => Promise<void>;
  /** Add a featured artist credit. */
  onAddFeaturedArtist: (artist: FeaturedArtistInput) => Promise<void>;
  onRemoveFeaturedArtist: (trackArtistId: string) => Promise<void>;
  /** Toggle publish state on a single track. */
  onTogglePublish: (publish: boolean) => Promise<void>;
  onRemove: () => void;
  readOnly?: boolean;
}

const StatusBadge: React.FC<{ track: AlbumManageTrackDto }> = ({ track }) => {
  // A duplicate-review hold takes precedence: such a track is technically "ready"
  // but withheld from publication, so the plain status palette would mislabel it.
  const cfg = track.heldForDuplicateReview
    ? { bg: 'yellow.100', color: 'yellow.800', label: 'Under review' }
    : ({
        processing: { bg: 'orange.50', color: 'orange.700', label: 'Processing…' },
        ready: track.isPublished
          ? { bg: 'green.50', color: 'green.700', label: 'Published' }
          : { bg: 'gray.100', color: 'gray.700', label: 'Ready · Draft' },
        failed: { bg: 'red.50', color: 'red.700', label: 'Failed' },
        deleted: { bg: 'gray.100', color: 'gray.500', label: 'Deleted' },
      }[track.status] ?? { bg: 'orange.50', color: 'orange.700', label: 'Processing…' });

  return (
    <Tag.Root size="sm" bg={cfg.bg} color={cfg.color} borderRadius="full" px={2}>
      <Tag.Label fontSize="10px" fontWeight="600" letterSpacing="0.04em">
        {cfg.label}
      </Tag.Label>
    </Tag.Root>
  );
};

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  position,
  isDragging,
  onUpdateTitle,
  onAddFeaturedArtist,
  onRemoveFeaturedArtist,
  onTogglePublish,
  onRemove,
  readOnly = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [titleDraft, setTitleDraft] = useState(track.title);
  const [savingTitle, setSavingTitle] = useState(false);
  const [pendingArtist, setPendingArtist] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const commitTitle = async () => {
    if (titleDraft.trim() === track.title) return;
    setSavingTitle(true);
    try {
      await onUpdateTitle(titleDraft.trim());
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDispute = async (reason: string) => {
    setDisputing(true);
    try {
      await trackService.disputeTrack(track.id, reason);
      setDisputeSubmitted(true);
      setDisputeOpen(false);
      toaster.create({
        title: 'Dispute submitted',
        description: 'Our moderation team will review your track shortly.',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Could not submit dispute',
        description: 'Something went wrong. Please try again in a moment.',
        type: 'error',
      });
    } finally {
      setDisputing(false);
    }
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor={isDragging ? 'primary.400' : 'gray.200'}
      borderRadius="lg"
      shadow={isDragging ? 'md' : 'none'}
      transition="border-color 0.12s ease, box-shadow 0.12s ease"
      px={3}
      py={3}
    >
      <HStack align="center" gap={3}>
        {/* Drag handle */}
        <Box
          color="gray.400"
          cursor={readOnly ? 'default' : 'grab'}
          _active={{ cursor: readOnly ? 'default' : 'grabbing' }}
          fontSize="14px"
          fontWeight="bold"
          letterSpacing="0.1em"
          userSelect="none"
        >
          ⋮⋮
        </Box>

        {/* Track number */}
        <Box w="24px" textAlign="right" flexShrink={0}>
          <Text fontSize="13px" fontWeight="600" color="gray.500">
            {track.trackNumber ?? position}
          </Text>
        </Box>

        {/* Title editor */}
        <Box flex="1" minW={0}>
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            placeholder="Untitled track"
            size="sm"
            variant="flushed"
            fontSize="14px"
            fontWeight="600"
            color="gray.900"
            disabled={readOnly}
            borderColor="transparent"
            _focus={{ borderColor: 'primary.500' }}
          />
          {track.featuredArtists.length > 0 && (
            <HStack mt={1} gap={1} flexWrap="wrap">
              <Text fontSize="11px" color="gray.500">feat.</Text>
              {track.featuredArtists.map((fa) => (
                <Text key={fa.id} fontSize="11px" color="gray.700" fontWeight="500">
                  {fa.name}
                  {fa.isVerified ? ' ✓' : ''}
                </Text>
              ))}
            </HStack>
          )}
        </Box>

        {/* Duration */}
        <Box w="48px" textAlign="right" flexShrink={0}>
          <Text fontSize="12px" color="gray.500" fontVariantNumeric="tabular-nums">
            {formatDuration(track.durationSeconds)}
          </Text>
        </Box>

        {/* Status */}
        <StatusBadge track={track} />

        {/* Actions */}
        <HStack gap={1}>
          {savingTitle && <Spinner size="xs" />}
          <IconButton
            aria-label={expanded ? 'Collapse' : 'Expand'}
            size="xs"
            variant="ghost"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </IconButton>
          <IconButton
            aria-label="Remove track"
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'red.500', bg: 'red.50' }}
            onClick={onRemove}
            disabled={readOnly}
          >
            <FiMoreVertical />
          </IconButton>
        </HStack>
      </HStack>

      {/* Inline editor */}
      {expanded && (
        <Box mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
          {track.status === 'failed' && track.processingError && (
            <HStack
              bg="red.50"
              color="red.700"
              borderRadius="md"
              px={3}
              py={2}
              mb={3}
              fontSize="12px"
            >
              <Box flexShrink={0}>
                <FiAlertTriangle />
              </Box>
              <Text>Processing failed: {track.processingError}</Text>
            </HStack>
          )}

          {track.heldForDuplicateReview && (
            <VStack
              align="stretch"
              bg="yellow.50"
              border="1px solid"
              borderColor="yellow.200"
              borderRadius="md"
              px={3}
              py={3}
              mb={3}
              gap={2}
            >
              <HStack color="yellow.800" fontSize="12px" align="flex-start">
                <Box flexShrink={0} mt="2px">
                  <FiAlertTriangle />
                </Box>
                <Text>
                  This track is on hold — our duplicate-detection check flagged it as a
                  possible duplicate, so it won't be published until a moderator reviews it.
                  If you hold the rights to this track, you can dispute the flag.
                </Text>
              </HStack>
              <HStack>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="yellow.300"
                  color="yellow.800"
                  _hover={{ bg: 'yellow.100' }}
                  disabled={disputeSubmitted}
                  onClick={() => setDisputeOpen(true)}
                >
                  <FiFlag /> {disputeSubmitted ? 'Dispute submitted' : 'Dispute this flag'}
                </Button>
              </HStack>
            </VStack>
          )}

          <Stack direction={{ base: 'column', md: 'row' }} gap={5}>
            {/* Featured artists */}
            <VStack align="stretch" flex="1" gap={2}>
              <Text fontSize="11px" fontWeight="semibold" letterSpacing="0.08em"
                textTransform="uppercase" color="gray.blue.700">
                Featured artists
              </Text>
              {track.featuredArtists.length > 0 && (
                <HStack flexWrap="wrap" gap={2}>
                  {track.featuredArtists.map((fa: FeaturedArtistDto) => (
                    <Tag.Root
                      key={fa.id}
                      size="md"
                      bg="gray.100"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      <Tag.Label fontSize="12px">{fa.name}{fa.isVerified ? ' ✓' : ''}</Tag.Label>
                      {!readOnly && (
                        <IconButton
                          aria-label={`Remove ${fa.name}`}
                          size="2xs"
                          variant="ghost"
                          ml={1}
                          onClick={async () => {
                            await onRemoveFeaturedArtist(fa.id);
                          }}
                        >
                          <FiX />
                        </IconButton>
                      )}
                    </Tag.Root>
                  ))}
                </HStack>
              )}
              {!readOnly && (
                <ArtistAutocomplete
                  isSubmitting={pendingArtist}
                  onPick={async (pick) => {
                    setPendingArtist(true);
                    try {
                      await onAddFeaturedArtist({
                        artistUserId: pick.userId,
                        artistName: pick.name,
                        role: 'Featured',
                      });
                    } finally {
                      setPendingArtist(false);
                    }
                  }}
                />
              )}
            </VStack>

            {/* Publish toggle (per-track) */}
            <VStack align="stretch" gap={2} minW="180px">
              <Text fontSize="11px" fontWeight="semibold" letterSpacing="0.08em"
                textTransform="uppercase" color="gray.blue.700">
                Visibility
              </Text>
              <Button
                size="sm"
                variant="outline"
                disabled={track.status !== 'ready' || readOnly}
                onClick={() => onTogglePublish(!track.isPublished)}
                borderColor={track.isPublished ? 'green.300' : 'gray.300'}
                color={track.isPublished ? 'green.700' : 'gray.700'}
                _hover={{ bg: track.isPublished ? 'green.50' : 'gray.50' }}
              >
                {track.isPublished ? 'Published — click to unpublish' : 'Publish only this track'}
              </Button>
              {track.status !== 'ready' && (
                <Text fontSize="11px" color="gray.500">
                  Available once processing finishes.
                </Text>
              )}
            </VStack>
          </Stack>

          {!readOnly && (
            <HStack mt={4} pt={3} borderTop="1px solid" borderColor="gray.100">
              <Button
                size="xs"
                variant="ghost"
                color="red.500"
                onClick={onRemove}
              >
                <FiTrash2 /> Delete track
              </Button>
            </HStack>
          )}
        </Box>
      )}

      <DisputeModal
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        onSubmit={handleDispute}
        contentTitle={track.title}
        contentNoun="track"
        isLoading={disputing}
      />
    </Box>
  );
};
