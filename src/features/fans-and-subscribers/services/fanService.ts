import { axiosInstance } from '@app/lib/axiosInstance';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type {
  FanPublicProfileDto,
  FanActivityListDto,
  SupportedArtistsListDto,
  FollowedArtistsListDto,
  UserBadgeListDto,
  UserMedalListDto,
} from '../types';

const FANS_BASE = '/fans';

/**
 * Fan Profile API service
 * Handles all fan-related API calls
 */
export const fanService = {
  // ============================================
  // Fan Profile
  // ============================================

  /**
   * GET /api/v1/fans/{fanId}/profile
   * Get public profile for a specific fan
   */
  async getFanProfile(fanId: string): Promise<FanPublicProfileDto> {
    try {
      const response = await axiosInstance.get<FanPublicProfileDto>(
        `${FANS_BASE}/${fanId}/profile`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch fan profile'));
    }
  },

  // ============================================
  // Fan Activity
  // ============================================

  /**
   * GET /api/v1/fans/{fanId}/activity
   * Get paginated activity history for a fan
   */
  async getFanActivity(
    fanId: string,
    page = 1,
    pageSize = 20
  ): Promise<FanActivityListDto> {
    try {
      const response = await axiosInstance.get<FanActivityListDto>(
        `${FANS_BASE}/${fanId}/activity`,
        {
          params: { page, pageSize },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch fan activity'));
    }
  },

  // ============================================
  // Supported Artists
  // ============================================

  /**
   * GET /api/v1/fans/{fanId}/supported-artists
   * Get list of artists supported by a fan through gifts
   */
  async getSupportedArtists(
    fanId: string,
    page = 1,
    pageSize = 20
  ): Promise<SupportedArtistsListDto> {
    try {
      const response = await axiosInstance.get<SupportedArtistsListDto>(
        `${FANS_BASE}/${fanId}/supported-artists`,
        {
          params: { page, pageSize },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch supported artists'));
    }
  },

  // ============================================
  // Followed Artists
  // ============================================

  /**
   * GET /api/v1/fans/{fanId}/followed-artists
   */
  async getFollowedArtists(
    fanId: string,
    page = 1,
    pageSize = 20
  ): Promise<FollowedArtistsListDto> {
    try {
      const response = await axiosInstance.get<FollowedArtistsListDto>(
        `${FANS_BASE}/${fanId}/followed-artists`,
        { params: { page, pageSize } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch followed artists'));
    }
  },

  // ============================================
  // Achievements
  // ============================================

  /**
   * GET /api/v1/fans/{fanId}/badges
   */
  async getFanBadges(fanId: string): Promise<UserBadgeListDto> {
    try {
      const response = await axiosInstance.get<UserBadgeListDto>(
        `${FANS_BASE}/${fanId}/badges`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch badges'));
    }
  },

  /**
   * GET /api/v1/fans/{fanId}/medals
   */
  async getFanMedals(fanId: string): Promise<UserMedalListDto> {
    try {
      const response = await axiosInstance.get<UserMedalListDto>(
        `${FANS_BASE}/${fanId}/medals`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch medals'));
    }
  },
};
