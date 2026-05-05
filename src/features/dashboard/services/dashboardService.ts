import { api } from "@shared/services/api";
import { getApiErrorMessage } from "@shared/lib/errorUtils";

// ============================================================================
// Dashboard Stats DTOs
// ============================================================================

export interface DashboardStatDto {
  value: number;
  formattedValue: string;
  percentChange: number;
  isPositiveChange: boolean;
}

export interface DashboardStatsDto {
  totalEarnings: DashboardStatDto;
  totalPlays: DashboardStatDto;
  totalFollowers: DashboardStatDto;
  totalUploads: DashboardStatDto;
}

// ============================================================================
// Recent Sales DTOs
// ============================================================================

export interface RecentSaleDto {
  id: string;
  type: string;
  description: string;
  amountInSmallestUnit: number;
  amountDisplay: number;
  currency: string;
  buyerId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  trackId?: string;
  trackTitle?: string;
  trackCoverArtUrl?: string;
  transactionDate: string;
}

export interface RecentSalesDto {
  sales: RecentSaleDto[];
  totalCount: number;
}

// ============================================================================
// Analytics DTOs
// ============================================================================

export interface ChartDataPointDto {
  label: string;
  value: number;
}

export interface ChartSeriesDto {
  name: string;
  data: ChartDataPointDto[];
}

export interface DashboardAnalyticsDto {
  period: string;
  startDate: string;
  endDate: string;
  earningsChart: ChartSeriesDto;
  playsChart: ChartSeriesDto;
  followersChart: ChartSeriesDto;
  totalEarnings: number;
  totalEarningsDisplay: number;
  totalPlays: number;
  newFollowers: number;
  totalGiftsReceived: number;
  totalContentUnlocks: number;
}

// ============================================================================
// Top Tracks DTOs
// ============================================================================

export interface TopTrackDto {
  id: string;
  title: string;
  coverArtUrl?: string;
  durationSeconds: number;
  playCount: number;
  likeCount: number;
  shareCount: number;
  earningsAmount: number;
  earningsDisplay: number;
  giftCount: number;
  unlockCount: number;
  percentChange: number;
  releaseDate?: string;
}

export interface TopTracksDto {
  tracks: TopTrackDto[];
  totalCount: number;
  period: string;
}

// ============================================================================
// Unlock Stats DTOs
// ============================================================================

export interface DailyUnlockStatDto {
  count: number;
  earningsAmount: number;
  earningsDisplay: number;
  muxifyCoins: number;
}

export interface UnlockStatsDto {
  today: DailyUnlockStatDto;
  yesterday: DailyUnlockStatDto;
}

// ============================================================================
// Legacy types for backward compatibility (used by existing components)
// ============================================================================

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

// ============================================================================
// Type period options
// ============================================================================

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "1y";
export type TopTracksPeriod = "7d" | "30d" | "90d" | "all-time";

// ============================================================================
// Mapper functions
// ============================================================================

export function mapDashboardStatsToLegacy(dto: DashboardStatsDto): DashboardStats {
  return {
    totalEarnings: dto.totalEarnings.value,
    totalPlays: dto.totalPlays.value,
    totalFollowers: dto.totalFollowers.value,
    totalUploads: dto.totalUploads.value,
    earningsChange: dto.totalEarnings.percentChange,
    playsChange: dto.totalPlays.percentChange,
    followersChange: dto.totalFollowers.percentChange,
    uploadsChange: dto.totalUploads.percentChange,
  };
}

export function mapRecentSalesToLegacy(dto: RecentSalesDto): RecentSale[] {
  return dto.sales.map((sale) => ({
    id: sale.id,
    track: sale.trackTitle || sale.description,
    platform: sale.type,
    amount: sale.amountDisplay,
    date: sale.transactionDate,
    status: "completed" as const,
  }));
}

export function mapAnalyticsToPerformanceData(dto: DashboardAnalyticsDto): PerformanceData[] {
  const playsData = dto.playsChart.data;
  const followersData = dto.followersChart.data;
  const earningsData = dto.earningsChart.data;

  return playsData.map((point, index) => ({
    date: point.label,
    streams: point.value,
    followers: followersData[index]?.value || 0,
    revenue: earningsData[index]?.value || 0,
  }));
}

// ============================================================================
// Dashboard Service
// ============================================================================

export const dashboardService = {
  /**
   * Get dashboard statistics (total earnings, plays, followers, uploads with % changes)
   */
  getStats: () => api.get<DashboardStatsDto>("/dashboard/stats"),

  /**
   * Get recent sales/transactions
   * @param take - Number of records to retrieve (default: 10)
   */
  getRecentSales: (take: number = 10) =>
    api.get<RecentSalesDto>(`/dashboard/recent-sales?take=${take}`),

  /**
   * Get dashboard analytics with chart data
   * @param period - Time period for analytics (7d, 30d, 90d, 1y)
   */
  getAnalytics: (period: AnalyticsPeriod = "7d") =>
    api.get<DashboardAnalyticsDto>(`/dashboard/analytics?period=${period}`),

  /**
   * Get top performing tracks
   * @param period - Time period (7d, 30d, 90d, all-time)
   * @param take - Number of tracks to retrieve (default: 10)
   */
  getTopTracks: (period: TopTracksPeriod = "all-time", take: number = 10) =>
    api.get<TopTracksDto>(`/dashboard/top-tracks?period=${period}&take=${take}`),

  /**
   * Get unlock statistics (today vs yesterday)
   */
  getUnlockStats: () => api.get<UnlockStatsDto>("/dashboard/unlock-stats"),

  // ============================================================================
  // Legacy methods for backward compatibility
  // ============================================================================

  /**
   * @deprecated Use getStats() instead. Returns mapped legacy format.
   */
  getLegacyStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStatsDto>("/dashboard/stats");
      return mapDashboardStatsToLegacy(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch dashboard stats"));
    }
  },

  /**
   * @deprecated Use getRecentSales() instead. Returns mapped legacy format.
   */
  getLegacyRecentSales: async (): Promise<RecentSale[]> => {
    try {
      const response = await api.get<RecentSalesDto>("/dashboard/recent-sales?take=10");
      return mapRecentSalesToLegacy(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch recent sales"));
    }
  },

  /**
   * @deprecated Use getAnalytics() instead. Returns mapped legacy format.
   */
  getPerformanceData: async (period: "7d" | "30d" | "90d"): Promise<PerformanceData[]> => {
    try {
      const response = await api.get<DashboardAnalyticsDto>(
        `/dashboard/analytics?period=${period}`
      );
      return mapAnalyticsToPerformanceData(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch performance data"));
    }
  },
};
