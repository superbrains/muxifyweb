import type { Notification } from "../types";

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Complete Verification',
    message: 'Lorem ipsum dolor sit amet consectetur. Pharetra a vel duis sed rhoncus ac commodo amet ut.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionUrl: '/onboarding/artist/identity-verification',
    actionLabel: 'Complete Now',
  },
  {
    id: '2',
    title: 'Complete Verification',
    message: 'Lorem ipsum dolor sit amet consectetur. Pharetra a vel duis sed rhoncus ac commodo amet ut.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    actionUrl: '/onboarding/company/company-identity-verification',
    actionLabel: 'Complete Now',
  },
  {
    id: '3',
    title: 'Fund wallet to publish ads',
    message: 'Lorem ipsum dolor sit amet consectetur. Pharetra a vel duis sed rhoncus ac commodo amet ut.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    actionUrl: '/payments',
    actionLabel: 'Add Funds',
  },
  {
    id: '4',
    title: 'New fan subscription',
    message: 'You have a new subscriber on your latest release.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actionUrl: '/fans-subscribers',
  },
  {
    id: '5',
    title: 'Payment received',
    message: 'Your payment of ₦50,000 has been processed successfully.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    actionUrl: '/payments',
  },
];

class NotificationService {
  private notifications: Notification[] = [...mockNotifications];

  /**
   * Get all notifications
   */
  async getNotifications(): Promise<Notification[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sort by createdAt descending (newest first)
    return [...this.notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
    }
    
    return notification!;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.notifications.forEach(notification => {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  /**
   * Create a new notification (for testing)
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    
    this.notifications.unshift(newNotification);
    return newNotification;
  }
}

export const notificationService = new NotificationService();

