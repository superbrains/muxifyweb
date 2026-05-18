import { api } from "@shared/services/api";
import { getApiErrorMessage } from "@shared/lib/errorUtils";
import type {
  EarningsSummaryDto,
  EarningsHistoryDto,
  WithdrawalRequest,
  WithdrawalResponse,
  WithdrawalHistoryDto,
  ArtistPayoutHistoryDto,
  PaginationOptions,
  EarningsOverview,
  DashboardAnalyticsDto,
} from "../types";
import { mapEarningsSummaryToOverview } from "../types";

// ============================================================================
// API Base Path
// ============================================================================

const EARNINGS_BASE_PATH = "/artist/earnings";

// ============================================================================
// Earnings Service
// ============================================================================

export const earningsService = {
  /**
   * Get earnings summary including totals, breakdown by type, and period comparisons
   */
  getSummary: () => api.get<EarningsSummaryDto>(`${EARNINGS_BASE_PATH}/summary`),

  /**
   * Get earnings summary mapped to a simplified overview format
   */
  getOverview: async (): Promise<EarningsOverview> => {
    try {
      const response = await api.get<EarningsSummaryDto>(`${EARNINGS_BASE_PATH}/summary`);
      return mapEarningsSummaryToOverview(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch earnings overview"));
    }
  },

  /**
   * Get paginated list of individual earnings transactions
   * @param options - Pagination options (page, pageSize)
   */
  getHistory: (options: PaginationOptions = {}) => {
    const { page = 1, pageSize = 20 } = options;
    return api.get<EarningsHistoryDto>(
      `${EARNINGS_BASE_PATH}/history?page=${page}&pageSize=${pageSize}`
    );
  },

  /**
   * Request earnings withdrawal to a bank account via Paystack
   * @param request - Withdrawal request details
   */
  requestWithdrawal: (request: WithdrawalRequest) =>
    api.post<WithdrawalResponse>(`${EARNINGS_BASE_PATH}/withdraw`, request),

  /**
   * Get paginated list of withdrawal requests and their statuses
   * @param options - Pagination options (page, pageSize)
   */
  getWithdrawalHistory: (options: PaginationOptions = {}) => {
    const { page = 1, pageSize = 20 } = options;
    return api.get<WithdrawalHistoryDto>(
      `${EARNINGS_BASE_PATH}/withdrawals?page=${page}&pageSize=${pageSize}`
    );
  },

  /**
   * Get paginated, read-only list of label-triggered payouts where the
   * current artist is the recipient
   * @param options - Pagination options (page, pageSize)
   */
  getArtistPayouts: (options: PaginationOptions = {}) => {
    const { page = 1, pageSize = 20 } = options;
    return api.get<ArtistPayoutHistoryDto>(
      `${EARNINGS_BASE_PATH}/payouts?page=${page}&pageSize=${pageSize}`
    );
  },

  /**
   * Get dashboard analytics with chart data for earnings, plays, and followers
   * @param period - Time period (7d, 30d, 90d, 12m)
   */
  getAnalytics: (period: string = "30d") =>
    api.get<DashboardAnalyticsDto>(`/dashboard/analytics?period=${period}`),
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format amount in smallest unit (kobo) to display format (Naira)
 * @param amountInSmallestUnit - Amount in kobo
 * @param currency - Currency code (default: NGN)
 */
export function formatEarningsAmount(
  amountInSmallestUnit: number,
  currency: string = "NGN"
): string {
  const amount = amountInSmallestUnit / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format coin amount for display
 * @param coins - Number of coins
 */
export function formatCoinAmount(coins: number): string {
  if (coins >= 1000000) {
    return `${(coins / 1000000).toFixed(1)}M`;
  }
  if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}K`;
  }
  return coins.toLocaleString();
}

/**
 * Calculate percentage change between two periods
 * @param current - Current period value
 * @param previous - Previous period value
 */
export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Mask bank account number for display (show last 4 digits)
 * @param accountNumber - Full account number
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }
  const masked = "*".repeat(accountNumber.length - 4);
  return masked + accountNumber.slice(-4);
}

export default earningsService;
