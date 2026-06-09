import React from 'react';
import {
    Box,
    Button,
    Center,
    Grid,
    HStack,
    Icon,
    Input,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';
import { formatNaira } from '@shared/utils';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import {
    useContributorEarningsSummary,
    useContributorPayoutMethods,
    useContributorWithdrawals,
    useRequestContributorWithdrawal,
} from '../hooks/useContributor';
import type {
    ContributorWithdrawalDto,
    ContributorWithdrawalStatus,
} from '../services/contributorService';

const STATUS_STYLE: Record<
    ContributorWithdrawalStatus,
    { bg: string; color: string; dot: string; label: string }
> = {
    Completed: { bg: '#E7FFF7', color: '#0F7B5C', dot: '#16A34A', label: 'Paid' },
    Processing: { bg: '#ECF7FF', color: '#1D4ED8', dot: '#3B82F6', label: 'Processing' },
    Pending: { bg: '#FFF9E6', color: '#92660C', dot: '#D97706', label: 'Pending Approval' },
    Rejected: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E', label: 'Rejected' },
    Failed: { bg: '#FEF2F2', color: '#C53030', dot: '#E53E3E', label: 'Failed' },
    Cancelled: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Cancelled' },
};

const StatusBadge: React.FC<{ status: ContributorWithdrawalStatus }> = ({ status }) => {
    const s = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
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
            display="inline-flex"
            w="fit-content"
        >
            <Box boxSize="6px" borderRadius="full" bg={s.dot} />
            <Text>{s.label}</Text>
        </HStack>
    );
};

const formatDateTime = (value: string) => {
    const date = new Date(value);
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const day = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    return `${time} - ${day}`;
};

