import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
    Spinner,
} from '@chakra-ui/react';
import { EmptyWalletIcon, Receipt2Icon } from '@/shared/icons/CustomIcons';
import { usePayoutStore } from '../store/usePayoutStore';
import { AddPayoutAccountModal } from '../components/AddPayoutAccountModal';
import { PayoutPinModal } from '../components/PayoutPinModal';
import { PaymentSuccessfulModal } from '../components/PaymentSuccessfulModal';
import { UpdateTransactionPinModal } from '@/features/settings/components/UpdateTransactionPinModal';
import { userService } from '@/shared/services/userService';
import { toaster } from '@/components/ui/toaster-instance';
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import { earningsService } from '@/features/earnings-and-royalty/services/earningsService';
import type { ArtistPayoutDto, WithdrawalDto } from '@/features/earnings-and-royalty/types';
import { WithdrawalStatusBadge } from '../components/WithdrawalStatusBadge';

export const Payments: React.FC = () => {
    const { isRecordLabel } = useUserType();
    const {
        payoutAccount,
        earningBalance,
        initiatePayout,
        isLoading,
        fetchPayoutMethods,
        setEarningBalance,
    } = usePayoutStore();

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Whether the artist is signed to a record label. Label-managed artists
    // cannot self-initiate payouts (the label triggers them); they can only
    // view their payouts and initiate withdrawals of their balance.
    const [isLabelManaged, setIsLabelManaged] = useState(false);
    const [labelPayouts, setLabelPayouts] = useState<ArtistPayoutDto[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalDto[]>([]);

    const refreshWithdrawals = React.useCallback(async () => {
        try {
            const res = await earningsService.getWithdrawalHistory({ page: 1, pageSize: 20 });
            setWithdrawals(res.data.withdrawals ?? []);
        } catch (error) {
            console.error('Failed to load withdrawal history:', error);
        }
    }, []);

    const refreshSummary = React.useCallback(async () => {
        const summaryResponse = await earningsService.getSummary();
        if (summaryResponse.data) {
            setEarningBalance(summaryResponse.data.availableForWithdrawalDisplay);
            setIsLabelManaged(summaryResponse.data.isLabelManaged);
        }
    }, [setEarningBalance]);

    // Fetch payout methods, earnings balance and withdrawal history on mount
    useEffect(() => {
        const loadData = async () => {
            setIsInitialLoading(true);
            try {
                await fetchPayoutMethods();
                const summaryResponse = await earningsService.getSummary();
                if (summaryResponse.data) {
                    setEarningBalance(summaryResponse.data.availableForWithdrawalDisplay);

                    const labelManaged = summaryResponse.data.isLabelManaged;
                    setIsLabelManaged(labelManaged);

                    // Label-managed artists also see a read-only list of payouts
                    // their record label triggered for them.
                    if (labelManaged) {
                        const payoutsResponse = await earningsService.getArtistPayouts();
                        setLabelPayouts(payoutsResponse.data.payouts ?? []);
                    }
                }
                await refreshWithdrawals();
            } catch (error) {
                console.error('Failed to load payment data:', error);
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadData();
    }, [fetchPayoutMethods, setEarningBalance, refreshWithdrawals]);

    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showPayoutPin, setShowPayoutPin] = useState(false);
    const [showSetPin, setShowSetPin] = useState(false);
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

    // Whether the artist has a transactional PIN configured. The PIN authorises
    // payouts, so we need to know up front whether to prompt for it or send the
    // artist through initial setup first.
    const refreshPinStatus = React.useCallback(async () => {
        try {
            const status = await userService.getPinStatus();
            setHasPin(status.hasPin);
            return status.hasPin;
        } catch (error) {
            console.warn('Failed to fetch pin status', error);
            setHasPin(false);
            return false;
        }
    }, []);

    useEffect(() => {
        refreshPinStatus();
    }, [refreshPinStatus]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleAddAccount = () => {
        setShowAddAccount(true);
    };

    // The account is already persisted (and marked verified server-side) by the
    // time this fires, so there is nothing left to authorise — just refresh the
    // list so the new account shows up without a reload.
    const handleAccountSaved = async () => {
        setShowAddAccount(false);
        await fetchPayoutMethods();
    };

    const handleContinue = async () => {
        const amount = parseFloat(payoutAmount);

        if (!amount || amount <= 0) {
            toaster.create({
                title: 'Invalid Amount',
                description: 'Please enter a valid amount',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        if (amount > earningBalance) {
            toaster.create({
                title: 'Insufficient Balance',
                description: 'You do not have enough balance',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        // Payouts are authorised with the artist's transactional PIN. If they
        // have not set one yet, send them through setup first.
        const pinConfigured = hasPin ?? (await refreshPinStatus());
        if (!pinConfigured) {
            setShowSetPin(true);
            return;
        }

        setShowPayoutPin(true);
    };

    // Returns an error message to display inline in the PIN modal, or null on
    // success. A wrong PIN keeps the modal open so the artist can retry.
    const handlePayoutPinSubmit = async (pin: string): Promise<string | null> => {
        const amount = parseFloat(payoutAmount);

        const response = await initiatePayout(amount, pin);
        if (!response) {
            const { error, errorCode } = usePayoutStore.getState();

            if (errorCode === 'invalid_pin' || errorCode === 'pin_not_set') {
                if (errorCode === 'pin_not_set') {
                    setHasPin(false);
                }
                return error ?? 'That PIN was not accepted';
            }

            // Anything else is a real failure, not a bad PIN: close and surface it.
            setShowPayoutPin(false);
            toaster.create({
                title: 'Request failed',
                description: error ?? 'Could not submit your withdrawal request',
                type: 'error',
                duration: 4000,
            });
            return null;
        }

        setShowPayoutPin(false);
        setShowSuccess(true);
        setPayoutAmount('');
        await Promise.all([refreshWithdrawals(), refreshSummary()]);

        const awaitingLabel = response.status === 'PendingLabelApproval';
        toaster.create({
            title: 'Withdrawal Requested',
            description:
                response.message ??
                (awaitingLabel
                    ? 'Your record label will review this before it reaches Muxify.'
                    : 'Your request is now awaiting admin approval.'),
            type: 'success',
            duration: 4000,
        });

        return null;
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        return `${time} - ${formattedDate}`;
    };

    // Label-managed artists initiate a withdrawal; independent artists process a payout.
    const moneyOutVerb = isLabelManaged ? 'Withdraw Earnings' : 'Quick Payout';
    const moneyOutAction = isLabelManaged ? 'Initiate Withdrawal' : 'Continue';

    // Show loading spinner during initial load
    if (isInitialLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
                <Spinner size="xl" color="primary.500" />
            </Box>
        );
    }

    return (
        <Box>
            {/* Artist Dropdown for Record Labels */}
            {isRecordLabel && (
                <Box display="flex" justifyContent="flex-end" mb={4}>
                    <ArtistDropdown />
                </Box>
            )}


            <Box bg="white" minH="90vh" p={{ base: 4, md: 6 }} borderRadius="10px" >
                <HStack justify="space-between" align="center" mb={6}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                        Payout
                    </Text>
                    <HStack gap={3}>
                        <Button
                            variant="outline"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            px={4}
                            h="34px"
                            borderRadius="md"
                            borderColor="gray.200"
                            color="gray.600"
                            _hover={{ bg: 'gray.50' }}
                        >
                            Edit Payout Account
                        </Button>
                    </HStack>
                </HStack>

                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                    {/* Left Section */}
                    <VStack align="stretch" gap={6}>
                        {!payoutAccount ? (
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
                                    {moneyOutVerb}
                                </Text>
                                <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                    <EmptyWalletIcon boxSize={12} mx="auto" mb={3} />
                                    <Text fontSize="xs" color="gray.500" mb={3}>
                                        You do not have a payout account
                                    </Text>
                                    <Button
                                        bg="primary.500"
                                        color="white"
                                        size="sm"
                                        fontSize="xs"
                                        fontWeight="medium"
                                        borderRadius="md"
                                        _hover={{ bg: 'primary.600' }}
                                        onClick={handleAddAccount}
                                    >
                                        Add Payout Account
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={6}
                            >
                                <HStack justify="flex-end" mb={4}>
                                    <VStack align="end" gap={0}>
                                        <Text fontSize="xs" color="gray.500">
                                            Earning Balance
                                        </Text>
                                        <Text fontSize="lg" fontWeight="bold" color="primary.500">
                                            {formatCurrency(earningBalance)}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <VStack gap={4} align="stretch">
                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                            Account Number
                                        </Text>
                                        <Input
                                            value={payoutAccount.accountNumber}
                                            readOnly
                                            size="md"
                                            bg="gray.50"
                                            borderColor="gray.200"
                                        />
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                            Bank Name
                                        </Text>
                                        <Input
                                            value={payoutAccount.bankName}
                                            readOnly
                                            size="md"
                                            bg="gray.50"
                                            borderColor="gray.200"
                                        />
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                            Account Name
                                        </Text>
                                        <Input
                                            value={payoutAccount.accountName}
                                            readOnly
                                            size="md"
                                            bg="gray.50"
                                            borderColor="gray.200"
                                        />
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                            Amount
                                        </Text>
                                        <Input
                                            type="number"
                                            placeholder="NGN 0.00"
                                            value={payoutAmount}
                                            onChange={(e) => setPayoutAmount(e.target.value)}
                                            size="md"
                                            bg="gray.50"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                        />
                                    </Box>

                                    <Button
                                        onClick={handleContinue}
                                        bg="primary.500"
                                        color="white"
                                        size="md"
                                        fontSize="sm"
                                        fontWeight="medium"
                                        borderRadius="md"
                                        _hover={{ bg: 'primary.600' }}
                                        loading={isLoading}
                                        loadingText="Processing..."
                                        disabled={!payoutAmount}
                                    >
                                        {moneyOutAction}
                                    </Button>
                                </VStack>
                            </Box>
                        )}
                    </VStack>

                    {/* Right Section */}
                    <VStack align="stretch" gap={4}>
                        <WithdrawalHistoryPanel
                            withdrawals={withdrawals}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                        {isLabelManaged && (
                            <LabelPayoutsPanel payouts={labelPayouts} formatCurrency={formatCurrency} formatDate={formatDate} />
                        )}
                    </VStack>
                </Grid>

            </Box>



            {/* Modals */}
            <AddPayoutAccountModal
                isOpen={showAddAccount}
                onClose={() => setShowAddAccount(false)}
                onNext={handleAccountSaved}
            />

            <PayoutPinModal
                isOpen={showPayoutPin}
                onClose={() => setShowPayoutPin(false)}
                onSubmit={handlePayoutPinSubmit}
                amountLabel={payoutAmount ? formatCurrency(parseFloat(payoutAmount)) : undefined}
            />

            <UpdateTransactionPinModal
                isOpen={showSetPin}
                isInitialSetup
                onClose={() => setShowSetPin(false)}
                onSuccess={async () => {
                    setShowSetPin(false);
                    await refreshPinStatus();
                    setShowPayoutPin(true);
                }}
            />

            <PaymentSuccessfulModal
                isOpen={showSuccess}
                onClose={handleSuccessClose}
                onDone={handleSuccessClose}
            />
        </Box>
    );
};

// ----------------------------------------------------------------------------
// Multi-stage withdrawal request history (Pending Label Approval → Pending Admin
// → Processing → Paid, or Rejected with a reason).
// ----------------------------------------------------------------------------
interface WithdrawalHistoryPanelProps {
    withdrawals: WithdrawalDto[];
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

const WithdrawalHistoryPanel: React.FC<WithdrawalHistoryPanelProps> = ({ withdrawals, formatCurrency, formatDate }) => {
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
                <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Receipt2Icon boxSize={12} mx="auto" mb={3} />
                    <Text fontSize="xs" color="gray.500">
                        No withdrawal requests yet
                    </Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                Withdrawal Requests
            </Text>
            <VStack align="stretch" gap={3} maxH="600px" overflowY="auto">
                {withdrawals.map((w) => {
                    const reason = w.rejectionReason ?? w.labelRejectionReason;
                    return (
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
                                            {formatCurrency(w.amountDisplay)}
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">
                                            {formatDate(w.requestedAt)}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack justify="space-between" align="center">
                                    <WithdrawalStatusBadge status={w.status} />
                                    {w.netAmount > 0 && (
                                        <Text fontSize="10px" color="gray.400">
                                            Net {formatCurrency(w.netAmountDisplay)}
                                        </Text>
                                    )}
                                </HStack>
                                {w.status === 'Rejected' && reason && (
                                    <Box bg="red.50" borderRadius="md" px={3} py={2}>
                                        <Text fontSize="11px" color="red.600">
                                            <strong>{w.rejectedByRole === 'Label' ? 'Label' : 'Admin'} rejected:</strong> {reason}
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                            <hr />
                        </React.Fragment>
                    );
                })}
            </VStack>
        </Box>
    );
};

// ----------------------------------------------------------------------------
// Read-only panel showing the payouts a record label triggered for the artist.
// ----------------------------------------------------------------------------
interface LabelPayoutsPanelProps {
    payouts: ArtistPayoutDto[];
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

const isSettledStatus = (status: string) => status === 'Paid';
const isFailedStatus = (status: string) => status === 'Failed' || status === 'Cancelled';

const LabelPayoutsPanel: React.FC<LabelPayoutsPanelProps> = ({ payouts, formatCurrency, formatDate }) => {
    if (payouts.length === 0) {
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
                    Payouts
                </Text>
                <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Receipt2Icon boxSize={12} mx="auto" mb={3} />
                    <Text fontSize="xs" color="gray.500">
                        Your label has not issued any payouts yet
                    </Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={6}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={1}>
                Payouts
            </Text>
            <Text fontSize="xs" color="gray.500" mb={4}>
                Issued by your record label
            </Text>
            <VStack align="stretch" maxH="600px" overflowY="auto">
                {payouts.map((item) => {
                    const settled = isSettledStatus(item.status);
                    const failed = isFailedStatus(item.status);
                    return (
                        <React.Fragment key={item.id}>
                            <Box>
                                <HStack justify="space-between" align="start">
                                    <HStack gap={3}>
                                        <Box
                                            w={8}
                                            h={8}
                                            borderRadius="full"
                                            bg={settled ? 'primary.100' : failed ? 'red.50' : 'gray.100'}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon
                                                as={failed ? IoClose : FaCheck}
                                                boxSize={4}
                                                color={failed ? 'red.500' : 'primary.500'}
                                            />
                                        </Box>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                                {item.status}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                Net {formatCurrency(item.netAmountDisplay)}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <VStack align="end" gap={0}>
                                        <Text
                                            fontSize="13px"
                                            fontWeight="medium"
                                            color={settled ? 'primary.500' : 'gray.500'}
                                        >
                                            {formatCurrency(item.amountDisplay)}
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">
                                            {formatDate(item.initiatedAt)}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                            <hr />
                        </React.Fragment>
                    );
                })}
            </VStack>
        </Box>
    );
};

export default Payments;
