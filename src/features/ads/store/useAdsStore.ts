import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";

export interface AdCampaign {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'audio';
  location: {
    country: string;
    state: string;
  };
  target: {
    type: 'music' | 'video' | 'audio';
    genre?: string;
    artists?: string[];
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
  };
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
  // Media files (base64 encoded)
  mediaData?: string;
  mediaName?: string;
  mediaSize?: string;
}

interface AdsState {
  campaigns: AdCampaign[];
  
  // Actions
  addCampaign: (campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>) => AdCampaign;
  updateCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaignById: (id: string) => AdCampaign | undefined;
  getCampaignsByType: (type: 'photo' | 'video' | 'audio') => AdCampaign[];
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      
      addCampaign: (campaignData) => {
        const newCampaign: AdCampaign = {
          ...campaignData,
          id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
