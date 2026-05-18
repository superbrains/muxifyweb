import React, { useState } from 'react';
import {
    Box,
    Button,
    Icon,
    IconButton,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { toaster } from '@/components/ui/toaster-instance';
import { authService } from '@/shared/services/auth';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';

interface PasswordFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggleVisible: () => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
    label,
    placeholder,
    value,
    onChange,
    visible,
    onToggleVisible,
}) => (
    <Box w="full">
        <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
            {label}
        </Text>
        <Box position="relative">
            <Input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                size="sm"
                pr={10}
                bg="gray.50"
                borderColor="gray.200"
                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
            />
            <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                variant="ghost"
                size="sm"
                position="absolute"
                right={1}
                top="50%"
                transform="translateY(-50%)"
                onClick={onToggleVisible}
            >
                <Icon as={visible ? MdVisibilityOff : MdVisibility} />
            </IconButton>
        </Box>
    </Box>
);

/**
 * Inline card that lets the signed-in admin rotate their account password.
 * Posts to the shared `POST /api/v1/auth/change-password` endpoint, which
 * verifies the current password and revokes outstanding refresh tokens.
 */
export const ChangePasswordCard: React.FC = () => {
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

        // Backend enforces 8+ chars with upper/lower/digit; mirror the lower
        // bound here so admins get an immediate hint before submitting.
        if (newPassword.length < 8) {
            toaster.create({
                title: 'Weak Password',
                description: 'Password must be at least 8 characters long',
                type: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(currentPassword, newPassword);

            toaster.create({
                title: 'Password Updated',
                description: 'Your admin account password has been updated successfully',
                type: 'success',
                duration: 3000,
            });
            setCurrentPassword('');
            setNewPassword('');
            setRepeatPassword('');
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowRepeatPassword(false);
        } catch (error) {
            console.error('admin change password error', error);
            toaster.create({
                title: 'Update Failed',
                description: getApiErrorMessage(
                    error,
                    'Failed to update password. Please check your current password and try again.',
                ),
                type: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="16px"
            p={{ base: 5, md: 6 }}
            maxW="440px"
            w="full"
        >
            <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                Change Password
            </Text>
            <Text fontSize="11px" color="gray.600" mt={0.5} mb={5}>
                Choose a strong password to keep your admin account secure. You may
                need to sign in again on your other devices afterwards.
            </Text>

            <VStack gap={4} w="full">
                <PasswordField
                    label="Current Password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    visible={showCurrentPassword}
                    onToggleVisible={() => setShowCurrentPassword((v) => !v)}
                />
                <PasswordField
                    label="New Password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggleVisible={() => setShowNewPassword((v) => !v)}
                />
                <PasswordField
                    label="Repeat New Password"
                    placeholder="New Password"
                    value={repeatPassword}
                    onChange={setRepeatPassword}
                    visible={showRepeatPassword}
                    onToggleVisible={() => setShowRepeatPassword((v) => !v)}
                />

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
        </Box>
    );
};
