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
  LeaderboardPeriod,
} from '../types';

const LEADERBOARD_BASE = '/leaderboard';

/**
 * Leaderboard API service
 */
export const leaderboardService = {
  // ============================================
  // Top Gifters
  // ============================================

  /**
   * GET /api/v1/leaderboard/top-gifters
   * Get top fans ranked by total gift value sent
   */
  async getTopGifters(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<TopGiftersLeaderboardDto> {
    try {
      const response = await axiosInstance.get<TopGiftersLeaderboardDto>(
        `${LEADERBOARD_BASE}/top-gifters`,
        {
          params: { take, period },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch top gifters'));
    }
  },

  // ============================================
  // Most Gifted Artists
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-gifted
   * Get artists ranked by total gifts received
   */
  async getMostGiftedArtists(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<MostGiftedArtistsLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostGiftedArtistsLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-gifted`,
        {
          params: { take, period },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most gifted artists'));
    }
  },

  // ============================================
  // Most Played Tracks
  // ============================================

  /**
   * GET /api/v1/leaderboard/most-played
   * Get tracks ranked by total play count
   */
  async getMostPlayedTracks(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<MostPlayedTracksLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostPlayedTracksLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-played`,
        {
          params: { take, period },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most played tracks'));
    }
  },

  // ============================================
  // Artist Top Fans
  // ============================================

  /**
   * GET /api/v1/leaderboard/artist/{artistId}/top-fans
   * Get the top fans for a specific artist
   */
  async getArtistTopFans(
    artistId: string,
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<ArtistTopFansLeaderboardDto> {
    try {
      const response = await axiosInstance.get<ArtistTopFansLeaderboardDto>(
        `${LEADERBOARD_BASE}/artist/${artistId}/top-fans`,
        {
          params: { take, period },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist top fans'));
    }
  },

  // ============================================
  // Leaderboard Stats
  // ============================================

  /**
   * GET /api/v1/leaderboard/stats
   * Get leaderboard earnings statistics
   */
  async getLeaderboardStats(
    period: LeaderboardPeriod = 'day'
  ): Promise<LeaderboardStatsDto> {
    try {
      const response = await axiosInstance.get<LeaderboardStatsDto>(
        `${LEADERBOARD_BASE}/stats`,
        {
          params: { period },
        }
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
   * Get content with most unlocks
   */
  async getHighestUnlocked(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    contentType?: 'track' | 'video'
  ): Promise<HighestUnlockedLeaderboardDto> {
    try {
      const response = await axiosInstance.get<HighestUnlockedLeaderboardDto>(
        `${LEADERBOARD_BASE}/highest-unlocked`,
        {
          params: { take, period, contentType },
        }
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
   * Get most watched videos
   */
  async getMostWatchedVideos(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<MostWatchedVideosLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostWatchedVideosLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-watched`,
        {
          params: { take, period },
        }
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
   * Get top albums by play count
   */
  async getTopAlbums(
    take = 10,
    period: LeaderboardPeriod = 'all-time'
  ): Promise<TopAlbumsLeaderboardDto> {
    try {
      const response = await axiosInstance.get<TopAlbumsLeaderboardDto>(
        `${LEADERBOARD_BASE}/top-albums`,
        {
          params: { take, period },
        }
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
   * Get most shared content
   */
  async getMostShared(
    take = 10,
    period: LeaderboardPeriod = 'all-time',
    contentType?: 'track' | 'video'
  ): Promise<MostSharedLeaderboardDto> {
    try {
      const response = await axiosInstance.get<MostSharedLeaderboardDto>(
        `${LEADERBOARD_BASE}/most-shared`,
        {
          params: { take, period, contentType },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch most shared content'));
    }
  },
};
