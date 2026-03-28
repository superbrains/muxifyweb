import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";
import { adsService } from "../services/adsService";
import type {
  AdCampaign,
  AdWalletDto,
  AdCampaignDto,
  CampaignListDto,
  CreateCampaignRequest,
} from "../types";

// Re-export for backwards compatibility
export type { AdCampaign } from "../types";

interface AdsState {
  // Campaigns data
  campaigns: AdCampaign[];
  campaignsDto: AdCampaignDto[];

  // Wallet data
  wallet: AdWalletDto | null;

  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;

  // Loading states
  isLoading: boolean;
  isLoadingWallet: boolean;
  isLoadingCampaign: boolean;

  // Error states
  error: string | null;
  walletError: string | null;

  // API Actions
  fetchWallet: () => Promise<void>;
  fetchCampaigns: (page?: number, pageSize?: number, status?: string) => Promise<void>;
  fetchCampaignById: (id: string) => Promise<AdCampaignDto | null>;
  createCampaignApi: (request: CreateCampaignRequest) => Promise<string | null>;
  updateCampaignApi: (id: string, updates: Partial<CreateCampaignRequest>) => Promise<boolean>;
  pauseCampaignApi: (id: string) => Promise<boolean>;
  resumeCampaignApi: (id: string) => Promise<boolean>;
  stopCampaignApi: (id: string) => Promise<boolean>;

  // Legacy local actions (for backwards compatibility)
  addCampaign: (campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>) => AdCampaign;
  updateCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaignById: (id: string) => AdCampaign | undefined;
  getCampaignsByType: (type: 'photo' | 'video' | 'audio') => AdCampaign[];
  pauseCampaign: (id: string) => void;
  resumeCampaign: (id: string) => void;
  startCampaign: (id: string) => void;
  stopCampaign: (id: string) => void;

