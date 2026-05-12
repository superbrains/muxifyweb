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

interface ArtistState {
  // UI selection state for the ArtistDropdown (which roster artist is the
  // record-label user currently acting as). Persisted so the choice survives
  // navigations and reloads. The roster itself comes from the backend via
  // useRoster() — no local copy is kept here.
  selectedArtistId: string | null;
  setSelectedArtist: (artistId: string | null) => void;

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
      selectedArtistId: null,
      setSelectedArtist: (artistId) => set({ selectedArtistId: artistId }),

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
      partialize: (state) => ({
        selectedArtistId: state.selectedArtistId,
      }),
    }
  )
);
