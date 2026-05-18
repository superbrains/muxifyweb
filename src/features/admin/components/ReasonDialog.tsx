import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Portal,
    Spinner,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

const MIN_REASON_LENGTH = 10;

interface ReasonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    message?: string;
    /** Label above the textarea. */
    reasonLabel?: string;
    placeholder?: string;
    confirmText?: string;
    confirmColor?: 'red' | 'orange';
    isLoading?: boolean;
}

/**
 * Confirmation dialog that requires a typed reason before the destructive
 * action can fire. Shared by verification rejection, account suspension, and
 * moderation removals — the reason is persisted and surfaced to the affected
 * user, so it is mandatory (min length enforced).
 */
export const ReasonDialog: React.FC<ReasonDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    reasonLabel = 'Reason',
    placeholder = 'Explain why — this is shared with the user.',
    confirmText = 'Confirm',
    confirmColor = 'red',
    isLoading = false,
}) => {
    const [reason, setReason] = React.useState('');

    React.useEffect(() => {
        if (isOpen) setReason('');
    }, [isOpen]);

    const trimmed = reason.trim();
    const tooShort = trimmed.length < MIN_REASON_LENGTH;

    const handleConfirm = () => {
        if (tooShort || isLoading) return;
        onConfirm(trimmed);
    };

    const accent = confirmColor === 'red' ? '#f94444' : '#F97316';
    const accentHover = confirmColor === 'red' ? '#e53939' : '#EA6A0C';

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => !e.open && onClose()}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="460px" p={6} borderRadius="20px" position="relative">
                        <IconButton
                            aria-label="Close"
                            variant="ghost"
                            size="sm"
                            color="gray.500"
                            position="absolute"
                            right={3}
                            top={3}
                            onClick={onClose}
                        >
                            <Icon as={MdClose} />
                        </IconButton>

                        <VStack align="stretch" gap={4}>
                            <Box>
                                <Text
                                    fontSize="md"
                                    fontWeight="semibold"
                                    color="gray.900"
                                    fontFamily="Poppins"
                                >
                                    {title}
                                </Text>
                                {message && (
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        {message}
                                    </Text>
                                )}
                            </Box>

                            <Box>
                                <Text
                                    fontSize="11px"
                                    fontWeight="semibold"
                                    color="gray.700"
                                    mb={1.5}
                                >
                                    {reasonLabel}
                                </Text>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={placeholder}
                                    rows={4}
                                    fontSize="xs"
                                    resize="none"
                                    autoFocus
                                    _focus={{
                                        borderColor: accent,
                                        boxShadow: `0 0 0 1px ${accent}`,
                                    }}
                                />
                                {tooShort && trimmed.length > 0 && (
                                    <Text fontSize="10px" color="primary.500" mt={1}>
                                        Please add a little more detail
                                        ({MIN_REASON_LENGTH}+ characters).
                                    </Text>
                                )}
                            </Box>

                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={isLoading}
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    bg={accent}
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    borderRadius="10px"
                                    disabled={tooShort || isLoading}
                                    _hover={{ bg: accentHover }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {isLoading ? (
                                        <HStack gap={2}>
                                            <Spinner size="xs" color="white" />
                                            <Text>{confirmText}</Text>
                                        </HStack>
                                    ) : (
                                        confirmText
                                    )}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
