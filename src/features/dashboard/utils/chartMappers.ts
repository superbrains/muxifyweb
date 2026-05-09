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
 * Map analytics DTO to Activity Insights chart format.
 * Real per-day counts: Plays from PlayHistory, Gifts from gift count series,
 * Unlocked from unlock count series.
 */
export function mapAnalyticsToActivityChart(
  analyticsDto: DashboardAnalyticsDto | null
): ApexChartSeries[] {
  if (!analyticsDto) {
    return [
      { name: 'Plays', data: [] },
      { name: 'Gifts', data: [] },
      { name: 'Unlocked', data: [] },
    ];
  }

  return [
    { name: 'Plays', data: analyticsDto.playsChart.data.map((p) => p.value) },
    { name: 'Gifts', data: analyticsDto.giftCountsChart.data.map((p) => p.value) },
    { name: 'Unlocked', data: analyticsDto.unlockCountsChart.data.map((p) => p.value) },
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
 * Map analytics DTO to Total Revenue bar chart format.
 * Each series is the real per-day earnings amount for that source type.
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

  return [
    { name: 'Gifting', data: analyticsDto.giftEarningsChart.data.map((p) => p.value) },
    { name: 'Unlocked', data: analyticsDto.unlockEarningsChart.data.map((p) => p.value) },
    { name: 'Commission', data: analyticsDto.otherEarningsChart.data.map((p) => p.value) },
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
 * Map analytics DTO to Popular Activity stacked bar chart.
 * Uses the trailing 6 buckets of the real unlock/gift count series.
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

  const tail = <T>(arr: T[], n: number): T[] => arr.slice(Math.max(0, arr.length - n));

  return [
    { name: 'Unlock', data: tail(analyticsDto.unlockCountsChart.data, 6).map((p) => p.value) },
    { name: 'Gifting', data: tail(analyticsDto.giftCountsChart.data, 6).map((p) => p.value) },
  ];
}

/**
 * Calculate Y-axis max that hugs the data and rounds up to a "nice" number
 * (1, 2, 2.5, 5 × 10ⁿ). Returns a small default when there's no data so the
 * chart frame still renders cleanly instead of collapsing to 0.
 */
export function calculateYAxisMax(series: ApexChartSeries[], buffer = 1.15): number {
  const allValues = series.flatMap((s) => s.data).filter((v) => Number.isFinite(v));
  const rawMax = allValues.length === 0 ? 0 : Math.max(...allValues);
  if (rawMax <= 0) return 10;
  return niceCeiling(rawMax * buffer);
}

function niceCeiling(n: number): number {
  if (n <= 0) return 0;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const f = n / base;
  const niceF = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return Math.ceil(niceF * base);
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
