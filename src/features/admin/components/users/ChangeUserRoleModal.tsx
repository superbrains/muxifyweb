import React from 'react';
import { Dialog, Box, Button, HStack, IconButton, Stack, Text, VStack } from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { Select } from '@shared/components';
import { roleLabel } from '../../lib/statusColor';
import { useChangeUserRole } from '../../hooks/useUsers';
import type { AdminUserDetailDto } from '../../types';

interface ChangeUserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUserDetailDto;
}

const ASSIGNABLE_ROLES = [
    { value: 'artist', label: 'Artist' },
    { value: 'dj', label: 'DJ' },
    { value: 'creator', label: 'Creator' },
    { value: 'podcaster', label: 'Podcaster' },
    { value: 'record_label', label: 'Record Label' },
    { value: 'ad_manager', label: 'Ad Manager' },
];

export const ChangeUserRoleModal: React.FC<ChangeUserRoleModalProps> = ({
    isOpen,
    onClose,
    user,
}) => {
    const [role, setRole] = React.useState<string>(user.role);
    const changeRole = useChangeUserRole();

    React.useEffect(() => {
        if (isOpen) setRole(user.role);
    }, [isOpen, user.role]);

    const unchanged = role === user.role;

    const handleConfirm = () => {
        if (unchanged) return;
        changeRole.mutate(
            { userId: user.id, role },
            { onSuccess: () => onClose() },
        );
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(d) => !d.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    bg="white"
                    borderRadius="xl"
                    maxW="md"
                    w="full"
                    mx={4}
                    p={6}
                >
                    <HStack justify="space-between" align="start" mb={4}>
                        <Text fontSize="md" fontWeight="bold" color="gray.900">
                            Change role
                        </Text>
                        <IconButton
                            aria-label="Close"
                            size="xs"
                            variant="ghost"
                            onClick={onClose}
                        >
                            <MdClose />
                        </IconButton>
                    </HStack>

                    <VStack align="stretch" gap={4}>
                        <Stack gap={1}>
                            <Text fontSize="xs" color="gray.500">
                                Reassign <strong>{user.name}</strong> ({user.email}) to a different role.
                                Currently <strong>{roleLabel(user.role)}</strong>.
                            </Text>
                            <Text fontSize="11px" color="gray.400">
                                Admin promotions go through Admin Management, not this dialog.
                            </Text>
                        </Stack>

                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
                                New role
                            </Text>
                            <Select
                                options={ASSIGNABLE_ROLES}
                                value={role}
                                onChange={(v) => setRole(v)}
                                width="100%"
                            />
                        </Box>

                        <HStack justify="end" gap={2} pt={2}>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onClose}
                                disabled={changeRole.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                colorPalette="red"
                                onClick={handleConfirm}
                                disabled={unchanged || changeRole.isPending}
                                loading={changeRole.isPending}
                            >
                                Change role
                            </Button>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
