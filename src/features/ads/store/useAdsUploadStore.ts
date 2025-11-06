import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";

// Upload file interface
export interface UploadFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "ready" | "error";
  file?: File; // File object (not persisted)
  url?: string; // For preview (persisted)
}

// Common fields across all ad types
export interface AdBaseInfo {
  title: string;
  location: {
    country: string;
    state: string;
  };
  target: {
    type: "music" | "video" | "photo";
    genre?: string;
    artists?: string[]; // Array of artist IDs
  };
  schedule: {
    date: Date | null;
    startTime: string;
    endTime: string;
    ampm: "AM" | "PM";
  };
}

// Call to Action
export interface CallToAction {
  action: "signup" | "download" | "view" | "click";
  link: string;
}

// Budget and Reach
export interface BudgetReach {
  amount: number;
  impressions: number;
}

// Combined ads upload state
interface AdsUploadState {
  // Tab management
  activeTab: "photo" | "video" | "audio";
  currentFlow: number; // 1, 2, 3, or 4 for each tab

  // Photo Ads
  photoFile: UploadFile | null;
  photoAdInfo: AdBaseInfo | null;
  photoCallToAction: CallToAction | null;
  photoBudgetReach: BudgetReach | null;

  // Video Ads
  videoFile: UploadFile | null;
  videoAdInfo: AdBaseInfo | null;
  videoCallToAction: CallToAction | null;
  videoBudgetReach: BudgetReach | null;
  videoTrimStart: number; // Trim start time in seconds
  videoTrimEnd: number; // Trim end time in seconds

  // Music Ads
  musicFile: UploadFile | null;
  musicAdInfo: AdBaseInfo | null;
  musicCallToAction: CallToAction | null;
  musicBudgetReach: BudgetReach | null;
  musicTrimStart: number; // Trim start time in seconds
  musicTrimEnd: number; // Trim end time in seconds

  // Actions
  setActiveTab: (tab: "photo" | "video" | "audio") => void;
  setCurrentFlow: (flow: number) => void;

  // Photo Ads actions
  photoSetFile: (file: UploadFile | null) => void;
  photoSetAdInfo: (info: AdBaseInfo | null) => void;
  photoSetCallToAction: (cta: CallToAction | null) => void;
  photoSetBudgetReach: (budget: BudgetReach | null) => void;
  resetPhotoAds: () => void;

  // Video Ads actions
  videoSetFile: (file: UploadFile | null) => void;
  videoSetAdInfo: (info: AdBaseInfo | null) => void;
  videoSetCallToAction: (cta: CallToAction | null) => void;
  videoSetBudgetReach: (budget: BudgetReach | null) => void;
  videoSetTrimStart: (start: number) => void;
  videoSetTrimEnd: (end: number) => void;
  resetVideoAds: () => void;

  // Music Ads actions
  musicSetFile: (file: UploadFile | null) => void;
  musicSetAdInfo: (info: AdBaseInfo | null) => void;
  musicSetCallToAction: (cta: CallToAction | null) => void;
  musicSetBudgetReach: (budget: BudgetReach | null) => void;
  musicSetTrimStart: (start: number) => void;
  musicSetTrimEnd: (end: number) => void;
  resetMusicAds: () => void;

  // Reset all
  resetAllAds: () => void;
}

const initialState = {
  activeTab: "photo" as const,
  currentFlow: 1,

  // Photo Ads
  photoFile: null,
  photoAdInfo: null,
  photoCallToAction: null,
  photoBudgetReach: null,

  // Video Ads
  videoFile: null,
  videoAdInfo: null,
  videoCallToAction: null,
  videoBudgetReach: null,
  videoTrimStart: 0,
  videoTrimEnd: 5,

  // Music Ads
  musicFile: null,
  musicAdInfo: null,
  musicCallToAction: null,
  musicBudgetReach: null,
  musicTrimStart: 0,
  musicTrimEnd: 5,
};

export const useAdsUploadStore = create<AdsUploadState>()(
  persist(
    (set) => ({
      ...initialState,

      // Tab management
      setActiveTab: (tab) => set({ activeTab: tab, currentFlow: 1 }),
      setCurrentFlow: (flow) => set({ currentFlow: flow }),

      // Photo Ads
      photoSetFile: (file) => set({ photoFile: file }),
      photoSetAdInfo: (info) => set({ photoAdInfo: info }),
      photoSetCallToAction: (cta) => set({ photoCallToAction: cta }),
      photoSetBudgetReach: (budget) => set({ photoBudgetReach: budget }),
      resetPhotoAds: () =>
        set({
          photoFile: null,
          photoAdInfo: null,
          photoCallToAction: null,
          photoBudgetReach: null,
        }),

      // Video Ads
      videoSetFile: (file) => set({ videoFile: file }),
      videoSetAdInfo: (info) => set({ videoAdInfo: info }),
      videoSetCallToAction: (cta) => set({ videoCallToAction: cta }),
      videoSetBudgetReach: (budget) => set({ videoBudgetReach: budget }),
      videoSetTrimStart: (start) => set({ videoTrimStart: start }),
      videoSetTrimEnd: (end) => set({ videoTrimEnd: end }),
      resetVideoAds: () =>
        set({
          videoFile: null,
          videoAdInfo: null,
          videoCallToAction: null,
          videoBudgetReach: null,
          videoTrimStart: 0,
          videoTrimEnd: 5,
        }),

      // Music Ads
      musicSetFile: (file) => set({ musicFile: file }),
      musicSetAdInfo: (info) => set({ musicAdInfo: info }),
      musicSetCallToAction: (cta) => set({ musicCallToAction: cta }),
      musicSetBudgetReach: (budget) => set({ musicBudgetReach: budget }),
      musicSetTrimStart: (start) => set({ musicTrimStart: start }),
      musicSetTrimEnd: (end) => set({ musicTrimEnd: end }),
      resetMusicAds: () =>
        set({
          musicFile: null,
          musicAdInfo: null,
          musicCallToAction: null,
          musicBudgetReach: null,
          musicTrimStart: 0,
          musicTrimEnd: 5,
        }),

      // Reset all
      resetAllAds: () => set(initialState),
    }),
    {
      name: "ads-upload-storage",
      storage: indexedDbStorage,
      partialize: (state) => {
        // Exclude file objects from persistence as they can't be serialized
        const excludeFile = (file: UploadFile | null) => {
          if (!file) return null;
          return {
            id: file.id,
            name: file.name,
            size: file.size,
            progress: file.progress,
            status: file.status,
            url: file.url,
          };
        };

        return {
          photoFile: excludeFile(state.photoFile),
          videoFile: excludeFile(state.videoFile),
          musicFile: excludeFile(state.musicFile),
          photoAdInfo: state.photoAdInfo,
          videoAdInfo: state.videoAdInfo,
          musicAdInfo: state.musicAdInfo,
          photoCallToAction: state.photoCallToAction,
          videoCallToAction: state.videoCallToAction,
          musicCallToAction: state.musicCallToAction,
          photoBudgetReach: state.photoBudgetReach,
          videoBudgetReach: state.videoBudgetReach,
          videoTrimStart: state.videoTrimStart,
          videoTrimEnd: state.videoTrimEnd,
          musicBudgetReach: state.musicBudgetReach,
          musicTrimStart: state.musicTrimStart,
          musicTrimEnd: state.musicTrimEnd,
          activeTab: state.activeTab,
          currentFlow: state.currentFlow,
        };
      },
    }
  )
);
