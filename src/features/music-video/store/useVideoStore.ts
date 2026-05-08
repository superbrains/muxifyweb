import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VideoItem } from "../types";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";
import { videoService } from "@/features/upload-video/services/videoService";
import type { VideoDto, UpdateVideoRequest } from "@/features/upload-video/types";
import { getApiErrorMessage } from "@/shared/lib/errorUtils";

// =============================================================================
// Extended Store State with API Integration
// =============================================================================

interface VideoStoreState {
  // Data
  videoItems: VideoItem[];

  // Loading states
  isLoading: boolean;
  isDeleting: string | null; // Video ID being deleted
  isUpdating: string | null; // Video ID being updated

  // Error state
  error: string | null;

  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // API Actions
  fetchVideos: (page?: number, pageSize?: number) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  updateVideo: (id: string, data: UpdateVideoRequest) => Promise<void>;
  refreshVideos: () => Promise<void>;
  clearError: () => void;

  // Local State Actions (for optimistic updates)
  addVideoItem: (item: VideoItem) => void;
  removeVideoItem: (id: string) => void;
  updateVideoItem: (id: string, item: Partial<VideoItem>) => void;
  getVideoItemById: (id: string) => VideoItem | undefined;
}

// =============================================================================
// Helper: Transform VideoDto to VideoItem
// =============================================================================

function videoDtoToVideoItem(video: VideoDto): VideoItem {
  return {
    id: video.id,
    title: video.title,
    artist: video.artist,
    releaseDate: video.createdAt,
    plays: video.viewCount,
    unlocks: 0, // Not in VideoDto, default to 0
    gifts: 0, // Not in VideoDto, default to 0
    thumbnail: video.thumbnail || "",
    videoFile: undefined as unknown as File, // Not available from API
    releaseType: video.videoType ? [video.videoType] : [],
    unlockCost: [],
    allowSponsorship: [],
    createdAt: video.createdAt,
  };
}

// =============================================================================
// Store Implementation
// =============================================================================

export const useVideoStore = create<VideoStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      videoItems: [],
      isLoading: false,
      isDeleting: null,
      isUpdating: null,
      error: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,

      // =============================================================================
      // API Actions
      // =============================================================================

      /**
       * Fetch videos from the API
       */
      fetchVideos: async (page = 1, pageSize = 20) => {
        set({ isLoading: true, error: null });

        try {
          const response = await videoService.getVideos({ page, pageSize });

          // Transform API response to frontend format
          const videoItems = response.items.map(videoDtoToVideoItem);

          set({
            videoItems,
            totalCount: response.totalCount,
            currentPage: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to fetch videos"),
            isLoading: false,
          });
        }
      },

      /**
       * Delete a video via API
       */
      deleteVideo: async (id: string) => {
        set({ isDeleting: id, error: null });

        try {
          await videoService.deleteVideo(id);

          // Remove from local state after successful API call
          set((state) => ({
            videoItems: state.videoItems.filter((item) => item.id !== id),
            totalCount: state.totalCount - 1,
            isDeleting: null,
          }));
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to delete video"),
            isDeleting: null,
          });
          throw error;
        }
      },

      /**
       * Update video metadata via API
       */
      updateVideo: async (id: string, data: UpdateVideoRequest) => {
        set({ isUpdating: id, error: null });

        try {
          const updatedVideo = await videoService.updateVideo(id, data);

          // Update local state with response
          set((state) => ({
            videoItems: state.videoItems.map((item) =>
              item.id === id ? videoDtoToVideoItem(updatedVideo) : item
            ),
            isUpdating: null,
          }));
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to update video"),
            isUpdating: null,
          });
          throw error;
        }
      },

      /**
       * Refresh videos (re-fetch current page)
       */
      refreshVideos: async () => {
        const { currentPage, pageSize } = get();
        await get().fetchVideos(currentPage, pageSize);
      },

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),

      // =============================================================================
      // Local State Actions (for optimistic updates)
      // =============================================================================

      addVideoItem: (item: VideoItem) => {
        set((state) => ({
          videoItems: [item, ...state.videoItems],
          totalCount: state.totalCount + 1,
        }));
      },

      removeVideoItem: (id: string) => {
        set((state) => ({
          videoItems: state.videoItems.filter((item) => item.id !== id),
          totalCount: state.totalCount - 1,
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
      // v2: strips base64 video/thumbnail blobs that previously OOM'd the browser
      // on hydration. The old "muxify-video-storage" key may still exist in
      // IndexedDB for existing users; it is intentionally orphaned and unread.
      name: "muxify-video-storage-v2",
      storage: indexedDbStorage,
      partialize: (state) => ({
        videoItems: state.videoItems.map((item) => {
          const { videoData: _vd, thumbnailData: _td, videoFile: _vf, ...rest } = item;
          return rest as VideoItem;
        }),
        totalCount: state.totalCount,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        totalPages: state.totalPages,
      }),
    }
  )
);
