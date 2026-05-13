import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Drawer,
    HStack,
    Portal,
    Separator,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiCopy, FiX } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import { usePayout } from '../hooks/usePayouts';
import { formatMinorAmount } from '../lib/format';
import { payoutStatusStyle } from '../lib/payoutStatusColor';
import type { PayoutStatus } from '../types';

interface PayoutDetailDrawerProps {
    payoutId: string | null;
    onClose: () => void;
}

function formatDateTime(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const TimelineStep: React.FC<{
    label: string;
    timestamp?: string;
    state: 'done' | 'active' | 'pending' | 'failed';
}> = ({ label, timestamp, state }) => {
    const color =
        state === 'done'
            ? '#16A34A'
            : state === 'active'
              ? '#3B82F6'
              : state === 'failed'
                ? '#E53E3E'
                : '#D1D5DB';
    return (
        <HStack gap={3} align="start">
            <Box boxSize="8px" borderRadius="full" bg={color} mt={1.5} flexShrink={0} />
            <VStack gap={0} align="start" flex="1" minW={0}>
                <Text fontSize="xs" fontWeight="semibold" color={state === 'pending' ? 'gray.400' : 'gray.800'}>
                    {label}
                </Text>
                <Text fontSize="10px" color="gray.500">
                    {state === 'pending' ? '—' : formatDateTime(timestamp)}
                </Text>
            </VStack>
        </HStack>
    );
};

function deriveTimelineState(status: PayoutStatus) {
    return {
        initiated: 'done' as const,
        processing:
            status === 'Pending'
                ? ('pending' as const)
                : status === 'Failed'
                  ? ('failed' as const)
                  : ('done' as const),
        completed:
            status === 'Paid'
                ? ('done' as const)
                : status === 'Failed'
                  ? ('failed' as const)
                  : status === 'Processing'
                    ? ('active' as const)
                    : ('pending' as const),
    };
}

export const PayoutDetailDrawer: React.FC<PayoutDetailDrawerProps> = ({ payoutId, onClose }) => {
    const { data, isLoading } = usePayout(payoutId ?? undefined);
    const toast = useChakraToast();
    const open = payoutId !== null;

    const handleCopy = async () => {
        if (!data?.id) return;
        try {
            await navigator.clipboard.writeText(data.id);
            toast.success('Copied', 'Payout ID copied to clipboard.');
        } catch {
            toast.error('Copy failed', 'Could not access the clipboard.');
        }
    };

    return (
        <Drawer.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            placement="end"
            size="sm"
        >
            <Portal>
                <Drawer.Backdrop bg="blackAlpha.500" />
                <Drawer.Positioner>
                    <Drawer.Content bg="white">
                        <Drawer.Header borderBottom="1px solid" borderColor="gray.100" px={5} py={4}>
                            <HStack justify="space-between" align="center" width="100%">
                                <Drawer.Title fontSize="sm" fontWeight="semibold" color="gray.900">
                                    Payout details
                                </Drawer.Title>
                                <Box
                                    as="button"
                                    onClick={onClose}
                                    color="gray.400"
                                    _hover={{ color: 'gray.700' }}
                                    aria-label="Close drawer"
                                >
                                    <FiX />
                                </Box>
                            </HStack>
                        </Drawer.Header>

                        <Drawer.Body px={5} py={4}>
                            {isLoading || !data ? (
                                <HStack py={6} justify="center">
                                    <Spinner size="sm" color="primary.500" />
                                </HStack>
                            ) : (
                                <Stack gap={4}>
                                    <HStack gap={3} align="center">
                                        <Avatar.Root size="lg">
                                            <Avatar.Fallback name={data.recipientName} />
                                        </Avatar.Root>
                                        <VStack align="start" gap={0} flex="1" minW={0}>
                                            <Text
                                                fontSize="md"
                                                fontWeight="semibold"
                                                color="gray.900"
                                                fontFamily="Poppins"
                                                lineClamp={1}
                                            >
                                                {data.recipientName}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {data.currency} recipient
                                            </Text>
                                            <PayoutBadge status={data.status} />
                                        </VStack>
                                    </HStack>

                                    <Box
                                        bg="gray.50"
                                        borderRadius="14px"
                                        border="1px solid"
                                        borderColor="gray.100"
                                        px={4}
                                        py={3}
                                    >
                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
                                            Amount
                                        </Text>
                                        <Text fontSize="xl" fontWeight="bold" color="gray.900" fontFamily="Poppins" mt={1}>
                                            {formatMinorAmount(data.amountMinor, data.currency)}
                                        </Text>
                                    </Box>

                                    <Stack gap={2}>
                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
                                            Timeline
                                        </Text>
                                        <Stack gap={3}>
                                            {(() => {
                                                const t = deriveTimelineState(data.status);
                                                return (
                                                    <>
                                                        <TimelineStep label="Initiated" state={t.initiated} timestamp={data.initiatedAt} />
                                                        <TimelineStep
                                                            label="Processing"
                                                            state={t.processing}
                                                            timestamp={data.status === 'Processing' || data.status === 'Paid' || data.status === 'Failed' ? data.initiatedAt : undefined}
                                                        />
                                                        <TimelineStep
                                                            label={data.status === 'Failed' ? 'Failed' : 'Completed'}
                                                            state={t.completed}
                                                            timestamp={data.completedAt}
                                                        />
                                                    </>
                                                );
                                            })()}
                                        </Stack>
                                    </Stack>

                                    {data.failureReason && (
                                        <Box
                                            bg="#FEF2F2"
                                            color="#C53030"
                                            borderRadius="12px"
                                            border="1px solid"
                                            borderColor="#FECACA"
                                            px={3}
                                            py={2.5}
                                            fontSize="xs"
                                        >
                                            <Text fontWeight="semibold" mb={1}>Failure reason</Text>
                                            <Text>{data.failureReason}</Text>
                                        </Box>
                                    )}

                                    <Separator />

                                    <Stack gap={2}>
                                        <MetaRow label="Payout ID" value={data.id} mono />
                                        <MetaRow label="Batch ID" value={data.batchId} mono />
                                    </Stack>
                                </Stack>
                            )}
                        </Drawer.Body>

                        <Drawer.Footer borderTop="1px solid" borderColor="gray.100" px={5} py={3}>
                            <HStack gap={2} width="100%" justify="flex-end">
                                <Button
                                    onClick={handleCopy}
                                    disabled={!data}
                                    size="sm"
                                    variant="outline"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    borderColor="gray.200"
                                    color="gray.700"
                                >
                                    <HStack gap={1.5}>
                                        <FiCopy />
                                        <Text>Copy ID</Text>
                                    </HStack>
                                </Button>
                                <Button
                                    onClick={onClose}
                                    size="sm"
                                    bg="primary.500"
                                    color="white"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                >
                                    Close
                                </Button>
                            </HStack>
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};

const PayoutBadge: React.FC<{ status: PayoutStatus }> = ({ status }) => {
    const s = payoutStatusStyle(status);
    return (
        <HStack
            gap={1.5}
            bg={s.bg}
            color={s.color}
            fontSize="10px"
            fontWeight="semibold"
            px={2.5}
            py={1}
            borderRadius="full"
            mt={1}
        >
            <Box boxSize="6px" borderRadius="full" bg={s.dot} />
            <Text>{s.label}</Text>
        </HStack>
    );
};

const MetaRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({
    label,
    value,
    mono,
}) => (
    <HStack justify="space-between" align="start" gap={3}>
        <Text
            fontSize="10px"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.5px"
            fontWeight="semibold"
        >
            {label}
        </Text>
        <Text
            fontSize="xs"
            color="gray.800"
            textAlign="right"
            fontFamily={mono ? 'mono' : undefined}
            wordBreak="break-all"
        >
            {value}
        </Text>
    </HStack>
);

