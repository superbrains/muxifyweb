import { create } from "zustand";
import type {
  DashboardStatsDto,
  RecentSalesDto,
  DashboardAnalyticsDto,
  TopTracksDto,
  AnalyticsPeriod,
  // Legacy types for backward compatibility
  DashboardStats,
  RecentSale,
  PerformanceData,
} from "../services/dashboardService";

interface DashboardState {
  // New API response types
  statsDto: DashboardStatsDto | null;
  recentSalesDto: RecentSalesDto | null;
  analyticsDto: DashboardAnalyticsDto | null;
  topTracksDto: TopTracksDto | null;

  // Legacy types for backward compatibility
  stats: DashboardStats | null;
  recentSales: RecentSale[];
  performanceData: PerformanceData[];

  // UI state
  isLoading: boolean;
  selectedPeriod: AnalyticsPeriod;
  error: string | null;

  // New setters
  setStatsDto: (stats: DashboardStatsDto) => void;
  setRecentSalesDto: (sales: RecentSalesDto) => void;
  setAnalyticsDto: (analytics: DashboardAnalyticsDto) => void;
  setTopTracksDto: (tracks: TopTracksDto) => void;
  setSelectedPeriod: (period: AnalyticsPeriod) => void;
  setError: (error: string | null) => void;

  // Legacy setters for backward compatibility
  setStats: (stats: DashboardStats) => void;
  setRecentSales: (sales: RecentSale[]) => void;
  setPerformanceData: (data: PerformanceData[]) => void;
  setLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  statsDto: null,
  recentSalesDto: null,
  analyticsDto: null,
  topTracksDto: null,
  stats: null,
  recentSales: [],
  performanceData: [],
  isLoading: false,
  selectedPeriod: "7d" as AnalyticsPeriod,
  error: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  // New setters
  setStatsDto: (statsDto) => set({ statsDto }),
  setRecentSalesDto: (recentSalesDto) => set({ recentSalesDto }),
  setAnalyticsDto: (analyticsDto) => set({ analyticsDto }),
  setTopTracksDto: (topTracksDto) => set({ topTracksDto }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setError: (error) => set({ error }),

  // Legacy setters
  setStats: (stats) => set({ stats }),
  setRecentSales: (recentSales) => set({ recentSales }),
  setPerformanceData: (performanceData) => set({ performanceData }),
  setLoading: (isLoading) => set({ isLoading }),

  // Reset
  reset: () => set(initialState),
}));
