import { useMemo } from "react";

export type UserRole = "artist" | "dj" | "creator" | "record_label";

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
}

const rolePermissions: Record<UserRole, Permission> = {
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

export const usePermission = (role?: UserRole) => {
  const permissions = useMemo(() => {
    if (!role) return null;
    return rolePermissions[role];
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
