import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Input,
    Button,
    Grid,
} from '@chakra-ui/react';
import { Select } from '@/shared/components/Select';
import { AddPayoutAccountModal } from '../../payments/components/AddPayoutAccountModal';
import { CreatePinModal } from './CreatePinModal';
import { RepeatPinModal } from './RepeatPinModal';
import { AuthorizeAccountModal } from './AuthorizeAccountModal';

export const PaymentTab: React.FC = () => {
    const [isAddPayoutOpen, setIsAddPayoutOpen] = useState(false);
    const [isCreatePinOpen, setIsCreatePinOpen] = useState(false);
    const [isRepeatPinOpen, setIsRepeatPinOpen] = useState(false);
    const [isAuthorizeAccountOpen, setIsAuthorizeAccountOpen] = useState(false);

    const handleAddPayoutSuccess = () => {
        setIsAddPayoutOpen(false);
        setIsCreatePinOpen(true);
    };

    const handleCreatePinSuccess = () => {
        setIsCreatePinOpen(false);
        setIsRepeatPinOpen(true);
    };

    const handleRepeatPinSuccess = () => {
        setIsRepeatPinOpen(false);
        setIsAuthorizeAccountOpen(true);
    };

    const handleAuthorizeAccountSuccess = () => {
        setIsAuthorizeAccountOpen(false);
        // Handle final success logic here
    };

    return (
        <>
            <VStack align="stretch" gap={6}>
                <VStack align="start" gap={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.900">
                        Payment Settings
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                        Decide how you want to your payment and method of payout
                    </Text>
                </VStack>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                    <VStack align="stretch" gap={3}>
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
                        </Box>
                    </VStack>

                    <VStack align="stretch" gap={3}>
                        <HStack justify="space-between" align="end">
                            <Box flex="1">
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                    Payment Method
                                </Text>
                            </Box>
                            <Button
                                variant="outline"
                                size="xs"
                                fontSize="xs"
                                fontWeight="medium"
                                borderColor="gray.300"
                                color="gray.700"
                                _hover={{ bg: 'gray.50' }}
                            >
                                Edit Payment
                            </Button>
                        </HStack>
                    </VStack>
                </Grid>

                {/* Payout Account Section */}
                <VStack align="stretch" gap={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        Payout Account
                    </Text>

                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Bank
                            </Text>
                            <Select
                                options={[{ value: 'gtbank', label: 'GTBank' }]}
                                defaultValue="gtbank"
                                backgroundColor="gray.50"
                                borderColor="gray.200"
                                fontSize="xs"
                                size="sm"
                            />
                        </Box>
                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Account Number
                            </Text>
                            <Input
                                value="1234567890"
                                size="sm"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            />
                        </Box>
                    </Grid>

                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                            Account Name
                        </Text>
                        <Input
                            value="David Adeleke"
                            size="sm"
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                        />
                    </Box>

                    <Button
                        onClick={() => setIsAddPayoutOpen(true)}
                        bg="primary.500"
                        color="white"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="md"
                        _hover={{ bg: 'primary.600' }}
                        alignSelf="flex-start"
                    >
                        Add Payout Account
                    </Button>
                </VStack>
            </VStack>

            <AddPayoutAccountModal
                isOpen={isAddPayoutOpen}
                onClose={() => setIsAddPayoutOpen(false)}
                onNext={handleAddPayoutSuccess}
            />

            <CreatePinModal
                isOpen={isCreatePinOpen}
                onClose={() => setIsCreatePinOpen(false)}
                onSuccess={handleCreatePinSuccess}
            />

            <RepeatPinModal
                isOpen={isRepeatPinOpen}
                onClose={() => setIsRepeatPinOpen(false)}
                onSuccess={handleRepeatPinSuccess}
            />

            <AuthorizeAccountModal
                isOpen={isAuthorizeAccountOpen}
                onClose={() => setIsAuthorizeAccountOpen(false)}
                onSuccess={handleAuthorizeAccountSuccess}
            />
        </>
    );
};
