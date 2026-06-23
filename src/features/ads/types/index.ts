/**
 * Campaign status enum matching backend status
 */
export type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'stopped' | 'completed' | 'rejected';

/**
 * Campaign type enum
 */
export type CampaignType = 'photo' | 'video' | 'audio';

// ============================================
// Ad Wallet DTOs
// ============================================

/**
 * Ad wallet DTO from backend
 */
export interface AdWalletDto {
  id: string;
  balance: number;
  balanceDisplay: number;
  totalDeposited: number;
  totalSpent: number;
  totalRefunded: number;
  currency: string;
  isActive: boolean;
}

/**
 * Wallet transaction DTO
 */
export interface AdWalletTransactionDto {
  id: string;
  type: string;
  amount: number;
  amountDisplay: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  currency: string;
  createdAt: string;
}

/**
 * Wallet transaction history response
 */
export interface AdWalletTransactionHistoryDto {
  transactions: AdWalletTransactionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Request to deposit to ad wallet
 */
export interface DepositToWalletRequest {
  amountInSmallestUnit: number;
}

/**
 * Response for wallet deposit initiation
 */
export interface DepositToWalletResponse {
  success: boolean;
  intentId?: string;
  paymentUrl?: string;
  paymentReference?: string;
  message?: string;
}

/**
 * Request to initiate a Flutterwave ad-wallet top-up
 */
export interface InitiateAdDepositRequest {
  amountMinor: number;
  paymentMethodId: string;
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
  redirectUrl?: string;
}

/**
 * Deposit status returned by the poll endpoint
 */
export interface AdDepositStatusResponse {
  intentId: string;
  status: string;
  amountMinor: number;
  currency: string;
  settledAt?: string;
  failureReason?: string;
}

/**
 * A supported top-up method (Flutterwave channel)
 */
export interface CollectionMethod {
  id: string;
  name: string;
  fundType: string;
  requiresOtp: boolean;
}

export interface CollectionMethodsResponse {
  currency: string;
  providerName: string;
  methods: CollectionMethod[];
}

// ============================================
// Ad Campaign DTOs
// ============================================

/**
 * Ad campaign DTO from backend
 */
export interface AdCampaignDto {
  id: string;
  name: string;
  type: string;
  /** Creative format (photo/video/audio) — what the library tabs and wizard use. */
  format: string;
  status: CampaignStatus;
  budget: number;
  budgetDisplay: number;
  dailyLimit?: number;
  amountSpent: number;
  amountSpentDisplay: number;
  remainingBudget: number;
  remainingBudgetDisplay: number;
  currency: string;
  startDate: string;
  endDate?: string;
  targetContentId?: string;
  targetContentType?: string;
  creativeUrl?: string;
  clickUrl?: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  rejectionReason?: string;
  createdAt: string;
}

/**
 * Campaign list response with pagination
 */
export interface CampaignListDto {
  campaigns: AdCampaignDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Request to create a campaign
 */
export interface CreateCampaignRequest {
  name: string;
  type: string;
  budget: number;
  dailyLimit?: number;
  startDate: string;
  endDate?: string;
  targetContentId?: string;
  targetContentType?: string;
  creativeUrl?: string;
  clickUrl?: string;
  targetingSettings?: string;
}

/**
 * Request to update a campaign
 */
export interface UpdateCampaignRequest {
  name?: string;
  budget?: number;
  dailyLimit?: number;
  startDate?: string;
  endDate?: string;
  creativeUrl?: string;
  clickUrl?: string;
  targetingSettings?: string;
}

/**
 * Response for campaign creation
 */
export interface CreateCampaignResponse {
  success: boolean;
  campaignId: string;
  status: string;
  message?: string;
  campaign?: AdCampaignDto;
}

/**
 * Generic success response for campaign actions
 */
export interface CampaignActionResponse {
  success: boolean;
}

// ============================================
// Campaign Analytics DTOs
// ============================================

/**
 * Daily metric data point
 */
export interface DailyMetricDto {
  date: string;
  impressions: number;
  clicks: number;
  amountSpent: number;
}

/**
 * Demographic (gender × age band) breakdown row
 */
export interface AdDemographicRowDto {
  gender: string;
  ageBand: string;
  impressions: number;
  clicks: number;
  spendMinor: number;
}

/**
 * Location (country/state) breakdown row
 */
export interface AdGeoRowDto {
  country: string;
  state: string;
  impressions: number;
  clicks: number;
  spendMinor: number;
}

/**
 * Campaign analytics DTO
 */
export interface CampaignAnalyticsDto {
  campaignId: string;
  campaignName: string;
  format: string;
  status: CampaignStatus;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  amountSpent: number;
  amountSpentDisplay: number;
  budget: number;
  budgetDisplay: number;
  costPerClick: number;
  costPerImpression: number;
  startDate: string;
  endDate?: string;
  durationDays: number;
  currency: string;
  dailyMetrics: DailyMetricDto[];
  people: AdDemographicRowDto[];
  location: AdGeoRowDto[];
}

/**
 * Submit-for-approval response
 */
export interface SubmitCampaignResponse {
  success: boolean;
  campaignId: string;
  status: string;
  message?: string;
}

// ============================================
// Rates DTOs
// ============================================

export interface AdRateCardDto {
  cpcMinor: number;
  cpcDisplay: number;
  cpiMinor: number;
  cpiDisplay: number;
}

export interface AdRatesDto {
  photo: AdRateCardDto;
  video: AdRateCardDto;
  audio: AdRateCardDto;
  minBudgetMinor: number;
  currency: string;
}

// ============================================
// Ad Targeting DTOs
// ============================================

/**
 * A single sponsorable media item (track/video) returned by the targeting search.
 * Only media with AllowSponsorship=true is surfaced.
 */
export interface SponsorableMediaItem {
  id: string;
  title: string;
  artistName: string;
  coverArtUrl?: string;
  genreName?: string;
  type: 'music' | 'video';
}

/**
 * Paged result for the sponsorable-media targeting search.
 */
export interface SponsorableMediaSearchResponse {
  items: SponsorableMediaItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ============================================
// Dashboard / Spending / Report DTOs
// ============================================

export interface AdActivityPointDto {
  label: string;
  impressions: number;
  clicks: number;
  spendMinor: number;
}

export interface AdSpendByFormatDto {
  photoMinor: number;
  videoMinor: number;
  audioMinor: number;
}

export interface AdCountryReachDto {
  country: string;
  impressions: number;
  clicks: number;
  spendMinor: number;
}

export interface AdDashboardSummaryDto {
  currency: string;
  totalImpressions: number;
  totalClicks: number;
  totalSpendMinor: number;
  clickThroughRate: number;
  activeCampaigns: number;
  totalCampaigns: number;
  impressionsDeltaPct: number;
  clicksDeltaPct: number;
  spendDeltaPct: number;
  optimisationScore: number;
  visibilityScore: number;
  presenceScore: number;
  activity: AdActivityPointDto[];
  spendByFormat: AdSpendByFormatDto;
  countryReach: AdCountryReachDto[];
}

export interface AdSpendingBucketDto {
  label: string;
  photoMinor: number;
  videoMinor: number;
  audioMinor: number;
  totalMinor: number;
}

export interface AdSpendingSeriesDto {
  grouping: string;
  currency: string;
  buckets: AdSpendingBucketDto[];
  totalSpendMinor: number;
  totalImpressions: number;
  totalClicks: number;
  impressionsCostMinor: number;
  clicksCostMinor: number;
}

export interface AdReportRowDto {
  campaignId: string;
  name: string;
  format: string;
  status: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  spendMinor: number;
  costPerClick: number;
  costPerImpression: number;
  startDate: string;
  endDate?: string;
}

export interface AdReportDto {
  currency: string;
  rows: AdReportRowDto[];
  totalImpressions: number;
  totalClicks: number;
  totalSpendMinor: number;
}

// ============================================
// Legacy AdCampaign interface for UI compatibility
// ============================================

/**
 * Legacy AdCampaign interface for backwards compatibility with UI components
 */
export interface AdCampaign {
  id: string;
  title: string;
  type: CampaignType;
  location: {
    country: string;
    state: string;
  };
  target: {
    type: 'music' | 'video' | 'audio' | 'photo';
    genre?: string;
    artists?: string[];
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
  };
  budget: number;
  status: CampaignStatus;
  isPaused?: boolean;
  isStopped?: boolean;
  createdAt: string;
  updatedAt: string;
  // Media files (base64 encoded)
  mediaData?: string;
  mediaName?: string;
  mediaSize?: string;
  // Backend campaign data
  impressions?: number;
  clicks?: number;
  amountSpent?: number;
}

// ============================================
// Mapper Functions
// ============================================

/**
 * Maps AdCampaignDto to legacy AdCampaign for UI components
 */
/**
 * Normalises a backend campaign status (PascalCase enum name, e.g. "Active",
 * "PendingApproval") to the web's lowercase CampaignStatus union.
 */
export function normalizeCampaignStatus(status: string): CampaignStatus {
  switch ((status || '').toLowerCase()) {
    case 'draft': return 'draft';
    case 'pendingapproval':
    case 'pending': return 'pending';
    case 'active': return 'active';
    case 'paused': return 'paused';
    case 'stopped': return 'stopped';
    case 'completed': return 'completed';
    case 'rejected': return 'rejected';
    default: return 'draft';
  }
}

export function mapDtoToAdCampaign(dto: AdCampaignDto): AdCampaign {
  // Prefer the explicit creative format from the backend; fall back to the raw
  // type for older payloads.
  const campaignType = (dto.format || dto.type || 'photo').toLowerCase() as CampaignType;
  const status = normalizeCampaignStatus(dto.status);

  return {
    id: dto.id,
    title: dto.name,
    type: campaignType,
    location: {
      country: 'Nigeria', // Default, would need backend support
      state: '',
    },
    target: {
      type: campaignType === 'audio' ? 'music' : campaignType,
      genre: undefined,
      artists: undefined,
    },
    schedule: {
      date: dto.startDate,
      startTime: '',
      endTime: dto.endDate || '',
    },
    budget: dto.budgetDisplay,
    status,
    isPaused: status === 'paused',
    isStopped: status === 'stopped' || status === 'completed',
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
    mediaData: dto.creativeUrl,
    impressions: dto.impressions,
    clicks: dto.clicks,
    amountSpent: dto.amountSpentDisplay,
  };
}

/**
 * Maps legacy AdCampaign to CreateCampaignRequest for API
 */
export function mapAdCampaignToCreateRequest(campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>): CreateCampaignRequest {
  return {
    name: campaign.title,
    type: campaign.type,
    budget: campaign.budget * 100, // Convert to smallest unit (kobo)
    startDate: campaign.schedule.date,
    endDate: campaign.schedule.endTime || undefined,
    creativeUrl: campaign.mediaData,
    targetingSettings: JSON.stringify({
      location: campaign.location,
      target: campaign.target,
    }),
  };
}
