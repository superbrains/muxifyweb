import { create } from "zustand";
import type {
  DashboardStats,
  RecentSale,
  PerformanceData,
} from "../services/dashboardService";

interface DashboardState {
  stats: DashboardStats | null;
  recentSales: RecentSale[];
  performanceData: PerformanceData[];
  isLoading: boolean;
  setStats: (stats: DashboardStats) => void;
  setRecentSales: (sales: RecentSale[]) => void;
  setPerformanceData: (data: PerformanceData[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  recentSales: [],
  performanceData: [],
  isLoading: false,
  setStats: (stats) => set({ stats }),
  setRecentSales: (recentSales) => set({ recentSales }),
  setPerformanceData: (performanceData) => set({ performanceData }),
  setLoading: (isLoading) => set({ isLoading }),
}));
