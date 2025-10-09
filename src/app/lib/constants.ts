export const APP_CONFIG = {
  name: "Muxify",
  version: "1.0.0",
  description: "Music distribution and management platform",
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  user: {
    profile: "/user/profile",
    updateProfile: "/user/profile",
    uploadAvatar: "/user/avatar",
  },
  music: {
    upload: "/music/upload",
    list: "/music",
    delete: "/music",
    update: "/music",
  },
  video: {
    upload: "/video/upload",
    list: "/video",
    delete: "/video",
    update: "/video",
  },
  dashboard: {
    stats: "/dashboard/stats",
    recentActivity: "/dashboard/recent-activity",
  },
  earnings: {
    list: "/earnings",
    summary: "/earnings/summary",
  },
  leaderboard: {
    list: "/leaderboard",
  },
  fans: {
    list: "/fans",
    subscribers: "/fans/subscribers",
  },
  sales: {
    report: "/sales/report",
    export: "/sales/export",
  },
  payments: {
    list: "/payments",
    methods: "/payments/methods",
  },
  artists: {
    list: "/artists",
    add: "/artists",
    update: "/artists",
    delete: "/artists",
  },
} as const;

export const FILE_TYPES = {
  audio: ["mp3", "wav", "flac", "aac", "m4a"],
  video: ["mp4", "avi", "mov", "wmv", "mkv"],
  image: ["jpg", "jpeg", "png", "gif", "webp"],
} as const;

export const MAX_FILE_SIZES = {
  audio: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  image: 5 * 1024 * 1024, // 5MB
} as const;
