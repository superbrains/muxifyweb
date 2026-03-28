/**
 * Content Streaming Service
 * Integrates with the backend API endpoints from ContentEndpoints.cs
 * Provides streaming URLs and play event tracking for tracks and videos
 */

import { axiosInstance } from '@app/lib/axiosInstance';

// =============================================================================
// Types (from Muxify.Modules.Fans.Application.DTOs)
// =============================================================================

/**
 * Featured artist information
 */
export interface FeaturedArtistDto {
  userId?: string;
  name: string;
  role?: string;
}

/**
 * Detailed track information for content endpoint
 * Maps to TrackDetailDto from ContentDtos.cs
 */
export interface TrackDetailDto {
  id: string;
  title: string;
  description?: string;
  artistId: string;
  artistName: string;
  artistAvatarUrl?: string;
  albumId?: string;
  albumName?: string;
  genreName?: string;
  coverArtUrl?: string;
  durationSeconds: number;
  releaseDate?: string;
  isrc?: string;
  bpm?: number;
  musicalKey?: string;
  playCount: number;
  likeCount: number;
  shareCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;

  // Fan-specific properties
  isUnlocked: boolean;
  unlockCostCoins: number;
  isLiked: boolean;
  isArtistFollowed: boolean;

  // Featured artists
  featuredArtists: FeaturedArtistDto[];
}

/**
 * Detailed video information for content endpoint
 * Maps to VideoDetailDto from ContentDtos.cs
 */
export interface VideoDetailDto {
  id: string;
  title: string;
  description?: string;
  artistId: string;
  artistName: string;
  artistAvatarUrl?: string;
  videoType: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  resolution?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;

  // Fan-specific properties
  isUnlocked: boolean;
  unlockCostCoins: number;
  isLiked: boolean;
  isArtistFollowed: boolean;
}

/**
 * Streaming URL response
 * Maps to StreamingUrlDto from ContentDtos.cs
 */
export interface StreamingUrlDto {
  url: string;
  expiresAt: string;
  quality: string;
  format: string;
}

/**
 * Play event response
 * Maps to PlayEventDto from ContentDtos.cs
 */
export interface PlayEventDto {
  playHistoryId: string;
  success: boolean;
  message?: string;
}

/**
 * Request for recording a play event
 * Maps to RecordPlayRequest in ContentEndpoints.cs
 */
export interface RecordPlayRequest {
  platform?: string;
  durationSeconds?: number;
}

/**
 * Album detail with tracks
 * Maps to AlbumDetailDto from ContentDtos.cs
 */
export interface AlbumDetailDto {
  id: string;
  title: string;
  description?: string;
  artistId: string;
  artistAvatarUrl?: string;
  coverArtUrl?: string;
  releaseType: string;
  releaseDate?: string;
  totalTracks: number;
  totalDurationSeconds: number;
  playCount: number;
  likeCount: number;
  createdAt: string;

  // Fan-specific
  isArtistFollowed: boolean;

  // Tracks
  tracks: AlbumTrackDto[];
}

/**
 * Track within an album
 * Maps to AlbumTrackDto from ContentDtos.cs
 */
export interface AlbumTrackDto {
  id: string;
  trackNumber: number;
  title: string;
  durationSeconds: number;
  playCount: number;
  isUnlocked: boolean;
  unlockCostCoins: number;
}

/**
 * Playlist detail with tracks
 * Maps to PlaylistDetailDto from ContentDtos.cs
 */
export interface PlaylistDetailDto {
  id: string;
  name: string;
  description?: string;
  coverArtUrl?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  totalTracks: number;
  totalDurationSeconds: number;
  followerCount: number;
  createdAt: string;
  updatedAt?: string;

  // Tracks
  tracks: PlaylistTrackDto[];
}

/**
 * Track within a playlist
 * Maps to PlaylistTrackDto from ContentDtos.cs
 */
export interface PlaylistTrackDto {
  id: string;
  position: number;
  title: string;
  artistName: string;
  artistId: string;
  coverArtUrl?: string;
  durationSeconds: number;
  isUnlocked: boolean;
  addedAt: string;
}

/**
 * Unlock content response
 * Maps to UnlockContentResponse from ContentUnlockDtos.cs
 */
export interface UnlockContentResponse {
  success: boolean;
  unlockId: string;
  coinsSpent: number;
  newBalance: number;
  streamUrl?: string;
  message?: string;
}

/**
 * Unlocked content item
 * Maps to UnlockedContentDto from ContentUnlockDtos.cs
 */
export interface UnlockedContentDto {
  id: string;
  type: 'track' | 'video';
  contentId: string;
  title: string;
  artistName?: string;
  artistId?: string;
  coverArtUrl?: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  coinsSpent: number;
  unlockedAt: string;
}

/**
 * Paginated unlocked content list
 * Maps to UnlockedContentListDto from ContentUnlockDtos.cs
 */
