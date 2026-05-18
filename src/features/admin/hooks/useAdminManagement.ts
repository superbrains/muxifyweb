import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { useIsAdmin } from '@app/hooks/useIsAdmin';
import {
    adminManagementService,
    type CreateRolePayload,
    type InviteAdminPayload,
} from '../services/adminManagementService';
import { adminKeys } from './adminKeys';

/* ------------------------------- Permissions ------------------------------ */

/**
 * The signed-in admin's effective permissions. Drives UI gating (nav item,
 * tabs, action buttons). Backed by `GET /admin/me/permissions`.
 */
export const useMyPermissions = () => {
    const isAdmin = useIsAdmin();
    return useQuery({
        queryKey: adminKeys.myPermissions,
        queryFn: adminManagementService.getMyPermissions,
        enabled: isAdmin,
        staleTime: 60_000,
    });
};

/** True when the current admin holds the given permission (super admins: always). */
export const useHasPermission = (permission: string): boolean => {
    const { data } = useMyPermissions();
    if (!data) return false;
    return data.isSuperAdmin || data.permissions.includes(permission);
};

export const usePermissionCatalog = () =>
    useQuery({
        queryKey: adminKeys.permissionCatalog,
        queryFn: adminManagementService.getPermissionCatalog,
        staleTime: 5 * 60_000,
    });

/* ---------------------------------- Roles --------------------------------- */

export const useRoles = () =>
    useQuery({
        queryKey: adminKeys.roles,
        queryFn: adminManagementService.getRoles,
        staleTime: 30_000,
    });

export const useCreateRole = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: CreateRolePayload) => adminManagementService.createRole(payload),
        onSuccess: (role) => {
            toast.success('Role created', `“${role.name}” is ready to assign.`);
            qc.invalidateQueries({ queryKey: adminKeys.roles });
        },
        onError: (err) =>
            toast.error('Could not create role', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useUpdateRole = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ roleId, payload }: { roleId: string; payload: CreateRolePayload }) =>
            adminManagementService.updateRole(roleId, payload),
        onSuccess: (role) => {
            toast.success('Role updated', `“${role.name}” has been saved.`);
            qc.invalidateQueries({ queryKey: adminKeys.roles });
            qc.invalidateQueries({ queryKey: adminKeys.admins });
        },
        onError: (err) =>
            toast.error('Could not update role', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useDeleteRole = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (roleId: string) => adminManagementService.deleteRole(roleId),
        onSuccess: () => {
            toast.success('Role deleted', 'The role has been removed.');
            qc.invalidateQueries({ queryKey: adminKeys.roles });
        },
        onError: (err) =>
            toast.error('Could not delete role', getApiErrorMessage(err, 'Please try again.')),
    });
};

/* --------------------------------- Admins --------------------------------- */

export const useAdmins = () =>
    useQuery({
        queryKey: adminKeys.admins,
        queryFn: adminManagementService.getAdmins,
        staleTime: 30_000,
    });

export const useAdmin = (userId: string | null) =>
    useQuery({
        queryKey: adminKeys.adminDetail(userId ?? ''),
        queryFn: () => adminManagementService.getAdmin(userId as string),
        enabled: !!userId,
    });

const useAdminMutation = <TArgs>(
    mutationFn: (args: TArgs) => Promise<unknown>,
    success: string,
    failure: string,
    targetUserId?: (args: TArgs) => string,
) => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn,
        onSuccess: (_data, args) => {
            toast.success(success);
            qc.invalidateQueries({ queryKey: adminKeys.admins });
            qc.invalidateQueries({ queryKey: adminKeys.audit() });
            if (targetUserId)
                qc.invalidateQueries({ queryKey: adminKeys.adminDetail(targetUserId(args)) });
        },
        onError: (err) => toast.error(failure, getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useChangeAdminRole = () =>
    useAdminMutation(
        ({ userId, roleId }: { userId: string; roleId: string }) =>
            adminManagementService.changeAdminRole(userId, roleId),
        'Role updated for this admin.',
        'Could not change role',
        (a) => a.userId,
    );

export const useAddDelegation = () =>
    useAdminMutation(
        ({ userId, permission }: { userId: string; permission: string }) =>
            adminManagementService.addDelegation(userId, permission),
        'Permission delegated.',
        'Could not delegate permission',
        (a) => a.userId,
    );

export const useRemoveDelegation = () =>
    useAdminMutation(
        ({ userId, permission }: { userId: string; permission: string }) =>
            adminManagementService.removeDelegation(userId, permission),
        'Delegated permission removed.',
        'Could not remove permission',
        (a) => a.userId,
    );

export const useRevokeAdminAccess = () =>
    useAdminMutation(
        ({ userId }: { userId: string }) => adminManagementService.revokeAdminAccess(userId),
        'Admin access revoked.',
        'Could not revoke access',
        (a) => a.userId,
    );

/* ------------------------------- Invitations ------------------------------ */

export const useInvitations = () =>
    useQuery({
        queryKey: adminKeys.invitations,
        queryFn: adminManagementService.getInvitations,
        staleTime: 30_000,
    });

export const useInviteAdmin = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (payload: InviteAdminPayload) => adminManagementService.inviteAdmin(payload),
        onSuccess: (invitation) => {
            toast.success('Invitation sent', `${invitation.email} will receive a setup link.`);
            qc.invalidateQueries({ queryKey: adminKeys.invitations });
            qc.invalidateQueries({ queryKey: adminKeys.audit() });
        },
        onError: (err) =>
            toast.error('Could not send invitation', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useResendInvitation = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (invitationId: string) => adminManagementService.resendInvitation(invitationId),
        onSuccess: () => {
            toast.success('Invitation resent', 'A fresh setup link is on its way.');
            qc.invalidateQueries({ queryKey: adminKeys.invitations });
        },
        onError: (err) =>
            toast.error('Could not resend invitation', getApiErrorMessage(err, 'Please try again.')),
    });
};

export const useRevokeInvitation = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (invitationId: string) => adminManagementService.revokeInvitation(invitationId),
        onSuccess: () => {
            toast.success('Invitation revoked', 'The setup link no longer works.');
            qc.invalidateQueries({ queryKey: adminKeys.invitations });
        },
        onError: (err) =>
            toast.error('Could not revoke invitation', getApiErrorMessage(err, 'Please try again.')),
    });
};

/* ---------------------------------- Audit --------------------------------- */

export const useAuditLog = (page: number, pageSize: number) =>
    useQuery({
        queryKey: adminKeys.audit({ page, pageSize }),
        queryFn: () => adminManagementService.getAuditLog(page, pageSize),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
    });
