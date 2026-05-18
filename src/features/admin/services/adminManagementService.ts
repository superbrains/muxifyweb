import { api } from '@shared/services/api';
import type { PagedResult } from '../types';

/* ------------------------------------------------------------------ *
 * Admin Management types — mirror the backend DTOs in
 * `Muxify.Api/Services/Admin/AdminManagementDtos.cs`.
 * ------------------------------------------------------------------ */

/** A single permission with display metadata. */
export interface PermissionDto {
    code: string;
    displayName: string;
    group: string;
    description: string;
}

/** Permissions grouped by console area, for the role editor's picker. */
export interface PermissionGroupDto {
    group: string;
    permissions: PermissionDto[];
}

/** A custom or system admin role. */
export interface AdminRoleDto {
    id: string;
    name: string;
    description?: string | null;
    isSystemRole: boolean;
    isActive: boolean;
    permissions: string[];
    assignedUserCount: number;
    createdAt: string;
}

/** A staff account in the admins list. */
export interface AdminListItemDto {
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    roleId?: string | null;
    roleName?: string | null;
    isSuperAdmin: boolean;
    status: string;
    createdAt: string;
    lastActiveAt?: string | null;
}

/** A staff account with its resolved permission breakdown. */
export interface AdminDetailDto extends AdminListItemDto {
    rolePermissions: string[];
    delegatedPermissions: string[];
    effectivePermissions: string[];
}

/** A pending admin invitation. */
export interface AdminInvitationDto {
    id: string;
    email: string;
    roleId: string;
    roleName: string;
    status: string;
    inviterName: string;
    expiresAt: string;
    createdAt: string;
}

/** An entry in the admin activity feed. */
export interface AdminAuditLogDto {
    id: string;
    actorName: string;
    action: string;
    targetType: string;
    summary: string;
    createdAt: string;
}

/** The caller's own effective admin permissions (for UI gating). */
export interface MyPermissionsDto {
    isSuperAdmin: boolean;
    isStaff: boolean;
    permissions: string[];
}

/** Public pre-auth view of an invitation token. */
export interface InvitationLookupDto {
    email: string;
    roleName: string;
    status: string;
    isValid: boolean;
    expiresAt: string;
}

export interface CreateRolePayload {
    name: string;
    description?: string;
    permissions: string[];
}

export interface InviteAdminPayload {
    email: string;
    roleId: string;
    personalNote?: string;
}

export interface AcceptAdminInvitationPayload {
    token: string;
    fullName: string;
    password: string;
}

/* ------------------------------------------------------------------ *
 * Service
 * ------------------------------------------------------------------ */

const BASE = '/admin/management';

/**
 * Typed client for the Admin Management API (`/api/v1/admin/management/*`)
 * plus the public invitation-accept endpoints. The backend enforces a
 * granular `perm:*` policy on every management route — this client is the
 * contract; UI gating via {@link MyPermissionsDto} is UX only.
 */
export const adminManagementService = {
    /* ----------------------------- Permissions ---------------------------- */
    getPermissionCatalog: async (): Promise<PermissionGroupDto[]> => {
        const { data } = await api.get<PermissionGroupDto[]>(`${BASE}/permissions`);
        return data;
    },
    getMyPermissions: async (): Promise<MyPermissionsDto> => {
        const { data } = await api.get<MyPermissionsDto>('/admin/me/permissions');
        return data;
    },

    /* -------------------------------- Roles -------------------------------- */
    getRoles: async (): Promise<AdminRoleDto[]> => {
        const { data } = await api.get<AdminRoleDto[]>(`${BASE}/roles`);
        return data;
    },
    createRole: async (payload: CreateRolePayload): Promise<AdminRoleDto> => {
        const { data } = await api.post<AdminRoleDto>(`${BASE}/roles`, payload);
        return data;
    },
    updateRole: async (roleId: string, payload: CreateRolePayload): Promise<AdminRoleDto> => {
        const { data } = await api.put<AdminRoleDto>(`${BASE}/roles/${roleId}`, payload);
        return data;
    },
    deleteRole: async (roleId: string): Promise<void> => {
        await api.delete(`${BASE}/roles/${roleId}`);
    },

    /* -------------------------------- Admins ------------------------------- */
    getAdmins: async (): Promise<AdminListItemDto[]> => {
        const { data } = await api.get<AdminListItemDto[]>(`${BASE}/admins`);
        return data;
    },
    getAdmin: async (userId: string): Promise<AdminDetailDto> => {
        const { data } = await api.get<AdminDetailDto>(`${BASE}/admins/${userId}`);
        return data;
    },
    changeAdminRole: async (userId: string, roleId: string): Promise<void> => {
        await api.put(`${BASE}/admins/${userId}/role`, { roleId });
    },
    addDelegation: async (userId: string, permission: string): Promise<void> => {
        await api.post(`${BASE}/admins/${userId}/delegations`, { permission });
    },
    removeDelegation: async (userId: string, permission: string): Promise<void> => {
        await api.delete(`${BASE}/admins/${userId}/delegations/${permission}`);
    },
    revokeAdminAccess: async (userId: string): Promise<void> => {
        await api.post(`${BASE}/admins/${userId}/revoke`);
    },

    /* ----------------------------- Invitations ----------------------------- */
    getInvitations: async (): Promise<AdminInvitationDto[]> => {
        const { data } = await api.get<AdminInvitationDto[]>(`${BASE}/invitations`);
        return data;
    },
    inviteAdmin: async (payload: InviteAdminPayload): Promise<AdminInvitationDto> => {
        const { data } = await api.post<AdminInvitationDto>(`${BASE}/invitations`, payload);
        return data;
    },
    resendInvitation: async (invitationId: string): Promise<void> => {
        await api.post(`${BASE}/invitations/${invitationId}/resend`);
    },
    revokeInvitation: async (invitationId: string): Promise<void> => {
        await api.post(`${BASE}/invitations/${invitationId}/revoke`);
    },

    /* -------------------------------- Audit -------------------------------- */
    getAuditLog: async (page: number, pageSize: number): Promise<PagedResult<AdminAuditLogDto>> => {
        const { data } = await api.get<PagedResult<AdminAuditLogDto>>(`${BASE}/audit`, {
            params: { page, pageSize },
        });
        return data;
    },

    /* --------------------- Public invitation accept ----------------------- */
    lookupAdminInvitation: async (token: string): Promise<InvitationLookupDto> => {
        const { data } = await api.get<InvitationLookupDto>('/admin-invitations/lookup', {
            params: { token },
        });
        return data;
    },
    acceptAdminInvitation: async (payload: AcceptAdminInvitationPayload): Promise<unknown> => {
        const { data } = await api.post('/admin-invitations/accept', payload);
        return data;
    },
};
