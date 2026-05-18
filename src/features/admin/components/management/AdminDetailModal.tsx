import React from 'react';
import { Box, Button, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { ConfirmModal } from '@shared/components';
import { ManagementDialog } from './ManagementDialog';
import {
    useAddDelegation,
    useAdmin,
    useChangeAdminRole,
    usePermissionCatalog,
    useRemoveDelegation,
    useRevokeAdminAccess,
    useRoles,
} from '../../hooks/useAdminManagement';

interface AdminDetailModalProps {
    userId: string | null;
    onClose: () => void;
    /** The signed-in admin's id — used to block self-revoke / self-demotion. */
    currentUserId: string | null;
}

const selectStyles: React.CSSProperties = {
    flex: 1,
    width: '100%',
    fontSize: '12px',
    padding: '7px 9px',
    borderRadius: '8px',
    border: '1px solid var(--chakra-colors-gray-200)',
    background: 'white',
    color: 'var(--chakra-colors-gray-800)',
};

const PermPill: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => (
    <HStack
        gap={1}
        bg={onRemove ? 'primary.50' : 'gray.100'}
        color={onRemove ? 'primary.600' : 'gray.600'}
        fontSize="10px"
        fontWeight="medium"
        px={2}
        py={1}
        borderRadius="full"
    >
        <Text>{label}</Text>
        {onRemove && (
            <Icon
                as={FiX}
                boxSize={3}
                cursor="pointer"
                onClick={onRemove}
                _hover={{ color: 'primary.700' }}
            />
        )}
    </HStack>
);

/** Detail + management surface for a single staff account. */
export const AdminDetailModal: React.FC<AdminDetailModalProps> = ({
    userId,
    onClose,
    currentUserId,
}) => {
    const { data: admin, isLoading } = useAdmin(userId);
    const { data: roles } = useRoles();
    const { data: catalog } = usePermissionCatalog();
    const changeRole = useChangeAdminRole();
    const addDelegation = useAddDelegation();
    const removeDelegation = useRemoveDelegation();
    const revoke = useRevokeAdminAccess();

    const [roleId, setRoleId] = React.useState('');
    const [delegateCode, setDelegateCode] = React.useState('');
    const [confirmRevoke, setConfirmRevoke] = React.useState(false);

    React.useEffect(() => {
        setRoleId(admin?.roleId ?? '');
        setDelegateCode('');
    }, [admin?.roleId, admin?.userId]);

    const labelFor = React.useMemo(() => {
        const map = new Map<string, string>();
        catalog?.forEach((g) => g.permissions.forEach((p) => map.set(p.code, p.displayName)));
        return (code: string) => map.get(code) ?? code;
    }, [catalog]);

    const isSelf = !!admin && admin.userId === currentUserId;
    const roleChanged = !!admin && roleId !== (admin.roleId ?? '');

    const delegatableCodes = React.useMemo(() => {
        if (!admin || !catalog) return [];
        const held = new Set([...admin.rolePermissions, ...admin.delegatedPermissions]);
        return catalog
            .flatMap((g) => g.permissions)
            .filter((p) => !held.has(p.code));
    }, [admin, catalog]);

    return (
        <>
            <ManagementDialog
                isOpen={userId !== null}
                onClose={onClose}
                title="Admin details"
                subtitle="Adjust this admin's role, delegate extra permissions, or revoke access."
                maxW="560px"
            >
                {isLoading || !admin ? (
                    <HStack justify="center" py={8}>
                        <Spinner size="md" color="primary.500" />
                    </HStack>
                ) : (
                    <>
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                {admin.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {admin.email}
                            </Text>
                            <HStack gap={2} mt={2}>
                                <PermPill label={admin.isSuperAdmin ? 'Super Admin' : admin.roleName ?? 'No role'} />
                                <PermPill label={admin.status} />
                            </HStack>
                        </Box>

                        {/* Change role */}
                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Role
                            </Text>
                            <HStack gap={2}>
                                <select
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                    style={selectStyles}
                                >
                                    <option value="">No role</option>
                                    {(roles ?? []).map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                            {r.isSystemRole ? ' (full access)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    bg="primary.500"
                                    color="white"
                                    disabled={!roleChanged || !roleId || changeRole.isPending}
                                    _hover={{ bg: 'primary.600' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                    onClick={() =>
                                        admin &&
                                        changeRole.mutate({ userId: admin.userId, roleId })
                                    }
                                >
                                    {changeRole.isPending ? <Spinner size="xs" /> : 'Update'}
                                </Button>
                            </HStack>
                            {isSelf && (
                                <Text fontSize="10px" color="gray.400" mt={1}>
                                    You cannot remove your own Super Admin access.
                                </Text>
                            )}
                        </Box>

                        {/* Role permissions */}
                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                From role {admin.isSuperAdmin && '(full access)'}
                            </Text>
                            <HStack gap={1.5} flexWrap="wrap">
                                {admin.isSuperAdmin ? (
                                    <PermPill label="All permissions" />
                                ) : admin.rolePermissions.length === 0 ? (
                                    <Text fontSize="10px" color="gray.400">
                                        No permissions from role.
                                    </Text>
                                ) : (
                                    admin.rolePermissions.map((c) => (
                                        <PermPill key={c} label={labelFor(c)} />
                                    ))
                                )}
                            </HStack>
                        </Box>

                        {/* Delegated permissions */}
                        {!admin.isSuperAdmin && (
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Delegated directly
                                </Text>
                                <HStack gap={1.5} flexWrap="wrap" mb={2}>
                                    {admin.delegatedPermissions.length === 0 ? (
                                        <Text fontSize="10px" color="gray.400">
                                            No extra permissions delegated.
                                        </Text>
                                    ) : (
                                        admin.delegatedPermissions.map((c) => (
                                            <PermPill
                                                key={c}
                                                label={labelFor(c)}
                                                onRemove={() =>
                                                    removeDelegation.mutate({
                                                        userId: admin.userId,
                                                        permission: c,
                                                    })
                                                }
                                            />
                                        ))
                                    )}
                                </HStack>
                                <HStack gap={2}>
                                    <select
                                        value={delegateCode}
                                        onChange={(e) => setDelegateCode(e.target.value)}
                                        style={selectStyles}
                                    >
                                        <option value="">Delegate a permission…</option>
                                        {delegatableCodes.map((p) => (
                                            <option key={p.code} value={p.code}>
                                                {p.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        size="sm"
                                        fontSize="xs"
                                        borderRadius="10px"
                                        variant="outline"
                                        borderColor="primary.500"
                                        color="primary.500"
                                        disabled={!delegateCode || addDelegation.isPending}
                                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                        onClick={() => {
                                            addDelegation.mutate(
                                                { userId: admin.userId, permission: delegateCode },
                                                { onSuccess: () => setDelegateCode('') },
                                            );
                                        }}
                                    >
                                        {addDelegation.isPending ? <Spinner size="xs" /> : 'Add'}
                                    </Button>
                                </HStack>
                            </Box>
                        )}

                        {/* Revoke */}
                        <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
                            <VStack align="stretch" gap={1}>
                                <Button
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    variant="outline"
                                    borderColor="red.300"
                                    color="red.600"
                                    disabled={isSelf || revoke.isPending}
                                    _hover={{ bg: 'red.50' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                    onClick={() => setConfirmRevoke(true)}
                                >
                                    Revoke admin access
                                </Button>
                                <Text fontSize="10px" color="gray.400">
                                    Removes all admin access and suspends the staff account.
                                </Text>
                            </VStack>
                        </Box>
                    </>
                )}
            </ManagementDialog>

            <ConfirmModal
                isOpen={confirmRevoke}
                onClose={() => setConfirmRevoke(false)}
                onConfirm={() => {
                    if (!admin) return;
                    revoke.mutate(
                        { userId: admin.userId },
                        {
                            onSuccess: () => {
                                setConfirmRevoke(false);
                                onClose();
                            },
                        },
                    );
                }}
                title="Revoke admin access?"
                message={`${admin?.name ?? 'This admin'} will lose all console access and their account will be suspended.`}
                confirmText="Revoke access"
                confirmColor="red"
                isLoading={revoke.isPending}
            />
        </>
    );
};
