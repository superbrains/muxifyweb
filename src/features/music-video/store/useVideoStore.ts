import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VideoItem, VideoStoreState } from "../types";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";

export const useVideoStore = create<VideoStoreState>()(
  persist(
    (set, get) => ({
      videoItems: [],

      addVideoItem: (item: VideoItem) => {
        set((state) => ({
          videoItems: [item, ...state.videoItems],
        }));
      },

      removeVideoItem: (id: string) => {
        set((state) => ({
          videoItems: state.videoItems.filter((item) => item.id !== id),
        }));
      },

      updateVideoItem: (id: string, updatedItem: Partial<VideoItem>) => {
        set((state) => ({
          videoItems: state.videoItems.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));
      },

      getVideoItemById: (id: string) => {
        return get().videoItems.find((item) => item.id === id);
      },
    }),
    {
      name: "muxify-video-storage",
      storage: indexedDbStorage,
    }
  )
);
