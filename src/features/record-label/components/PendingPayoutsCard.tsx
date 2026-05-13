import React from 'react';
import {
    Avatar,
    Box,
    Center,
    HStack,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePayouts } from '../hooks/usePayouts';
import { formatMinorAmount } from '../lib/format';

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const PendingPayoutsCard: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading } = usePayouts({ status: 'Pending' });
    const top = (data ?? []).slice(0, 5);
    const total = (data ?? []).reduce((s, p) => s + p.amountMinor, 0);
    const currency = (data ?? [])[0]?.currency ?? 'NGN';

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="gray.100"
            overflow="hidden"
        >
            <HStack justify="space-between" align="start" px={4} pt={4} pb={2}>
                <VStack align="start" gap={0.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        Pending payouts
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        Awaiting disbursement
                    </Text>
                </VStack>
                {total > 0 && (
                    <VStack align="end" gap={0}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.900">
                            {formatMinorAmount(total, currency)}
                        </Text>
                        <Text fontSize="9px" color="gray.500">
                            {(data ?? []).length} payout{(data ?? []).length === 1 ? '' : 's'}
                        </Text>
                    </VStack>
                )}
            </HStack>

            <Box px={2} pb={2}>
                {isLoading ? (
                    <Center py={6}>
                        <Spinner size="sm" color="primary.500" />
                    </Center>
                ) : top.length === 0 ? (
                    <Center py={6}>
                        <Text fontSize="xs" color="gray.500">
                            Nothing pending right now.
                        </Text>
                    </Center>
                ) : (
                    <VStack align="stretch" gap={0}>
                        {top.map((p) => (
                            <HStack
                                key={p.id}
                                px={2}
                                py={2}
                                gap={3}
                                borderRadius="lg"
                                _hover={{ bg: 'gray.50' }}
                                cursor="pointer"
                                onClick={() => navigate('/label/payouts')}
                            >
                                <Avatar.Root size="xs">
                                    <Avatar.Fallback name={p.recipientName} />
                                </Avatar.Root>
                                <VStack align="start" gap={0} flex={1} minW={0}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="semibold"
                                        color="gray.900"
                                        truncate
                                    >
                                        {p.recipientName}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500">
                                        {formatDate(p.initiatedAt)}
                                    </Text>
                                </VStack>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                                    {formatMinorAmount(p.amountMinor, p.currency)}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Box>

            {top.length > 0 && (
                <Box
                    as="button"
                    borderTopWidth="1px"
                    borderColor="gray.100"
                    w="full"
                    py={2.5}
                    bg="white"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => navigate('/label/payouts')}
                    cursor="pointer"
                >
                    <HStack justify="center" gap={1}>
                        <Text fontSize="10px" fontWeight="semibold" color="primary.500">
                            View all payouts
                        </Text>
                        <FiArrowRight size={10} color="#f94444" />
                    </HStack>
                </Box>
            )}
        </Box>
    );
};
