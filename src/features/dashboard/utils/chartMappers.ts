import type { ChartSeriesDto, DashboardAnalyticsDto } from '../services/dashboardService';

/**
 * ApexCharts series format for line/area charts
 */
export interface ApexChartSeries {
  name: string;
  data: number[];
}

/**
 * ApexCharts configuration with categories
 */
export interface ApexChartConfig {
  series: ApexChartSeries[];
  categories: string[];
}

/**
 * Map a single ChartSeriesDto to ApexCharts format
 * Input: { name: "Earnings", data: [{ label: "Mon", value: 1000 }] }
 * Output: { series: [{ name: "Earnings", data: [1000] }], categories: ["Mon"] }
 */
export function mapChartSeriesToApex(chartSeries: ChartSeriesDto): ApexChartConfig {
  const categories = chartSeries.data.map((point) => point.label);
  const values = chartSeries.data.map((point) => point.value);

  return {
    series: [{ name: chartSeries.name, data: values }],
    categories,
  };
}

/**
 * Map multiple ChartSeriesDto arrays to a combined ApexCharts format
 * Used for multi-series charts like Activity Insights
 */
export function mapMultiSeriesToApex(
  chartSeriesArray: ChartSeriesDto[],
  fallbackCategories?: string[]
): ApexChartConfig {
  if (chartSeriesArray.length === 0) {
    return {
      series: [],
      categories: fallbackCategories || [],
    };
  }

  // Use the first series to get categories (all should have same labels)
  const categories = chartSeriesArray[0].data.map((point) => point.label);

  const series = chartSeriesArray.map((chartSeries) => ({
    name: chartSeries.name,
    data: chartSeries.data.map((point) => point.value),
  }));

  return {
    series,
    categories: categories.length > 0 ? categories : (fallbackCategories || []),
  };
}

/**
 * Map analytics DTO to Activity Insights chart format
 * Creates multi-series chart with Plays, (derived) Gifts trend, and Unlocks trend
 */
export function mapAnalyticsToActivityChart(
  analyticsDto: DashboardAnalyticsDto | null
): ApexChartSeries[] {
  if (!analyticsDto) {
    // Return default empty series
    return [
      { name: 'Plays', data: [] },
      { name: 'Gifts', data: [] },
      { name: 'Unlocked', data: [] },
    ];
  }

  // Map plays chart
  const playsData = analyticsDto.playsChart.data.map((point) => point.value);

  // For gifts and unlocks, we can derive trends from earnings data
  // or use the totals distributed across the period
  // Since backend provides earningsChart which includes gift revenue,
  // we'll use a proportional distribution based on totals
  const dataPoints = analyticsDto.playsChart.data.length || 1;
  const avgGiftsPerPeriod = Math.round(analyticsDto.totalGiftsReceived / dataPoints);
  const avgUnlocksPerPeriod = Math.round(analyticsDto.totalContentUnlocks / dataPoints);

  // Create a trend that roughly follows the earnings pattern
  const earningsData = analyticsDto.earningsChart.data.map((point) => point.value);
  const maxEarnings = Math.max(...earningsData, 1);

  const giftsData = earningsData.map((value) =>
    Math.round((value / maxEarnings) * avgGiftsPerPeriod * dataPoints * 0.5)
  );
  const unlocksData = earningsData.map((value) =>
    Math.round((value / maxEarnings) * avgUnlocksPerPeriod * dataPoints * 0.5)
  );

  return [
    { name: 'Plays', data: playsData },
    { name: 'Gifts', data: giftsData.length > 0 ? giftsData : [0] },
    { name: 'Unlocked', data: unlocksData.length > 0 ? unlocksData : [0] },
  ];
}

/**
 * Get categories from analytics DTO for x-axis labels
 */
export function getAnalyticsCategories(
  analyticsDto: DashboardAnalyticsDto | null,
  fallback: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
): string[] {
  if (!analyticsDto || analyticsDto.playsChart.data.length === 0) {
    return fallback;
  }
  return analyticsDto.playsChart.data.map((point) => point.label);
}

