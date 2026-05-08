import { useRef, useState } from 'react';
import { Box, HStack, Spinner, Text, VStack, Icon } from '@chakra-ui/react';
import { FiImage, FiUpload } from 'react-icons/fi';
import { AuthedImage } from '@shared/components/AuthedImage';

interface AlbumCoverUploadProps {
  coverArtUrl?: string | null;
  coverArtThumbnail?: string | null;
  onUpload: (file: File) => Promise<void>;
  readOnly?: boolean;
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp';

export const AlbumCoverUpload: React.FC<AlbumCoverUploadProps> = ({
  coverArtUrl,
  coverArtThumbnail,
  onUpload,
  readOnly = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const triggerSelect = () => {
    if (readOnly || uploading) return;
    inputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload cover.');
    } finally {
      setUploading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const showImage = !!(coverArtThumbnail || coverArtUrl);

  return (
    <VStack align="stretch" gap={3} w={{ base: 'full', md: '220px' }} flexShrink={0}>
      <Text
        fontSize="11px"
        fontWeight="semibold"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="gray.blue.700"
      >
        Cover art
      </Text>

      <Box
        position="relative"
        w="full"
        aspectRatio={1}
        borderRadius="lg"
        overflow="hidden"
        cursor={readOnly ? 'default' : 'pointer'}
        bg={showImage ? 'transparent' : (isDragging ? 'red.200' : 'red.400')}
        border={showImage ? '1px solid' : '2px dashed'}
        borderColor={showImage ? 'gray.200' : (isDragging ? 'red.400' : 'red.200')}
        transition="all 0.2s"
        _hover={!readOnly ? { borderColor: 'red.300' } : {}}
        onClick={triggerSelect}
        onDragOver={(e) => {
          e.preventDefault();
          if (!readOnly) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        {showImage ? (
          <AuthedImage
            src={coverArtThumbnail ?? coverArtUrl ?? undefined}
            w="full"
            h="full"
            objectFit="cover"
            fallback={
              <HStack w="full" h="full" align="center" justify="center" bg="gray.100">
                <Icon as={FiImage} color="gray.400" boxSize={10} />
              </HStack>
            }
          />
        ) : (
          <VStack h="full" align="center" justify="center" gap={2} px={4}>
            <Icon as={FiUpload} color="white" boxSize={6} />
            <Text fontSize="13px" fontWeight="semibold" color="white" textAlign="center">
              Click or drag to upload
            </Text>
            <Text fontSize="11px" color="white" opacity={0.85} textAlign="center">
              JPEG, PNG, WebP up to 10 MB
            </Text>
          </VStack>
        )}

        {uploading && (
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner color="white" />
          </Box>
        )}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={onChange}
        style={{ display: 'none' }}
      />

      {showImage && !readOnly && (
        <Text
          as="button"
          fontSize="12px"
          color="primary.500"
          fontWeight="semibold"
          textAlign="left"
          onClick={triggerSelect}
          _hover={{ color: 'primary.600' }}
        >
          Replace cover
        </Text>
      )}

      <Text fontSize="11px" color="gray.500">
        This cover is used for the album and any track that doesn&apos;t have its own override.
      </Text>

      {error && (
        <Text fontSize="11px" color="red.500">{error}</Text>
      )}
    </VStack>
  );
};
