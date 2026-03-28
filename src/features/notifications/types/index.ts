/**
 * Notification type enum matching backend NotificationType
 */
export enum NotificationType {
  System = 0,
  NewFollower = 1,
  GiftReceived = 2,
  NewContent = 3,
  Comment = 4,
  Like = 5,
  Achievement = 6,
  BadgeEarned = 7,
  MedalEarned = 8,
  WithdrawalProcessed = 9,
  WithdrawalFailed = 10,
  ContentUnlocked = 11,
  Milestone = 12,
  Promotion = 13,
}

/**
 * Single notification DTO from backend
 */
export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string;
  imageUrl?: string;
  actionUrl?: string;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Paginated notification list response
 */
export interface NotificationListDto {
  notifications: NotificationDto[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Real-time notification payload from SignalR
 */
export interface RealTimeNotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string;
  imageUrl?: string;
  actionUrl?: string;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  createdAt: string;
}

/**
 * Unread count response
 */
export interface UnreadCountDto {
  unreadCount: number;
}

/**
 * Mark as read response
 */
export interface MarkReadResponse {
  markedCount: number;
  success: boolean;
}

/**
 * Single notification preference
 */
export interface NotificationPreferenceDto {
  type: NotificationType;
  typeName: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

/**
 * User notification preferences
 */
export interface UserNotificationPreferencesDto {
  userId: string;
  preferences: NotificationPreferenceDto[];
  globalPushEnabled: boolean;
  globalEmailEnabled: boolean;
}

/**
 * Request to update a single notification preference
 */
export interface UpdateNotificationPreferenceRequest {
  type: NotificationType;
  inAppEnabled?: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
}

/**
 * Request to update all notification preferences
 */
export interface UpdateAllPreferencesRequest {
  preferences: UpdateNotificationPreferenceRequest[];
}

/**
 * Request to mark notifications as read
 */
export interface MarkNotificationsReadRequest {
  notificationIds: string[];
}

/**
 * Request to register device token for push notifications
 */
export interface RegisterDeviceTokenRequest {
  token: string;
  platform: string;
  deviceId?: string;
}

/**
 * Legacy Notification interface for backward compatibility
 * Maps NotificationDto to the existing component interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  // Extended fields from NotificationDto
  imageUrl?: string;
  actorName?: string;
  actorAvatarUrl?: string;
}

/**
 * Maps NotificationType enum to legacy notification type for UI display
 */
export function mapNotificationTypeToLegacy(type: NotificationType): Notification['type'] {
  switch (type) {
    case NotificationType.WithdrawalFailed:
      return 'error';
    case NotificationType.System:
    case NotificationType.Milestone:
      return 'warning';
    case NotificationType.GiftReceived:
    case NotificationType.NewFollower:
    case NotificationType.Achievement:
    case NotificationType.BadgeEarned:
    case NotificationType.MedalEarned:
    case NotificationType.ContentUnlocked:
    case NotificationType.WithdrawalProcessed:
      return 'success';
    case NotificationType.NewContent:
    case NotificationType.Comment:
    case NotificationType.Like:
    case NotificationType.Promotion:
    default:
      return 'info';
  }
}

/**
 * Converts NotificationDto to legacy Notification format for UI components
 */
export function mapDtoToNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    type: mapNotificationTypeToLegacy(dto.type),
    isRead: dto.isRead,
    createdAt: dto.createdAt,
    readAt: dto.readAt,
    actionUrl: dto.actionUrl,
    imageUrl: dto.imageUrl,
    actorName: dto.actorName,
    actorAvatarUrl: dto.actorAvatarUrl,
  };
}

/**
 * Converts RealTimeNotificationDto to legacy Notification format
 */
export function mapRealTimeToNotification(dto: RealTimeNotificationDto): Notification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    type: mapNotificationTypeToLegacy(dto.type),
    isRead: false, // Real-time notifications are always unread initially
    createdAt: dto.createdAt,
    actionUrl: dto.actionUrl,
    imageUrl: dto.imageUrl,
    actorName: dto.actorName,
    actorAvatarUrl: dto.actorAvatarUrl,
  };
}
