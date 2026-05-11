import { useMemo } from "react";
import type { UserRole } from "@shared/types/user";

export type { UserRole };

type CreatorRole = Extract<UserRole, "artist" | "dj" | "creator" | "record_label">;

interface Permission {
  canUploadMusic: boolean;
  canUploadVideo: boolean;
  canViewEarnings: boolean;
  canViewLeaderboard: boolean;
  canViewFans: boolean;
  canViewSales: boolean;
  canViewPayments: boolean;
  canAddArtists: boolean;
  canViewSettings: boolean;
  // Record-label specific
  canManageRoster: boolean;
  canInviteArtists: boolean;
  canManageSplits: boolean;
  canTriggerPayouts: boolean;
  canViewLabelAnalytics: boolean;
  canUploadOnBehalfOfArtist: boolean;
}

const emptyPermissions: Permission = {
  canUploadMusic: false,
  canUploadVideo: false,
  canViewEarnings: false,
  canViewLeaderboard: false,
  canViewFans: false,
  canViewSales: false,
  canViewPayments: false,
  canAddArtists: false,
  canViewSettings: false,
  canManageRoster: false,
  canInviteArtists: false,
  canManageSplits: false,
  canTriggerPayouts: false,
  canViewLabelAnalytics: false,
  canUploadOnBehalfOfArtist: false,
};

const rolePermissions: Record<CreatorRole, Permission> = {
  artist: {
    ...emptyPermissions,
    canUploadMusic: true,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
    canViewSettings: true,
  },
  dj: {
    ...emptyPermissions,
    canUploadMusic: true,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
    canViewSettings: true,
  },
  creator: {
    ...emptyPermissions,
    canUploadVideo: true,
    canViewEarnings: true,
    canViewLeaderboard: true,
    canViewFans: true,
    canViewSales: true,
    canViewPayments: true,
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
    canManageRoster: true,
    canInviteArtists: true,
    canManageSplits: true,
    // canTriggerPayouts is server-enforced against VerificationStatus === Verified;
    // we keep the role-level flag true and let the dashboard read the cached
    // summary to disable the UI when verification isn't approved yet.
    canTriggerPayouts: true,
    canViewLabelAnalytics: true,
    canUploadOnBehalfOfArtist: true,
  },
};

export const usePermission = (role?: UserRole) => {
  const permissions = useMemo(() => {
    if (!role) return null;
    if (role in rolePermissions) {
      return rolePermissions[role as CreatorRole];
    }
    return emptyPermissions;
  }, [role]);

  const hasPermission = (permission: keyof Permission) => {
    return permissions?.[permission] ?? false;
  };

  const canAccessRoute = (route: string) => {
    if (!permissions) return false;

    switch (route) {
      case "/upload-music":
        return permissions.canUploadMusic;
      case "/upload-video":
        return permissions.canUploadVideo;
      case "/earning-royalty":
        return permissions.canViewEarnings;
      case "/leaderboard":
        return permissions.canViewLeaderboard;
      case "/fans-subscribers":
        return permissions.canViewFans;
      case "/sales-report":
        return permissions.canViewSales;
      case "/payments":
        return permissions.canViewPayments;
      case "/add-artist":
        return permissions.canAddArtists;
      case "/settings":
        return permissions.canViewSettings;
      case "/label/roster":
        return permissions.canManageRoster;
      case "/label/releases":
        return permissions.canManageRoster;
      case "/label/splits":
        return permissions.canManageSplits;
      case "/label/payouts":
        return permissions.canTriggerPayouts;
      case "/label/analytics":
        return permissions.canViewLabelAnalytics;
      case "/label/settings":
        return permissions.canManageRoster;
      default:
        return true;
    }
  };

  return {
    permissions,
    hasPermission,
    canAccessRoute,
  };
};
