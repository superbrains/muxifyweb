import React, { useEffect, useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    Spinner,
} from '@chakra-ui/react';
import { Select } from '@/shared/components/Select';
import { AddPayoutAccountModal } from '../../payments/components/AddPayoutAccountModal';
import { usePayoutStore } from '@/features/payments/store/usePayoutStore';
import { toaster } from '@/components/ui/toaster-instance';

export const PaymentTab: React.FC = () => {
    const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
    const {
        payoutMethods,
        isLoading,
        fetchPayoutMethods,
        deletePayoutMethod,
        setDefaultPayoutMethod,
    } = usePayoutStore();

    useEffect(() => {
        fetchPayoutMethods();
    }, [fetchPayoutMethods]);

    const handleAddPayoutSuccess = () => {
        setIsAddPayoutOpen(false);
        fetchPayoutMethods();
    };

    const handleSetDefault = async (id: string) => {
        const ok = await setDefaultPayoutMethod(id);
        if (ok) {
            toaster.create({
                title: 'Default updated',
                description: 'This account will receive future payouts.',
                type: 'success',
                duration: 3000,
            });
        }
    };

    const handleRemove = async (id: string) => {
        const ok = await deletePayoutMethod(id);
        if (ok) {
            toaster.create({
                title: 'Account removed',
                description: 'Payout account has been removed.',
                type: 'success',
                duration: 3000,
            });
        }
    };

    return (
        <>
            <VStack align="stretch" gap={6}>
                <VStack align="start" gap={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        Payment Settings
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                        Decide how you want to receive your payments
                    </Text>
                </VStack>

                <Box>
                    <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                        Currency
                    </Text>
                    <Select
                        options={[{ value: 'ngn', label: 'Nigeria - Naira (NGN)' }]}
                        defaultValue="ngn"
                        backgroundColor="gray.50"
                        borderColor="gray.200"
                        fontSize="xs"
                        size="sm"
                    />
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                        Payouts are processed in NGN. Multi-currency support coming soon.
                    </Text>
                </Box>

                {/* Payout Account Section */}
                <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="center">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Payout Accounts
                        </Text>
                        <Button
                            onClick={() => setIsAddPayoutOpen(true)}
                            bg="primary.500"
                            color="white"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Add Account
                        </Button>
                    </HStack>

                    {isLoading && payoutMethods.length === 0 ? (
                        <HStack justify="center" py={6}>
                            <Spinner size="sm" color="primary.500" />
                            <Text fontSize="xs" color="gray.500">Loading payout accounts…</Text>
                        </HStack>
                    ) : payoutMethods.length === 0 ? (
                        <Box
                            border="1px dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            p={4}
                            textAlign="center"
                        >
                            <Text fontSize="xs" color="gray.600" mb={2}>
                                You haven't added a payout account yet.
                            </Text>
                            <Text fontSize="2xs" color="gray.500">
                                Add a bank account to receive payouts when you reach the withdrawal threshold.
                            </Text>
                        </Box>
                    ) : (
                        <VStack align="stretch" gap={2}>
                            {payoutMethods.map((method) => (
                                <Box
                                    key={method.id}
                                    border="1px solid"
                                    borderColor={method.isDefault ? 'primary.200' : 'gray.200'}
                                    bg={method.isDefault ? 'primary.50' : 'white'}
                                    borderRadius="md"
                                    p={3}
                                >
                                    <HStack justify="space-between" align="start">
                                        <VStack align="start" gap={0.5}>
                                            <HStack gap={2}>
                                                <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                                    {method.accountName}
                                                </Text>
                                                {method.isDefault && (
                                                    <Box
                                                        as="span"
                                                        bg="primary.500"
                                                        color="white"
                                                        fontSize="2xs"
                                                        fontWeight="semibold"
                                                        borderRadius="sm"
                                                        px={1.5}
                                                        py={0.5}
                                                    >
                                                        Default
                                                    </Box>
                                                )}
                                            </HStack>
                                            <Text fontSize="xs" color="gray.600">
                                                {method.bankName} • {method.maskedAccountNumber}
                                            </Text>
                                            {method.nickname && (
                                                <Text fontSize="2xs" color="gray.500">{method.nickname}</Text>
                                            )}
                                        </VStack>
                                        <HStack gap={2}>
                                            {!method.isDefault && (
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    fontSize="2xs"
                                                    onClick={() => handleSetDefault(method.id)}
                                                >
                                                    Set Default
                                                </Button>
                                            )}
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                color="red.500"
                                                fontSize="2xs"
                                                onClick={() => handleRemove(method.id)}
                                            >
                                                Remove
                                            </Button>
                                        </HStack>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </VStack>
            </VStack>

            <AddPayoutAccountModal
                isOpen={isAddPayoutOpen}
                onClose={() => setIsAddPayoutOpen(false)}
                onNext={handleAddPayoutSuccess}
            />
        </>
    );
};
