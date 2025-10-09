import { api } from "@shared/services/api";

export interface DashboardStats {
  totalEarnings: number;
  totalPlays: number;
  totalFollowers: number;
  totalUploads: number;
  earningsChange: number;
  playsChange: number;
  followersChange: number;
  uploadsChange: number;
}

export interface RecentSale {
  id: string;
  track: string;
  platform: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface PerformanceData {
  date: string;
  streams: number;
  followers: number;
  revenue: number;
}

export const dashboardService = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats"),
  getRecentSales: () => api.get<RecentSale[]>("/dashboard/recent-sales"),
  getPerformanceData: (period: "7d" | "30d" | "90d") =>
    api.get<PerformanceData[]>(`/dashboard/performance?period=${period}`),
};
