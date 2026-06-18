import { axiosInstance } from '@app/lib/axiosInstance';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type {
  TopGiftersLeaderboardDto,
  MostGiftedArtistsLeaderboardDto,
  MostPlayedTracksLeaderboardDto,
  ArtistTopFansLeaderboardDto,
  LeaderboardStatsDto,
  HighestUnlockedLeaderboardDto,
  MostWatchedVideosLeaderboardDto,
  TopAlbumsLeaderboardDto,
  MostSharedLeaderboardDto,
  TopSinglesLeaderboardDto,
  MostGiftedContentLeaderboardDto,
  ArtistTopUnlockersLeaderboardDto,
  FanCountryBreakdownDto,
  FanEngagementSummaryDto,
  LeaderboardPeriod,
  LeaderboardScope,
  FanMediaType,
  CountryDimension,
} from '../types';

const LEADERBOARD_BASE = '/leaderboard';

/**
 * Leaderboard API service.
 *
 * Most list endpoints accept a `scope` ("mine" | "global"): "mine" scopes the
 * ranking to the logged-in artist/creator's own content and fans; "global"
 * returns the platform-wide ranking.
 */
export const leaderboardService = {
  // ============================================
  // Top Gifters (platform-wide)
  // ============================================

  /**
   * GET /api/v1/leaderboard/top-gifters
   * Get top fans ranked by total gift value sent (platform-wide).
   */
  async getTopGifters(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<TopGiftersLeaderboardDto> {
    try {
      const response = await axiosInstance.get<TopGiftersLeaderboardDto>(
        `${LEADERBOARD_BASE}/top-gifters`,
        { params: { take, period } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch top gifters'));
    }
  },

  // ============================================
  // Most Gifted Artists (platform-wide)
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-gifted
   * Get artists ranked by total gifts received.
   */
  async getMostGiftedArtists(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<MostGiftedArtistsLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostGiftedArtistsLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-gifted`,
        { params: { take, period } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most gifted artists'));
    }
  },

  // ============================================
  // Most Gifted Content (tracks / videos)
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-gifted-content
   * Get tracks/videos ranked by total gift value received.
   */
  async getMostGiftedContent(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    contentType?: 'track' | 'video',
    scope: LeaderboardScope = 'global'
  ): Promise<MostGiftedContentLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostGiftedContentLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-gifted-content`,
        { params: { take, period, contentType, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most gifted content'));
    }
  },

  // ============================================
  // Most Played Tracks
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-played
   * Get tracks ranked by total play count.
   */
  async getMostPlayedTracks(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    scope: LeaderboardScope = 'global'
  ): Promise<MostPlayedTracksLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostPlayedTracksLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-played`,
        { params: { take, period, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most played tracks'));
    }
  },

  // ============================================
  // Top Singles
  // ============================================

  /**
   * GET /api/v1/leaderboard/top-singles
   * Get single-release tracks ranked by play count.
   */
  async getTopSingles(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    scope: LeaderboardScope = 'global'
  ): Promise<TopSinglesLeaderboardDto> {
    try {
      const response = await axiosInstance.get<TopSinglesLeaderboardDto>(
        `${LEADERBOARD_BASE}/top-singles`,
        { params: { take, period, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch top singles'));
    }
  },

  // ============================================
  // Artist Top Fans (scoped to a specific artist)
  // ============================================

  /**
   * GET /api/v1/leaderboard/artist/{artistId}/top-fans
   * Get the top fans for a specific artist.
   */
  async getArtistTopFans(
    artistId: string,
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    mediaType?: FanMediaType
  ): Promise<ArtistTopFansLeaderboardDto> {
    try {
      const response = await axiosInstance.get<ArtistTopFansLeaderboardDto>(
        `${LEADERBOARD_BASE}/artist/${artistId}/top-fans`,
        { params: { take, period, mediaType } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist top fans'));
    }
  },

  /**
   * GET /api/v1/leaderboard/artist/{artistId}/top-unlockers
   * Get the fans who unlocked the most of an artist's content.
   */
  async getArtistTopUnlockers(
    artistId: string,
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    mediaType?: FanMediaType
  ): Promise<ArtistTopUnlockersLeaderboardDto> {
    try {
      const response = await axiosInstance.get<ArtistTopUnlockersLeaderboardDto>(
        `${LEADERBOARD_BASE}/artist/${artistId}/top-unlockers`,
        { params: { take, period, mediaType } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist top unlockers'));
    }
  },

  /**
   * GET /api/v1/leaderboard/artist/{artistId}/country-breakdown
   * Break an artist's plays, gifts or unlocks down by the fan's country.
   */
  async getFanCountryBreakdown(
    artistId: string,
    dimension: CountryDimension,
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    mediaType?: FanMediaType
  ): Promise<FanCountryBreakdownDto> {
    try {
      const response = await axiosInstance.get<FanCountryBreakdownDto>(
        `${LEADERBOARD_BASE}/artist/${artistId}/country-breakdown`,
        { params: { dimension, take, period, mediaType } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch fan country breakdown'));
    }
  },

  /**
   * GET /api/v1/leaderboard/artist/{artistId}/fan-summary
   * Get an artist's media-aware fan engagement KPI summary.
   */
  async getFanEngagementSummary(
    artistId: string,
    period: LeaderboardPeriod = 'all-time',
    mediaType?: FanMediaType
  ): Promise<FanEngagementSummaryDto> {
    try {
      const response = await axiosInstance.get<FanEngagementSummaryDto>(
        `${LEADERBOARD_BASE}/artist/${artistId}/fan-summary`,
        { params: { period, mediaType } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch fan engagement summary'));
    }
  },

  // ============================================
  // Leaderboard Stats
  // ============================================

  /**
   * GET /api/v1/leaderboard/stats
   * Get leaderboard earnings statistics.
   */
  async getLeaderboardStats(
    period: LeaderboardPeriod = 'day'
  ): Promise<LeaderboardStatsDto> {
    try {
      const response = await axiosInstance.get<LeaderboardStatsDto>(
        `${LEADERBOARD_BASE}/stats`,
        { params: { period } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch leaderboard stats'));
    }
  },

  // ============================================
  // Highest Unlocked Content
  // ============================================

  /**
   * GET /api/v1/leaderboard/highest-unlocked
   * Get content with most unlocks.
   */
  async getHighestUnlocked(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    contentType?: 'track' | 'video',
    scope: LeaderboardScope = 'global'
  ): Promise<HighestUnlockedLeaderboardDto> {
    try {
      const response = await axiosInstance.get<HighestUnlockedLeaderboardDto>(
        `${LEADERBOARD_BASE}/highest-unlocked`,
        { params: { take, period, contentType, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch highest unlocked content'));
    }
  },

  // ============================================
  // Most Watched Videos
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-watched
   * Get most watched videos.
   */
  async getMostWatchedVideos(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    scope: LeaderboardScope = 'global'
  ): Promise<MostWatchedVideosLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostWatchedVideosLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-watched`,
        { params: { take, period, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most watched videos'));
    }
  },

  // ============================================
  // Top Albums
  // ============================================

  /**
   * GET /api/v1/leaderboard/top-albums
   * Get top albums by play count.
   */
  async getTopAlbums(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    scope: LeaderboardScope = 'global'
  ): Promise<TopAlbumsLeaderboardDto> {
    try {
      const response = await axiosInstance.get<TopAlbumsLeaderboardDto>(
        `${LEADERBOARD_BASE}/top-albums`,
        { params: { take, period, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch top albums'));
    }
  },

  // ============================================
  // Most Shared Content
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-shared
   * Get most shared content.
   */
  async getMostShared(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    contentType?: 'track' | 'video',
    scope: LeaderboardScope = 'global'
  ): Promise<MostSharedLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostSharedLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-shared`,
        { params: { take, period, contentType, scope } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most shared content'));
    }
  },
};
