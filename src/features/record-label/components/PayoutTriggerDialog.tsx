import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Portal,
    RadioGroup,
    Stack,
    Text,
} from '@chakra-ui/react';
import { useTriggerPayout } from '../hooks/usePayouts';
import type { PayoutPeriod } from '../types';

interface PayoutTriggerDialogProps {
    open: boolean;
    onClose: () => void;
}

const generateIdempotencyKey = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const PayoutTriggerDialog: React.FC<PayoutTriggerDialogProps> = ({ open, onClose }) => {
    const [period, setPeriod] = useState<PayoutPeriod>('last-month');
    const trigger = useTriggerPayout();

    const handleConfirm = async () => {
        await trigger.mutateAsync({
            req: { period },
            idempotencyKey: generateIdempotencyKey(),
        });
        onClose();
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            size="sm"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold">
                                Trigger payout
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={3}>
                                <Text fontSize="xs" color="gray.600">
                                    Choose the period to pay out for. Splits will be applied
                                    automatically based on your saved configurations.
                                </Text>
                                <RadioGroup.Root
                                    value={period}
                                    onValueChange={(d) => setPeriod(d.value as PayoutPeriod)}
                                >
                                    <Stack gap={2}>
                                        {(
                                            [
                                                { value: 'mtd', label: 'Month to date' },
                                                { value: 'last-month', label: 'Last calendar month' },
                                            ] as Array<{ value: PayoutPeriod; label: string }>
                                        ).map((opt) => (
                                            <RadioGroup.Item key={opt.value} value={opt.value}>
                                                <RadioGroup.ItemHiddenInput />
                                                <RadioGroup.ItemIndicator />
                                                <RadioGroup.ItemText fontSize="xs">
                                                    {opt.label}
                                                </RadioGroup.ItemText>
                                            </RadioGroup.Item>
                                        ))}
                                    </Stack>
                                </RadioGroup.Root>
                                <Box
                                    bg="primary.50"
                                    p={3}
                                    borderRadius="md"
                                    fontSize="xs"
                                    color="gray.700"
                                >
                                    A confirmation will be sent to each artist. This action
                                    cannot be undone once funds settle.
                                </Box>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <HStack gap={2}>
                                <Button onClick={onClose} variant="ghost" size="sm" fontSize="xs">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    loading={trigger.isPending}
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                >
                                    Trigger payout
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
