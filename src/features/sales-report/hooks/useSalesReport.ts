import { useState, useEffect, useCallback, useMemo } from "react";
import {
  dashboardService,
  type DashboardAnalyticsDto,
  type RecentSalesDto,
  type TopTracksDto,
  type RecentSaleDto,
  type AnalyticsPeriod,
  type TopTracksPeriod,
  type UnlockStatsDto,
} from "@/features/dashboard/services/dashboardService";
import { useChakraToast } from "@shared/hooks";
import { getApiErrorMessage } from "@shared/lib/errorUtils";

// ============================================================================
// Gift Breakdown Types
// ============================================================================

export interface GiftBreakdownItem {
  type: string;
  count: number;
  totalValue: number;
  displayValue: string;
}

export interface SalesReportData {
  analytics: DashboardAnalyticsDto | null;
  recentSales: RecentSalesDto | null;
  topTracks: TopTracksDto | null;
  giftBreakdown: GiftBreakdownItem[];
  giftSales: RecentSaleDto[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Period Mapping
// ============================================================================

type TimeFilter = "daily" | "weekly" | "monthly" | "yearly";

const mapTimeFilterToPeriod = (filter: TimeFilter): AnalyticsPeriod => {
  switch (filter) {
    case "daily":
      return "7d";
    case "weekly":
      return "30d";
    case "monthly":
      return "90d";
    case "yearly":
      return "1y";
    default:
      return "7d";
  }
};

const mapTimeFilterToTopTracksPeriod = (filter: TimeFilter): TopTracksPeriod => {
  switch (filter) {
    case "daily":
      return "7d";
    case "weekly":
      return "30d";
    case "monthly":
      return "90d";
    case "yearly":
      return "all-time";
    default:
      return "7d";
  }
};

// ============================================================================
// Gift Type Helpers
// ============================================================================

/**
 * Extract gift type from description or type field
 */
const extractGiftType = (sale: RecentSaleDto): string => {
  // Try to extract gift type from description (e.g., "Gift: Donut")
  const descMatch = sale.description?.match(/Gift:\s*(\w+)/i);
  if (descMatch) {
    return descMatch[1].toLowerCase();
  }

  // Fallback to type field
  return sale.type.toLowerCase();
};

/**
 * Aggregate gift sales into breakdown
 */
const aggregateGiftBreakdown = (giftSales: RecentSaleDto[]): GiftBreakdownItem[] => {
  const breakdownMap = new Map<string, { count: number; totalValue: number }>();

  giftSales.forEach((sale) => {
    const giftType = extractGiftType(sale);
    const existing = breakdownMap.get(giftType) || { count: 0, totalValue: 0 };
    breakdownMap.set(giftType, {
      count: existing.count + 1,
      totalValue: existing.totalValue + sale.amountDisplay,
    });
  });

  return Array.from(breakdownMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    totalValue: data.totalValue,
    displayValue: data.totalValue.toLocaleString(),
  }));
};

// ============================================================================
// Hook Implementation
// ============================================================================

export const useSalesReport = (timeFilter: TimeFilter = "daily") => {
  const [analytics, setAnalytics] = useState<DashboardAnalyticsDto | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSalesDto | null>(null);
  const [topTracks, setTopTracks] = useState<TopTracksDto | null>(null);
  const [unlockStats, setUnlockStats] = useState<UnlockStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toast = useChakraToast();

  /**
   * Derive gift sales from recent sales
   */
  const giftSales = useMemo(() => {
    if (!recentSales?.sales) return [];
    return recentSales.sales.filter(
      (sale) => sale.type.toLowerCase() === "gift" || sale.type.toLowerCase().includes("gift")
    );
  }, [recentSales]);

  /**
   * Derive gift breakdown from gift sales
   */
  const giftBreakdown = useMemo(() => {
    return aggregateGiftBreakdown(giftSales);
  }, [giftSales]);

  /**
   * Load all sales report data
   */
  const loadSalesReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const analyticsPeriod = mapTimeFilterToPeriod(timeFilter);
      const topTracksPeriod = mapTimeFilterToTopTracksPeriod(timeFilter);

      const [analyticsResponse, salesResponse, topTracksResponse, unlockStatsResponse] = await Promise.all([
        dashboardService.getAnalytics(analyticsPeriod),
        dashboardService.getRecentSales(50), // Get more sales for gift breakdown
        dashboardService.getTopTracks(topTracksPeriod, 10),
        dashboardService.getUnlockStats(),
      ]);

      setAnalytics(analyticsResponse.data);
      setRecentSales(salesResponse.data);
      setTopTracks(topTracksResponse.data);
      setUnlockStats(unlockStatsResponse.data);
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err, "Failed to load sales report data");
      setError(errorMessage);
      toast.error("Failed to load sales report", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, toast]);

  /**
   * Refresh analytics for a specific period
   */
  const refreshAnalytics = useCallback(
    async (period: AnalyticsPeriod) => {
      try {
        const response = await dashboardService.getAnalytics(period);
        setAnalytics(response.data);
      } catch (err: unknown) {
        toast.error(
          "Failed to refresh analytics",
          getApiErrorMessage(err, "An unexpected error occurred")
        );
      }
    },
    [toast]
  );

  /**
   * Refresh top tracks
   */
  const refreshTopTracks = useCallback(
    async (period: TopTracksPeriod = "all-time", take: number = 10) => {
      try {
        const response = await dashboardService.getTopTracks(period, take);
        setTopTracks(response.data);
      } catch (err: unknown) {
        toast.error(
          "Failed to refresh top tracks",
          getApiErrorMessage(err, "An unexpected error occurred")
        );
      }
    },
    [toast]
  );

  // Load data on mount and when time filter changes
  useEffect(() => {
    void loadSalesReportData();
  }, [loadSalesReportData]);

  return {
    // Data
    analytics,
    recentSales,
    topTracks,
    giftBreakdown,
    giftSales,
    unlockStats,

    // State
    isLoading,
    error,

    // Actions
    loadSalesReportData,
    refreshAnalytics,
    refreshTopTracks,
  };
};

export default useSalesReport;
