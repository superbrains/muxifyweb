import React from 'react';
import { Box, HStack, Link, Text, VStack } from '@chakra-ui/react';
import { FiFileText, FiPaperclip } from 'react-icons/fi';
import { formatMinorAmount } from '@/features/record-label/lib/format';
import { DetailDrawer, StatusBadge, CopyableId } from '@shared/console';
import { AuthedImage } from '@shared/components/AuthedImage';
import { useAuthedImageSrc } from '@shared/hooks/useAuthedImageSrc';
import { useDispute } from '../hooks/useDisputes';
import { subjectLabel, isImageAttachment, formatFileSize } from '../lib/disputeFamily';
import type { DisputeAttachment } from '../services/disputeService';

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

/* ----------------------------- Attachment item ----------------------------- */

const AttachmentItem: React.FC<{ attachment: DisputeAttachment }> = ({ attachment }) => {
    const blobUrl = useAuthedImageSrc(attachment.url);

    if (isImageAttachment(attachment.contentType)) {
        return (
            <Link
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                display="block"
                borderRadius="10px"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'primary.500' }}
            >
                <AuthedImage
                    src={attachment.url}
                    alt={attachment.fileName}
                    w="full"
                    h="80px"
                    objectFit="cover"
                    fallback={
                        <Box w="full" h="80px" bg="gray.50" display="flex" alignItems="center" justifyContent="center" color="gray.400">
                            <FiFileText />
                        </Box>
                    }
                />
            </Link>
        );
    }

    return (
        <Link
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ textDecoration: 'none' }}
            aria-disabled={!blobUrl}
        >
            <HStack
                gap={2}
                bg="gray.50"
                borderRadius="10px"
                border="1px solid"
                borderColor="gray.200"
                px={3}
                py={2.5}
                _hover={{ borderColor: 'primary.500' }}
            >
                <Box color="primary.500" flexShrink={0}>
                    <FiFileText />
                </Box>
                <VStack align="start" gap={0} minW={0} flex={1}>
                    <Text fontSize="xs" color="gray.800" fontWeight="medium" truncate>
                        {attachment.fileName}
                    </Text>
                    <Text fontSize="10px" color="gray.400">
                        {formatFileSize(attachment.sizeBytes)}
                    </Text>
                </VStack>
            </HStack>
        </Link>
    );
};

/* -------------------------------- Detail body ------------------------------- */

const DisputeDetail: React.FC<{ base: string; id: string }> = ({ base, id }) => {
    const { data, isLoading } = useDispute(base, id);

    if (isLoading || !data) {
        return (
            <VStack align="stretch" gap={3}>
                {[0, 1, 2].map((i) => (
                    <Box key={i} h="48px" bg="gray.50" borderRadius="8px" />
                ))}
            </VStack>
        );
    }

    const attachments = data.attachments ?? [];

    return (
        <VStack align="stretch" gap={5}>
            <HStack justify="space-between">
                <StatusBadge status={data.status} size="md" />
                <Text fontSize="xs" color="gray.400">
                    {subjectLabel(data.subjectType)}
                </Text>
            </HStack>

            <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                    <Text fontSize="11px" color="gray.500">Reference</Text>
                    <CopyableId value={data.reference} />
                </HStack>
                {data.amountMinor != null && (
                    <HStack justify="space-between">
                        <Text fontSize="11px" color="gray.500">Disputed amount</Text>
                        <Text fontSize="xs" fontWeight="medium" color="gray.800">
                            {formatMinorAmount(data.amountMinor, data.currency ?? 'NGN')}
                        </Text>
                    </HStack>
                )}
                <HStack justify="space-between">
                    <Text fontSize="11px" color="gray.500">Raised</Text>
                    <Text fontSize="xs" color="gray.700">{formatDateTime(data.createdAt)}</Text>
                </HStack>
            </VStack>

            <Box>
                <Text fontSize="11px" color="gray.500" mb={1}>What you reported</Text>
                <Box bg="gray.50" borderRadius="10px" p={3}>
                    <Text fontSize="xs" color="gray.800" whiteSpace="pre-wrap">{data.description}</Text>
                </Box>
            </Box>

            {attachments.length > 0 && (
                <Box>
                    <HStack gap={1.5} mb={2} color="gray.500">
                        <FiPaperclip size={12} />
                        <Text fontSize="11px">Evidence ({attachments.length})</Text>
                    </HStack>
                    <VStack align="stretch" gap={2}>
                        {attachments.map((a) => (
                            <AttachmentItem key={a.id} attachment={a} />
                        ))}
                    </VStack>
                </Box>
            )}

            {data.resolutionNotes && (
                <Box>
                    <Text fontSize="11px" color="gray.500" mb={1}>Outcome</Text>
                    <Box bg="#E7FFF7" borderRadius="10px" p={3}>
                        <Text fontSize="xs" color="#0F7B5C" whiteSpace="pre-wrap">{data.resolutionNotes}</Text>
                    </Box>
                </Box>
            )}

            <Box>
                <Text fontSize="11px" color="gray.500" mb={3}>Timeline</Text>
                <VStack align="stretch" gap={0}>
                    {data.events.map((e, idx) => (
                        <HStack key={e.id} align="flex-start" gap={3}>
                            <VStack gap={0} align="center" flexShrink={0}>
                                <Box boxSize="9px" borderRadius="full" bg="primary.500" mt={1} />
                                {idx < data.events.length - 1 && (
                                    <Box w="2px" flex={1} minH="28px" bg="gray.200" />
                                )}
                            </VStack>
                            <VStack align="start" gap={0} pb={4} minW={0}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    {e.action}
                                    <Text as="span" color="gray.400" fontWeight="normal">
                                        {' '}· {e.byYou ? 'You' : 'Muxify team'}
                                    </Text>
                                </Text>
                                {e.note && <Text fontSize="11px" color="gray.600">{e.note}</Text>}
                                <Text fontSize="10px" color="gray.400">{formatDateTime(e.createdAt)}</Text>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};

/* --------------------------------- Drawer ---------------------------------- */

interface DisputeDetailDrawerProps {
    base: string;
    id: string | null;
    onClose: () => void;
}

export const DisputeDetailDrawer: React.FC<DisputeDetailDrawerProps> = ({ base, id, onClose }) => (
    <DetailDrawer
        open={!!id}
        onClose={onClose}
        title="Dispute"
        subtitle="Case details, evidence and timeline"
    >
        {id && <DisputeDetail base={base} id={id} />}
    </DetailDrawer>
);
