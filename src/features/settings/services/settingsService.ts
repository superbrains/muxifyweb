import { axiosInstance } from '@app/lib/axiosInstance';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type {
  UserNotificationPreferencesDto,
  UpdateNotificationPreferencesRequest,
} from '../types';

const NOTIFICATIONS_BASE = '/notifications';

/**
 * Settings API service
 * Handles notification preferences API calls
 * Note: Security settings (2FA, sessions) have NO backend endpoints yet
 */
export const settingsService = {
  // ============================================
  // Notification Preferences
  // ============================================

  /**
   * GET /api/v1/notifications/preferences
   * Get current user's notification preferences
   */
  async getNotificationPreferences(): Promise<UserNotificationPreferencesDto> {
    try {
      const response = await axiosInstance.get<UserNotificationPreferencesDto>(
        `${NOTIFICATIONS_BASE}/preferences`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch notification preferences'));
    }
  },

  /**
   * PUT /api/v1/notifications/preferences
   * Update user's notification preferences
   */
  async updateNotificationPreferences(
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<UserNotificationPreferencesDto> {
    try {
      const response = await axiosInstance.put<UserNotificationPreferencesDto>(
        `${NOTIFICATIONS_BASE}/preferences`,
        preferences
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update notification preferences'));
    }
  },

  /**
   * Toggle a single notification preference
   * Convenience method for toggling individual settings
   */
  async togglePreference(
    key: keyof UserNotificationPreferencesDto,
    value: boolean
  ): Promise<UserNotificationPreferencesDto> {
    return this.updateNotificationPreferences({ [key]: value });
  },
};
