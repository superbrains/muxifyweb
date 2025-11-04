import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification } from "../types";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  setLoading: (isLoading: boolean) => void;
  getUnreadCount: () => number;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification) => {
        const currentNotifications = get().notifications;
        const updatedNotifications = [notification, ...currentNotifications];
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },

      markAsRead: (notificationId) => {
        const currentNotifications = get().notifications;
        const updatedNotifications = currentNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },

      markAllAsRead: () => {
        const currentNotifications = get().notifications;
        const updatedNotifications = currentNotifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }));
        set({ notifications: updatedNotifications, unreadCount: 0 });
      },

      deleteNotification: (notificationId) => {
        const currentNotifications = get().notifications;
        const updatedNotifications = currentNotifications.filter(
          notification => notification.id !== notificationId
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      setLoading: (isLoading) => set({ isLoading }),

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.isRead).length;
      },

      fetchNotifications: async () => {
        set({ isLoading: true });
        try {
          const { notificationService } = await import("../services/notificationService");
          const notifications = await notificationService.getNotifications();
          get().setNotifications(notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "notification-storage",
      storage: indexedDbStorage,
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

