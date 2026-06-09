import React from 'react';
import { Box, Button, Flex, HStack, Input, Spinner, Text, Textarea } from '@chakra-ui/react';
import { ManagementDialog } from './ManagementDialog';
import { PermissionPicker } from './PermissionPicker';
import { useCreateRole, useUpdateRole } from '../../hooks/useAdminManagement';
import { PLATFORM_ROLES, type PlatformRole } from '../../config/adminRoles';
import type { AdminRoleDto } from '../../services/adminManagementService';

const PLATFORM_ROLE_LIST = Object.values(PLATFORM_ROLES);

interface RoleEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Null when creating a new role. */
    role: AdminRoleDto | null;
}

/** Create or edit a custom admin role and its permission set. */
export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({ isOpen, onClose, role }) => {
    const isEdit = !!role;
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [permissions, setPermissions] = React.useState<string[]>([]);
    const [scopedRoles, setScopedRoles] = React.useState<string[]>([]);

    const createRole = useCreateRole();
    const updateRole = useUpdateRole();
    const isPending = createRole.isPending || updateRole.isPending;

    React.useEffect(() => {
        if (!isOpen) return;
        setName(role?.name ?? '');
        setDescription(role?.description ?? '');
        setPermissions(role?.permissions ?? []);
        setScopedRoles(role?.scopedRoles ?? []);
    }, [isOpen, role]);

    const toggleScopedRole = (key: PlatformRole) => {
        setScopedRoles((prev) =>
            prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key],
        );
    };

    const trimmedName = name.trim();
    const canSave = trimmedName.length >= 2 && permissions.length > 0 && !isPending;

    const handleSave = () => {
        if (!canSave) return;
        const payload = { name: trimmedName, description: description.trim(), permissions, scopedRoles };
        if (isEdit && role) {
            updateRole.mutate({ roleId: role.id, payload }, { onSuccess: onClose });
        } else {
            createRole.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <ManagementDialog
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit role' : 'Create a role'}
            subtitle="Bundle permissions into a role you can assign to admins."
            footer={
                <>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        size="sm"
                        fontSize="xs"
                        borderRadius="10px"
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        bg="primary.500"
                        color="white"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="10px"
                        disabled={!canSave}
                        _hover={{ bg: 'primary.600' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        {isPending ? <Spinner size="xs" /> : isEdit ? 'Save changes' : 'Create role'}
                    </Button>
                </>
            }
        >
            <Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                    Role name
                </Text>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Verification Reviewer"
                    fontSize="xs"
                    maxLength={60}
                    autoFocus
                />
            </Box>

            <Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                    Description <Text as="span" color="gray.400" fontWeight="normal">(optional)</Text>
                </Text>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this role for?"
                    rows={2}
                    fontSize="xs"
                    resize="none"
                    maxLength={500}
                />
            </Box>

            <Box>
                <HStack justify="space-between" mb={1.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                        Permissions
                    </Text>
                    <Text fontSize="10px" color={permissions.length ? 'gray.500' : 'primary.500'}>
                        {permissions.length} selected
                    </Text>
                </HStack>
                <PermissionPicker selected={permissions} onChange={setPermissions} />
            </Box>

            <Box>
                <HStack justify="space-between" mb={1.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.700">
                        Operates on roles
                    </Text>
                    <Text fontSize="10px" color={scopedRoles.length ? 'gray.500' : 'primary.500'}>
                        {scopedRoles.length ? `${scopedRoles.length} selected` : 'All roles'}
                    </Text>
                </HStack>
                <Flex flexWrap="wrap" gap={2}>
                    {PLATFORM_ROLE_LIST.map((meta) => {
                        const checked = scopedRoles.includes(meta.role);
                        return (
                            <Box
                                as="button"
                                key={meta.role}
                                onClick={() => toggleScopedRole(meta.role)}
                                px={2.5}
                                py={1.5}
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={checked ? 'primary.500' : 'gray.200'}
                                bg={checked ? 'primary.50' : 'white'}
                                color={checked ? 'primary.600' : 'gray.700'}
                                fontSize="11px"
                                fontWeight={checked ? 'semibold' : 'normal'}
                                transition="all 0.15s"
                                _hover={{ borderColor: checked ? 'primary.500' : 'gray.300' }}
                            >
                                {meta.plural}
                            </Box>
                        );
                    })}
                </Flex>
                <Text fontSize="10px" color="gray.500" mt={1.5}>
                    {scopedRoles.length
                        ? 'This role only operates on the selected platform roles.'
                        : 'No roles selected means this role operates on all platform roles (unrestricted).'}
                </Text>
            </Box>
        </ManagementDialog>
    );
};
