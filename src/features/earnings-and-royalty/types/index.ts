// ============================================================================
// Earnings Summary DTOs
// ============================================================================

export interface EarningsSummaryDto {
  totalEarnedCoins: number;
  totalEarnedAmount: number;
  currency: string;
  totalEarnedDisplay: number;

  pendingWithdrawalCoins: number;
  pendingWithdrawalAmount: number;
  pendingWithdrawalDisplay: number;

  availableForWithdrawalCoins: number;
  availableForWithdrawalAmount: number;
  availableForWithdrawalDisplay: number;

  totalWithdrawnAmount: number;
  totalWithdrawnDisplay: number;

  platformFees: number;
  platformFeesDisplay: number;

  // Breakdown by type
  giftEarnings: number;
  contentUnlockEarnings: number;
  streamingEarnings: number;
  bonusEarnings: number;

  // Period stats
  earningsThisMonth: number;
  earningsLastMonth: number;
  growthPercentage: number;

  // True when the artist is signed to a record label. Label-managed artists
  // cannot self-initiate payouts (the label triggers them); they only view payouts.
  isLabelManaged: boolean;
}

// ============================================================================
// Earning Entry DTOs
// ============================================================================

export type EarningType = "gift" | "unlock" | "streaming" | "bonus" | "referral";

export interface EarningDto {
  id: string;
  type: EarningType;
  coinAmount: number;
  amountInSmallestUnit: number;
  amountDisplay: number;
  currency: string;
  platformFee: number;
  netCoinAmount: number;
  netAmountInSmallestUnit: number;
  netAmountDisplay: number;
  description: string;
  contributorId?: string;
  contributorName?: string;
  contributorAvatar?: string;
  earnedAt: string;
  isWithdrawn: boolean;
}

export interface EarningsHistoryDto {
  earnings: EarningDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Withdrawal DTOs
// ============================================================================

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface WithdrawalRequest {
  amountInSmallestUnit: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  withdrawalId: string;
  status: WithdrawalStatus;
  amountRequested: number;
  processingFee: number;
  netAmount: number;
  message?: string;
}

export interface WithdrawalDto {
  id: string;
  amountInSmallestUnit: number;
  amountDisplay: number;
  currency: string;
  processingFee: number;
  processingFeeDisplay: number;
  netAmount: number;
  netAmountDisplay: number;
  status: WithdrawalStatus;
  bankName: string;
  accountNumber: string;
  accountName: string;
  requestedAt: string;
  completedAt?: string;
  gatewayMessage?: string;
}

export interface WithdrawalHistoryDto {
  withdrawals: WithdrawalDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Artist Payout DTOs (label-triggered payouts, read-only for the recipient)
// ============================================================================

export type PayoutStatus = "Pending" | "Processing" | "Paid" | "Failed" | "Cancelled";

export interface ArtistPayoutDto {
  id: string;
  batchId: string;
  amountMinor: number;
  amountDisplay: number;
  muxifyFeeMinor: number;
  muxifyFeeDisplay: number;
  netAmountMinor: number;
  netAmountDisplay: number;
  currency: string;
  status: PayoutStatus;
  reference?: string;
  initiatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface ArtistPayoutHistoryDto {
  payouts: ArtistPayoutDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Pagination Options
// ============================================================================

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Dashboard Analytics DTOs
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
  // Earnings breakdown by type (for Activity Insights chart)
  giftEarningsChart: ChartSeriesDto;
  unlockEarningsChart: ChartSeriesDto;
  otherEarningsChart: ChartSeriesDto;
  // Summary totals
  totalEarnings: number;
  totalEarningsDisplay: number;
  totalPlays: number;
  newFollowers: number;
  totalGiftsReceived: number;
  totalContentUnlocks: number;
}

// ============================================================================
// Earnings Breakdown (for charts/display)
// ============================================================================

export interface EarningsBreakdown {
  gifts: number;
  unlocks: number;
  streaming: number;
  bonus: number;
  total: number;
}

export interface EarningsOverview {
  totalEarned: number;
  availableBalance: number;
  pendingWithdrawal: number;
  totalWithdrawn: number;
  currency: string;
  breakdown: EarningsBreakdown;
  growthPercentage: number;
}

// ============================================================================
// Utility functions
// ============================================================================

export function mapEarningsSummaryToOverview(dto: EarningsSummaryDto): EarningsOverview {
  return {
    totalEarned: dto.totalEarnedDisplay,
    availableBalance: dto.availableForWithdrawalDisplay,
    pendingWithdrawal: dto.pendingWithdrawalDisplay,
    totalWithdrawn: dto.totalWithdrawnDisplay,
    currency: dto.currency,
    breakdown: {
      gifts: dto.giftEarnings,
      unlocks: dto.contentUnlockEarnings,
      streaming: dto.streamingEarnings,
      bonus: dto.bonusEarnings,
      total: dto.totalEarnedAmount,
    },
    growthPercentage: dto.growthPercentage,
  };
}

export function getWithdrawalStatusColor(status: WithdrawalStatus): string {
  switch (status) {
    case "completed":
      return "green";
    case "pending":
    case "processing":
      return "yellow";
    case "failed":
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}

export function getEarningTypeLabel(type: EarningType): string {
  switch (type) {
    case "gift":
      return "Gift";
    case "unlock":
      return "Content Unlock";
    case "streaming":
      return "Streaming";
    case "bonus":
      return "Bonus";
    case "referral":
      return "Referral";
    default:
      return type;
  }
}

export function getEarningTypeIcon(type: EarningType): string {
  switch (type) {
    case "gift":
      return "🎁";
    case "unlock":
      return "🔓";
    case "streaming":
      return "🎵";
    case "bonus":
      return "🎉";
    case "referral":
      return "👥";
    default:
      return "💰";
  }
}
