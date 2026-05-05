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
};
