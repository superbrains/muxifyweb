import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Input,
    Grid,
    Icon,
    Spinner,
    Skeleton,
} from '@chakra-ui/react';
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import { adsService } from '../services/adsService';
import { useAdsStore } from '../store/useAdsStore';
import type { AdWalletTransactionDto, CollectionMethod } from '../types';

const PENDING_INTENT_KEY = 'ad_deposit_intent';

export const AdsWallet: React.FC = () => {
    const { wallet, isLoadingWallet, fetchWallet } = useAdsStore();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const [amount, setAmount] = useState('');
    const [methods, setMethods] = useState<CollectionMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const [transactions, setTransactions] = useState<AdWalletTransactionDto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loadingTx, setLoadingTx] = useState(true);

    const walletBalance = wallet?.balanceDisplay || 0;

    const loadTransactions = useCallback(async (size: number) => {
        setLoadingTx(true);
        try {
            const res = await adsService.getWalletTransactions(1, size);
            setTransactions(res.transactions);
            setTotalCount(res.totalCount);
        } catch {
            setTransactions([]);
        } finally {
            setLoadingTx(false);
        }
    }, []);

    // Load wallet, methods, and transactions on mount.
    useEffect(() => {
        fetchWallet();
        loadTransactions(pageSize);
        adsService
            .getWalletMethods()
            .then((res) => {
                setMethods(res.methods);
                if (res.methods.length) setSelectedMethod(res.methods[0].id);
            })
            .catch(() => setMethods([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // After returning from Flutterwave, poll the deposit status (credits on success).
    useEffect(() => {
        const intentId = searchParams.get('adIntent') || localStorage.getItem(PENDING_INTENT_KEY);
        if (!intentId) return;

        let cancelled = false;
        const poll = async () => {
            for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
                try {
                    const status = await adsService.getDepositStatus(intentId);
                    if (status.status === 'Succeeded') {
                        toast.success('Top-up successful', 'Your ad wallet has been credited.');
                        break;
                    }
                    if (status.status === 'Failed' || status.status === 'Expired') {
                        toast.error('Top-up not completed', status.failureReason || 'The payment did not go through.');
                        break;
                    }
                } catch {
                    // transient — retry
                }
                await new Promise((r) => setTimeout(r, 2000));
            }
            if (!cancelled) {
                localStorage.removeItem(PENDING_INTENT_KEY);
                if (searchParams.get('adIntent')) {
                    searchParams.delete('adIntent');
                    setSearchParams(searchParams, { replace: true });
                }
                fetchWallet();
                loadTransactions(pageSize);
            }
        };
        poll();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAmountChange = (value: string) => {
        if (/^\d*\.?\d*$/.test(value)) setAmount(value);
    };

    const handleContinue = async () => {
        const naira = parseFloat(amount);
        if (!naira || naira <= 0) return;
        if (!selectedMethod) {
            toast.error('Select a method', 'Choose a funding method to continue.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await adsService.initiateDeposit({
                amountMinor: Math.round(naira * 100),
                paymentMethodId: selectedMethod,
                redirectUrl: `${window.location.origin}/ads/payments`,
            });
            if (res.paymentUrl && res.intentId) {
                localStorage.setItem(PENDING_INTENT_KEY, res.intentId);
                window.location.href = res.paymentUrl;
                return;
            }
            toast.error('Could not start payment', res.message || 'Please try again.');
        } catch (e) {
            toast.error('Could not start payment', e instanceof Error ? e.message : 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('en-NG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isCredit = (type: string) => type === 'Deposit' || type === 'Refund';

    return (
        <Box bg="gray.50" minH="100vh" p={6}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                {/* Left Panel - Top up */}
                <VStack align="stretch" gap={6}>
                    <Box bg="white" p={6} borderRadius="xl">
                        <VStack align="stretch" gap={6}>
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                                    Wallet Balance
                                </Text>
                                {isLoadingWallet ? (
                                    <Skeleton height="36px" width="180px" />
                                ) : (
                                    <Text fontSize="3xl" fontWeight="bold" color="primary.500">
                                        {formatCurrency(walletBalance)}
                                    </Text>
                                )}
                            </VStack>

                            <VStack align="stretch" gap={2}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                    Amount (NGN)
                                </Text>
                                <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" px={3} py={2}>
                                    <HStack gap={3}>
                                        <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="sm" px={2} py={1}>
                                            <Text fontSize="xs">NGN</Text>
                                        </Box>
                                        <Input
                                            value={amount}
                                            onChange={(e) => handleAmountChange(e.target.value)}
                                            placeholder="0.00"
                                            fontSize="sm"
                                            border="none"
                                            _focus={{ border: 'none' }}
                                            _placeholder={{ color: 'gray.400' }}
                                        />
                                    </HStack>
                                </Box>
                            </VStack>

                            <VStack align="stretch" gap={2}>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="semibold">
                                        Funding Method
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        Secured by Flutterwave
                                    </Text>
                                </HStack>
                                {methods.length === 0 ? (
                                    <Text fontSize="sm" color="gray.500">
                                        Loading payment options…
                                    </Text>
                                ) : (
                                    <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }} gap={2}>
                                        {methods.map((method) => (
                                            <HStack
                                                key={method.id}
                                                gap={2}
                                                cursor="pointer"
                                                p={3}
                                                border="2px solid"
                                                borderColor={selectedMethod === method.id ? 'primary.500' : 'gray.100'}
                                                borderRadius="lg"
                                                onClick={() => setSelectedMethod(method.id)}
                                                _hover={{ borderColor: 'primary.500' }}
                                                transition="all 0.2s"
                                                bg="white"
                                            >
                                                <Icon as={FiCreditCard} boxSize={5} color="primary.500" />
                                                <Text fontSize="sm" lineHeight="1.2">
                                                    {method.name}
                                                </Text>
                                            </HStack>
                                        ))}
                                    </Grid>
                                )}
                            </VStack>

                            <Button
                                bg="primary.500"
                                color="white"
                                size="md"
                                onClick={handleContinue}
                                disabled={!amount || parseFloat(amount) <= 0 || submitting}
                                _hover={{ bg: 'primary.600' }}
                                _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
                            >
                                {submitting ? <Spinner size="sm" /> : 'Continue'}
                            </Button>
                        </VStack>
                    </Box>
                </VStack>

                {/* Right Panel - Wallet History */}
                <VStack align="stretch" gap={4}>
                    <Box bg="white" p={6} borderRadius="xl">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                            Wallet History
                        </Text>

                        {loadingTx ? (
                            <VStack align="stretch" gap={3}>
                                {[0, 1, 2, 3].map((i) => (
                                    <Skeleton key={i} height="40px" borderRadius="md" />
                                ))}
                            </VStack>
                        ) : transactions.length === 0 ? (
                            <VStack py={10} gap={2}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                    No transactions yet
                                </Text>
                                <Text fontSize="xs" color="gray.500" textAlign="center">
                                    Top up your wallet to start running campaigns. Your deposits and ad spend will appear here.
                                </Text>
                            </VStack>
                        ) : (
                            <>
                                <VStack align="stretch" maxH="600px" overflowY="auto" gap={3}>
                                    {transactions.map((tx) => {
                                        const credit = isCredit(tx.type);
                                        return (
                                            <HStack key={tx.id} justify="space-between" align="start">
                                                <HStack gap={3}>
                                                    <Box
                                                        w={8}
                                                        h={8}
                                                        borderRadius="full"
                                                        bg={credit ? 'green.50' : '#ffefef'}
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                    >
                                                        <Icon
                                                            as={credit ? FiArrowDownLeft : FiArrowUpRight}
                                                            boxSize={4}
                                                            color={credit ? 'green.500' : 'primary.500'}
                                                        />
                                                    </Box>
                                                    <VStack align="start" gap={0}>
                                                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                                            {tx.description}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            {formatDate(tx.createdAt)}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                <VStack align="end" gap={0}>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="semibold"
                                                        color={credit ? 'green.600' : 'primary.500'}
                                                    >
                                                        {credit ? '+' : '-'}
                                                        {formatCurrency(tx.amountDisplay)}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.400">
                                                        Bal {formatCurrency(tx.balanceAfter / 100)}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        );
                                    })}
                                </VStack>
                                {transactions.length < totalCount && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="primary.500"
                                        _hover={{ bg: 'gray.50' }}
                                        mt={4}
                                        w="full"
                                        onClick={() => {
                                            const next = pageSize + 10;
                                            setPageSize(next);
                                            loadTransactions(next);
                                        }}
                                    >
                                        See All ({totalCount})
                                    </Button>
                                )}
                            </>
                        )}
                    </Box>
                </VStack>
            </Grid>
        </Box>
    );
};

export default AdsWallet;