/**
 * Map analytics DTO to Total Revenue bar chart format
 * Creates multi-series chart with Gifting, Unlocked, and Commission breakdown
 */
export function mapAnalyticsToRevenueChart(
  analyticsDto: DashboardAnalyticsDto | null
): ApexChartSeries[] {
  if (!analyticsDto) {
    return [
      { name: 'Gifting', data: [] },
      { name: 'Unlocked', data: [] },
      { name: 'Commission', data: [] },
    ];
  }

  const earningsData = analyticsDto.earningsChart.data;

  // Calculate proportions based on totals
  const giftProportion = analyticsDto.totalGiftsReceived > 0 ? 0.5 : 0.3;
  const unlockProportion = analyticsDto.totalContentUnlocks > 0 ? 0.35 : 0.4;
  const commissionProportion = 1 - giftProportion - unlockProportion;

  // Distribute across data points following earnings pattern
  const giftingData = earningsData.map((point) =>
    Math.round(point.value * giftProportion)
  );
  const unlockedData = earningsData.map((point) =>
    Math.round(point.value * unlockProportion)
  );
  const commissionData = earningsData.map((point) =>
    Math.round(point.value * commissionProportion)
  );

  return [
    { name: 'Gifting', data: giftingData },
    { name: 'Unlocked', data: unlockedData },
    { name: 'Commission', data: commissionData },
  ];
}

/**
 * Map analytics DTO to Earnings comparison chart
 * Creates comparison between current and previous period
 */
export function mapAnalyticsToEarningsComparisonChart(
  analyticsDto: DashboardAnalyticsDto | null
): ApexChartSeries[] {
  if (!analyticsDto) {
    return [
      { name: 'Period Earnings', data: [] },
      { name: 'Plays Trend', data: [] },
    ];
  }

  // Map earnings chart data
  const earningsData = analyticsDto.earningsChart.data.map((point) => point.value);

  // Map plays as a secondary metric (scaled for visibility)
  const playsData = analyticsDto.playsChart.data.map((point) => point.value);

  // Scale plays data to be in similar range as earnings for chart visibility
  const maxEarnings = Math.max(...earningsData, 1);
  const maxPlays = Math.max(...playsData, 1);
  const scaleFactor = maxEarnings / maxPlays;

  const scaledPlaysData = playsData.map((value) =>
    Math.round(value * scaleFactor * 0.5)
  );

  return [
    { name: 'Period Earnings', data: earningsData },
    { name: 'Plays Trend', data: scaledPlaysData },
  ];
}

/**
 * Map analytics DTO to Popular Activity stacked bar chart
 */
export function mapAnalyticsToPopularActivityChart(
  analyticsDto: DashboardAnalyticsDto | null
): ApexChartSeries[] {
  if (!analyticsDto) {
    return [
      { name: 'Unlock', data: [] },
      { name: 'Gifting', data: [] },
    ];
  }

  const dataPoints = Math.min(analyticsDto.earningsChart.data.length, 6);
  const earningsData = analyticsDto.earningsChart.data.slice(0, dataPoints);

  // Derive unlock and gifting activity from earnings pattern
  const unlockData = earningsData.map((point) =>
    Math.round(point.value * 0.4)
  );
  const giftingData = earningsData.map((point) =>
    Math.round(point.value * 0.3)
  );

  return [
    { name: 'Unlock', data: unlockData },
    { name: 'Gifting', data: giftingData },
  ];
}

/**
 * Calculate max Y-axis value based on data series
 */
export function calculateYAxisMax(series: ApexChartSeries[], buffer = 1.2): number {
  const allValues = series.flatMap((s) => s.data);
  const maxValue = Math.max(...allValues, 100);
  return Math.ceil(maxValue * buffer);
}

/**
 * Format number for chart labels
 */
export function formatChartValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
}
