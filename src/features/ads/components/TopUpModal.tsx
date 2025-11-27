import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    Input,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
    Heading,
    Image,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
    isOpen,
    onClose,
    onComplete,
}) => {
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('paystack');

    const paymentMethods = [
        { id: 'paystack', name: 'Paystack', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/paypal_q3jbsu.png' },
        { id: 'flutterwave', name: 'Flutterwave', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/flutterwave_h4hwpl.png' },
        { id: 'fincra', name: 'Fincra', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/fincra_wt7l83.png' },
        { id: 'mtn', name: 'MTN - MoMo', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/Momo_ea8emj.png' },
        { id: 'airtime', name: 'Airtime', image: 'https://res.cloudinary.com/dygrsvya5/image/upload/v1762541366/airtime_ut4baa.png' },
    ];

    const handleAmountChange = (value: string) => {
        // Only allow numbers and decimal
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            return;
        }
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        onComplete();
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    maxW="350px"
                    p={5}
                    borderRadius="20px"
                    position="relative"
                >
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        color="primary.500"
                        right={4}
                        top={4}
                        onClick={onClose}
                    >
                        <Icon as={MdClose} boxSize={5} />
                    </IconButton>

                    <VStack gap={6} align="stretch" w="full">
                        {/* Header */}
                        <VStack gap={1}>
                            <Heading size="sm" fontWeight="semibold">
                                Top Up Ad Wallet
                            </Heading>
                            <Text fontSize="xs" color="gray.600" textAlign="center" px={2}>
                                Add more money to your ad wallet to keep your ad active, and avoid unnecessary cancelling
                            </Text>
                        </VStack>

                        {/* Amount Input */}
                        <VStack gap={2} align="stretch">
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

                        {/* Payment Methods */}
                        <VStack alignItems="center" gap={5} align="stretch">
                            <Text fontSize="sm" fontWeight="semibold">
                                Funding Method
                            </Text>
                            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
                                {paymentMethods.map((method) => (
                                    <VStack
                                        key={method.id}
                                        position="relative"
                                        gap={0}
                                        cursor="pointer"
                                        p={2}
                                        border={'2px solid'}
                                        borderColor={selectedMethod === method.id ? 'primary.500' : 'red.100'}
                                        borderRadius="lg"
                                        bg="white"
                                        onClick={() => setSelectedMethod(method.id)}
                                        _hover={{ borderColor: selectedMethod === method.id ? 'primary.500' : 'red.300' }}
                                        transition="all 0.2s"
                                        align="center"
                                        justify="center"
                                    >
                                        <Image
                                            src={method.image}
                                            alt={method.name}
                                            boxSize="50px"
                                            objectFit="contain"
                                        />
                                    </VStack>
                                ))}
                            </Box>
                        </VStack>

                        {/* Submit Button */}
                        <Button
                            bg="primary.500"
                            color="white"
                            size="md"
                            onClick={handleSubmit}
                            disabled={!amount || parseFloat(amount) <= 0}
                            _hover={{ bg: 'primary.600' }}
                            _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
                        >
                            Add Funds
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

