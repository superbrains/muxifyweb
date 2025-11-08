import { useCallback, useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { dashboardService } from "../services/dashboardService";
import { useChakraToast } from "@shared/hooks";

export const useDashboard = () => {
  const {
    stats,
    recentSales,
    performanceData,
    isLoading,
    setStats,
    setRecentSales,
    setPerformanceData,
    setLoading,
  } = useDashboardStore();

  const toast = useChakraToast();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, salesResponse, performanceResponse] =
        await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentSales(),
          dashboardService.getPerformanceData("7d"),
        ]);

      setStats(statsResponse.data);
      setRecentSales(salesResponse.data);
      setPerformanceData(performanceResponse.data);
    } catch (error: unknown) {
      toast.error(
        "Failed to load dashboard data",
        extractDashboardErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, [setLoading, setStats, setRecentSales, setPerformanceData, toast]);

  const loadPerformanceData = useCallback(
    async (period: "7d" | "30d" | "90d") => {
      try {
        const response = await dashboardService.getPerformanceData(period);
        setPerformanceData(response.data);
      } catch (error: unknown) {
        toast.error(
          "Failed to load performance data",
          extractDashboardErrorMessage(error)
        );
      }
    },
    [setPerformanceData, toast]
  );

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    recentSales,
    performanceData,
    isLoading,
    loadDashboardData,
    loadPerformanceData,
  };
};

const extractDashboardErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: unknown } }).response !== null
  ) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: string }).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  return "An unexpected error occurred";
};
