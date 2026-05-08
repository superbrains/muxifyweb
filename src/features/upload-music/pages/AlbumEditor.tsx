import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Spinner,
  Stack,
  Tag,
  Text,
  VStack,
  type SystemStyleObject,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useChakraToast } from '@shared/hooks/useChakraToast';
import { albumService } from '../services/albumService';
import { trackService } from '../services/trackService';
import type { AlbumManageDto, FeaturedArtistInput, UpdateAlbumRequest } from '../types/album';
import { AlbumDetailsForm } from '../components/album/AlbumDetailsForm';
import { AlbumCoverUpload } from '../components/album/AlbumCoverUpload';
import { TrackList } from '../components/album/TrackList';
import { AddTrackModal } from '../components/album/AddTrackModal';
import { PublishConfirmDialog } from '../components/album/PublishConfirmDialog';
import { formatDuration } from '../components/album/format';

const stickyHeaderStyle: SystemStyleObject = {
  position: 'sticky',
  top: 0,
  bg: 'white',
  borderBottom: '1px solid',
  borderColor: 'gray.200',
  zIndex: 5,
  py: 4,
  px: { base: 4, md: 8, lg: 10 },
};

const stickyFooterStyle: SystemStyleObject = {
  position: 'sticky',
  bottom: 0,
  bg: 'white',
  borderTop: '1px solid',
  borderColor: 'gray.200',
  zIndex: 5,
  py: 3,
  px: { base: 4, md: 8, lg: 10 },
};

