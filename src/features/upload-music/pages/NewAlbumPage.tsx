import { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { albumService } from '../services/albumService';
import { useChakraToast } from '@shared/hooks/useChakraToast';

/**
 * Lightweight intake page: asks for the album title up-front, creates a draft,
 * and redirects into the full editor at /upload/album/:id. Keeps the flow obvious
 * (every album has a title) without making the editor handle a "no album yet" state.
 */
export const NewAlbumPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useChakraToast();
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const album = await albumService.createDraft({
        title: trimmed,
        releaseType: 'Album',
      });
      navigate(`/upload/album/${album.id}`, { replace: true });
    } catch (e) {
      toast.error('Could not create album', e instanceof Error ? e.message : '');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box maxW="640px" mx="auto" p={{ base: 4, md: 8, lg: 10 }}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate(-1)}
        mb={6}
      >
        <FiArrowLeft /> Back
      </Button>

      <VStack align="stretch" gap={6}>
        <Box>
          <Text
            fontSize="11px"
            fontWeight="semibold"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="gray.blue.700"
            mb={2}
          >
            New album
          </Text>
          <Text fontSize="28px" fontWeight="700" color="gray.900" lineHeight="1.2">
            Let&apos;s start with a title.
          </Text>
          <Text fontSize="14px" color="gray.500" mt={2}>
            You can edit everything else (cover, genre, release date, tracks) on the next screen
            and come back to finish anytime.
          </Text>
        </Box>

        <Stack gap={2}>
          <Text fontSize="12px" fontWeight="semibold" color="gray.900">
            Album title
          </Text>
          <Input
            autoFocus
            size="lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) submit();
            }}
            placeholder="e.g., Lagos Lights"
            bg="white"
            fontSize="16px"
            borderColor="gray.200"
            _focus={{
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            }}
          />
        </Stack>

        <HStack justify="flex-end">
          <Button
            bg="primary.500"
            color="white"
            _hover={{ bg: 'primary.600' }}
            onClick={submit}
            loading={creating}
            disabled={!title.trim() || creating}
          >
            Continue <FiArrowRight />
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default NewAlbumPage;
