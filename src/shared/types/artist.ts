/**
 * Artist Types
 * Based on backend DTOs from ArtistPublicDtos.cs
 */

// ============================================
// Artist Public Profile
// ============================================

/**
 * Public profile information for an artist
 */
export interface ArtistPublicProfileDto {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  country?: string;
  state?: string;
  website?: string;
  isVerified: boolean;
  joinedAt: string;
  // Social links
  instagram?: string;
  twitter?: string;
  tikTok?: string;
  youTube?: string;
  spotify?: string;
  facebook?: string;
  // Stats
  followerCount: number;
  totalPlays: number;
  trackCount: number;
  albumCount: number;
  videoCount: number;
  // Fan-specific
  isFollowing: boolean;
  notificationsEnabled: boolean;
}

// ============================================
// Artist Content DTOs
// ============================================

/**
 * Track information for artist profile
 */
export interface ArtistTrackDto {
  id: string;
  title: string;
  coverArtUrl?: string;
  albumId?: string;
  albumName?: string;
  genreName?: string;
  durationSeconds: number;
  playCount: number;
  likeCount: number;
  releaseDate?: string;
  createdAt: string;
  isUnlocked: boolean;
  unlockCostCoins: number;
}

/**
 * Album information for artist profile
 */
export interface ArtistAlbumDto {
  id: string;
  title: string;
  coverArtUrl?: string;
  releaseType: string;
  releaseDate?: string;
  trackCount: number;
  playCount: number;
  createdAt: string;
}

/**
 * Video information for artist profile
 */
export interface ArtistVideoDto {
  id: string;
  title: string;
  thumbnailUrl?: string;
  videoType: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  isUnlocked: boolean;
  unlockCostCoins: number;
}

/**
 * New release item (track, album, or video)
 */
export interface NewReleaseDto {
  id: string;
  type: 'track' | 'album' | 'video';
  title: string;
  imageUrl?: string;
  releaseDate: string;
  trackCount?: number;
  durationSeconds?: number;
}

// ============================================
// Paginated Content List
// ============================================

/**
 * Generic paginated list of artist content
 */
export interface ArtistContentListDto<T> {
  artistId: string;
  artistName: string;
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Follow Result
// ============================================

/**
 * Result of follow/unfollow operation
 */
export interface FollowResultDto {
  success: boolean;
  isFollowing: boolean;
  artistFollowerCount: number;
  message?: string;
}

// ============================================
// Track Sort Options
// ============================================

/**
 * Available sort options for artist tracks
 */
export type TrackSortBy =
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'title';

// ============================================
// Helper Types
// ============================================

/**
 * Artist content types
 */
export type ArtistContentType = 'track' | 'album' | 'video';

/**
 * Formats duration from seconds to display string (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats play count for display (e.g., 1.2M, 500K)
 */
export function formatPlayCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Formats a date string to relative time or date
 */
export function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
