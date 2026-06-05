import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Input,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';
import { useOwnPayoutBalance, useRequestOwnPayout } from '../hooks/useWithdrawalRequests';
import { formatMinorAmount } from '../lib/format';

interface RequestOwnPayoutDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Lets a record label request a payout of its OWN split-aware share (the Label-role
 * cut across roster tracks). Goes straight to the admin queue — distinct from the
 * "Trigger payout" flow which pays roster artists.
 */
export const RequestOwnPayoutDialog: React.FC<RequestOwnPayoutDialogProps> = ({ open, onClose }) => {
    const { data: balance, isLoading } = useOwnPayoutBalance(open);
    const requestPayout = useRequestOwnPayout();
    const [amount, setAmount] = useState('');

    const currency = balance?.currency ?? 'NGN';
    const availableMajor = (balance?.availableMinor ?? 0) / 100;
    const parsed = parseFloat(amount);
    const invalid = !parsed || parsed <= 0 || parsed > availableMajor;

    const handleSubmit = async () => {
        if (invalid) return;
        try {
            await requestPayout.mutateAsync(Math.round(parsed * 100));
            setAmount('');
            onClose();
        } catch {
            // Error toast fired inside the mutation; keep the dialog open to retry.
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(d) => !d.open && onClose()} size="md" placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold" fontFamily="Poppins">
                                Request your payout
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={4}>
                                <Text fontSize="xs" color="gray.600">
                                    Withdraw your label's share of roster earnings. This request goes to
                                    Muxify for approval and pays into your saved payout account.
                                </Text>

                                <Box bg="gray.50" borderRadius="12px" p={4}>
                                    <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.5px">
                                        Available to withdraw
                                    </Text>
                                    <Text fontSize="xl" fontWeight="bold" color="primary.500">
                                        {isLoading ? '—' : formatMinorAmount(balance?.availableMinor ?? 0, currency)}
                                    </Text>
                                    {(balance?.pendingMinor ?? 0) > 0 && (
                                        <Text fontSize="10px" color="gray.500">
                                            {formatMinorAmount(balance?.pendingMinor ?? 0, currency)} already in flight
                                        </Text>
                                    )}
                                </Box>

                                <Stack gap={1}>
                                    <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.5px">
                                        Amount ({currency})
                                    </Text>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        size="sm"
                                        borderRadius="10px"
                                    />
                                    {parsed > availableMajor && (
                                        <Text fontSize="10px" color="red.500">
                                            Amount exceeds your available balance.
                                        </Text>
                                    )}
                                </Stack>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <HStack gap={2} justify="flex-end" w="full">
                                <Button variant="ghost" size="sm" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                    onClick={handleSubmit}
                                    disabled={invalid}
                                    loading={requestPayout.isPending}
                                    loadingText="Requesting..."
                                >
                                    Request payout
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default RequestOwnPayoutDialog;
