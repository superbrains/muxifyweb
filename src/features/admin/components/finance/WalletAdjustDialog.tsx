import React from 'react';
import { Box, Button, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { ManagementDialog } from '../management/ManagementDialog';
import { useCreditWallet, useDebitWallet } from '../../hooks/useFinance';

const ACCENT = '#f94444';

export function WalletAdjustDialog({
    isOpen,
    onClose,
    userId,
    userName,
}: {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName?: string;
}) {
    const [mode, setMode] = React.useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = React.useState('');
    const [reason, setReason] = React.useState('');
    const credit = useCreditWallet();
    const debit = useDebitWallet();
    const pending = credit.isPending || debit.isPending;

    React.useEffect(() => {
        if (isOpen) {
            setMode('credit');
            setAmount('');
            setReason('');
        }
    }, [isOpen]);

    const amountNum = Number(amount);
    const valid = userId && Number.isFinite(amountNum) && amountNum > 0 && reason.trim().length > 0;

    const submit = () => {
        if (!userId || !valid) return;
        const vars = { userId, amount: Math.round(amountNum), reason: reason.trim() };
        const m = mode === 'credit' ? credit : debit;
        m.mutate(vars, { onSuccess: onClose });
    };

    const tabBtn = (key: 'credit' | 'debit', label: string) => (
        <Button
            flex="1"
            size="sm"
            borderRadius="lg"
            fontSize="xs"
            onClick={() => setMode(key)}
            bg={mode === key ? (key === 'credit' ? '#E7FFF7' : '#FEF2F2') : 'white'}
            color={mode === key ? (key === 'credit' ? '#0F7B5C' : '#C53030') : 'gray.600'}
            border="1px solid"
            borderColor={mode === key ? (key === 'credit' ? '#16A34A' : '#E53E3E') : 'gray.200'}
        >
            {label}
        </Button>
    );

    return (
        <ManagementDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Adjust wallet"
            subtitle={userName ? `Manual coin adjustment for ${userName}` : 'Manual coin adjustment'}
            footer={
                <HStack justify="flex-end" gap={2} w="100%">
                    <Button variant="outline" borderColor="gray.200" borderRadius="lg" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" borderRadius="lg" bg={ACCENT} color="white" _hover={{ opacity: 0.9 }} loading={pending} disabled={!valid} onClick={submit}>
                        {mode === 'credit' ? 'Credit coins' : 'Debit coins'}
                    </Button>
                </HStack>
            }
        >
            <VStack align="stretch" gap={3}>
                <HStack gap={2}>{tabBtn('credit', 'Credit')}{tabBtn('debit', 'Debit')}</HStack>
                <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>Amount (coins)</Text>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={1} placeholder="0" size="sm" fontSize="xs" borderColor="gray.200" borderRadius="lg" />
                </Box>
                <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>Reason</Text>
                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required — recorded in the audit log" rows={3} fontSize="xs" borderColor="gray.200" borderRadius="lg" />
                </Box>
            </VStack>
        </ManagementDialog>
    );
}
