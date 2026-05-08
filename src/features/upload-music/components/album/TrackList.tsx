import { useEffect, useState } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { Box, VStack } from '@chakra-ui/react';
import { TrackRow } from './TrackRow';
import type {
  AlbumManageTrackDto,
  FeaturedArtistInput,
} from '../../types/album';

interface TrackListProps {
  tracks: AlbumManageTrackDto[];
  /** Persist a new ordering. Called once after a drop with the full ordered array of IDs. */
  onReorder: (orderedIds: string[]) => Promise<void>;
  onUpdateTitle: (trackId: string, title: string) => Promise<void>;
  onAddFeaturedArtist: (trackId: string, artist: FeaturedArtistInput) => Promise<void>;
  onRemoveFeaturedArtist: (trackId: string, trackArtistId: string) => Promise<void>;
  onTogglePublish: (trackId: string, publish: boolean) => Promise<void>;
  onRemove: (trackId: string) => void;
  readOnly?: boolean;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  onReorder,
  onUpdateTitle,
  onAddFeaturedArtist,
  onRemoveFeaturedArtist,
  onTogglePublish,
  onRemove,
  readOnly = false,
}) => {
  // Local order is the source of truth during a drag; we sync with server order after drop.
  const [order, setOrder] = useState(tracks);

  useEffect(() => {
    setOrder(tracks);
  }, [tracks]);

  const handleDragEnd = async () => {
    const ids = order.map((t) => t.id);
    const originalIds = tracks.map((t) => t.id);
    if (ids.length !== originalIds.length || ids.some((id, i) => id !== originalIds[i])) {
      try {
        await onReorder(ids);
      } catch {
        // Roll back to server order on error.
        setOrder(tracks);
      }
    }
  };

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={setOrder}
      as="div"
      style={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      <VStack align="stretch" gap={2}>
        <AnimatePresence initial={false}>
          {order.map((track, index) => (
            <Reorder.Item
              key={track.id}
              value={track}
              as="div"
              dragListener={!readOnly}
              onDragEnd={handleDragEnd}
              style={{ listStyle: 'none' }}
            >
              <Box>
                <TrackRow
                  track={track}
                  position={index + 1}
                  readOnly={readOnly}
                  onUpdateTitle={(title) => onUpdateTitle(track.id, title)}
                  onAddFeaturedArtist={(artist) => onAddFeaturedArtist(track.id, artist)}
                  onRemoveFeaturedArtist={(trackArtistId) =>
                    onRemoveFeaturedArtist(track.id, trackArtistId)
                  }
                  onTogglePublish={(publish) => onTogglePublish(track.id, publish)}
                  onRemove={() => onRemove(track.id)}
                />
              </Box>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </VStack>
    </Reorder.Group>
  );
};
