/**
 * Settings Types
 * Based on backend DTOs from NotificationDtos.cs
 */

// ============================================
// Notification Preferences DTOs
// ============================================

/**
 * User notification preferences for email, push, and in-app notifications
 * GET/PUT /api/v1/notifications/preferences
 */
export interface UserNotificationPreferencesDto {
  // Email notifications
  emailGiftReceived: boolean;
  emailContentUnlocked: boolean;
  emailNewFollower: boolean;
  emailWeeklyDigest: boolean;
  // Push notifications
  pushGiftReceived: boolean;
  pushContentUnlocked: boolean;
  pushNewFollower: boolean;
  pushNewRelease: boolean;
  // In-app notifications
  inAppGiftReceived: boolean;
  inAppContentUnlocked: boolean;
  inAppNewFollower: boolean;
  inAppNewRelease: boolean;
}

// ============================================
// Update Request Types
// ============================================

/**
 * Partial update for notification preferences
 */
export type UpdateNotificationPreferencesRequest = Partial<UserNotificationPreferencesDto>;

// ============================================
// UI Helper Types
// ============================================

/**
 * Notification category for grouping preferences in the UI
 */
export type NotificationCategory = 'email' | 'push' | 'inApp';

/**
 * Individual notification setting for display
 */
export interface NotificationSetting {
  key: keyof UserNotificationPreferencesDto;
  label: string;
  description: string;
  category: NotificationCategory;
}

/**
 * Grouped notification settings for UI display
 */
export const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  // Email notifications
  {
    key: 'emailGiftReceived',
    label: 'Gift Received',
    description: 'Receive email when someone sends you a gift',
    category: 'email',
  },
  {
    key: 'emailContentUnlocked',
    label: 'Content Unlocked',
    description: 'Receive email when someone unlocks your content',
    category: 'email',
  },
  {
    key: 'emailNewFollower',
    label: 'New Follower',
    description: 'Receive email when someone follows you',
    category: 'email',
  },
  {
    key: 'emailWeeklyDigest',
    label: 'Weekly Digest',
    description: 'Receive a weekly summary of your activity',
    category: 'email',
  },
  // Push notifications
  {
    key: 'pushGiftReceived',
    label: 'Gift Received',
    description: 'Push notification when someone sends you a gift',
    category: 'push',
  },
  {
    key: 'pushContentUnlocked',
    label: 'Content Unlocked',
    description: 'Push notification when someone unlocks your content',
    category: 'push',
  },
  {
    key: 'pushNewFollower',
    label: 'New Follower',
    description: 'Push notification when someone follows you',
    category: 'push',
  },
  {
    key: 'pushNewRelease',
    label: 'New Release',
    description: 'Push notification for new releases from artists you follow',
    category: 'push',
  },
  // In-app notifications
  {
    key: 'inAppGiftReceived',
    label: 'Gift Received',
    description: 'In-app notification when someone sends you a gift',
    category: 'inApp',
  },
  {
    key: 'inAppContentUnlocked',
    label: 'Content Unlocked',
    description: 'In-app notification when someone unlocks your content',
    category: 'inApp',
  },
  {
    key: 'inAppNewFollower',
    label: 'New Follower',
    description: 'In-app notification when someone follows you',
    category: 'inApp',
  },
  {
    key: 'inAppNewRelease',
    label: 'New Release',
    description: 'In-app notification for new releases from artists you follow',
    category: 'inApp',
  },
];

/**
 * Get notification settings by category
 */
export function getSettingsByCategory(category: NotificationCategory): NotificationSetting[] {
  return NOTIFICATION_SETTINGS.filter((setting) => setting.category === category);
}

/**
 * Default notification preferences (all enabled)
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferencesDto = {
  emailGiftReceived: true,
  emailContentUnlocked: true,
  emailNewFollower: true,
  emailWeeklyDigest: true,
  pushGiftReceived: true,
  pushContentUnlocked: true,
  pushNewFollower: true,
  pushNewRelease: true,
  inAppGiftReceived: true,
  inAppContentUnlocked: true,
  inAppNewFollower: true,
  inAppNewRelease: true,
};
