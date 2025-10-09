import type { UserRole } from "./roles";

export interface Permission {
  canUploadMusic: boolean;
  canUploadVideo: boolean;
  canViewEarnings: boolean;
  canViewLeaderboard: boolean;
  canViewFans: boolean;
  canViewSales: boolean;
  canViewPayments: boolean;
  canAddArtists: boolean;
  canViewSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  artist: {
    canUploadMusic: true,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
    canAddArtists: false,
    canViewSettings: true,
  },
  dj: {
    canUploadMusic: true,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
    canAddArtists: false,
    canViewSettings: true,
  },
  creator: {
    canUploadMusic: false,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
    canAddArtists: false,
    canViewSettings: true,
  },
  record_label: {
    canUploadMusic: true,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
    canAddArtists: true,
    canViewSettings: true,
  },
};

export const getPermissions = (role: UserRole): Permission => {
  return ROLE_PERMISSIONS[role];
};

export const hasPermission = (
  role: UserRole,
  permission: keyof Permission
): boolean => {
  const permissions = getPermissions(role);
  return permissions[permission];
};
