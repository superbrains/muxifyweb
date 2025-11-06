import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";
import type { AdCampaign } from "../types";

// Re-export for backwards compatibility
export type { AdCampaign } from "../types";

interface AdsState {
  campaigns: AdCampaign[];
  
  // Actions
  addCampaign: (campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>) => AdCampaign;
  updateCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaignById: (id: string) => AdCampaign | undefined;
  getCampaignsByType: (type: 'photo' | 'video' | 'audio') => AdCampaign[];
  pauseCampaign: (id: string) => void;
  resumeCampaign: (id: string) => void;
  startCampaign: (id: string) => void;
  stopCampaign: (id: string) => void;
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      
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
      },
      
      resumeCampaign: (id) => {
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
      },
      
      startCampaign: (id) => {
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
      },
      
      stopCampaign: (id) => {
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
