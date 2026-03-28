import { axiosInstance } from '@app/lib/axiosInstance';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type {
  NotificationListDto,
  UnreadCountDto,
  MarkReadResponse,
  UserNotificationPreferencesDto,
  UpdateAllPreferencesRequest,
  MarkNotificationsReadRequest,
  RegisterDeviceTokenRequest,
} from '../types';

const NOTIFICATIONS_BASE = '/notifications';

/**
 * Notification API service for REST endpoints
 */
export const notificationService = {
  /**
   * GET /api/v1/notifications
   * Fetches paginated notifications for the current user
   */
  async getNotifications(
    page = 1,
    pageSize = 20
  ): Promise<NotificationListDto> {
    try {
      const response = await axiosInstance.get<NotificationListDto>(
        NOTIFICATIONS_BASE,
        {
          params: { page, pageSize },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch notifications'));
    }
  },

  /**
   * GET /api/v1/notifications/unread-count
   * Gets the current unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountDto> {
    try {
      const response = await axiosInstance.get<UnreadCountDto>(
        `${NOTIFICATIONS_BASE}/unread-count`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch unread count'));
    }
  },

  /**
   * POST /api/v1/notifications/mark-read
   * Marks specific notifications as read
   */
  async markAsRead(notificationIds: string[]): Promise<MarkReadResponse> {
    try {
      const request: MarkNotificationsReadRequest = { notificationIds };
      const response = await axiosInstance.post<MarkReadResponse>(
        `${NOTIFICATIONS_BASE}/mark-read`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to mark notifications as read'));
    }
  },

  /**
   * POST /api/v1/notifications/mark-all-read
   * Marks all notifications as read
   */
  async markAllAsRead(): Promise<MarkReadResponse> {
    try {
      const response = await axiosInstance.post<MarkReadResponse>(
        `${NOTIFICATIONS_BASE}/mark-all-read`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to mark all notifications as read'));
    }
  },

  /**
   * GET /api/v1/notifications/preferences
   * Gets user notification preferences
   */
  async getPreferences(): Promise<UserNotificationPreferencesDto> {
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
   * Updates user notification preferences
   */
  async updatePreferences(
    request: UpdateAllPreferencesRequest
  ): Promise<UserNotificationPreferencesDto> {
    try {
      const response = await axiosInstance.put<UserNotificationPreferencesDto>(
        `${NOTIFICATIONS_BASE}/preferences`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update notification preferences'));
    }
  },

  /**
   * POST /api/v1/notifications/device-token
   * Registers a device token for push notifications
   */
  async registerDeviceToken(request: RegisterDeviceTokenRequest): Promise<boolean> {
    try {
      const response = await axiosInstance.post<boolean>(
        `${NOTIFICATIONS_BASE}/device-token`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to register device token'));
    }
  },

  /**
   * DELETE /api/v1/notifications/device-token/{token}
   * Unregisters a device token from push notifications
   */
  async unregisterDeviceToken(token: string): Promise<boolean> {
    try {
      const response = await axiosInstance.delete<boolean>(
        `${NOTIFICATIONS_BASE}/device-token/${encodeURIComponent(token)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to unregister device token'));
    }
  },
};
