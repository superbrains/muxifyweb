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
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { usePayoutStore } from '../store/usePayoutStore';
import { toaster } from '@/components/ui/toaster';

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
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');
    const { setPayoutAccount, isLoading, error, clearError } = usePayoutStore();

    const handleSubmit = async () => {
        clearError();

        if (!accountNumber || !bankName || !accountName) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please fill in all fields',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        await setPayoutAccount({
            id: Date.now().toString(),
            accountNumber,
            bankName,
            accountName,
        });

        if (!error) {
            toaster.create({
                title: 'Account Added',
                description: 'Payout account has been saved',
                type: 'success',
                duration: 3000,
            });
            onNext();
        }
    };

    const handleClose = () => {
        setAccountNumber('');
        setBankName('');
        setAccountName('');
        clearError();
        onClose();
    };

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
                                Account Number
                            </Text>
                            <Input
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="123567890"
                                size="md"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            />
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Bank Name
                            </Text>
                            <Input
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="Fidelity Bank PLC"
                                size="md"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            />
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Account Name
                            </Text>
                            <Input
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="David Adeleke"
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
                            loading={isLoading}
                            loadingText="Saving..."
                        >
                            Save
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
