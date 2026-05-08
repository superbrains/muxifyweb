import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SingleItem, AlbumItem } from "../types";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";
import { uploadMusicService } from "@/features/upload-music/services/uploadMusicService";
import { albumService } from "@/features/upload-music/services/albumService";
import type { AlbumManageDto } from "@/features/upload-music/types/album";
import type { TrackDto, UpdateTrackRequest } from "@/features/upload-music/types";
import { getApiErrorMessage } from "@/shared/lib/errorUtils";

// =============================================================================
// Extended Store State with API Integration
// =============================================================================

interface MusicStoreState {
  // Data
  singles: SingleItem[];
  albums: AlbumItem[];

  // Loading states
  isLoading: boolean;
  isDeleting: string | null; // Track ID being deleted
  isUpdating: string | null; // Track ID being updated

  // Error state
  error: string | null;

  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // API Actions
  fetchTracks: (page?: number, pageSize?: number) => Promise<void>;
  fetchAlbums: () => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  updateTrack: (id: string, data: UpdateTrackRequest) => Promise<void>;
  refreshTracks: () => Promise<void>;
  clearError: () => void;

  // Local State Actions (for optimistic updates and local-only operations)
  addSingle: (item: SingleItem) => void;
  addAlbum: (item: AlbumItem) => void;
  removeSingle: (id: string) => void;
  removeAlbum: (id: string) => void;
  updateSingle: (id: string, item: Partial<SingleItem>) => void;
  updateAlbum: (id: string, item: Partial<AlbumItem>) => void;
  getSingleById: (id: string) => SingleItem | undefined;
  getAlbumById: (id: string) => AlbumItem | undefined;
}

// =============================================================================
// Helper: Transform TrackDto to SingleItem
// =============================================================================

function albumDtoToAlbumItem(dto: AlbumManageDto): AlbumItem {
  return {
    id: dto.id,
    title: dto.title,
    artist: dto.artistName,
    artists: [{ id: dto.artistId, name: dto.artistName, role: "Primary" }],
    album: dto.title,
    releaseDate: dto.releaseDate ?? dto.createdAt,
    plays: 0,
    unlocks: 0,
    gifts: 0,
    coverArt: dto.coverArtThumbnail ?? dto.coverArtUrl ?? "",
    isPublished: dto.isPublished,
    tracks: [], // The grid only needs metadata; the album editor fetches tracks on demand.
    genre: dto.genreName ? [dto.genreName] : [],
    releaseType: [dto.releaseType],
    unlockCost: [],
    allowSponsorship: [],
    releaseYear: dto.releaseDate
      ? new Date(dto.releaseDate).getFullYear().toString()
      : new Date(dto.createdAt).getFullYear().toString(),
    createdAt: dto.createdAt,
  };
}

function trackDtoToSingleItem(track: TrackDto): SingleItem {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artists: [track.artist], // Single artist as array
    releaseDate: track.releaseDate || track.createdAt,
    plays: track.playCount,
    unlocks: 0, // Not in TrackDto, default to 0
    gifts: 0, // Not in TrackDto, default to 0
    coverArt: track.thumbnail || "",
    genre: track.genre ? [track.genre] : [],
    releaseType: [],
    unlockCost: [],
    allowSponsorship: [],
    releaseYear: track.releaseDate
      ? new Date(track.releaseDate).getFullYear().toString()
      : new Date(track.createdAt).getFullYear().toString(),
    createdAt: track.createdAt,
  };
}

// =============================================================================
// Store Implementation
// =============================================================================

export const useMusicStore = create<MusicStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      singles: [],
      albums: [],
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
       * Fetch tracks from the API
       */
      fetchTracks: async (page = 1, pageSize = 20) => {
        set({ isLoading: true, error: null });

        try {
          const response = await uploadMusicService.getTracks({ page, pageSize });

          // Transform API response to frontend format
          const singles = response.items.map(trackDtoToSingleItem);

          set({
            singles,
            totalCount: response.totalCount,
            currentPage: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to fetch tracks"),
            isLoading: false,
          });
        }
      },

      /**
       * Fetch albums from /api/v1/albums (drafts + published).
       */
      fetchAlbums: async () => {
        set({ error: null });
        try {
          const dtos = await albumService.listMyAlbums(true);
          set({ albums: dtos.map(albumDtoToAlbumItem) });
        } catch (error) {
          set({ error: getApiErrorMessage(error, "Failed to fetch albums") });
        }
      },

      /**
       * Delete a track via API
       */
      deleteTrack: async (id: string) => {
        set({ isDeleting: id, error: null });

        try {
          await uploadMusicService.deleteTrack(id);

          // Remove from local state after successful API call
          set((state) => ({
            singles: state.singles.filter((item) => item.id !== id),
            totalCount: state.totalCount - 1,
            isDeleting: null,
          }));
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to delete track"),
            isDeleting: null,
          });
          throw error;
        }
      },

      /**
       * Delete an album via API.
       */
      deleteAlbum: async (id: string) => {
        set({ isDeleting: id, error: null });
        try {
          await albumService.deleteAlbum(id);
          set((state) => ({
            albums: state.albums.filter((item) => item.id !== id),
            isDeleting: null,
          }));
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to delete album"),
            isDeleting: null,
          });
          throw error;
        }
      },

      /**
       * Update track metadata via API
       */
      updateTrack: async (id: string, data: UpdateTrackRequest) => {
        set({ isUpdating: id, error: null });

        try {
          const updatedTrack = await uploadMusicService.updateTrack(id, data);

          // Update local state with response
          set((state) => ({
            singles: state.singles.map((item) =>
              item.id === id ? trackDtoToSingleItem(updatedTrack) : item
            ),
            isUpdating: null,
          }));
        } catch (error) {
          set({
            error: getApiErrorMessage(error, "Failed to update track"),
            isUpdating: null,
          });
          throw error;
        }
      },

      /**
       * Refresh tracks (re-fetch current page)
       */
      refreshTracks: async () => {
        const { currentPage, pageSize } = get();
        await get().fetchTracks(currentPage, pageSize);
      },

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),

      // =============================================================================
      // Local State Actions (for optimistic updates)
      // =============================================================================

      addSingle: (item: SingleItem) => {
        set((state) => ({
          singles: [item, ...state.singles],
          totalCount: state.totalCount + 1,
        }));
      },

      addAlbum: (item: AlbumItem) => {
        set((state) => ({
          albums: [item, ...state.albums],
        }));
      },

      removeSingle: (id: string) => {
        set((state) => ({
          singles: state.singles.filter((item) => item.id !== id),
          totalCount: state.totalCount - 1,
        }));
      },

      removeAlbum: (id: string) => {
        set((state) => ({
          albums: state.albums.filter((item) => item.id !== id),
        }));
      },

      updateSingle: (id: string, updatedItem: Partial<SingleItem>) => {
        set((state) => ({
          singles: state.singles.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));
      },

      updateAlbum: (id: string, updatedItem: Partial<AlbumItem>) => {
        set((state) => ({
          albums: state.albums.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));
      },

      getSingleById: (id: string) => {
        return get().singles.find((item) => item.id === id);
      },

      getAlbumById: (id: string) => {
        return get().albums.find((item) => item.id === id);
      },
    }),
    {
      name: "muxify-music-storage",
      storage: indexedDbStorage,
      // Only persist essential data, not loading states
      partialize: (state) => ({
        singles: state.singles,
        albums: state.albums,
        totalCount: state.totalCount,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        totalPages: state.totalPages,
      }),
    }
  )
);