export interface UnlockedContentListDto {
  items: UnlockedContentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Content unlock status
 * Maps to UnlockStatusDto from ContentUnlockDtos.cs
 */
export interface UnlockStatusDto {
  contentId: string;
  contentType: string;
  isUnlocked: boolean;
  unlockCostCoins?: number;
  unlockedAt?: string;
  isPremiumContent: boolean;
  canAfford: boolean;
  currentBalance: number;
}

// =============================================================================
// Service Implementation
// =============================================================================

export const contentService = {
  // ===========================================================================
  // Track Content
  // ===========================================================================

  /**
   * Get track details
   * GET /api/v1/content/tracks/{id}
   */
  getTrackDetail: async (id: string): Promise<TrackDetailDto> => {
    const response = await axiosInstance.get<TrackDetailDto>(`/content/tracks/${id}`);
    return response.data;
  },

  /**
   * Get streaming URL for a track
   * GET /api/v1/content/tracks/{id}/stream
   */
  getTrackStreamUrl: async (id: string, quality?: string): Promise<StreamingUrlDto> => {
    const response = await axiosInstance.get<StreamingUrlDto>(`/content/tracks/${id}/stream`, {
      params: quality ? { quality } : undefined,
    });
    return response.data;
  },

  /**
   * Record a play event for a track
   * POST /api/v1/content/tracks/{id}/play
   */
  recordTrackPlay: async (
    id: string,
    data?: RecordPlayRequest
  ): Promise<PlayEventDto> => {
    const response = await axiosInstance.post<PlayEventDto>(`/content/tracks/${id}/play`, data);
    return response.data;
  },

  /**
   * Unlock a premium track with coins
   * POST /api/v1/content/tracks/{id}/unlock
   */
  unlockTrack: async (id: string): Promise<UnlockContentResponse> => {
    const response = await axiosInstance.post<UnlockContentResponse>(
      `/content/tracks/${id}/unlock`
    );
    return response.data;
  },

  // ===========================================================================
  // Video Content
  // ===========================================================================

  /**
   * Get video details
   * GET /api/v1/content/videos/{id}
   */
  getVideoDetail: async (id: string): Promise<VideoDetailDto> => {
    const response = await axiosInstance.get<VideoDetailDto>(`/content/videos/${id}`);
    return response.data;
  },

  /**
   * Get streaming URL for a video
   * GET /api/v1/content/videos/{id}/stream
   */
  getVideoStreamUrl: async (id: string, quality?: string): Promise<StreamingUrlDto> => {
    const response = await axiosInstance.get<StreamingUrlDto>(`/content/videos/${id}/stream`, {
      params: quality ? { quality } : undefined,
    });
    return response.data;
  },

  /**
   * Record a play/view event for a video
   * POST /api/v1/content/videos/{id}/play
   */
  recordVideoPlay: async (
    id: string,
    data?: RecordPlayRequest
  ): Promise<PlayEventDto> => {
    const response = await axiosInstance.post<PlayEventDto>(`/content/videos/${id}/play`, data);
    return response.data;
  },

  /**
   * Unlock a premium video with coins
   * POST /api/v1/content/videos/{id}/unlock
   */
  unlockVideo: async (id: string): Promise<UnlockContentResponse> => {
    const response = await axiosInstance.post<UnlockContentResponse>(
      `/content/videos/${id}/unlock`
    );
    return response.data;
  },

  // ===========================================================================
  // Albums & Playlists
  // ===========================================================================

  /**
   * Get album details with tracks
   * GET /api/v1/content/albums/{id}
   */
  getAlbumDetail: async (id: string): Promise<AlbumDetailDto> => {
    const response = await axiosInstance.get<AlbumDetailDto>(`/content/albums/${id}`);
    return response.data;
  },

  /**
   * Get playlist details with tracks
   * GET /api/v1/content/playlists/{id}
   */
  getPlaylistDetail: async (id: string): Promise<PlaylistDetailDto> => {
    const response = await axiosInstance.get<PlaylistDetailDto>(`/content/playlists/${id}`);
    return response.data;
  },

  // ===========================================================================
  // Unlocked Content
  // ===========================================================================

  /**
   * Get user's unlocked content
   * GET /api/v1/content/unlocked
   */
  getUnlockedContent: async (
    page = 1,
    pageSize = 20
  ): Promise<UnlockedContentListDto> => {
    const response = await axiosInstance.get<UnlockedContentListDto>('/content/unlocked', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Check content unlock status
   * GET /api/v1/content/{type}/{id}/unlock-status
   */
  getUnlockStatus: async (
    type: 'tracks' | 'videos',
    id: string
  ): Promise<UnlockStatusDto> => {
    const response = await axiosInstance.get<UnlockStatusDto>(
      `/content/${type}/${id}/unlock-status`
    );
    return response.data;
  },
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format play count for display (e.g., 1.2K, 3.4M)
 */
export function formatPlayCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Check if streaming URL is expired
 */
export function isStreamUrlExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date();
}

/**
 * Get platform identifier for play events
 */
export function getPlatform(): string {
  if (typeof window === 'undefined') return 'server';

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mobile')) return 'mobile-web';
  if (userAgent.includes('tablet')) return 'tablet-web';
  return 'desktop-web';
}
