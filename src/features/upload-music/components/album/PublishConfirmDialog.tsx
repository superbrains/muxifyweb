import { Box, Button, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { AlbumManageDto } from '../../types/album';

interface PublishConfirmDialogProps {
  isOpen: boolean;
  album: AlbumManageDto;
  onConfirm: () => void;
  onCancel: () => void;
  isPublishing?: boolean;
}

interface Check {
  label: string;
  passed: boolean;
  detail?: string;
}

function buildChecks(album: AlbumManageDto): Check[] {
  const ready = album.tracks.filter((t) => t.status === 'ready');
  const titled = album.tracks.filter((t) => t.title?.trim());
  const processing = album.tracks.filter((t) => t.status === 'processing');
  const failed = album.tracks.filter((t) => t.status === 'failed');

  return [
    {
      label: 'Album has a title',
      passed: !!album.title?.trim(),
    },
    {
      label: 'Album has cover art',
      passed: !!album.coverArtUrl,
      detail: 'Optional but strongly recommended.',
    },
    {
      label: 'At least one track has finished processing',
      passed: ready.length >= 1,
      detail: ready.length === 0
        ? `${processing.length} processing, ${failed.length} failed.`
        : `${ready.length} of ${album.tracks.length} ready.`,
    },
    {
      label: 'Every track has a title',
      passed: titled.length === album.tracks.length && album.tracks.length > 0,
    },
  ];
}

export const PublishConfirmDialog: React.FC<PublishConfirmDialogProps> = ({
  isOpen,
  album,
  onConfirm,
  onCancel,
  isPublishing = false,
}) => {
  if (!isOpen) return null;

  const checks = buildChecks(album);
  const requiredChecks = [checks[0], checks[2], checks[3]]; // title, ≥1 ready, all titled
  const canPublish = requiredChecks.every((c) => c.passed);
  const processing = album.tracks.filter((t) => t.status === 'processing').length;

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
      onClick={!isPublishing ? onCancel : undefined}
    >
      <Box
        bg="white"
        borderRadius="xl"
        shadow="2xl"
        w="full"
        maxW="500px"
        p={6}
        onClick={(e) => e.stopPropagation()}
      >
        <Text fontSize="20px" fontWeight="700" color="gray.900" mb={2}>
          Publish &ldquo;{album.title}&rdquo;?
        </Text>
        <Text fontSize="13px" color="gray.600" mb={4}>
          Once published, fans can find and play this album. You can unpublish later from the
          same screen.
        </Text>

        <VStack align="stretch" gap={2} mb={5}>
          {checks.map((c) => (
            <HStack key={c.label} align="start">
              <Box mt="2px" color={c.passed ? 'green.500' : 'gray.300'}>
                {c.passed ? <FiCheckCircle /> : <FiAlertCircle />}
              </Box>
              <Box flex="1">
                <Text
                  fontSize="13px"
                  fontWeight={c.passed ? '500' : '600'}
                  color={c.passed ? 'gray.700' : 'gray.900'}
                >
                  {c.label}
                </Text>
                {c.detail && (
                  <Text fontSize="11px" color="gray.500">
                    {c.detail}
                  </Text>
                )}
              </Box>
            </HStack>
          ))}
        </VStack>

        {processing > 0 && (
          <Box bg="orange.50" color="orange.800" px={3} py={2} borderRadius="md" mb={4}>
            <Text fontSize="12px">
              {processing} track{processing === 1 ? '' : 's'} still processing — only ready tracks
              will publish now. The rest will need to be published individually after they finish.
            </Text>
          </Box>
        )}

        <Stack direction="row" justify="flex-end" gap={2}>
          <Button variant="ghost" onClick={onCancel} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            bg="primary.500"
            color="white"
            _hover={{ bg: 'primary.600' }}
            onClick={onConfirm}
            disabled={!canPublish || isPublishing}
            loading={isPublishing}
          >
            Publish album
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