export const AlbumEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useChakraToast();

  const [album, setAlbum] = useState<AlbumManageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const isPublished = album?.isPublished ?? false;

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setLoading(true);
    setError(null);
    albumService
      .getAlbum(id)
      .then((data) => { if (!cancelled) setAlbum(data); })
      .catch((e: Error) => { if (!cancelled) setError(e.message ?? 'Failed to load album.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // Auto-poll while any track is processing — backend updates status asynchronously.
  useEffect(() => {
    if (!album) return;
    const hasProcessing = album.tracks.some((t) => t.status === 'processing');
    if (!hasProcessing) return;
    const handle = window.setInterval(async () => {
      try {
        const fresh = await albumService.getAlbum(album.id);
        setAlbum(fresh);
      } catch {/* keep polling */}
    }, 8000);
    return () => window.clearInterval(handle);
  }, [album]);

  const reloadAlbum = useCallback(async () => {
    if (!id) return;
    try {
      const fresh = await albumService.getAlbum(id);
      setAlbum(fresh);
    } catch (e) {
      toast.error('Could not refresh', e instanceof Error ? e.message : '');
    }
  }, [id, toast]);

  const handleSaveDetails = async (changes: UpdateAlbumRequest) => {
    if (!album) return;
    try {
      const updated = await albumService.updateAlbum(album.id, changes);
      setAlbum(updated);
    } catch (e) {
      toast.error('Could not save', e instanceof Error ? e.message : '');
      throw e;
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!album) return;
    const updated = await albumService.updateCoverArt(album.id, file);
    setAlbum(updated);
    toast.success('Cover updated');
  };

  const handleReorder = async (orderedIds: string[]) => {
    if (!album) return;
    const updated = await albumService.reorderTracks(album.id, orderedIds);
    setAlbum(updated);
  };

  const handleUpdateTitle = async (trackId: string, title: string) => {
    if (!title.trim()) return;
    try {
      await trackService.publishTrack; // ts: ensure import is used
    } catch {/* unreachable */}
    try {
      // Reuse the existing /api/v1/music/{id} PUT (UpdateTrackRequest accepts title).
      const { axiosInstance } = await import('@app/lib/axiosInstance');
      await axiosInstance.put(`/music/${trackId}`, { title });
      await reloadAlbum();
    } catch (e) {
      toast.error('Could not save title', e instanceof Error ? e.message : '');
    }
  };

  const handleAddFeaturedArtist = async (trackId: string, artist: FeaturedArtistInput) => {
    try {
      await trackService.addFeaturedArtist(trackId, {
        artistUserId: artist.artistUserId,
        artistName: artist.artistName,
        role: artist.role ?? 'Featured',
      });
      await reloadAlbum();
    } catch (e) {
      toast.error('Could not add artist', e instanceof Error ? e.message : '');
    }
  };

  const handleRemoveFeaturedArtist = async (trackId: string, trackArtistId: string) => {
    try {
      await trackService.removeFeaturedArtist(trackId, trackArtistId);
      await reloadAlbum();
    } catch (e) {
      toast.error('Could not remove artist', e instanceof Error ? e.message : '');
    }
  };

  const handleTogglePublish = async (trackId: string, publish: boolean) => {
    try {
      if (publish) {
        await trackService.publishTrack(trackId);
        toast.success('Track published');
      } else {
        await trackService.unpublishTrack(trackId);
        toast.info('Track unpublished');
      }
      await reloadAlbum();
    } catch (e) {
      toast.error('Could not update track', e instanceof Error ? e.message : '');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!album) return;
    if (!window.confirm('Remove this track from the album? This deletes the track entirely.')) return;
    try {
      await trackService.deleteTrack(trackId);
      await reloadAlbum();
      toast.success('Track removed');
    } catch (e) {
      toast.error('Could not remove track', e instanceof Error ? e.message : '');
    }
  };

  const handlePublishAlbum = async () => {
    if (!album) return;
    setPublishing(true);
    try {
      const updated = await albumService.publishAlbum(album.id);
      setAlbum(updated);
      toast.success('Album published', 'Fans can now find and play it.');
      setPublishDialogOpen(false);
    } catch (e) {
      toast.error('Publish failed', e instanceof Error ? e.message : '');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishAlbum = async () => {
    if (!album) return;
    if (!window.confirm('Unpublish the album? It will no longer appear to fans until you publish again.')) return;
    try {
      const updated = await albumService.unpublishAlbum(album.id);
      setAlbum(updated);
      toast.info('Album unpublished');
    } catch (e) {
      toast.error('Unpublish failed', e instanceof Error ? e.message : '');
    }
  };

  if (loading) {
    return (
      <HStack p={10} justify="center"><Spinner /></HStack>
    );
  }
  if (error || !album) {
    return (
      <VStack p={10} align="center" gap={3}>
        <Text fontSize="14px" color="red.500">{error ?? 'Album not found.'}</Text>
        <Button onClick={() => navigate('/music-videos')} size="sm">Back to library</Button>
      </VStack>
    );
  }

  const readyCount = album.tracks.filter((t) => t.status === 'ready').length;
  const processingCount = album.tracks.filter((t) => t.status === 'processing').length;

  return (
    <Box pb="100px">
      {/* Sticky header */}
      <Box css={stickyHeaderStyle}>
        <HStack maxW="1280px" mx="auto" justify="space-between">
          <HStack gap={3}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/music-videos')}
            >
              <FiArrowLeft /> Back
            </Button>
            <VStack align="start" gap={0}>
              <Text fontSize="22px" fontWeight="700" color="gray.900">
                {album.title || 'Untitled album'}
              </Text>
              <HStack gap={2}>
                <Tag.Root size="sm" bg={isPublished ? 'green.50' : 'orange.50'} color={isPublished ? 'green.700' : 'orange.700'} borderRadius="full">
                  <Tag.Label fontSize="10px" fontWeight="600" letterSpacing="0.04em">
                    {isPublished ? 'Published' : 'Draft'}
                  </Tag.Label>
                </Tag.Root>
                <Text fontSize="11px" color="gray.500">
                  {album.tracks.length} track{album.tracks.length === 1 ? '' : 's'}
                  {' · '}
                  {formatDuration(album.totalDurationSeconds)}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack gap={2}>
            {isPublished ? (
              <Button
                size="sm"
                variant="outline"
                borderColor="gray.300"
                onClick={handleUnpublishAlbum}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                size="sm"
                bg="primary.500"
                color="white"
                _hover={{ bg: 'primary.600' }}
                onClick={() => setPublishDialogOpen(true)}
              >
                Publish album
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Content */}
      <Box maxW="1280px" mx="auto" p={{ base: 4, md: 8, lg: 10 }}>
        <Stack direction={{ base: 'column', md: 'row' }} align="flex-start" gap={8}>
          {/* Cover */}
          <AlbumCoverUpload
            coverArtUrl={album.coverArtUrl}
            coverArtThumbnail={album.coverArtThumbnail}
            onUpload={handleCoverUpload}
            readOnly={isPublished}
          />

          {/* Details form */}
          <Box flex="1" minW={0} w="full">
            <AlbumDetailsForm
              album={album}
              onSave={handleSaveDetails}
              readOnly={isPublished}
            />
          </Box>
        </Stack>

        {/* Tracks section */}
        <VStack align="stretch" mt={10} gap={4}>
          <HStack justify="space-between">
            <Text
              fontSize="11px"
              fontWeight="semibold"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="gray.blue.700"
            >
              Tracks ({album.tracks.length})
            </Text>
            <Button
              size="sm"
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              onClick={() => setAddTrackOpen(true)}
            >
              <FiPlus /> Add track
            </Button>
          </HStack>

          {album.tracks.length === 0 ? (
            <Box
              border="2px dashed"
              borderColor="gray.200"
              borderRadius="lg"
              py={10}
              textAlign="center"
            >
              <Text fontSize="14px" color="gray.500" mb={3}>
                No tracks yet. Each track is its own audio file.
              </Text>
              <Button
                size="sm"
                bg="primary.500"
                color="white"
                _hover={{ bg: 'primary.600' }}
                onClick={() => setAddTrackOpen(true)}
              >
                <FiPlus /> Add your first track
              </Button>
            </Box>
          ) : (
            <TrackList
              tracks={album.tracks}
              onReorder={handleReorder}
              onUpdateTitle={handleUpdateTitle}
              onAddFeaturedArtist={handleAddFeaturedArtist}
              onRemoveFeaturedArtist={handleRemoveFeaturedArtist}
              onTogglePublish={handleTogglePublish}
              onRemove={handleRemoveTrack}
              readOnly={false}
            />
          )}
        </VStack>
      </Box>

      {/* Sticky footer status */}
      <Box css={stickyFooterStyle}>
        <HStack maxW="1280px" mx="auto" justify="space-between">
          <Text fontSize="12px" color="gray.600">
            {isPublished ? 'Published · ' : 'Draft · '}
            {album.tracks.length} track{album.tracks.length === 1 ? '' : 's'}
            {processingCount > 0 && ` · ${processingCount} processing`}
            {readyCount > 0 && ` · ${readyCount} ready`}
          </Text>
          <Text fontSize="11px" color="gray.500">
            Changes save automatically
          </Text>
        </HStack>
      </Box>

      <AddTrackModal
        isOpen={addTrackOpen}
        onClose={() => {
          setAddTrackOpen(false);
          // Reload to pick up the new track in the list.
          reloadAlbum();
        }}
        albumId={album.id}
        defaultTrackNumber={album.tracks.length + 1}
        onTrackAdded={() => {
          // Reload happens in onClose anyway.
        }}
      />

      <PublishConfirmDialog
        isOpen={publishDialogOpen}
        album={album}
        onConfirm={handlePublishAlbum}
        onCancel={() => setPublishDialogOpen(false)}
        isPublishing={publishing}
      />
    </Box>
  );
};

export default AlbumEditor;
