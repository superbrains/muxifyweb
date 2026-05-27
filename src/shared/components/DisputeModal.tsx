import React from 'react';
import {
    Dialog,
    Box,
    Icon,
    IconButton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiFlag } from 'react-icons/fi';
import { DisputeForm } from './DisputeForm';

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

/**
 * Modal for an artist to dispute a duplicate-detection flag on held content.
 * Composes the shared <DisputeForm> so the validation and copy stay in lockstep
 * with the standalone /disputes page.
 */
export const DisputeModal: React.FC<DisputeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    contentTitle,
    contentNoun = 'upload',
    isLoading = false,
}) => {
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

                        <DisputeForm
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isLoading={isLoading}
                        />
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
