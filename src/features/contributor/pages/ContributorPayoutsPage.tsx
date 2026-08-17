import React from 'react';
import {
    Box,
    Button,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { formatNaira } from '@shared/utils';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { DataTable, KpiStrip, StatusBadge } from '@shared/console';
import type { DataColumn, KpiItem } from '@shared/console';
import {
    useContributorEarningsSummary,
    useContributorProfile,
    useContributorPayoutMethods,
    useContributorWithdrawals,
    useContributorPayouts,
    useRequestContributorWithdrawal,
} from '../hooks/useContributor';
import { ContributorPageShell } from '../components/ContributorPageShell';
import type {
    ContributorWithdrawalDto,
    ContributorPayoutDto,
} from '../services/contributorService';

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Notice: React.FC<{
    tone: 'warning' | 'info';
    icon: React.ElementType;
    title: string;
    description: string;
    cta?: { label: string; onClick: () => void };
}> = ({ tone, icon, title, description, cta }) => {
    const c =
        tone === 'warning'
            ? { bg: '#FFF9E6', fg: '#92660C', icon: '#D97706' }
            : { bg: '#ECF7FF', fg: '#1D4ED8', icon: '#3B82F6' };
    return (
        <VStack align="start" gap={2} bg={c.bg} borderRadius="lg" p={4}>
            <HStack gap={2}>
                <Icon as={icon} color={c.icon} boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color={c.fg}>
                    {title}
                </Text>
            </HStack>
            <Text fontSize="xs" color="gray.600">
                {description}
            </Text>
            {cta && (
                <Button
                    size="xs"
                    bg="white"
                    color={c.fg}
                    fontSize="xs"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={c.icon}
                    _hover={{ bg: 'white' }}
                    onClick={cta.onClick}
                >
                    {cta.label}
                </Button>
            )}
        </VStack>
    );
};

const ContributorPayoutsPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useChakraToast();
    const summaryQuery = useContributorEarningsSummary();
    const profileQuery = useContributorProfile();
    const methodsQuery = useContributorPayoutMethods();
    const withdrawalsQuery = useContributorWithdrawals({ pageSize: 20 });
    const payoutsQuery = useContributorPayouts({ pageSize: 20 });
    const requestWithdrawal = useRequestContributorWithdrawal();

    const [amount, setAmount] = React.useState('');

    const summary = summaryQuery.data;
    const available = summary?.availableForWithdrawalDisplay ?? 0;
    const isLabelManaged = summary?.isLabelManaged ?? false;
    const isVerified = profileQuery.data?.verificationStatus === 'Verified';
    const methods = methodsQuery.data?.payoutMethods ?? [];
    const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0] ?? null;
    const withdrawals = withdrawalsQuery.data?.withdrawals ?? [];
    const payouts = payoutsQuery.data?.payouts ?? [];

    const kpis: KpiItem[] = [
        { label: 'Available to withdraw', value: formatNaira(available), tone: 'success' },
        {
            label: 'Pending withdrawal',
            value: formatNaira(summary?.pendingWithdrawalDisplay ?? 0),
            tone: 'warning',
        },
        {
            label: 'Total withdrawn',
            value: formatNaira(summary?.totalWithdrawnDisplay ?? 0),
            tone: 'neutral',
        },
    ];

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
                res.message ?? 'Your request is now awaiting approval.',
            );
        } catch (err) {
            toast.error('Request failed', getApiErrorMessage(err, 'Could not submit your withdrawal request.'));
        }
    };

    const withdrawalColumns: DataColumn<ContributorWithdrawalDto>[] = [
        { key: 'date', header: 'Requested', render: (w) => (
            <Text fontSize="xs" color="gray.600">{formatDate(w.requestedAt)}</Text>
        ) },
        { key: 'account', header: 'Destination', render: (w) => (
            <VStack align="start" gap={0} minW={0}>
                <Text fontSize="xs" fontWeight="medium" color="gray.900" lineClamp={1}>{w.accountName}</Text>
                <Text fontSize="11px" color="gray.500" lineClamp={1}>{w.accountNumber} · {w.bankName}</Text>
            </VStack>
        ) },
        { key: 'amount', header: 'Amount', align: 'right', render: (w) => (
            <Text fontSize="xs" fontWeight="semibold" color="gray.900">{formatNaira(w.amountDisplay)}</Text>
        ) },
        { key: 'status', header: 'Status', align: 'right', render: (w) => (
            <VStack align="end" gap={1}>
                <StatusBadge status={w.status} />
                {(w.rejectionReason || w.labelRejectionReason) && (
                    <Text fontSize="10px" color="red.500" maxW="200px" textAlign="right" lineClamp={2}>
                        {w.rejectionReason || w.labelRejectionReason}
                    </Text>
                )}
            </VStack>
        ) },
    ];

    const payoutColumns: DataColumn<ContributorPayoutDto>[] = [
        { key: 'date', header: 'Date', render: (p) => (
            <Text fontSize="xs" color="gray.600">{formatDate(p.initiatedAt)}</Text>
        ) },
        { key: 'ref', header: 'Reference', render: (p) => (
            <Text fontSize="xs" color="gray.700" fontFamily="mono">{p.reference || '—'}</Text>
        ) },
        { key: 'amount', header: 'Amount', align: 'right', render: (p) => (
            <Text fontSize="xs" color="gray.600">{formatNaira(p.amountDisplay)}</Text>
        ) },
        { key: 'net', header: 'Net', align: 'right', render: (p) => (
            <Text fontSize="xs" fontWeight="semibold" color="gray.900">{formatNaira(p.netAmountDisplay)}</Text>
        ) },
        { key: 'status', header: 'Status', align: 'right', render: (p) => <StatusBadge status={p.status} /> },
    ];

    const canWithdraw = isVerified && !isLabelManaged && !!defaultMethod;

    return (
        <ContributorPageShell
            title="Payouts"
            subtitle="Withdraw your available balance and track every payout."
        >
            <KpiStrip items={kpis} columns={{ base: 3, md: 3, xl: 3 }} />

            <Box
                display="grid"
                gridTemplateColumns={{ base: '1fr', lg: '380px 1fr' }}
                gap={4}
                alignItems="start"
            >
                {/* Request withdrawal */}
                <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Request a withdrawal
                    </Text>

                    {isLabelManaged ? (
                        <Notice
                            tone="info"
                            icon={FiInfo}
                            title="Managed by your record label"
                            description="Your label triggers payouts on your behalf. Completed payouts appear under 'Payouts from your label' below."
                        />
                    ) : !isVerified ? (
                        <Notice
                            tone="warning"
                            icon={FiAlertTriangle}
                            title="Verify your account first"
                            description="You need a verified contributor account before you can withdraw."
                            cta={{ label: 'Go to profile', onClick: () => navigate('/contributor/profile') }}
                        />
                    ) : !defaultMethod ? (
                        <Notice
                            tone="warning"
                            icon={FiAlertTriangle}
                            title="Add a payout account"
                            description="Add a bank account to receive your withdrawals."
                            cta={{ label: 'Add account', onClick: () => navigate('/contributor/payout-accounts') }}
                        />
                    ) : (
                        <VStack gap={4} align="stretch">
                            <Box bg="primary.50" borderRadius="lg" px={4} py={3}>
                                <Text fontSize="11px" color="gray.600">Available balance</Text>
                                <Text fontSize="xl" fontWeight="bold" color="primary.600">
                                    {formatNaira(available)}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                    Destination account
                                </Text>
                                <Input
                                    value={`${defaultMethod.accountName} · ${defaultMethod.maskedAccountNumber} (${defaultMethod.bankName})`}
                                    readOnly
                                    size="md"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    fontSize="xs"
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
                                <Text fontSize="11px" color="gray.400" mt={1}>
                                    A processing fee may apply — you'll see the exact net amount on the request.
                                </Text>
                            </Box>

                            <Button
                                onClick={handleSubmit}
                                bg="primary.500"
                                color="white"
                                size="md"
                                fontSize="sm"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                                loading={requestWithdrawal.isPending}
                                loadingText="Submitting..."
                                disabled={!amount || !canWithdraw}
                            >
                                Request withdrawal
                            </Button>
                        </VStack>
                    )}
                </Box>

                {/* Withdrawal history */}
                <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Withdrawal requests
                    </Text>
                    <DataTable
                        columns={withdrawalColumns}
                        rows={withdrawals}
                        rowKey={(w) => w.id}
                        loading={withdrawalsQuery.isLoading}
                        skeletonRows={5}
                        emptyTitle="No withdrawal requests yet"
                        emptyDescription="Your withdrawal requests and their status will appear here."
                    />
                </Box>
            </Box>

            {/* Label-triggered payouts */}
            {(payouts.length > 0 || isLabelManaged) && (
                <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Payouts from your label
                    </Text>
                    <DataTable
                        columns={payoutColumns}
                        rows={payouts}
                        rowKey={(p) => p.id}
                        loading={payoutsQuery.isLoading}
                        skeletonRows={4}
                        emptyTitle="No label payouts yet"
                        emptyDescription="Payouts your record label sends you will appear here."
                    />
                </Box>
            )}
        </ContributorPageShell>
    );
};

export default ContributorPayoutsPage;
