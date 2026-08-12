import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    Input,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md';

interface PayoutPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Authorises the payout with the entered PIN. Resolve with an error message
     * to keep the modal open and show it inline (a rejected PIN must not look
     * like a success); resolve with null once the modal's work is done.
     */
    onSubmit: (pin: string) => Promise<string | null>;
    /** Formatted amount, shown so the artist can confirm what they're approving. */
    amountLabel?: string;
}

// Matches the backend's PIN shape (^\d{4,6}$) — the PIN is variable length, so a
// fixed-cell OTP grid would be the wrong control here.
const PIN_PATTERN = /^\d{4,6}$/;

export const PayoutPinModal: React.FC<PayoutPinModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    amountLabel,
}) => {
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inlineError, setInlineError] = useState<string | null>(null);

    // Never leave a PIN or a stale error sitting in state once the modal closes.
    useEffect(() => {
        if (!isOpen) {
            setPin('');
            setShowPin(false);
            setIsSubmitting(false);
            setInlineError(null);
        }
    }, [isOpen]);

    const isValid = PIN_PATTERN.test(pin);

    const handleSubmit = async () => {
        if (!isValid || isSubmitting) return;

        setInlineError(null);
        setIsSubmitting(true);
        try {
            const error = await onSubmit(pin);
            if (error) {
                // Wrong PIN: stay open, clear the digits so the artist can retry.
                setInlineError(error);
                setPin('');
                setShowPin(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="390px" p={7} position="relative" borderRadius="25px" display="flex" flexDirection="column" alignItems="center">
                    <Dialog.Header>
                        <HStack justify="center" w="full">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Authorise Payout
                            </Text>
                            <IconButton
                                aria-label="Close"
                                variant="ghost"
                                size="sm"
                                color="red.500"
                                position="absolute"
                                right={4}
                                top={4}
                                onClick={onClose}
                            >
                                <Icon as={MdClose} />
                            </IconButton>
                        </HStack>
                    </Dialog.Header>

                    <Text fontSize="xs" color="gray.600" mb={4} textAlign="center" w="85%">
                        {amountLabel
                            ? <>Enter your transaction PIN to authorise this payout of <strong style={{ color: '#f94444' }}>{amountLabel}</strong>.</>
                            : 'Enter your transaction PIN to authorise this payout.'}
                    </Text>

                    <VStack gap={4} align="stretch" w="full">
                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Transaction PIN
                            </Text>
                            <Box position="relative">
                                <Input
                                    value={pin}
                                    onChange={(e) => {
                                        setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setInlineError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSubmit();
                                    }}
                                    type={showPin ? 'text' : 'password'}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="Enter your 4-6 digit PIN"
                                    size="md"
                                    bg="gray.50"
                                    borderColor={inlineError ? 'red.500' : 'gray.200'}
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                    pr={10}
                                    autoFocus
                                />
                                <IconButton
                                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                                    variant="ghost"
                                    size="sm"
                                    position="absolute"
                                    right={1}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    color="gray.500"
                                    onClick={() => setShowPin((v) => !v)}
                                >
                                    <Icon as={showPin ? MdVisibilityOff : MdVisibility} />
                                </IconButton>
                            </Box>
                            {inlineError && (
                                <Text fontSize="xs" color="red.500" mt={1}>
                                    {inlineError}
                                </Text>
                            )}
                        </Box>

                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            loadingText="Authorising..."
                            bg="primary.500"
                            color="white"
                            size="md"
                            fontSize="sm"
                            width="full"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                            disabled={!isValid || isSubmitting}
                        >
                            Confirm Payout
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
