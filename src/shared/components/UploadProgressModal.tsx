import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import {
  formatBytes,
  formatEta,
  formatSpeed,
} from '@shared/lib/uploadProgress';
import type { UploadProgressDetail, UploadStage } from '@shared/types/upload';

const MotionBox = motion(Box);

interface UploadProgressModalProps {
  isOpen: boolean;
  thumbnailUrl?: string;
  title: string;
  fileSize: number;
  progress: UploadProgressDetail | null;
  /** When publishing an album, surfaces "Track N of M" context. */
  albumProgress?: { current: number; total: number };
  onRetry?: () => void;
  onClose?: () => void;
}

const STAGE_ORDER: UploadStage[] = [
  'preparing',
  'uploading',
  'finalizing',
  'completed',
];

const STAGE_LABELS: Record<UploadStage, string> = {
  preparing: 'Preparing upload',
  uploading: 'Uploading',
  finalizing: 'Finalizing',
  processing: 'Processing',
  completed: 'Upload complete',
  failed: 'Upload failed',
};

const STAGE_DOT_LABELS = ['Prepare', 'Upload', 'Finalize', 'Done'] as const;

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  thumbnailUrl,
  title,
  fileSize,
  progress,
  albumProgress,
  onRetry,
  onClose,
}) => {
  const stage: UploadStage = progress?.stage ?? 'preparing';
  const isTerminal = stage === 'completed' || stage === 'failed';
  const isActive = !isTerminal;

  const activeIndex = useMemo(() => {
    const idx = STAGE_ORDER.indexOf(stage);
    return idx === -1 ? 0 : idx;
  }, [stage]);

  // Auto-close after success
  useEffect(() => {
    if (stage !== 'completed' || !onClose) return;
    const timer = window.setTimeout(() => onClose(), 800);
    return () => window.clearTimeout(timer);
  }, [stage, onClose]);

  const displayedProgress = progress?.progress ?? 0;
  const loaded = progress?.loaded ?? 0;
  const total = progress?.total ?? fileSize;
  const speedBps = progress?.speedBps ?? 0;
  const etaSeconds = progress?.etaSeconds ?? null;

  const showShimmer = stage === 'preparing' || stage === 'finalizing';
  const showError = stage === 'failed';
  const showSuccess = stage === 'completed';

  const stageLabel = STAGE_LABELS[stage];
  const albumLabel = albumProgress
    ? `Track ${albumProgress.current} of ${albumProgress.total}`
    : null;

  return (
    <Dialog.Root
      open={isOpen}
      closeOnInteractOutside={false}
      closeOnEscape={isTerminal}
      onOpenChange={(e) => {
        if (!e.open && isTerminal) onClose?.();
      }}
    >
      <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <Dialog.Positioner>
        <Dialog.Content
          maxW="440px"
          w="calc(100vw - 32px)"
          p={0}
          borderRadius="20px"
          overflow="hidden"
          position="relative"
          bg="white"
          boxShadow="0 24px 60px rgba(249, 68, 68, 0.18), 0 8px 24px rgba(20, 20, 20, 0.08)"
        >
          {/* Top accent strip — branded red gradient */}
          <Box
            h="4px"
            w="full"
            bgGradient="linear(to right, #f94444, #ff7a55, #f94444)"
            bgSize="200% 100%"
          >
            {isActive && (
              <MotionBox
                h="full"
                w="full"
                bgGradient="linear(to right, #f94444, #ff7a55, #f94444)"
                bgSize="200% 100%"
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </Box>

          {isTerminal && onClose && (
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              position="absolute"
              right={3}
              top={5}
              onClick={onClose}
              zIndex={2}
            >
              <Icon as={MdClose} boxSize={5} color="gray.500" />
            </IconButton>
          )}

          <VStack align="stretch" gap={5} p={6}>
            {/* Context row: thumbnail + title */}
            <HStack gap={4} align="flex-start">
              <Box
                w="88px"
                h="88px"
                borderRadius="14px"
                overflow="hidden"
                flexShrink={0}
                position="relative"
                bg="primary.50"
                border="1px solid"
                borderColor="primary.100"
              >
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Box
                    w="full"
                    h="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiUploadCloud} boxSize={7} color="primary.500" />
                  </Box>
                )}
                {/* Subtle pulsing dot on the thumbnail while uploading */}
                {isActive && (
                  <MotionBox
                    position="absolute"
                    top="8px"
                    right="8px"
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg="primary.500"
                    boxShadow="0 0 0 0 rgba(249, 68, 68, 0.6)"
                    animate={{
                      scale: [1, 1.4, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(249, 68, 68, 0.6)',
                        '0 0 0 8px rgba(249, 68, 68, 0)',
                        '0 0 0 0 rgba(249, 68, 68, 0)',
                      ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
              </Box>

              <VStack align="stretch" gap={1} flex="1" minW={0} pt={1}>
                <Text
                  fontSize="11px"
                  fontWeight="medium"
                  color="primary.500"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  {albumLabel ?? 'Publishing'}
                </Text>
                <Text
                  fontSize="15px"
                  fontWeight="semibold"
                  color="gray.900"
                  lineClamp={2}
                  lineHeight="1.35"
                >
                  {title || 'Untitled'}
                </Text>
                <Text fontSize="11px" color="gray.500" mt={1}>
                  {formatBytes(total)}
                </Text>
              </VStack>
            </HStack>

            {/* Stage indicator strip */}
            <HStack gap={2} justify="space-between" px={1}>
              {STAGE_DOT_LABELS.map((label, idx) => {
                const isComplete = idx < activeIndex || stage === 'completed';
                const isCurrent =
                  idx === activeIndex && stage !== 'completed' && stage !== 'failed';
                const isFailedHere = stage === 'failed' && idx === activeIndex;

                return (
                  <VStack key={label} flex="1" gap={1.5}>
                    <Box position="relative" w="full" h="6px">
                      <Box
                        position="absolute"
                        inset={0}
                        bg="gray.100"
                        borderRadius="full"
                      />
                      {(isComplete || isCurrent || isFailedHere) && (
                        <MotionBox
                          position="absolute"
                          inset={0}
                          bg={isFailedHere ? 'red.400' : 'primary.500'}
                          borderRadius="full"
                          initial={{ scaleX: 0, originX: 0 }}
                          animate={{ scaleX: isCurrent ? 0.6 : 1 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      )}
                    </Box>
                    <Text
                      fontSize="9px"
                      fontWeight={isCurrent ? 'semibold' : 'medium'}
                      color={
                        isFailedHere
                          ? 'red.500'
                          : isCurrent || isComplete
                          ? 'gray.700'
                          : 'gray.400'
                      }
                      textTransform="uppercase"
                      letterSpacing="0.06em"
                    >
                      {label}
                    </Text>
                  </VStack>
                );
              })}
            </HStack>

            {/* Body — switches between active / success / error */}
            <AnimatePresence mode="wait" initial={false}>
              {showError ? (
                <MotionBox
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack align="stretch" gap={4}>
                    <HStack
                      gap={3}
                      bg="red.50"
                      borderRadius="md"
                      p={3}
                      border="1px solid"
                      borderColor="red.100"
                      align="flex-start"
                    >
                      <Icon
                        as={FiAlertCircle}
                        boxSize={5}
                        color="red.500"
                        mt="2px"
                        flexShrink={0}
                      />
                      <VStack align="stretch" gap={1} flex="1" minW={0}>
                        <Text fontSize="12px" fontWeight="semibold" color="red.600">
                          Upload failed
                        </Text>
                        <Text fontSize="11px" color="gray.700" lineHeight="1.5">
                          {progress?.error ||
                            'Something went wrong. Check your connection and try again.'}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack gap={2} justify="flex-end">
                      {onClose && (
                        <Button
                          variant="ghost"
                          size="sm"
                          fontSize="12px"
                          fontWeight="medium"
                          color="gray.600"
                          onClick={onClose}
                          _hover={{ bg: 'gray.100' }}
                        >
                          Close
                        </Button>
                      )}
                      {onRetry && (
                        <Button
                          bg="primary.500"
                          color="white"
                          size="sm"
                          fontSize="12px"
                          fontWeight="semibold"
                          h="38px"
                          px={5}
                          borderRadius="md"
                          _hover={{ bg: 'primary.600' }}
                          onClick={onRetry}
                        >
                          Retry upload
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </MotionBox>
              ) : showSuccess ? (
                <MotionBox
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <HStack gap={3} justify="center" py={2}>
                    <Box
                      w="44px"
                      h="44px"
                      borderRadius="full"
                      bg="green.50"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiCheckCircle} boxSize={6} color="green.500" />
                    </Box>
                    <VStack align="flex-start" gap={0}>
                      <Text fontSize="14px" fontWeight="semibold" color="gray.900">
                        Upload complete
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        Wrapping things up…
                      </Text>
                    </VStack>
                  </HStack>
                </MotionBox>
              ) : (
                <MotionBox
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack align="stretch" gap={3}>
                    {/* Stage label + percentage */}
                    <HStack justify="space-between" align="baseline">
                      <Text
                        fontSize="13px"
                        fontWeight="semibold"
                        color="gray.900"
                      >
                        {stageLabel}
                        {stage === 'preparing' || stage === 'finalizing' ? '…' : ''}
                      </Text>
                      <Text
                        fontSize="20px"
                        fontWeight="bold"
                        color="primary.500"
                        fontVariantNumeric="tabular-nums"
                      >
                        {Math.round(displayedProgress)}%
                      </Text>
                    </HStack>

                    {/* Progress bar */}
                    <Box
                      w="full"
                      h="10px"
                      bg="gray.100"
                      borderRadius="full"
                      overflow="hidden"
                      position="relative"
                    >
                      <MotionBox
                        h="full"
                        bgGradient="linear(to right, #f94444, #ff6b4a)"
                        borderRadius="full"
                        initial={false}
                        animate={{ width: `${Math.max(2, displayedProgress)}%` }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      />
                      {showShimmer && (
                        <MotionBox
                          position="absolute"
                          top={0}
                          bottom={0}
                          w="40%"
                          bgGradient="linear(to right, transparent, rgba(255,255,255,0.65), transparent)"
                          animate={{ left: ['-40%', '120%'] }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </Box>

                    {/* Stats row */}
                    <HStack
                      justify="space-between"
                      fontSize="11px"
                      color="gray.600"
                      fontVariantNumeric="tabular-nums"
                    >
                      <Text>
                        <Text as="span" fontWeight="semibold" color="gray.800">
                          {formatBytes(loaded)}
                        </Text>
                        <Text as="span" color="gray.400">
                          {' '}of{' '}
                        </Text>
                        {formatBytes(total)}
                      </Text>
                      <Text>
                        {stage === 'preparing'
                          ? 'Connecting…'
                          : stage === 'finalizing'
                          ? 'Saving to library…'
                          : `${formatSpeed(speedBps)} · ${formatEta(etaSeconds)}`}
                      </Text>
                    </HStack>

                    <Text fontSize="10px" color="gray.400" textAlign="center" pt={1}>
                      Keep this window open until your upload finishes.
                    </Text>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>
          </VStack>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default UploadProgressModal;
