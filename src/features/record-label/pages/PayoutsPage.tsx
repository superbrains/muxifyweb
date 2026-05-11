import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    HStack,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { usePayouts } from '../hooks/usePayouts';
import { useLabelSummary } from '../hooks/useLabelSummary';
import { PayoutTriggerDialog } from '../components/PayoutTriggerDialog';
import { formatMinorAmount } from '../lib/format';
import type { PayoutStatus } from '../types';

const statusColor = (status: PayoutStatus): { bg: string; color: string } => {
    switch (status) {
        case 'Paid':
            return { bg: '#E7FFF7', color: 'green.600' };
        case 'Processing':
            return { bg: '#ECF7FF', color: '#3B82F6' };
        case 'Failed':
            return { bg: 'primary.70', color: 'primary.600' };
        case 'Pending':
        default:
            return { bg: '#FFF9E6', color: '#92660C' };
    }
};

const PayoutsPage: React.FC = () => {
    const [triggerOpen, setTriggerOpen] = useState(false);
    const { data: payouts, isLoading } = usePayouts();
    const { data: summary } = useLabelSummary();

    const canTrigger = summary?.verificationStatus === 'Verified';

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <HStack justify="space-between" align="center">
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Payouts
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        Send earnings to artists on your roster
                    </Text>
                </Box>
                <Button
                    onClick={() => setTriggerOpen(true)}
                    disabled={!canTrigger}
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

            {!canTrigger && (
                <Box bg="#FFF9E6" color="#92660C" borderRadius="12px" p={3}>
                    <Text fontSize="xs">
                        Verification is required before you can trigger a payout.
                    </Text>
                </Box>
            )}

            {isLoading ? (
                <Center py={10}>
                    <Spinner size="md" color="primary.500" />
                </Center>
            ) : !payouts || payouts.length === 0 ? (
                <Center
                    bg="white"
                    borderRadius="20px"
                    py={10}
                    px={4}
                    minH="40vh"
                >
                    <Text fontSize="xs" color="gray.500">
                        No payouts yet.
                    </Text>
                </Center>
            ) : (
                <Box bg="white" borderRadius="xl" p={2}>
                    <Stack gap={0}>
                        {payouts.map((p) => {
                            const sc = statusColor(p.status);
                            return (
                                <HStack
                                    key={p.id}
                                    py={3}
                                    px={3}
                                    borderRadius="md"
                                    _hover={{ bg: 'primary.50' }}
                                    justify="space-between"
                                >
                                    <HStack gap={3}>
                                        <Avatar.Root size="sm">
                                            <Avatar.Fallback name={p.recipientName} />
                                        </Avatar.Root>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                                {p.recipientName}
                                            </Text>
                                            <Text fontSize="10px" color="gray.500">
                                                {new Date(p.initiatedAt).toLocaleString()}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <HStack gap={4}>
                                        <Box
                                            bg={sc.bg}
                                            color={sc.color}
                                            fontSize="9px"
                                            fontWeight="semibold"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                        >
                                            {p.status}
                                        </Box>
                                        <Text fontSize="xs" fontWeight="bold" color="gray.900">
                                            {formatMinorAmount(p.amountMinor, p.currency)}
                                        </Text>
                                    </HStack>
                                </HStack>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            <PayoutTriggerDialog open={triggerOpen} onClose={() => setTriggerOpen(false)} />
        </VStack>
    );
};

export default PayoutsPage;
