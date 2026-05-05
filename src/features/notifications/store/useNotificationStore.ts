import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { indexedDbStorage } from '@/shared/lib/indexedDbStorage';
import { notificationService } from '../services/notificationService';
import { signalRService } from '@shared/services/signalRService';
import type {
  Notification,
  RealTimeNotificationDto,
  NotificationListDto,
} from '../types';
import { mapDtoToNotification, mapRealTimeToNotification } from '../types';

interface NotificationState {
  // Data
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isMarkingRead: boolean;
  error: string | null;

  // SignalR connection state
  isConnected: boolean;

  // Actions
  fetchNotifications: (page?: number, pageSize?: number) => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Real-time handlers
  handleNewNotification: (notification: RealTimeNotificationDto) => void;
  handleUnreadCountUpdate: (count: number) => void;
  handleNotificationsMarkedRead: (notificationIds: string[]) => void;

  // SignalR connection management
  connectSignalR: () => Promise<void>;
  disconnectSignalR: () => Promise<void>;
  setConnectionState: (connected: boolean) => void;

  // Local state management
  addNotification: (notification: Notification) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      page: 1,
      pageSize: 20,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
      isMarkingRead: false,
      error: null,
      isConnected: false,

      /**
       * Fetches notifications from the API
       */
      fetchNotifications: async (page = 1, pageSize = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response: NotificationListDto = await notificationService.getNotifications(page, pageSize);
          const mappedNotifications = response.notifications.map(mapDtoToNotification);

          set({
            notifications: mappedNotifications,
            unreadCount: response.unreadCount,
            totalCount: response.totalCount,
            page: response.page,
            pageSize: response.pageSize,
            hasMore: response.hasMore,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
          console.error('[NotificationStore] Error fetching notifications:', error);
          set({ error: errorMessage, isLoading: false });
        }
      },

      /**
       * Loads more notifications (pagination)
       */
      fetchMoreNotifications: async () => {
        const { hasMore, isLoadingMore, page, pageSize, notifications } = get();
        if (!hasMore || isLoadingMore) return;

        set({ isLoadingMore: true, error: null });
        try {
          const response = await notificationService.getNotifications(page + 1, pageSize);
          const mappedNotifications = response.notifications.map(mapDtoToNotification);

          set({
            notifications: [...notifications, ...mappedNotifications],
            page: response.page,
            hasMore: response.hasMore,
            totalCount: response.totalCount,
            isLoadingMore: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load more notifications';
          console.error('[NotificationStore] Error loading more notifications:', error);
          set({ error: errorMessage, isLoadingMore: false });
        }
      },

      /**
       * Fetches only the unread count
       */
      fetchUnreadCount: async () => {
        try {
          const response = await notificationService.getUnreadCount();
          set({ unreadCount: response.unreadCount });
        } catch (error) {
          console.error('[NotificationStore] Error fetching unread count:', error);
        }
      },

      /**
       * Marks a single notification as read
       */
      markAsRead: async (notificationId: string) => {
        const { notifications } = get();
        const notification = notifications.find(n => n.id === notificationId);

        // Skip if already read
        if (notification?.isRead) return;

        set({ isMarkingRead: true });

        // Optimistic update
        set({
          notifications: notifications.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          ),
          unreadCount: Math.max(0, get().unreadCount - 1),
        });

        try {
          await notificationService.markAsRead([notificationId]);
          set({ isMarkingRead: false });
        } catch (error) {
          // Revert optimistic update on error
          console.error('[NotificationStore] Error marking notification as read:', error);
          set({
            notifications: notifications,
            unreadCount: get().unreadCount + 1,
            isMarkingRead: false,
          });
        }
      },

      /**
       * Marks multiple notifications as read
       */
      markMultipleAsRead: async (notificationIds: string[]) => {
        if (notificationIds.length === 0) return;

        const { notifications, unreadCount } = get();
        const unreadToMark = notificationIds.filter(id => {
          const n = notifications.find(notif => notif.id === id);
          return n && !n.isRead;
        });

        if (unreadToMark.length === 0) return;

        set({ isMarkingRead: true });

        // Optimistic update
        const now = new Date().toISOString();
        set({
          notifications: notifications.map(n =>
            notificationIds.includes(n.id)
              ? { ...n, isRead: true, readAt: now }
              : n
          ),
          unreadCount: Math.max(0, unreadCount - unreadToMark.length),
        });

        try {
          await notificationService.markAsRead(notificationIds);
          set({ isMarkingRead: false });
        } catch (error) {
          // Revert on error
          console.error('[NotificationStore] Error marking notifications as read:', error);
          set({
            notifications: notifications,
            unreadCount: unreadCount,
            isMarkingRead: false,
          });
        }
      },

      /**
       * Marks all notifications as read
       */
      markAllAsRead: async () => {
        const { notifications } = get();

        set({ isMarkingRead: true });

        // Optimistic update
        const now = new Date().toISOString();
        set({
          notifications: notifications.map(n => ({
            ...n,
            isRead: true,
            readAt: n.readAt || now,
          })),
          unreadCount: 0,
        });

        try {
          await notificationService.markAllAsRead();
          set({ isMarkingRead: false });
        } catch (error) {
          // Revert on error
          console.error('[NotificationStore] Error marking all notifications as read:', error);
          const originalUnreadCount = notifications.filter(n => !n.isRead).length;
          set({
            notifications: notifications,
            unreadCount: originalUnreadCount,
            isMarkingRead: false,
          });
        }
      },

      /**
       * Handles a new real-time notification from SignalR
       */
      handleNewNotification: (notification: RealTimeNotificationDto) => {
        const { notifications, unreadCount } = get();
        const mappedNotification = mapRealTimeToNotification(notification);

        // Check if notification already exists
        const exists = notifications.some(n => n.id === notification.id);
        if (exists) return;

        set({
          notifications: [mappedNotification, ...notifications],
          unreadCount: unreadCount + 1,
          totalCount: get().totalCount + 1,
        });
      },

      /**
       * Handles unread count update from SignalR
       */
      handleUnreadCountUpdate: (count: number) => {
        set({ unreadCount: count });
      },

      /**
       * Handles notifications marked as read from SignalR (from another device/tab)
       */
      handleNotificationsMarkedRead: (notificationIds: string[]) => {
        const { notifications } = get();
        const now = new Date().toISOString();

        let markedCount = 0;
        const updatedNotifications = notifications.map(n => {
          if (notificationIds.includes(n.id) && !n.isRead) {
            markedCount++;
            return { ...n, isRead: true, readAt: now };
          }
          return n;
        });

        set({
          notifications: updatedNotifications,
          unreadCount: Math.max(0, get().unreadCount - markedCount),
        });
      },

      /**
       * Connects to SignalR hub for real-time notifications
       */
      connectSignalR: async () => {
        const store = get();

        // Set up SignalR event handlers
        signalRService.setHandlers({
          onReceiveNotification: (notification) => {
            store.handleNewNotification(notification as RealTimeNotificationDto);
          },
          onUnreadCountUpdated: (data) => {
            store.handleUnreadCountUpdate(data.unreadCount);
          },
          onNotificationsMarkedRead: (data) => {
            store.handleNotificationsMarkedRead(data.notificationIds);
          },
          onConnectionStateChanged: (state) => {
            set({ isConnected: state === 'connected' });
          },
        });

        try {
          await signalRService.connect();
          set({ isConnected: true });
        } catch (error) {
          console.error('[NotificationStore] Failed to connect to SignalR:', error);
          set({ isConnected: false });
        }
      },

      /**
       * Disconnects from SignalR hub
       */
      disconnectSignalR: async () => {
        try {
          await signalRService.disconnect();
          set({ isConnected: false });
        } catch (error) {
          console.error('[NotificationStore] Error disconnecting from SignalR:', error);
        }
      },

      /**
       * Sets the connection state
       */
      setConnectionState: (connected: boolean) => {
        set({ isConnected: connected });
      },

      /**
       * Adds a notification locally (for testing or local-only notifications)
       */
      addNotification: (notification: Notification) => {
        const { notifications, unreadCount } = get();
        const exists = notifications.some(n => n.id === notification.id);
        if (exists) return;

        set({
          notifications: [notification, ...notifications],
          unreadCount: notification.isRead ? unreadCount : unreadCount + 1,
          totalCount: get().totalCount + 1,
        });
      },

      /**
       * Deletes a notification locally
       */
      deleteNotification: (notificationId: string) => {
        const { notifications, unreadCount } = get();
        const notification = notifications.find(n => n.id === notificationId);

        set({
          notifications: notifications.filter(n => n.id !== notificationId),
          unreadCount: notification && !notification.isRead
            ? Math.max(0, unreadCount - 1)
            : unreadCount,
          totalCount: Math.max(0, get().totalCount - 1),
        });
      },

      /**
       * Clears all notifications locally
       */
      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
          totalCount: 0,
          page: 1,
          hasMore: false,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      getUnreadCount: () => get().unreadCount,
    }),
    {
      name: 'notification-storage',
      storage: indexedDbStorage,
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Only persist latest 50
        unreadCount: state.unreadCount,
      }),
    }
  )
);