const WithdrawalHistory: React.FC<{
    withdrawals: ContributorWithdrawalDto[];
    isLoading: boolean;
}> = ({ withdrawals, isLoading }) => {
    if (isLoading) {
        return (
            <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} minH="400px">
                <Center h="full">
                    <Spinner color="primary.500" />
                </Center>
            </Box>
        );
    }

    if (withdrawals.length === 0) {
        return (
            <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={4}
                minH="400px"
                display="flex"
                flexDirection="column"
            >
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={6} textAlign="center">
                    Withdrawal Requests
                </Text>
                <Center flex="1">
                    <VStack gap={2}>
                        <Icon as={FiInbox} boxSize={10} color="gray.300" />
                        <Text fontSize="xs" color="gray.500">
                            No withdrawal requests yet
                        </Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                Withdrawal Requests
            </Text>
            <VStack align="stretch" gap={3} maxH="600px" overflowY="auto">
                {withdrawals.map((w) => (
                    <React.Fragment key={w.id}>
                        <VStack align="stretch" gap={1.5}>
                            <HStack justify="space-between" align="start">
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                        {w.accountName}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {w.accountNumber} - {w.bankName}
                                    </Text>
                                </VStack>
                                <VStack align="end" gap={0}>
                                    <Text fontSize="13px" fontWeight="medium" color="gray.900">
                                        {formatNaira(w.amountDisplay)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.400">
                                        {formatDateTime(w.requestedAt)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <HStack justify="space-between" align="center">
                                <StatusBadge status={w.status} />
                                {w.netAmount > 0 && (
                                    <Text fontSize="10px" color="gray.400">
                                        Net {formatNaira(w.netAmountDisplay)}
                                    </Text>
                                )}
                            </HStack>
                            {w.status === 'Rejected' && w.rejectionReason && (
                                <Box bg="red.50" borderRadius="md" px={3} py={2}>
                                    <Text fontSize="11px" color="red.600">
                                        <strong>Rejected:</strong> {w.rejectionReason}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                        <hr />
                    </React.Fragment>
                ))}
            </VStack>
        </Box>
    );
};

const ContributorPayoutsPage: React.FC = () => {
    const toast = useChakraToast();
    const summaryQuery = useContributorEarningsSummary();
    const methodsQuery = useContributorPayoutMethods();
    const withdrawalsQuery = useContributorWithdrawals({ pageSize: 20 });
    const requestWithdrawal = useRequestContributorWithdrawal();

    const [amount, setAmount] = React.useState('');

    const summary = summaryQuery.data;
    const available = summary?.availableForWithdrawalDisplay ?? 0;
    const methods = methodsQuery.data?.payoutMethods ?? [];
    const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0] ?? null;
    const withdrawals = withdrawalsQuery.data?.withdrawals ?? [];

    const handleSubmit = async () => {
        const value = parseFloat(amount);
        if (!value || value <= 0) {
            toast.error('Invalid amount', 'Please enter a valid amount.');
            return;
        }
        if (value > available) {
            toast.error('Insufficient balance', 'You do not have enough available balance.');
            return;
        }
        if (!defaultMethod) {
            toast.error('No payout account', 'Add a payout account before requesting a withdrawal.');
            return;
        }

        try {
            const res = await requestWithdrawal.mutateAsync({
                amountInSmallestUnit: Math.round(value * 100),
                bankName: defaultMethod.bankName,
                accountNumber: defaultMethod.accountNumber,
                accountName: defaultMethod.accountName,
                bankCode: defaultMethod.bankCode,
            });
            setAmount('');
            toast.success(
                'Withdrawal requested',
                res.message ?? 'Your request is now awaiting admin approval.',
            );
        } catch (err) {
            toast.error('Request failed', getApiErrorMessage(err, 'Could not submit your withdrawal request.'));
        }
    };

    if (summaryQuery.isLoading) {
        return (
            <Center minH="60vh">
                <Spinner size="xl" color="primary.500" />
            </Center>
        );
    }

    return (
        <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
            <Box bg="white" minH="90vh" p={{ base: 4, md: 6 }} borderRadius="10px">
                <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={6}>
                    Payouts
                </Text>

                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                    {/* Request withdrawal */}
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
                        <HStack justify="flex-end" mb={4}>
                            <VStack align="end" gap={0}>
                                <Text fontSize="xs" color="gray.500">
                                    Available Balance
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="primary.500">
                                    {formatNaira(available)}
                                </Text>
                            </VStack>
                        </HStack>

                        {!defaultMethod ? (
                            <VStack gap={2} py={8}>
                                <Text fontSize="sm" color="gray.700" fontWeight="medium">
                                    No payout account
                                </Text>
                                <Text fontSize="xs" color="gray.500" textAlign="center">
                                    Add a payout account on the Payout Accounts page before requesting a
                                    withdrawal.
                                </Text>
                            </VStack>
                        ) : (
                            <VStack gap={4} align="stretch">
                                <Box>
                                    <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                        Destination Account
                                    </Text>
                                    <Input
                                        value={`${defaultMethod.accountName} · ${defaultMethod.maskedAccountNumber} (${defaultMethod.bankName})`}
                                        readOnly
                                        size="md"
                                        bg="gray.50"
                                        borderColor="gray.200"
                                    />
                                </Box>

                                <Box>
                                    <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                        Amount (NGN)
                                    </Text>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        size="md"
                                        bg="gray.50"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                    />
                                </Box>

                                <Button
                                    onClick={handleSubmit}
                                    bg="primary.500"
                                    color="white"
                                    size="md"
                                    fontSize="sm"
                                    fontWeight="medium"
                                    borderRadius="md"
                                    _hover={{ bg: 'primary.600' }}
                                    loading={requestWithdrawal.isPending}
                                    loadingText="Submitting..."
                                    disabled={!amount}
                                >
                                    Request Withdrawal
                                </Button>
                            </VStack>
                        )}
                    </Box>

                    {/* History */}
                    <WithdrawalHistory withdrawals={withdrawals} isLoading={withdrawalsQuery.isLoading} />
                </Grid>
            </Box>
        </Box>
    );
};

export default ContributorPayoutsPage;
