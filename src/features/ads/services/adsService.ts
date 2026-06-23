import { axiosInstance } from '@app/lib/axiosInstance';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type {
  AdWalletDto,
  CampaignListDto,
  AdCampaignDto,
  CreateCampaignRequest,
  CreateCampaignResponse,
  UpdateCampaignRequest,
  CampaignActionResponse,
  SubmitCampaignResponse,
  AdWalletTransactionHistoryDto,
  CollectionMethodsResponse,
  InitiateAdDepositRequest,
  DepositToWalletResponse,
  AdDepositStatusResponse,
  AdRatesDto,
  AdDashboardSummaryDto,
  AdSpendingSeriesDto,
  AdReportDto,
  CampaignAnalyticsDto,
} from '../types';

const ADS_BASE = '/ads';

/**
 * Ads & Campaigns API service
 */
export const adsService = {
  // ============================================
  // Ad Wallet Endpoints
  // ============================================

  /**
   * GET /api/v1/ads/wallet
   * Get the current user's ad wallet details
   */
  async getWallet(): Promise<AdWalletDto> {
    try {
      const response = await axiosInstance.get<AdWalletDto>(`${ADS_BASE}/wallet`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch ad wallet'));
    }
  },

  // ============================================
  // Campaign Endpoints
  // ============================================

  /**
   * GET /api/v1/ads/campaigns
   * Fetches paginated campaigns for the current user
   */
  async getCampaigns(
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<CampaignListDto> {
    try {
      const response = await axiosInstance.get<CampaignListDto>(
        `${ADS_BASE}/campaigns`,
        {
          params: { page, pageSize, status },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch campaigns'));
    }
  },

  /**
   * GET /api/v1/ads/campaigns/{id}
   * Get a specific campaign by ID
   */
  async getCampaignById(id: string): Promise<AdCampaignDto> {
    try {
      const response = await axiosInstance.get<AdCampaignDto>(
        `${ADS_BASE}/campaigns/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch campaign'));
    }
  },

  /**
   * POST /api/v1/ads/campaigns
   * Creates a new campaign
   */
  async createCampaign(request: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    try {
      const response = await axiosInstance.post<CreateCampaignResponse>(
        `${ADS_BASE}/campaigns`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create campaign'));
    }
  },

  /**
   * PUT /api/v1/ads/campaigns/{id}
   * Updates a campaign
   */
  async updateCampaign(
    id: string,
    request: UpdateCampaignRequest
  ): Promise<CampaignActionResponse> {
    try {
      const response = await axiosInstance.put<CampaignActionResponse>(
        `${ADS_BASE}/campaigns/${id}`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update campaign'));
    }
  },

  /**
   * POST /api/v1/ads/campaigns/{id}/pause
   * Pauses an active campaign
   */
  async pauseCampaign(id: string): Promise<CampaignActionResponse> {
    try {
      const response = await axiosInstance.post<CampaignActionResponse>(
        `${ADS_BASE}/campaigns/${id}/pause`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to pause campaign'));
    }
  },

  /**
   * POST /api/v1/ads/campaigns/{id}/resume
   * Resumes a paused campaign
   */
  async resumeCampaign(id: string): Promise<CampaignActionResponse> {
    try {
      const response = await axiosInstance.post<CampaignActionResponse>(
        `${ADS_BASE}/campaigns/${id}/resume`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to resume campaign'));
    }
  },

  /**
   * POST /api/v1/ads/campaigns/{id}/stop
   * Stops an active or paused campaign permanently
   */
  async stopCampaign(id: string): Promise<CampaignActionResponse> {
    try {
      const response = await axiosInstance.post<CampaignActionResponse>(
        `${ADS_BASE}/campaigns/${id}/stop`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to stop campaign'));
    }
  },

  /**
   * POST /api/v1/ads/campaigns/{id}/submit
   * Submits a draft campaign for admin approval
   */
  async submitCampaign(id: string): Promise<SubmitCampaignResponse> {
    try {
      const response = await axiosInstance.post<SubmitCampaignResponse>(
        `${ADS_BASE}/campaigns/${id}/submit`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to submit campaign'));
    }
  },

  // ============================================
  // Rates
  // ============================================

  /** GET /api/v1/ads/rates — CPC/CPI per format for the wizard estimate */
  async getRates(): Promise<AdRatesDto> {
    try {
      const response = await axiosInstance.get<AdRatesDto>(`${ADS_BASE}/rates`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch ad rates'));
    }
  },

  // ============================================
  // Analytics
  // ============================================

  /** GET /api/v1/ads/dashboard — advertiser dashboard summary */
  async getDashboard(): Promise<AdDashboardSummaryDto> {
    try {
      const response = await axiosInstance.get<AdDashboardSummaryDto>(`${ADS_BASE}/dashboard`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch dashboard'));
    }
  },

  /** GET /api/v1/ads/spending — spending series with grouping */
  async getSpending(
    grouping: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily',
    from?: string,
    to?: string
  ): Promise<AdSpendingSeriesDto> {
    try {
      const response = await axiosInstance.get<AdSpendingSeriesDto>(`${ADS_BASE}/spending`, {
        params: { grouping, from, to },
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch spending'));
    }
  },

  /** GET /api/v1/ads/report — per-campaign report rows */
  async getReport(from?: string, to?: string): Promise<AdReportDto> {
    try {
      const response = await axiosInstance.get<AdReportDto>(`${ADS_BASE}/report`, {
        params: { from, to },
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch report'));
    }
  },

  /** GET /api/v1/ads/campaigns/{id}/analytics — per-campaign analytics */
  async getCampaignAnalytics(id: string, from?: string, to?: string): Promise<CampaignAnalyticsDto> {
    try {
      const response = await axiosInstance.get<CampaignAnalyticsDto>(
        `${ADS_BASE}/campaigns/${id}/analytics`,
        { params: { from, to } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch campaign analytics'));
    }
  },

  // ============================================
  // Payments (Flutterwave ad-wallet top-up)
  // ============================================

  /** GET /api/v1/ads/wallet/transactions — real transaction history */
  async getWalletTransactions(page = 1, pageSize = 20): Promise<AdWalletTransactionHistoryDto> {
    try {
      const response = await axiosInstance.get<AdWalletTransactionHistoryDto>(
        `${ADS_BASE}/wallet/transactions`,
        { params: { page, pageSize } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch transactions'));
    }
  },

  /** GET /api/v1/ads/wallet/methods — Flutterwave top-up channels */
  async getWalletMethods(): Promise<CollectionMethodsResponse> {
    try {
      const response = await axiosInstance.get<CollectionMethodsResponse>(`${ADS_BASE}/wallet/methods`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch payment methods'));
    }
  },

  /** POST /api/v1/ads/wallet/deposit — initiate a Flutterwave top-up */
  async initiateDeposit(request: InitiateAdDepositRequest): Promise<DepositToWalletResponse> {
    try {
      const response = await axiosInstance.post<DepositToWalletResponse>(
        `${ADS_BASE}/wallet/deposit`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to initiate deposit'));
    }
  },

  /** GET /api/v1/ads/wallet/deposit/{intentId} — poll deposit status (credits on success) */
  async getDepositStatus(intentId: string): Promise<AdDepositStatusResponse> {
    try {
      const response = await axiosInstance.get<AdDepositStatusResponse>(
        `${ADS_BASE}/wallet/deposit/${intentId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch deposit status'));
    }
  },
};