  // Utils
  clearError: () => void;
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set, get) => ({
      // Initial state
      campaigns: [],
      campaignsDto: [],
      wallet: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      isLoading: false,
      isLoadingWallet: false,
      isLoadingCampaign: false,
      error: null,
      walletError: null,

      // ============================================
      // API Actions
      // ============================================

      fetchWallet: async () => {
        set({ isLoadingWallet: true, walletError: null });
        try {
          const wallet = await adsService.getWallet();
          set({ wallet, isLoadingWallet: false });
        } catch (error) {
          set({
            walletError: error instanceof Error ? error.message : 'Failed to fetch wallet',
            isLoadingWallet: false
          });
        }
      },

      fetchCampaigns: async (page = 1, pageSize = 20, status?: string) => {
        set({ isLoading: true, error: null });
        try {
          const result: CampaignListDto = await adsService.getCampaigns(page, pageSize, status);

          // Map DTOs to legacy format for UI compatibility
          const campaigns: AdCampaign[] = result.campaigns.map((dto) => {
            const campaignType = dto.type.toLowerCase() as 'photo' | 'video' | 'audio';
            return {
              id: dto.id,
              title: dto.name,
              type: campaignType,
              location: { country: 'Nigeria', state: '' },
              target: {
                type: campaignType === 'audio' ? 'music' : campaignType,
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
          });

          set({
            campaigns,
            campaignsDto: result.campaigns,
            totalCount: result.totalCount,
            currentPage: result.page,
            pageSize: result.pageSize,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
            isLoading: false,
          });
        }
      },

      fetchCampaignById: async (id: string) => {
        set({ isLoadingCampaign: true, error: null });
        try {
          const campaign = await adsService.getCampaignById(id);
          set({ isLoadingCampaign: false });
          return campaign;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch campaign',
            isLoadingCampaign: false,
          });
          return null;
        }
      },

      createCampaignApi: async (request: CreateCampaignRequest) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adsService.createCampaign(request);
          if (result.success) {
            // Refresh campaigns list after creation
            await get().fetchCampaigns();
            set({ isLoading: false });
            return result.campaignId;
          }
          set({
            error: result.message || 'Failed to create campaign',
            isLoading: false,
          });
          return null;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create campaign',
            isLoading: false,
          });
          return null;
        }
      },

      updateCampaignApi: async (id: string, updates: Partial<CreateCampaignRequest>) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adsService.updateCampaign(id, updates);
          if (result.success) {
            // Refresh campaigns list after update
            await get().fetchCampaigns();
            set({ isLoading: false });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update campaign',
            isLoading: false,
          });
          return false;
        }
      },

      pauseCampaignApi: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adsService.pauseCampaign(id);
          if (result.success) {
            // Update local state immediately
            set((state) => ({
              campaigns: state.campaigns.map((campaign) =>
                campaign.id === id
                  ? { ...campaign, isPaused: true, status: 'paused' as const }
                  : campaign
              ),
              isLoading: false,
            }));
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to pause campaign',
            isLoading: false,
          });
          return false;
        }
      },

      resumeCampaignApi: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adsService.resumeCampaign(id);
          if (result.success) {
            // Update local state immediately
            set((state) => ({
              campaigns: state.campaigns.map((campaign) =>
                campaign.id === id
                  ? { ...campaign, isPaused: false, status: 'active' as const }
                  : campaign
              ),
              isLoading: false,
            }));
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to resume campaign',
            isLoading: false,
          });
          return false;
        }
      },

      stopCampaignApi: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adsService.stopCampaign(id);
          if (result.success) {
            // Update local state immediately
            set((state) => ({
              campaigns: state.campaigns.map((campaign) =>
                campaign.id === id
                  ? { ...campaign, isStopped: true, status: 'stopped' as const }
                  : campaign
              ),
              isLoading: false,
            }));
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to stop campaign',
            isLoading: false,
          });
          return false;
        }
      },

      // ============================================
      // Legacy Local Actions (for backwards compatibility)
      // ============================================

      addCampaign: (campaignData) => {
        const newCampaign: AdCampaign = {
          ...campaignData,
          id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isPaused: campaignData.isPaused ?? false,
          isStopped: campaignData.isStopped ?? false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
        }));

        return newCampaign;
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id
              ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
              : campaign
          ),
        }));
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
        }));
      },

      getCampaignById: (id) => {
        return get().campaigns.find((campaign) => campaign.id === id);
      },

      getCampaignsByType: (type) => {
        return get().campaigns.filter((campaign) => campaign.type === type);
      },

      pauseCampaign: (id) => {
        // Try API first, then fall back to local
        get().pauseCampaignApi(id).catch(() => {
          set((state) => ({
            campaigns: state.campaigns.map((campaign) =>
              campaign.id === id
                ? {
                    ...campaign,
                    isPaused: true,
                    isStopped: false,
                    status: 'paused' as const,
                    updatedAt: new Date().toISOString()
                  }
                : campaign
            ),
          }));
        });
      },

      resumeCampaign: (id) => {
        // Try API first, then fall back to local
        get().resumeCampaignApi(id).catch(() => {
          set((state) => ({
            campaigns: state.campaigns.map((campaign) =>
              campaign.id === id
                ? {
                    ...campaign,
                    isPaused: false,
                    isStopped: false,
                    status: 'active' as const,
                    updatedAt: new Date().toISOString()
                  }
                : campaign
            ),
          }));
        });
      },

      startCampaign: (id) => {
        // Try API resume first, then fall back to local
        get().resumeCampaignApi(id).catch(() => {
          set((state) => ({
            campaigns: state.campaigns.map((campaign) =>
              campaign.id === id
                ? {
                    ...campaign,
                    isPaused: false,
                    isStopped: false,
                    status: 'active' as const,
                    updatedAt: new Date().toISOString()
                  }
                : campaign
            ),
          }));
        });
      },

      stopCampaign: (id) => {
        // Try API first, then fall back to local
        get().stopCampaignApi(id).catch(() => {
          set((state) => ({
            campaigns: state.campaigns.map((campaign) =>
              campaign.id === id
                ? {
                    ...campaign,
                    isPaused: false,
                    isStopped: true,
                    status: 'completed' as const,
                    updatedAt: new Date().toISOString()
                  }
                : campaign
            ),
          }));
        });
      },

      // ============================================
      // Utils
      // ============================================

      clearError: () => {
        set({ error: null, walletError: null });
      },
    }),
    {
      name: "ads-storage",
      storage: indexedDbStorage,
      partialize: (state) => ({
        campaigns: state.campaigns,
      }),
    }
  )
);
