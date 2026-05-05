import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";
import { artistService } from "@shared/services/artistService";
import type {
  ArtistPublicProfileDto,
  ArtistContentListDto,
  ArtistTrackDto,
  ArtistAlbumDto,
  ArtistVideoDto,
  NewReleaseDto,
  TrackSortBy,
} from "@shared/types/artist";

/**
 * Local artist record for record label management
 * Note: Record label management endpoints are not yet available on the backend
 * This local state is preserved until those endpoints are created
 */
export interface Artist {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  genre?: string;
  userType?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArtistState {
  // ============================================
  // Record Label Management (Local State)
  // Note: Kept as local state until backend endpoints are available
  // ============================================
  artists: Artist[];
  selectedArtistId: string | null;

  // Local artist CRUD actions (for record label management)
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>) => Artist;
  updateArtist: (id: string, updates: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
  setSelectedArtist: (artistId: string | null) => void;
  getSelectedArtist: () => Artist | null;
  getArtistById: (id: string) => Artist | undefined;

  // ============================================
  // Public Artist Profile (API Integration)
  // ============================================
  artistProfile: ArtistPublicProfileDto | null;
  artistTracks: ArtistContentListDto<ArtistTrackDto> | null;
  artistAlbums: ArtistContentListDto<ArtistAlbumDto> | null;
  artistVideos: ArtistContentListDto<ArtistVideoDto> | null;
  artistNewReleases: ArtistContentListDto<NewReleaseDto> | null;

  // Loading states
  isLoadingProfile: boolean;
  isLoadingTracks: boolean;
  isLoadingAlbums: boolean;
  isLoadingVideos: boolean;
  isLoadingNewReleases: boolean;
  isFollowLoading: boolean;

  // Error states
  profileError: string | null;
  tracksError: string | null;
  albumsError: string | null;
  videosError: string | null;
  newReleasesError: string | null;

  // API actions
  fetchArtistProfile: (artistId: string) => Promise<ArtistPublicProfileDto | null>;
  fetchArtistTracks: (artistId: string, page?: number, pageSize?: number, sortBy?: TrackSortBy) => Promise<void>;
  fetchArtistAlbums: (artistId: string, page?: number, pageSize?: number) => Promise<void>;
  fetchArtistVideos: (artistId: string, page?: number, pageSize?: number) => Promise<void>;
  fetchArtistNewReleases: (artistId: string, days?: number, page?: number, pageSize?: number) => Promise<void>;
  followArtist: (artistId: string) => Promise<boolean>;
  unfollowArtist: (artistId: string) => Promise<boolean>;
  toggleFollowArtist: (artistId: string) => Promise<boolean>;

  // Clear states
  clearArtistProfile: () => void;
  clearAllArtistData: () => void;
}

export const useArtistStore = create<ArtistState>()(
  persist(
    (set, get) => ({
      // ============================================
      // Record Label Management State (Local)
      // ============================================
      artists: [],
      selectedArtistId: null,

      // ============================================
      // Public Artist Profile State (API)
      // ============================================
      artistProfile: null,
      artistTracks: null,
      artistAlbums: null,
      artistVideos: null,
      artistNewReleases: null,

      isLoadingProfile: false,
      isLoadingTracks: false,
      isLoadingAlbums: false,
      isLoadingVideos: false,
      isLoadingNewReleases: false,
      isFollowLoading: false,

      profileError: null,
      tracksError: null,
      albumsError: null,
      videosError: null,
      newReleasesError: null,

      // ============================================
      // Record Label Management Actions (Local)
      // ============================================
      addArtist: (artistData) => {
        const newArtist: Artist = {
          ...artistData,
          id: `artist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          artists: [...state.artists, newArtist],
        }));

        return newArtist;
      },

      updateArtist: (id, updates) => {
        set((state) => ({
          artists: state.artists.map((artist) =>
            artist.id === id
              ? { ...artist, ...updates, updatedAt: new Date().toISOString() }
              : artist
          ),
        }));
      },

      deleteArtist: (id) => {
        set((state) => ({
          artists: state.artists.filter((artist) => artist.id !== id),
          selectedArtistId: state.selectedArtistId === id ? null : state.selectedArtistId,
        }));
      },

      setSelectedArtist: (artistId) => {
        set({ selectedArtistId: artistId });
      },

      getSelectedArtist: () => {
        const state = get();
        if (!state.selectedArtistId) return null;
        return state.artists.find((a) => a.id === state.selectedArtistId) || null;
      },

      getArtistById: (id) => {
        return get().artists.find((artist) => artist.id === id);
      },

      // ============================================
      // Public Artist Profile Actions (API)
      // ============================================
      fetchArtistProfile: async (artistId: string) => {
        set({ isLoadingProfile: true, profileError: null });
        try {
          const profile = await artistService.getArtistProfile(artistId);
          set({ artistProfile: profile, isLoadingProfile: false });
          return profile;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch artist profile';
          set({ profileError: message, isLoadingProfile: false });
          return null;
        }
      },

      fetchArtistTracks: async (artistId: string, page = 1, pageSize = 20, sortBy?: TrackSortBy) => {
        set({ isLoadingTracks: true, tracksError: null });
        try {
          const tracks = await artistService.getArtistTracks(artistId, page, pageSize, sortBy);
          set({ artistTracks: tracks, isLoadingTracks: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch artist tracks';
          set({ tracksError: message, isLoadingTracks: false });
        }
      },

      fetchArtistAlbums: async (artistId: string, page = 1, pageSize = 20) => {
        set({ isLoadingAlbums: true, albumsError: null });
        try {
          const albums = await artistService.getArtistAlbums(artistId, page, pageSize);
          set({ artistAlbums: albums, isLoadingAlbums: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch artist albums';
          set({ albumsError: message, isLoadingAlbums: false });
        }
      },

      fetchArtistVideos: async (artistId: string, page = 1, pageSize = 20) => {
        set({ isLoadingVideos: true, videosError: null });
        try {
          const videos = await artistService.getArtistVideos(artistId, page, pageSize);
          set({ artistVideos: videos, isLoadingVideos: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch artist videos';
          set({ videosError: message, isLoadingVideos: false });
        }
      },

      fetchArtistNewReleases: async (artistId: string, days = 30, page = 1, pageSize = 20) => {
        set({ isLoadingNewReleases: true, newReleasesError: null });
        try {
          const releases = await artistService.getArtistNewReleases(artistId, days, page, pageSize);
          set({ artistNewReleases: releases, isLoadingNewReleases: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch new releases';
          set({ newReleasesError: message, isLoadingNewReleases: false });
        }
      },

      followArtist: async (artistId: string) => {
        set({ isFollowLoading: true });
        try {
          const result = await artistService.followArtist(artistId);
          // Update local profile if it matches
          const state = get();
          if (state.artistProfile?.id === artistId) {
            set({
              artistProfile: {
                ...state.artistProfile,
                isFollowing: result.isFollowing,
                followerCount: result.artistFollowerCount,
              },
            });
          }
          set({ isFollowLoading: false });
          return result.success;
        } catch {
          set({ isFollowLoading: false });
          return false;
        }
      },

      unfollowArtist: async (artistId: string) => {
        set({ isFollowLoading: true });
        try {
          const result = await artistService.unfollowArtist(artistId);
          // Update local profile if it matches
          const state = get();
          if (state.artistProfile?.id === artistId) {
            set({
              artistProfile: {
                ...state.artistProfile,
                isFollowing: result.isFollowing,
                followerCount: result.artistFollowerCount,
              },
            });
          }
          set({ isFollowLoading: false });
          return result.success;
        } catch {
          set({ isFollowLoading: false });
          return false;
        }
      },

      toggleFollowArtist: async (artistId: string) => {
        const state = get();
        const isCurrentlyFollowing = state.artistProfile?.isFollowing ?? false;

        if (isCurrentlyFollowing) {
          return get().unfollowArtist(artistId);
        }
        return get().followArtist(artistId);
      },

      clearArtistProfile: () => {
        set({
          artistProfile: null,
          artistTracks: null,
          artistAlbums: null,
          artistVideos: null,
          artistNewReleases: null,
          profileError: null,
          tracksError: null,
          albumsError: null,
          videosError: null,
          newReleasesError: null,
        });
      },

      clearAllArtistData: () => {
        set({
          artistProfile: null,
          artistTracks: null,
          artistAlbums: null,
          artistVideos: null,
          artistNewReleases: null,
          profileError: null,
          tracksError: null,
          albumsError: null,
          videosError: null,
          newReleasesError: null,
          isLoadingProfile: false,
          isLoadingTracks: false,
          isLoadingAlbums: false,
          isLoadingVideos: false,
          isLoadingNewReleases: false,
          isFollowLoading: false,
        });
      },
    }),
    {
      name: "artist-storage",
      storage: indexedDbStorage,
      // Only persist local record label management data, not API-fetched data
      partialize: (state) => ({
        artists: state.artists,
        selectedArtistId: state.selectedArtistId,
      }),
    }
  )
);

