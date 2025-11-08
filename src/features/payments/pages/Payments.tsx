import React, { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    HStack,
    Icon,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react';
import { EmptyWalletIcon, Receipt2Icon } from '@/shared/icons/CustomIcons';
import { usePayoutStore } from '../store/usePayoutStore';
import { AddPayoutAccountModal } from '../components/AddPayoutAccountModal';
import { AccountAuthorizationModal } from '../components/AccountAuthorizationModal';
import { PayoutAuthorizationModal } from '../components/PayoutAuthorizationModal';
import { PaymentSuccessfulModal } from '../components/PaymentSuccessfulModal';
import { toaster } from '@/components/ui/toaster-instance';
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';

export const Payments: React.FC = () => {
    const { isRecordLabel } = useUserType();
    const {
        payoutAccount,
        payoutHistory,
        earningBalance,
        initiatePayout,
        isLoading,
    } = usePayoutStore();

    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAccountAuth, setShowAccountAuth] = useState(false);
    const [showPayoutAuth, setShowPayoutAuth] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

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

    const handleAccountSaved = () => {
        setShowAddAccount(false);
        setShowAccountAuth(true);
    };

    const handleAccountAuthorized = () => {
        setShowAccountAuth(false);
        toaster.create({
            title: 'Account Verified',
            description: 'Your payout account has been verified',
            type: 'success',
            duration: 3000,
        });
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

        setShowPayoutAuth(true);
    };

    const handlePayoutAuthorized = async () => {
        setShowPayoutAuth(false);
        const amount = parseFloat(payoutAmount);

        await initiatePayout(amount);

        setShowSuccess(true);
        setPayoutAmount('');

        toaster.create({
            title: 'Payout Initiated',
            description: 'Your payout request has been submitted',
            type: 'success',
            duration: 3000,
        });
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
                                    Quick Payout
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
                                        Continue
                                    </Button>
                                </VStack>
                            </Box>
                        )}
                    </VStack>

                    {/* Right Section */}
                    <VStack align="stretch" gap={4}>
                        {payoutHistory.length === 0 ? (
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
                                    Payout History
                                </Text>
                                <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                    <Receipt2Icon boxSize={12} mx="auto" mb={3} />
                                    <Text fontSize="xs" color="gray.500">
                                        No transaction history
                                    </Text>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={6}
                            >
                                <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                                    Payout History
                                </Text>
                                <VStack align="stretch" maxH="600px" overflowY="auto">
                                    {payoutHistory.map((item) => (
                                        <>
                                            <Box
                                                key={item.id}
                                            >
                                                <HStack justify="space-between" align="start">
                                                    <HStack gap={3}>
                                                        <Box
                                                            w={8}
                                                            h={8}
                                                            borderRadius="full"
                                                            bg={item.status === 'success' ? 'primary.100' : 'red.50'}
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Icon
                                                                as={item.status === 'success' ? FaCheck : IoClose}
                                                                boxSize={4}
                                                                color="primary.500"
                                                            />
                                                        </Box>
                                                        <VStack align="start" gap={0}>
                                                            <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                                                {item.accountName}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                {item.accountNumber} - {item.bankName}
                                                            </Text>

                                                        </VStack>
                                                    </HStack>
                                                    <VStack align="end" gap={0}>
                                                        <Text
                                                            fontSize="13px"
                                                            fontWeight="medium"
                                                            color={item.status === 'success' ? 'primary.500' : 'gray.400'}
                                                        >
                                                            {item.status === 'success' ? '-' : ''}{formatCurrency(item.amount)}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.400">
                                                            {formatDate(item.date)}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </Box>
                                            <hr />
                                        </>

                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {payoutHistory.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                color="gray.700"
                                _hover={{ bg: 'gray.50' }}
                            >
                                See All
                            </Button>
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

            <AccountAuthorizationModal
                isOpen={showAccountAuth}
                onClose={() => setShowAccountAuth(false)}
                onComplete={handleAccountAuthorized}
            />

            <PayoutAuthorizationModal
                isOpen={showPayoutAuth}
                onClose={() => setShowPayoutAuth(false)}
                onComplete={handlePayoutAuthorized}
            />

            <PaymentSuccessfulModal
                isOpen={showSuccess}
                onClose={handleSuccessClose}
                onDone={handleSuccessClose}
            />
        </Box>
    );
};

export default Payments;
