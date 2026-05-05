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
  paymentUrl?: string;
  paymentReference?: string;
  message?: string;
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
 * Campaign analytics DTO
 */
export interface CampaignAnalyticsDto {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  amountSpent: number;
  costPerClick: number;
  costPerImpression: number;
  dailyMetrics: DailyMetricDto[];
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
export function mapDtoToAdCampaign(dto: AdCampaignDto): AdCampaign {
  const campaignType = dto.type.toLowerCase() as CampaignType;

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
    status: dto.status,
    isPaused: dto.status === 'paused',
    isStopped: dto.status === 'stopped' || dto.status === 'completed',
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
