import { Box, Button, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { albumService } from '../services/albumService';
import type { AlbumManageDto } from '../types/album';

/**
 * Albums use a dedicated lifecycle: a draft album is created up-front, tracks are added one by
 * one, and the artist publishes when ready. This panel funnels the user into that flow
 * (start a new draft, or continue an existing one) instead of cramming the whole editor here.
 */
export const AlbumTab: React.FC = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<AlbumManageDto[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    albumService
      .listMyAlbums(true)
      .then((rows) => {
        if (!cancelled) setDrafts(rows.filter((a) => !a.isPublished));
      })
      .catch(() => {
        if (!cancelled) setDrafts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <VStack align="stretch" gap={6} maxW="720px">
      {/* Hero CTA */}
      <Box
        bg="primary.50"
        border="1px solid"
        borderColor="primary.100"
        borderRadius="xl"
        p={6}
      >
        <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
          <VStack align="start" gap={2} flex="1" minW="240px">
            <Text fontSize="11px" fontWeight="semibold" letterSpacing="0.08em"
                  textTransform="uppercase" color="primary.700">
              Albums
            </Text>
            <Text fontSize="20px" fontWeight="700" color="gray.900" lineHeight="1.2">
              Build an album track by track.
            </Text>
            <Text fontSize="13px" color="gray.600">
              Each track is its own audio file. We&apos;ll save your progress as a draft so you can
              come back, reorder tracks, edit metadata, and publish when ready.
            </Text>
          </VStack>
          <Button
            bg="primary.500"
            color="white"
            _hover={{ bg: 'primary.600' }}
            onClick={() => navigate('/upload/album/new')}
          >
            <FiPlus /> Start new album
          </Button>
        </HStack>
      </Box>

      {/* Drafts list */}
      <Box>
        <Text fontSize="11px" fontWeight="semibold" letterSpacing="0.08em"
              textTransform="uppercase" color="gray.blue.700" mb={3}>
          Drafts
        </Text>

        {loading ? (
          <HStack py={6} justify="center">
            <Spinner size="sm" color="primary.500" />
          </HStack>
        ) : !drafts || drafts.length === 0 ? (
          <Box
            border="1px dashed"
            borderColor="gray.200"
            borderRadius="lg"
            py={8}
            textAlign="center"
          >
            <Text fontSize="13px" color="gray.500">
              No drafts. Click &ldquo;Start new album&rdquo; above to begin.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap={2}>
            {drafts.map((draft) => (
              <Box
                key={draft.id}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                px={4}
                py={3}
                cursor="pointer"
                transition="all 0.12s"
                _hover={{ borderColor: 'primary.300', bg: 'gray.50' }}
                onClick={() => navigate(`/upload/album/${draft.id}`)}
              >
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap={0}>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      {draft.title || 'Untitled album'}
                    </Text>
                    <Text fontSize="11px" color="gray.500">
                      {draft.trackCount} track{draft.trackCount === 1 ? '' : 's'}
                      {' · last edited '}
                      {new Date(draft.updatedAt ?? draft.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <FiArrowRight color="var(--chakra-colors-gray-400)" />
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};
