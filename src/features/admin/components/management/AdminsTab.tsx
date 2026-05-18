import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { CustomMenu } from '@shared/components';
import { useUserStore } from '@app/store/useUserStore';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { AdminError, AdminLoading } from '../AdminStateBlock';
import { IdentityCell } from '../IdentityCell';
import { StatusBadge } from '../StatusBadge';
import { accountStatusStyle } from '../../lib/statusColor';
import { adminDate } from '../../lib/format';
import { InviteAdminModal } from './InviteAdminModal';
import { AdminDetailModal } from './AdminDetailModal';
import {
    useAdmins,
    useHasPermission,
    useInvitations,
    useResendInvitation,
    useRevokeInvitation,
} from '../../hooks/useAdminManagement';
import type {
    AdminInvitationDto,
    AdminListItemDto,
} from '../../services/adminManagementService';

const RolePill: React.FC<{ label: string; emphasized?: boolean }> = ({ label, emphasized }) => (
    <Text
        fontSize="10px"
        fontWeight="semibold"
        color={emphasized ? 'primary.600' : 'gray.600'}
        bg={emphasized ? 'primary.50' : 'gray.100'}
        px={2}
        py={1}
        borderRadius="full"
        w="fit-content"
    >
        {label}
    </Text>
);

/** "Admins" tab — staff accounts plus pending invitations. */
export const AdminsTab: React.FC = () => {
    const currentUserId = useUserStore((s) => s.user?.id ?? null);
    const canManage = useHasPermission('ManagementManageAdmins');

    const admins = useAdmins();
    const invitations = useInvitations();
    const resend = useResendInvitation();
    const revoke = useRevokeInvitation();

    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [detailUserId, setDetailUserId] = React.useState<string | null>(null);

    const adminColumns: AdminTableColumn<AdminListItemDto>[] = [
        {
            key: 'admin',
            header: 'Admin',
            render: (a) => (
                <IdentityCell name={a.name} secondary={a.email} avatarUrl={a.avatarUrl ?? undefined} />
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (a) => (
                <RolePill
                    label={a.isSuperAdmin ? 'Super Admin' : a.roleName ?? 'No role'}
                    emphasized={a.isSuperAdmin}
                />
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (a) => <StatusBadge style={accountStatusStyle(a.status as never)} />,
        },
        {
            key: 'joined',
            header: 'Joined',
            render: (a) => (
                <Text fontSize="xs" color="gray.600">
                    {adminDate(a.createdAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '56px',
            render: (a) =>
                canManage ? (
                    <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                        <CustomMenu
                            options={[
                                {
                                    label: 'Manage admin',
                                    value: 'manage',
                                    onClick: () => setDetailUserId(a.userId),
                                },
                            ]}
                        />
                    </Box>
                ) : null,
        },
    ];

    const invitationColumns: AdminTableColumn<AdminInvitationDto>[] = [
        {
            key: 'email',
            header: 'Invitee',
            render: (i) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {i.email}
                </Text>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (i) => <RolePill label={i.roleName} />,
        },
        {
            key: 'invitedBy',
            header: 'Invited by',
            render: (i) => (
                <Text fontSize="xs" color="gray.600">
                    {i.inviterName}
                </Text>
            ),
        },
        {
            key: 'expires',
            header: 'Expires',
            render: (i) => (
                <Text fontSize="xs" color="gray.600">
                    {adminDate(i.expiresAt)}
                </Text>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '56px',
            render: (i) =>
                canManage ? (
                    <Box onClick={(e) => e.stopPropagation()} display="inline-block">
                        <CustomMenu
                            options={[
                                {
                                    label: 'Resend invitation',
                                    value: 'resend',
                                    onClick: () => resend.mutate(i.id),
                                },
                                {
                                    label: 'Revoke invitation',
                                    value: 'revoke',
                                    color: '#C53030',
                                    onClick: () => revoke.mutate(i.id),
                                },
                            ]}
                        />
                    </Box>
                ) : null,
        },
    ];

    return (
        <VStack align="stretch" gap={5}>
            <Box>
                <HStack justify="space-between" mb={3}>
                    <Text fontSize="11px" color="gray.600">
                        Everyone with access to the admin console.
                    </Text>
                    {canManage && (
                        <Button
                            onClick={() => setInviteOpen(true)}
                            size="xs"
                            bg="primary.500"
                            color="white"
                            fontSize="xs"
                            borderRadius="8px"
                            _hover={{ bg: 'primary.600' }}
                        >
                            <FiPlus />
                            Invite admin
                        </Button>
                    )}
                </HStack>

                {admins.isLoading && !admins.data ? (
                    <AdminLoading />
                ) : admins.error ? (
                    <AdminError error={admins.error} message="Could not load admins." />
                ) : (
                    <AdminTable
                        columns={adminColumns}
                        rows={admins.data ?? []}
                        rowKey={(a) => a.userId}
                        onRowClick={canManage ? (a) => setDetailUserId(a.userId) : undefined}
                        emptyTitle="No admins yet"
                        emptyDescription="Invite your first staff member to get started."
                    />
                )}
            </Box>

            {(invitations.data?.length ?? 0) > 0 && (
                <Box>
                    <Text
                        fontSize="11px"
                        fontWeight="semibold"
                        color="gray.700"
                        textTransform="uppercase"
                        letterSpacing="0.4px"
                        mb={2}
                    >
                        Pending invitations
                    </Text>
                    <AdminTable
                        columns={invitationColumns}
                        rows={invitations.data ?? []}
                        rowKey={(i) => i.id}
                        emptyTitle="No pending invitations"
                    />
                </Box>
            )}

            <InviteAdminModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
            <AdminDetailModal
                userId={detailUserId}
                onClose={() => setDetailUserId(null)}
                currentUserId={currentUserId}
            />
        </VStack>
    );
};
