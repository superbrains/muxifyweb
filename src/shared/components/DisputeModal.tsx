import React, { useEffect, useState } from 'react';
import {
    Dialog,
    Button,
    Text,
    Textarea,
    VStack,
    HStack,
    Box,
    Icon,
    IconButton,
    Spinner,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiFlag } from 'react-icons/fi';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Submits the dispute. The parent closes the modal on success. */
    onSubmit: (reason: string) => void;
    /** Title of the held content, shown for context. */
    contentTitle?: string;
    /** "track" or "video" — used in the copy. */
    contentNoun?: string;
    isLoading?: boolean;
}

const MIN_REASON_LENGTH = 10;

/**
 * Modal for an artist to dispute a duplicate-detection flag on held content.
 * Mirrors ConfirmModal's layout so it stays consistent with the rest of the app.
 */
export const DisputeModal: React.FC<DisputeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    contentTitle,
    contentNoun = 'upload',
    isLoading = false,
}) => {
    const [reason, setReason] = useState('');

    // Clear the draft whenever the modal is closed.
    useEffect(() => {
        if (!isOpen) setReason('');
    }, [isOpen]);

    const trimmed = reason.trim();
    const tooShort = trimmed.length < MIN_REASON_LENGTH;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="480px" p={7} borderRadius="25px" position="relative">
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                        position="absolute"
                        right={4}
                        top={4}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} />
                    </IconButton>

                    <VStack gap={5} align="stretch" w="full" py={2}>
                        <VStack gap={3} align="center">
                            <Box
                                bg="orange.50"
                                borderRadius="full"
                                p={4}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={FiFlag} boxSize={7} color="orange.500" />
                            </Box>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900" textAlign="center">
                                Dispute duplicate flag
                            </Text>
                            <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.6">
                                {contentTitle ? (
                                    <>
                                        Your {contentNoun}{' '}
                                        <Text as="span" fontWeight="600" color="gray.800">
                                            “{contentTitle}”
                                        </Text>{' '}
                                        was flagged as a possible duplicate.
                                    </>
                                ) : (
                                    <>This {contentNoun} was flagged as a possible duplicate.</>
                                )}{' '}
                                If you hold the rights to it, tell us why — our moderation team
                                will prioritise your case.
                            </Text>
                        </VStack>

                        <Box>
                            <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1.5}>
                                Why is this not an infringing duplicate?
                            </Text>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. This is my own original recording, or I hold a valid licence / distribution agreement for it."
                                rows={5}
                                fontSize="sm"
                                resize="vertical"
                                disabled={isLoading}
                                borderColor="gray.300"
                                _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px #f94444' }}
                            />
                            <Text fontSize="11px" color="gray.500" mt={1}>
                                Please give us at least a sentence so the team can act on it.
                            </Text>
                        </Box>

                        <HStack gap={3} w="full" justify="flex-end" pt={1}>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                borderColor="gray.300"
                                color="gray.700"
                                size="md"
                                fontSize="sm"
                                fontWeight="medium"
                                px={6}
                                borderRadius="md"
                                _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="#f94444"
                                color="white"
                                size="md"
                                fontSize="sm"
                                fontWeight="medium"
                                px={6}
                                borderRadius="md"
                                onClick={() => onSubmit(trimmed)}
                                disabled={isLoading || tooShort}
                                _hover={{ bg: '#e53939' }}
                                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" color="white" />
                                        <Text>Submitting…</Text>
                                    </>
                                ) : (
                                    'Submit dispute'
                                )}
                            </Button>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
