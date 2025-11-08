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
import { MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { toaster } from '@/components/ui/toaster-instance';

interface UpdateTransactionPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateTransactionPinModal: React.FC<UpdateTransactionPinModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [repeatPin, setRepeatPin] = useState('');
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showRepeatPin, setShowRepeatPin] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!currentPin || !newPin || !repeatPin) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please fill in all PIN fields',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        if (newPin !== repeatPin) {
            toaster.create({
                title: 'PIN Mismatch',
                description: 'New PIN and repeat PIN do not match',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        if (newPin.length !== 4) {
            toaster.create({
                title: 'Invalid PIN',
                description: 'PIN must be exactly 4 digits',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toaster.create({
                title: 'PIN Updated',
                description: 'Your transaction PIN has been updated successfully',
                type: 'success',
                duration: 3000,
            });
            onSuccess();
        } catch (error) {
            console.error('update transaction pin error', error);
            toaster.create({
                title: 'Update Failed',
                description: 'Failed to update PIN. Please try again.',
                type: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPin('');
        setNewPin('');
        setRepeatPin('');
        setShowCurrentPin(false);
        setShowNewPin(false);
        setShowRepeatPin(false);
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
                                Update Transaction PIN
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
                        Lorem ipsum dolor sit amet consectetur. Blandit malesuada sed malesuada duis ipsum et tempus.
                    </Text>

                    <VStack gap={4} w="full">
                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Current PIN
                            </Text>
                            <HStack gap={2}>
                                <Input
                                    type={showCurrentPin ? 'text' : 'password'}
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value)}
                                    placeholder="Current PIN"
                                    size="sm"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                />
                                <IconButton
                                    aria-label={showCurrentPin ? 'Hide PIN' : 'Show PIN'}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                                >
                                    <Icon as={showCurrentPin ? MdVisibilityOff : MdVisibility} />
                                </IconButton>
                            </HStack>
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                New PIN
                            </Text>
                            <HStack gap={2}>
                                <Input
                                    type={showNewPin ? 'text' : 'password'}
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    placeholder="New PIN"
                                    size="sm"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                />
                                <IconButton
                                    aria-label={showNewPin ? 'Hide PIN' : 'Show PIN'}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewPin(!showNewPin)}
                                >
                                    <Icon as={showNewPin ? MdVisibilityOff : MdVisibility} />
                                </IconButton>
                            </HStack>
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Repeat New PIN
                            </Text>
                            <HStack gap={2}>
                                <Input
                                    type={showRepeatPin ? 'text' : 'password'}
                                    value={repeatPin}
                                    onChange={(e) => setRepeatPin(e.target.value)}
                                    placeholder="New PIN"
                                    size="sm"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                />
                                <IconButton
                                    aria-label={showRepeatPin ? 'Hide PIN' : 'Show PIN'}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRepeatPin(!showRepeatPin)}
                                >
                                    <Icon as={showRepeatPin ? MdVisibilityOff : MdVisibility} />
                                </IconButton>
                            </HStack>
                        </Box>

                        <Button
                            onClick={handleSubmit}
                            loading={loading}
                            bg="primary.500"
                            color="white"
                            w="full"
                            size="sm"
                            fontSize="sm"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Update PIN
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
