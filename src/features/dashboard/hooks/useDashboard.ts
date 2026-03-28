import { useCallback, useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import {
  dashboardService,
  mapDashboardStatsToLegacy,
  mapRecentSalesToLegacy,
  mapAnalyticsToPerformanceData,
  type AnalyticsPeriod,
  type TopTracksPeriod,
} from "../services/dashboardService";
import { useChakraToast } from "@shared/hooks";
import { getApiErrorMessage } from "@shared/lib/errorUtils";

export const useDashboard = () => {
  const {
    // New DTO state
    statsDto,
    recentSalesDto,
    analyticsDto,
    topTracksDto,
    selectedPeriod,
    error,
    // Legacy state
    stats,
    recentSales,
    performanceData,
    isLoading,
    // New setters
    setStatsDto,
    setRecentSalesDto,
    setAnalyticsDto,
    setTopTracksDto,
    setSelectedPeriod,
    setError,
    // Legacy setters
    setStats,
    setRecentSales,
    setPerformanceData,
    setLoading,
  } = useDashboardStore();

  const toast = useChakraToast();

  /**
   * Load all dashboard data from the API
   */
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, salesResponse, analyticsResponse, topTracksResponse] =
        await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentSales(10),
          dashboardService.getAnalytics(selectedPeriod),
          dashboardService.getTopTracks("all-time", 10),
        ]);

      // Set new DTO state
      setStatsDto(statsResponse.data);
      setRecentSalesDto(salesResponse.data);
      setAnalyticsDto(analyticsResponse.data);
      setTopTracksDto(topTracksResponse.data);

      // Also set legacy state for backward compatibility
      setStats(mapDashboardStatsToLegacy(statsResponse.data));
      setRecentSales(mapRecentSalesToLegacy(salesResponse.data));
      setPerformanceData(mapAnalyticsToPerformanceData(analyticsResponse.data));
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, "Failed to load dashboard data");
      setError(errorMessage);
      toast.error("Failed to load dashboard data", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriod,
    setLoading,
    setError,
    setStatsDto,
    setRecentSalesDto,
    setAnalyticsDto,
    setTopTracksDto,
    setStats,
    setRecentSales,
    setPerformanceData,
    toast,
  ]);

  /**
   * Load analytics data for a specific period
   */
  const loadAnalytics = useCallback(
    async (period: AnalyticsPeriod) => {
      try {
        setSelectedPeriod(period);
        const response = await dashboardService.getAnalytics(period);
        setAnalyticsDto(response.data);
        setPerformanceData(mapAnalyticsToPerformanceData(response.data));
      } catch (error: unknown) {
        toast.error(
          "Failed to load analytics data",
          getApiErrorMessage(error, "An unexpected error occurred")
        );
      }
    },
    [setSelectedPeriod, setAnalyticsDto, setPerformanceData, toast]
  );

  /**
   * Load top tracks for a specific period
   */
  const loadTopTracks = useCallback(
    async (period: TopTracksPeriod = "all-time", take: number = 10) => {
      try {
        const response = await dashboardService.getTopTracks(period, take);
        setTopTracksDto(response.data);
      } catch (error: unknown) {
        toast.error(
          "Failed to load top tracks",
          getApiErrorMessage(error, "An unexpected error occurred")
        );
      }
    },
    [setTopTracksDto, toast]
  );

  /**
   * Refresh recent sales
   */
  const refreshRecentSales = useCallback(
    async (take: number = 10) => {
      try {
        const response = await dashboardService.getRecentSales(take);
        setRecentSalesDto(response.data);
        setRecentSales(mapRecentSalesToLegacy(response.data));
      } catch (error: unknown) {
        toast.error(
          "Failed to refresh sales data",
          getApiErrorMessage(error, "An unexpected error occurred")
        );
      }
    },
    [setRecentSalesDto, setRecentSales, toast]
  );

  /**
   * @deprecated Use loadAnalytics instead
   */
  const loadPerformanceData = useCallback(
    async (period: "7d" | "30d" | "90d") => {
      await loadAnalytics(period);
    },
    [loadAnalytics]
  );

  // Load dashboard data on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void loadDashboardData();
  }, []);  // Empty array - only run once on mount to prevent infinite loop

  return {
    // New DTO data
    statsDto,
    recentSalesDto,
    analyticsDto,
    topTracksDto,
    selectedPeriod,
    error,

    // Legacy data for backward compatibility
    stats,
    recentSales,
    performanceData,
    isLoading,

    // Actions
    loadDashboardData,
    loadAnalytics,
    loadTopTracks,
    refreshRecentSales,
    setSelectedPeriod,

    // Legacy action
    loadPerformanceData,
  };
};
