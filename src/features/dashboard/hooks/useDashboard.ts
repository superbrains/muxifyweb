import { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { dashboardService } from "../services/dashboardService";
import { useToast } from "@shared/hooks";

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

  const { toast } = useToast();

  const loadDashboardData = async () => {
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
    } catch (error: any) {
      toast.error(
        "Failed to load dashboard data",
        error.response?.data?.message
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async (period: "7d" | "30d" | "90d") => {
    try {
      const response = await dashboardService.getPerformanceData(period);
      setPerformanceData(response.data);
    } catch (error: any) {
      toast.error(
        "Failed to load performance data",
        error.response?.data?.message
      );
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    stats,
    recentSales,
    performanceData,
    isLoading,
    loadDashboardData,
    loadPerformanceData,
  };
};
