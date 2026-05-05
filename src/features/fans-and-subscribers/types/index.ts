/**
 * Fan & Subscriber Types
 * Based on backend DTOs from FanProfileDtos.cs
 */

// ============================================
// Badge & Medal DTOs
// ============================================

/**
 * User badge earned through engagement
 */
export interface UserBadgeDto {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  earnedAt: string;
}

/**
 * User medal earned through gifting
 */
export interface UserMedalDto {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  earnedAt: string;
}

// ============================================
// Fan Profile DTOs
// ============================================

/**
 * Public profile information for a fan
 */
export interface FanPublicProfileDto {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  // Gamification
  currentMedal?: string;
  medalIcon?: string;
  medalColor?: string;
  badgeCount: number;
  totalPoints: number;
  currentStreak: number;
  // Engagement
  totalGiftValue: number;
  artistsSupportedCount: number;
  followingCount: number;
  featuredBadges: UserBadgeDto[];
  medals: UserMedalDto[];
}

// ============================================
// Fan Activity DTOs
// ============================================

/**
 * Activity types for fan engagement
 */
export type FanActivityType =
  | 'play'
  | 'gift'
  | 'unlock'
  | 'share'
  | 'follow'
  | 'badge_earned'
  | 'medal_earned';

/**
 * Single fan activity entry
 */
export interface FanActivityDto {
  id: string;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  activityType: string;
  activityAt: string;
  points: number;
  artistId?: string;
  artistName?: string;
  trackId?: string;
  trackTitle?: string;
  videoId?: string;
  videoTitle?: string;
  coinValue?: number;
  giftType?: string;
  badgeName?: string;
  medalName?: string;
}

/**
 * Paginated list of fan activities
 */
export interface FanActivityListDto {
  activities: FanActivityDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Supported Artists DTOs
// ============================================

/**
 * Artist supported by a fan through gifts
 */
export interface SupportedArtistDto {
  artistId: string;
  artistName?: string;
  avatarUrl?: string;
  totalGiftValue: number;
  giftCount: number;
  firstGiftAt: string;
  lastGiftAt: string;
  isFollowing: boolean;
}

/**
 * Paginated list of supported artists
 */
export interface SupportedArtistsListDto {
  artists: SupportedArtistDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// UI Helper Types
// ============================================

/**
 * Leaderboard card item for display
 */
export interface FanLeaderboardItem {
  rank: number;
  name: string;
  value: string;
  avatar?: string;
  avatarUrl?: string;
  country?: string;
}

/**
 * Activity table row for display
 */
export interface FanActivityTableRow {
  no: number;
  name: string;
  category: string;
  totalCounts: string;
  date: string;
  amount: string;
}

/**
 * Time filter periods
 */
export type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Maps TimeFilter to LeaderboardPeriod
 */
export function mapTimeFilterToPeriod(filter: TimeFilter): 'day' | 'week' | 'month' | 'all-time' {
  switch (filter) {
    case 'daily':
      return 'day';
    case 'weekly':
      return 'week';
    case 'monthly':
      return 'month';
    case 'yearly':
      return 'all-time';
    default:
      return 'all-time';
  }
}

/**
 * Maps activity type to display category
 */
export function mapActivityTypeToCategory(type: string): string {
  switch (type.toLowerCase()) {
    case 'gift':
      return 'Gifting';
    case 'unlock':
      return 'Unlocked';
    case 'share':
      return 'Shares';
    case 'play':
      return 'Plays';
    case 'follow':
      return 'Following';
    case 'badge_earned':
      return 'Badge';
    case 'medal_earned':
      return 'Medal';
    default:
      return type;
  }
}

/**
 * Formats a date string to display format
 */
export function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
