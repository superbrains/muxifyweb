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

export type ActionTone = 'danger' | 'warning' | 'primary' | 'info';

const TONE_ACCENT: Record<ActionTone, { accent: string; hover: string }> = {
    danger: { accent: '#f94444', hover: '#e53939' },
    warning: { accent: '#F97316', hover: '#EA6A0C' },
    primary: { accent: '#FF2D55', hover: '#E61E45' },
    info: { accent: '#3B82F6', hover: '#2563EB' },
};

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Receives the typed reason (empty string when `requireReason` is false). */
    onConfirm: (reason: string) => void;
    title: string;
    message?: string;
    /** When true (default), a reason of `minReasonLength`+ chars is mandatory and feeds the audit log. */
    requireReason?: boolean;
    minReasonLength?: number;
    reasonLabel?: string;
    placeholder?: string;
    confirmText?: string;
    tone?: ActionTone;
    isLoading?: boolean;
}

/**
 * Reason-capture confirmation modal reused by every destructive or financial
 * admin action (suspend, reject, refund, freeze, remove). The captured reason
 * is what gets written to `AdminAuditLog`, so for sensitive actions it is
 * mandatory. Set `requireReason={false}` for benign confirmations.
 */
export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    requireReason = true,
    minReasonLength = 10,
    reasonLabel = 'Reason',
    placeholder = 'Explain why — this is recorded in the audit log.',
    confirmText = 'Confirm',
    tone = 'danger',
    isLoading = false,
}) => {
    const [reason, setReason] = React.useState('');

    React.useEffect(() => {
        if (isOpen) setReason('');
    }, [isOpen]);

    const trimmed = reason.trim();
    const tooShort = requireReason && trimmed.length < minReasonLength;
    const { accent, hover } = TONE_ACCENT[tone];

    const handleConfirm = () => {
        if (tooShort || isLoading) return;
        onConfirm(trimmed);
    };

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
                            <Box pr={6}>
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

                            {requireReason && (
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
                                            ({minReasonLength}+ characters).
                                        </Text>
                                    )}
                                </Box>
                            )}

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
                                    _hover={{ bg: hover }}
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
