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

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !repeatPassword) {
            toaster.create({
                title: 'Validation Error',
                description: 'Please fill in all password fields',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        if (newPassword !== repeatPassword) {
            toaster.create({
                title: 'Password Mismatch',
                description: 'New password and repeat password do not match',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        if (newPassword.length < 6) {
            toaster.create({
                title: 'Weak Password',
                description: 'Password must be at least 6 characters long',
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
                title: 'Password Updated',
                description: 'Your account password has been updated successfully',
                type: 'success',
                duration: 3000,
            });
            onSuccess();
        } catch (error) {
            console.error('update password error', error);
            toaster.create({
                title: 'Update Failed',
                description: 'Failed to update password. Please try again.',
                type: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setRepeatPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowRepeatPassword(false);
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
                                Update Account Password
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
                                Current Password
                            </Text>
                            <HStack gap={2}>
                                <Input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Current Password"
                                    size="sm"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                />
                                <IconButton
                                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Icon as={showCurrentPassword ? MdVisibilityOff : MdVisibility} />
                                </IconButton>
                            </HStack>
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                New Password
                            </Text>
                            <HStack gap={2}>
                                <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    size="sm"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                />
                                <IconButton
                                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Icon as={showNewPassword ? MdVisibilityOff : MdVisibility} />
                                </IconButton>
                            </HStack>
                        </Box>

                        <Box w="full">
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Repeat New Password
                            </Text>
                            <HStack gap={2}>
                                <Input
                                    type={showRepeatPassword ? 'text' : 'password'}
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    placeholder="New Password"
                                    size="sm"
                                    bg="gray.50"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                                />
                                <IconButton
                                    aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                >
                                    <Icon as={showRepeatPassword ? MdVisibilityOff : MdVisibility} />
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
                            Update Password
                        </Button>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
