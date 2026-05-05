// Re-export all types from the service for convenience
export type {
  // New API DTOs
  DashboardStatDto,
  DashboardStatsDto,
  RecentSaleDto,
  RecentSalesDto,
  ChartDataPointDto,
  ChartSeriesDto,
  DashboardAnalyticsDto,
  TopTrackDto,
  TopTracksDto,
  // Period types
  AnalyticsPeriod,
  TopTracksPeriod,
  // Legacy types (for backward compatibility)
  DashboardStats,
  RecentSale,
  PerformanceData,
} from "../services/dashboardService";
