import React from 'react';
import {
    Box,
    Button,
    Center,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Input,
    Spinner,
    Text,
    VStack,
    createListCollection,
} from '@chakra-ui/react';
import { MdCheck, MdClose, MdError } from 'react-icons/md';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from '@/components/ui/select';
import { ConfirmModal } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { isValidNigerianAccountNumber } from '@/features/payments/services/payoutService';
import { contributorService } from '../services/contributorService';
import {
    useContributorPayoutMethods,
    useContributorBanks,
    useAddContributorPayoutMethod,
    useDeleteContributorPayoutMethod,
    useSetDefaultContributorPayoutMethod,
} from '../hooks/useContributor';
import type { PayoutMethodDto } from '../services/contributorService';

const AddPayoutAccountDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isFirst: boolean;
}> = ({ isOpen, onClose, isFirst }) => {
    const toast = useChakraToast();
    const banksQuery = useContributorBanks();
    const addMethod = useAddContributorPayoutMethod();

    const [accountNumber, setAccountNumber] = React.useState('');
    const [selectedBankCode, setSelectedBankCode] = React.useState('');
    const [accountName, setAccountName] = React.useState('');
    const [nickname, setNickname] = React.useState('');
    const [isVerified, setIsVerified] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [verificationError, setVerificationError] = React.useState<string | null>(null);

    const banks = React.useMemo(() => banksQuery.data?.banks ?? [], [banksQuery.data]);

    const reset = React.useCallback(() => {
        setAccountNumber('');
        setSelectedBankCode('');
        setAccountName('');
        setNickname('');
        setIsVerified(false);
        setVerificationError(null);
    }, []);

    const handleClose = () => {
        reset();
        onClose();
    };

    // Auto-verify when bank + 10-digit account number are present.
    React.useEffect(() => {
        if (!isOpen) return;
        if (!selectedBankCode || !isValidNigerianAccountNumber(accountNumber)) return;

        let cancelled = false;
        const timeout = setTimeout(async () => {
            setIsVerifying(true);
            setVerificationError(null);
            setIsVerified(false);
            setAccountName('');
            try {
                const { data } = await contributorService.verifyAccount({
                    bankCode: selectedBankCode,
                    accountNumber,
                });
                if (cancelled) return;
                if (data.success && data.accountName) {
                    setAccountName(data.accountName);
                    setIsVerified(true);
                } else {
                    setVerificationError(data.message || 'Could not verify account');
                }
            } catch (err) {
                if (!cancelled) setVerificationError(getApiErrorMessage(err, 'Could not verify account'));
            } finally {
                if (!cancelled) setIsVerifying(false);
            }
        }, 500);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [isOpen, selectedBankCode, accountNumber]);

    const bankCollection = React.useMemo(
        () =>
            createListCollection({
                items: banks
                    .filter((b) => b.isActive)
                    .map((bank) => ({ label: bank.name, value: bank.code })),
            }),
        [banks],
    );

    const handleSubmit = async () => {
        if (!isVerified) {
            toast.error('Verification required', 'Please verify your account number first.');
            return;
        }
        try {
            await addMethod.mutateAsync({
                bankCode: selectedBankCode,
                accountNumber: accountNumber.replace(/\s/g, ''),
                nickname: nickname || undefined,
                setAsDefault: isFirst,
            });
            toast.success('Account added', 'Your payout account has been saved.');
            handleClose();
        } catch (err) {
            toast.error('Could not add account', getApiErrorMessage(err, 'Please try again.'));
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="390px" p={7} position="relative" borderRadius="25px">
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

                    <Text fontSize="xs" color="gray.600" mb={6} textAlign="center">
                        This account is used for your payouts only. It must match your legal name.
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
                                disabled={banksQuery.isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValueText
                                        placeholder={banksQuery.isLoading ? 'Loading banks...' : 'Select a bank'}
                                    />
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
                                        isVerified ? 'green.500' : verificationError ? 'red.500' : 'gray.200'
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
                                placeholder={isVerifying ? 'Verifying...' : 'Auto-filled after verification'}
                                size="md"
                                bg="gray.100"
                                borderColor={isVerified ? 'green.500' : 'gray.200'}
                                color={isVerified ? 'gray.900' : 'gray.500'}
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
                            loading={addMethod.isPending}
                            loadingText="Saving..."
                            disabled={!isVerified || addMethod.isPending}
                        >
                            Save Account
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

const PayoutMethodRow: React.FC<{
    method: PayoutMethodDto;
    onSetDefault: (id: string) => void;
    onDelete: (method: PayoutMethodDto) => void;
    busy: boolean;
}> = ({ method, onSetDefault, onDelete, busy }) => (
    <HStack
        justify="space-between"
        align="center"
        border="1px solid"
        borderColor={method.isDefault ? 'primary.200' : 'gray.200'}
        bg={method.isDefault ? 'primary.50' : 'white'}
        borderRadius="lg"
        p={4}
    >
        <VStack align="start" gap={0.5}>
            <HStack gap={2}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                    {method.nickname || method.bankName}
                </Text>
                {method.isDefault && (
                    <Text
                        fontSize="10px"
                        fontWeight="semibold"
                        color="primary.600"
                        bg="primary.100"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                    >
                        Default
                    </Text>
                )}
            </HStack>
            <Text fontSize="xs" color="gray.600">
                {method.accountName}
            </Text>
            <Text fontSize="xs" color="gray.500">
                {method.maskedAccountNumber} · {method.bankName}
            </Text>
        </VStack>

        <HStack gap={1}>
            {!method.isDefault && (
                <IconButton
                    aria-label="Set as default"
                    variant="ghost"
                    size="sm"
                    color="primary.500"
                    onClick={() => onSetDefault(method.id)}
                    disabled={busy}
                >
                    <Icon as={FiStar} />
                </IconButton>
            )}
            <IconButton
                aria-label="Delete account"
                variant="ghost"
                size="sm"
                color="red.500"
                onClick={() => onDelete(method)}
                disabled={busy}
            >
                <Icon as={FiTrash2} />
            </IconButton>
        </HStack>
    </HStack>
);

const ContributorPayoutAccountsPage: React.FC = () => {
    const toast = useChakraToast();
    const methodsQuery = useContributorPayoutMethods();
    const setDefault = useSetDefaultContributorPayoutMethod();
    const deleteMethod = useDeleteContributorPayoutMethod();

    const [showAdd, setShowAdd] = React.useState(false);
    const [pendingDelete, setPendingDelete] = React.useState<PayoutMethodDto | null>(null);

    const methods = methodsQuery.data?.payoutMethods ?? [];
    const busy = setDefault.isPending || deleteMethod.isPending;

    const handleSetDefault = async (id: string) => {
        try {
            await setDefault.mutateAsync(id);
            toast.success('Default updated', 'This account is now your default payout method.');
        } catch (err) {
            toast.error('Could not update default', getApiErrorMessage(err));
        }
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteMethod.mutateAsync(pendingDelete.id);
            toast.success('Account removed', 'The payout account has been deleted.');
        } catch (err) {
            toast.error('Could not delete account', getApiErrorMessage(err));
        } finally {
            setPendingDelete(null);
        }
    };

    return (
        <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
            <Box bg="white" borderRadius="10px" p={{ base: 4, md: 6 }} minH="80vh">
                <HStack justify="space-between" align="center" mb={6}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                        Payout Accounts
                    </Text>
                    <Button
                        bg="primary.500"
                        color="white"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="md"
                        _hover={{ bg: 'primary.600' }}
                        onClick={() => setShowAdd(true)}
                    >
                        Add Account
                    </Button>
                </HStack>

                {methodsQuery.isLoading ? (
                    <Center py={20}>
                        <Spinner size="lg" color="primary.500" />
                    </Center>
                ) : methods.length === 0 ? (
                    <Center py={20}>
                        <VStack gap={2}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                No payout accounts yet
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Add a bank account to receive your contributor payouts.
                            </Text>
                            <Button
                                mt={2}
                                bg="primary.500"
                                color="white"
                                size="sm"
                                fontSize="xs"
                                borderRadius="md"
                                _hover={{ bg: 'primary.600' }}
                                onClick={() => setShowAdd(true)}
                            >
                                Add Payout Account
                            </Button>
                        </VStack>
                    </Center>
                ) : (
                    <VStack align="stretch" gap={3} maxW="640px">
                        {methods.map((method) => (
                            <PayoutMethodRow
                                key={method.id}
                                method={method}
                                onSetDefault={handleSetDefault}
                                onDelete={setPendingDelete}
                                busy={busy}
                            />
                        ))}
                    </VStack>
                )}
            </Box>

            <AddPayoutAccountDialog
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                isFirst={methods.length === 0}
            />

            <ConfirmModal
                isOpen={!!pendingDelete}
                onClose={() => setPendingDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete payout account"
                message={
                    pendingDelete
                        ? `Remove ${pendingDelete.nickname || pendingDelete.bankName} (${pendingDelete.maskedAccountNumber})? This cannot be undone.`
                        : ''
                }
                confirmText="Delete"
                isLoading={deleteMethod.isPending}
            />
        </Box>
    );
};

export default ContributorPayoutAccountsPage;
