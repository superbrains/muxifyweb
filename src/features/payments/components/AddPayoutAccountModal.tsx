import React, { useState, useEffect } from 'react';
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
    Spinner,
} from '@chakra-ui/react';
import { MdClose, MdCheck, MdError } from 'react-icons/md';
import { usePayoutStore } from '../store/usePayoutStore';
import { toaster } from '@/components/ui/toaster-instance';
import { isValidNigerianAccountNumber } from '../services/payoutService';
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';

interface AddPayoutAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
}

export const AddPayoutAccountModal: React.FC<AddPayoutAccountModalProps> = ({
    isOpen,
    onClose,
    onNext,
}) => {
    const [accountNumber, setAccountNumber] = useState('');
    const [selectedBankCode, setSelectedBankCode] = useState<string>('');
    const [accountName, setAccountName] = useState('');
    const [nickname, setNickname] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const {
        banks,
        isBanksLoading,
        isVerifying,
        isLoading,
        error,
        fetchBanks,
        verifyAccount,
        addPayoutMethod,
        clearError,
    } = usePayoutStore();

    // Fetch banks on mount
    useEffect(() => {
        if (isOpen && banks.length === 0) {
            fetchBanks();
        }
    }, [isOpen, banks.length, fetchBanks]);

    // Auto-verify when account number and bank are complete
    useEffect(() => {
        const verifyAccountNumber = async () => {
            if (
                selectedBankCode &&
                accountNumber &&
                isValidNigerianAccountNumber(accountNumber)
            ) {
                setVerificationError(null);
                setIsVerified(false);
                setAccountName('');

                const result = await verifyAccount(selectedBankCode, accountNumber);

                if (result.success && result.accountName) {
                    setAccountName(result.accountName);
                    setIsVerified(true);
                } else {
                    setVerificationError(result.message || 'Could not verify account');
                    setIsVerified(false);
                }
            }
        };

        // Debounce the verification
        const timeoutId = setTimeout(verifyAccountNumber, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedBankCode, accountNumber, verifyAccount]);

    const handleSubmit = async () => {
        clearError();

        if (!selectedBankCode || !accountNumber) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please select a bank and enter account number',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        if (!isVerified) {
            toaster.create({
                title: 'Verification Required',
                description: 'Please verify your account number first',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        const success = await addPayoutMethod({
            bankCode: selectedBankCode,
            accountNumber: accountNumber.replace(/\s/g, ''),
            nickname: nickname || undefined,
            setAsDefault: true,
        });

        if (success) {
            toaster.create({
                title: 'Account Added',
                description: 'Payout account has been saved',
                type: 'success',
                duration: 3000,
            });
            handleClose();
            onNext();
        } else if (error) {
            toaster.create({
                title: 'Error',
                description: error,
                type: 'error',
                duration: 3000,
            });
        }
    };

    const handleClose = () => {
        setAccountNumber('');
        setSelectedBankCode('');
        setAccountName('');
        setNickname('');
        setIsVerified(false);
        setVerificationError(null);
        clearError();
        onClose();
    };

    const selectedBank = banks.find((b) => b.code === selectedBankCode);

    // Create bank collection for select
    const bankCollection = createListCollection({
        items: banks.filter((b) => b.isActive).map((bank) => ({
            label: bank.name,
            value: bank.code,
        })),
    });

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="390px" p={7} position="relative" borderRadius="25px" display="flex" flexDirection="column" alignItems="center">
                    <Dialog.Header>
                        <HStack justify="center" w="full">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Add Payout Account
                            </Text>
                            <IconButton
                                aria-label="Close"
                                variant="ghost"
                                size="sm"
                                color="red.500"
                                position="absolute"
                                right={4}
                                top={4}
                                onClick={handleClose}
                            >
                                <Icon as={MdClose} />
                            </IconButton>
                        </HStack>
                    </Dialog.Header>

                    <Text fontSize="xs" color="gray.600" mb={6} textAlign="center" w="80%">
                        This account will be used for your payout only, it must match with your legal name.
                    </Text>

                    <VStack gap={4} w="full">
                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Bank
                            </Text>
                            <SelectRoot
                                collection={bankCollection}
                                value={selectedBankCode ? [selectedBankCode] : []}
                                onValueChange={(e) => {
                                    setSelectedBankCode(e.value[0] || '');
                                    setIsVerified(false);
                                    setAccountName('');
                                    setVerificationError(null);
                                }}
                                disabled={isBanksLoading}
                            >
                                <SelectTrigger>
                                    <SelectValueText placeholder={isBanksLoading ? "Loading banks..." : "Select a bank"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankCollection.items.map((bank) => (
                                        <SelectItem key={bank.value} item={bank}>
                                            {bank.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Account Number
                            </Text>
                            <Box position="relative">
                                <Input
                                    value={accountNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setAccountNumber(value);
                                        setIsVerified(false);
                                        setVerificationError(null);
                                    }}
                                    placeholder="Enter 10-digit account number"
                                    size="md"
                                    bg="gray.50"
                                    borderColor={
                                        isVerified
                                            ? 'green.500'
                                            : verificationError
                                            ? 'red.500'
                                            : 'gray.200'
                                    }
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                    pr={10}
                                    maxLength={10}
                                />
                                {isVerifying && (
                                    <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                                        <Spinner size="sm" color="primary.500" />
                                    </Box>
                                )}
                                {isVerified && !isVerifying && (
                                    <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                                        <Icon as={MdCheck} color="green.500" boxSize={5} />
                                    </Box>
                                )}
                                {verificationError && !isVerifying && (
                                    <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                                        <Icon as={MdError} color="red.500" boxSize={5} />
                                    </Box>
                                )}
                            </Box>
                            {verificationError && (
                                <Text fontSize="xs" color="red.500" mt={1}>
                                    {verificationError}
                                </Text>
                            )}
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Account Name
                            </Text>
                            <Input
                                value={accountName}
                                readOnly
                                placeholder={isVerifying ? "Verifying..." : "Auto-filled after verification"}
                                size="md"
                                bg="gray.100"
                                borderColor={isVerified ? 'green.500' : 'gray.200'}
                                color={isVerified ? 'gray.900' : 'gray.500'}
                                fontWeight={isVerified ? 'medium' : 'normal'}
                            />
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Nickname (Optional)
                            </Text>
                            <Input
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g., Main Account"
                                size="md"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            />
                        </Box>

                        {selectedBank && isVerified && (
                            <Box
                                w="full"
                                p={3}
                                bg="green.50"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="green.200"
                            >
                                <HStack gap={2}>
                                    <Icon as={MdCheck} color="green.500" />
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" fontWeight="medium" color="green.700">
                                            Account Verified
                                        </Text>
                                        <Text fontSize="xs" color="green.600">
                                            {accountName} - {selectedBank.name}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        )}

                        <Button
                            onClick={handleSubmit}
                            bg="primary.500"
                            color="white"
                            w="full"
                            size="md"
                            fontSize="sm"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                            loading={isLoading}
                            loadingText="Saving..."
                            disabled={!isVerified || isLoading}
                        >
                            Save Account
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
