import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Input,
    Grid,
    Icon,
    Image,
} from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';
import { TopUpModal } from '../components/TopUpModal';

interface WalletTransaction {
    id: string;
    type: 'Top Up';
    method: string;
    amount: number;
    status: 'success' | 'failed';
    date: string;
}

export const AdsWallet: React.FC = () => {
    const [walletBalance] = useState(75550000);
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('paystack');
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

    // Mock transaction history
    const [transactions] = useState<WalletTransaction[]>([
        { id: '1', type: 'Top Up', method: 'Paystack', amount: 10000000, status: 'success', date: '11:23PM - 12/02/2025' },
        { id: '2', type: 'Top Up', method: 'Flutterwave', amount: 10000000, status: 'success', date: '10:15PM - 12/02/2025' },
        { id: '3', type: 'Top Up', method: 'Fincra', amount: 10000000, status: 'failed', date: '09:30PM - 12/02/2025' },
        { id: '4', type: 'Top Up', method: 'MTN - MoMo', amount: 10000000, status: 'failed', date: '08:45PM - 12/02/2025' },
        { id: '5', type: 'Top Up', method: 'Fincra', amount: 10000000, status: 'success', date: '07:20PM - 12/02/2025' },
        { id: '6', type: 'Top Up', method: 'Flutterwave', amount: 10000000, status: 'failed', date: '06:10PM - 12/02/2025' },
        { id: '7', type: 'Top Up', method: 'Paystack', amount: 10000000, status: 'success', date: '05:00PM - 12/02/2025' },
        { id: '8', type: 'Top Up', method: 'MTN - MoMo', amount: 10000000, status: 'failed', date: '04:30PM - 12/02/2025' },
    ]);

    const paymentMethods = [
        { id: 'paystack', name: 'Paystack', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/paypal_q3jbsu.png' },
        { id: 'flutterwave', name: 'Flutterwave', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/flutterwave_h4hwpl.png' },
        { id: 'fincra', name: 'Fincra', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/fincra_wt7l83.png' },
        { id: 'mtn', name: 'MTN - MoMo', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/Momo_ea8emj.png' },
        { id: 'airtime', name: 'Airtime', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/airtime_ut4baa.png' },
    ];

    const handleAmountChange = (value: string) => {
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleContinue = () => {
        if (!amount || parseFloat(amount) <= 0) {
            return;
        }
        setIsTopUpModalOpen(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Box bg="gray.50" minH="100vh" p={6}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                {/* Left Panel - Wallet Management */}
                <VStack align="stretch" gap={6}>
                    <Box bg="white" p={6} borderRadius="xl">
                        <VStack align="stretch" gap={6}>
                            {/* Wallet Balance */}
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                                    Wallet Balance
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="#f94444">
                                    {formatCurrency(walletBalance)}
                                </Text>
                            </VStack>

                            {/* Amount Input */}
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                    Amount (NGN)
                                </Text>
                                <Box
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                >
                                    <HStack gap={3}>
                                        <Box
                                            bg="white"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="sm"
                                            px={2}
                                            py={1}
                                        >
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

                            {/* Funding Method */}
                            <VStack align="stretch" gap={2}>
                                <Text fontSize="sm" fontWeight="semibold">
                                    Funding Method
                                </Text>
                                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} gap={2}>
                                    {paymentMethods.map((method) => (
                                        <VStack
                                            key={method.id}
                                            position="relative"
                                            gap={1}
                                            cursor="pointer"
                                            p={3}
                                            border="2px solid"
                                            borderColor={selectedMethod === method.id ? '#f94444' : 'gray.100'}
                                            borderRadius="lg"
                                            onClick={() => setSelectedMethod(method.id)}
                                            _hover={{ borderColor: '#f94444' }}
                                            transition="all 0.2s"
                                            bg="white"
                                        >
                                            <Image
                                                src={method.image}
                                                alt={method.name}
                                                boxSize="60px"
                                                objectFit="contain"
                                            />
                                            <Text fontSize="2xs" textAlign="center" lineHeight="1.2">
                                                {method.name}
                                            </Text>
                                        </VStack>
                                    ))}
                                </Grid>
                            </VStack>

                            {/* Continue Button */}
                            <Button
                                bg="#f94444"
                                color="white"
                                size="md"
                                onClick={handleContinue}
                                disabled={!amount || parseFloat(amount) <= 0}
                                _hover={{ bg: '#e53939' }}
                                _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
                            >
                                Continue
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
                        <VStack align="stretch" maxH="600px" overflowY="auto" gap={3}>
                            {transactions.map((transaction) => (
                                <HStack key={transaction.id} justify="space-between" align="start">
                                    <HStack gap={3}>
                                        <Box
                                            w={8}
                                            h={8}
                                            borderRadius="full"
                                            bg={transaction.status === 'success' ? '#ffefef' : '#ffefef'}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon
                                                as={transaction.status === 'success' ? FiCheck : FiX}
                                                boxSize={4}
                                                color={transaction.status === 'success' ? '#f94444' : '#f94444'}
                                            />
                                        </Box>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs" fontWeight="medium" color="gray.900">
                                                {transaction.type}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {transaction.method}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <VStack align="end" gap={0}>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                            color={transaction.status === 'success' ? '#f94444' : 'black'}
                                        >
                                            {transaction.status === 'success' ? '-' : ''}{formatCurrency(transaction.amount)}
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">
                                            {transaction.date}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                        {transactions.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                color="gray.700"
                                _hover={{ bg: 'gray.50' }}
                                mt={4}
                                w="full"
                            >
                                See All
                            </Button>
                        )}
                    </Box>
                </VStack>
            </Grid>

            {/* Top Up Modal */}
            <TopUpModal
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                onComplete={() => {
                    setIsTopUpModalOpen(false);
                    setAmount('');
                }}
            />
        </Box>
    );
};

export default AdsWallet;

