/**
 * Leaderboard period options for filtering
 */
export type LeaderboardPeriod = 'day' | 'week' | 'month' | 'year' | 'all-time';

/**
 * Leaderboard scope: 'mine' shows the logged-in artist/creator's own content
 * and fans; 'global' shows the platform-wide ranking.
 */
export type LeaderboardScope = 'mine' | 'global';

// ============================================
// Top Gifters DTOs
// ============================================

/**
 * DTO for a top gifter entry
 */
export interface TopGifterDto {
  rank: number;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  totalGiftValue: number;
  giftCount: number;
  currentMedal?: string;
  medalIcon?: string;
  medalColor?: string;
  previousRank?: number;
}

/**
 * DTO for top gifters leaderboard response
 */
export interface TopGiftersLeaderboardDto {
  entries: TopGifterDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Most Gifted Artists DTOs
// ============================================

/**
 * DTO for a most gifted artist entry
 */
export interface MostGiftedArtistDto {
  rank: number;
  artistId: string;
  artistName?: string;
  avatarUrl?: string;
  totalReceived: number;
  giftCount: number;
  followerCount: number;
  previousRank?: number;
}

/**
 * DTO for most gifted artists leaderboard response
 */
export interface MostGiftedArtistsLeaderboardDto {
  entries: MostGiftedArtistDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Most Played Tracks DTOs
// ============================================

/**
 * DTO for a most played track entry
 */
export interface MostPlayedTrackDto {
  rank: number;
  trackId: string;
  title?: string;
  artistName?: string;
  artistId?: string;
  coverUrl?: string;
  playCount: number;
  previousRank?: number;
}

/**
 * DTO for most played tracks leaderboard response
 */
export interface MostPlayedTracksLeaderboardDto {
  entries: MostPlayedTrackDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Artist Top Fans DTOs
// ============================================

/**
 * DTO for an artist's top fan entry
 */
export interface ArtistTopFanDto {
  rank: number;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  totalGiftValue: number;
  giftCount: number;
  currentMedal?: string;
  medalIcon?: string;
  medalColor?: string;
  isTopFan: boolean;
}

/**
 * DTO for artist's top fans leaderboard response
 */
export interface ArtistTopFansLeaderboardDto {
  artistId: string;
  artistName?: string;
  entries: ArtistTopFanDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Artist Top Unlockers DTOs
// ============================================

/**
 * Content vertical scope for artist fan analytics.
 */
export type FanMediaType = 'music' | 'video';

/**
 * DTO for an artist's top unlocker entry (a fan ranked by content unlocked).
 */
export interface ArtistTopUnlockerDto {
  rank: number;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  unlockCount: number;
  totalCoinsSpent: number;
}

/**
 * DTO for an artist's top unlockers leaderboard response.
 */
export interface ArtistTopUnlockersLeaderboardDto {
  artistId: string;
  entries: ArtistTopUnlockerDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Fan Country Breakdown DTOs
// ============================================

/**
 * Engagement dimension a country breakdown is grouped over.
 */
export type CountryDimension = 'plays' | 'gifts' | 'unlocks';

/**
 * DTO for a single country row in a fan country breakdown.
 */
export interface CountryStatDto {
  rank: number;
  country: string;
  count: number;
  value: number;
}

/**
 * DTO for an artist's fan engagement broken down by country.
 */
export interface FanCountryBreakdownDto {
  artistId: string;
  dimension: string;
  entries: CountryStatDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Fan Engagement Summary DTO
// ============================================

/**
 * A single fan-engagement metric with its trend vs the previous period.
 */
export interface FanMetricDto {
  value: number;
  previous: number;
  percentChange: number;
  isPositiveChange: boolean;
}

/**
 * Media-aware summary of an artist's fan engagement (drives the KPI strip).
 */
export interface FanEngagementSummaryDto {
  artistId: string;
  plays: FanMetricDto;
  followers: FanMetricDto;
  gifts: FanMetricDto;
  unlocks: FanMetricDto;
  totalGiftValue: number;
  totalUnlockCoins: number;
  period: string;
}

// ============================================
// Request Parameters
// ============================================

/**
 * Common query parameters for leaderboard requests
 */
export interface LeaderboardQueryParams {
  take?: number;
  period?: LeaderboardPeriod;
}

/**
 * Query parameters for artist top fans request
 */
export interface ArtistTopFansQueryParams extends LeaderboardQueryParams {
  artistId: string;
}

// ============================================
// UI Helper Types
// ============================================

/**
 * Generic leaderboard entry for UI display
 */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: string;
  avatar?: string;
  avatarUrl?: string;
  previousRank?: number;
}

/**
 * Maps TopGifterDto to a UI-friendly LeaderboardEntry
 */
export function mapTopGifterToEntry(gifter: TopGifterDto): LeaderboardEntry {
  return {
    rank: gifter.rank,
    name: gifter.displayName || gifter.username || 'Unknown User',
    value: gifter.totalGiftValue.toLocaleString(),
    avatarUrl: gifter.avatarUrl,
    previousRank: gifter.previousRank,
  };
}

/**
 * Maps MostGiftedArtistDto to a UI-friendly LeaderboardEntry
 */
export function mapMostGiftedArtistToEntry(artist: MostGiftedArtistDto): LeaderboardEntry {
  return {
    rank: artist.rank,
    name: artist.artistName || 'Unknown Artist',
    value: artist.totalReceived.toLocaleString(),
    avatarUrl: artist.avatarUrl,
    previousRank: artist.previousRank,
  };
}

/**
 * Maps MostPlayedTrackDto to a UI-friendly LeaderboardEntry
 */
export function mapMostPlayedTrackToEntry(track: MostPlayedTrackDto): LeaderboardEntry {
  return {
    rank: track.rank,
    name: track.title || 'Unknown Track',
    value: track.playCount.toLocaleString(),
    avatarUrl: track.coverUrl,
    previousRank: track.previousRank,
  };
}

/**
 * Maps ArtistTopFanDto to a UI-friendly LeaderboardEntry
 */
export function mapArtistTopFanToEntry(fan: ArtistTopFanDto): LeaderboardEntry {
  return {
    rank: fan.rank,
    name: fan.displayName || fan.username || 'Unknown Fan',
    value: fan.totalGiftValue.toLocaleString(),
    avatarUrl: fan.avatarUrl,
  };
}

// ============================================
// Leaderboard Stats DTOs
// ============================================

/**
 * DTO for leaderboard earnings statistics
 */
export interface LeaderboardStatsDto {
  totalEarningsToday: number;
  totalEarningsThisPeriod: number;
  totalGiftsToday: number;
  totalGiftsThisPeriod: number;
  totalUnlocksToday: number;
  totalUnlocksThisPeriod: number;
  period: string;
  lastUpdated?: string;
}

// ============================================
// Highest Unlocked Content DTOs
// ============================================

/**
 * DTO for highest unlocked content entry
 */
export interface HighestUnlockedContentDto {
  rank: number;
  contentId: string;
  contentType: 'track' | 'video';
  title?: string;
  artistName?: string;
  artistId?: string;
  coverUrl?: string;
  unlockCount: number;
  totalCoinsEarned: number;
  previousRank?: number;
}

/**
 * DTO for highest unlocked content leaderboard response
 */
export interface HighestUnlockedLeaderboardDto {
  entries: HighestUnlockedContentDto[];
  period: string;
  contentType?: string;
  lastUpdated?: string;
}

// ============================================
// Most Watched Videos DTOs
// ============================================

/**
 * DTO for most watched video entry
 */
export interface MostWatchedVideoDto {
  rank: number;
  videoId: string;
  title?: string;
  artistName?: string;
  artistId?: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  previousRank?: number;
}

/**
 * DTO for most watched videos leaderboard response
 */
export interface MostWatchedVideosLeaderboardDto {
  entries: MostWatchedVideoDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Top Albums DTOs
// ============================================

/**
 * DTO for top album entry
 */
export interface TopAlbumDto {
  rank: number;
  albumId: string;
  title?: string;
  artistName?: string;
  artistId?: string;
  coverArtUrl?: string;
  totalPlayCount: number;
  trackCount: number;
  previousRank?: number;
}

/**
 * DTO for top albums leaderboard response
 */
export interface TopAlbumsLeaderboardDto {
  entries: TopAlbumDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Most Shared Content DTOs
// ============================================

/**
 * DTO for most shared content entry
 */
export interface MostSharedContentDto {
  rank: number;
  contentId: string;
  contentType: 'track' | 'video';
  title?: string;
  artistName?: string;
  artistId?: string;
  coverUrl?: string;
  shareCount: number;
  previousRank?: number;
}

/**
 * DTO for most shared content leaderboard response
 */
export interface MostSharedLeaderboardDto {
  entries: MostSharedContentDto[];
  period: string;
  contentType?: string;
  lastUpdated?: string;
}

// ============================================
// Additional Mapping Functions
// ============================================

/**
 * Maps HighestUnlockedContentDto to a UI-friendly LeaderboardEntry
 */
export function mapHighestUnlockedToEntry(content: HighestUnlockedContentDto): LeaderboardEntry {
  return {
    rank: content.rank,
    name: content.title || 'Unknown Content',
    value: content.unlockCount.toLocaleString(),
    avatarUrl: content.coverUrl,
    previousRank: content.previousRank,
  };
}

/**
 * Maps MostWatchedVideoDto to a UI-friendly LeaderboardEntry
 */
export function mapMostWatchedVideoToEntry(video: MostWatchedVideoDto): LeaderboardEntry {
  return {
    rank: video.rank,
    name: video.title || 'Unknown Video',
    value: video.viewCount.toLocaleString(),
    avatarUrl: video.thumbnailUrl,
    previousRank: video.previousRank,
  };
}

/**
 * Maps TopAlbumDto to a UI-friendly LeaderboardEntry
 */
export function mapTopAlbumToEntry(album: TopAlbumDto): LeaderboardEntry {
  return {
    rank: album.rank,
    name: album.title || 'Unknown Album',
    value: album.totalPlayCount.toLocaleString(),
    avatarUrl: album.coverArtUrl,
    previousRank: album.previousRank,
  };
}

/**
 * Maps MostSharedContentDto to a UI-friendly LeaderboardEntry
 */
export function mapMostSharedToEntry(content: MostSharedContentDto): LeaderboardEntry {
  return {
    rank: content.rank,
    name: content.title || 'Unknown Content',
    value: content.shareCount.toLocaleString(),
    avatarUrl: content.coverUrl,
    previousRank: content.previousRank,
  };
}

// ============================================
// Top Singles DTOs
// ============================================

/**
 * DTO for a top single (a track whose release type is Single) entry
 */
export interface TopSingleDto {
  rank: number;
  trackId: string;
  title?: string;
  artistName?: string;
  artistId?: string;
  coverUrl?: string;
  playCount: number;
  previousRank?: number;
}

/**
 * DTO for top singles leaderboard response
 */
export interface TopSinglesLeaderboardDto {
  entries: TopSingleDto[];
  period: string;
  lastUpdated?: string;
}

// ============================================
// Most Gifted Content DTOs
// ============================================

/**
 * DTO for a most-gifted content (track/video) entry
 */
export interface MostGiftedContentDto {
  rank: number;
  contentId: string;
  contentType: 'track' | 'video';
  title?: string;
  artistName?: string;
  artistId?: string;
  coverUrl?: string;
  totalGiftValue: number;
  giftCount: number;
  previousRank?: number;
}

/**
 * DTO for most gifted content leaderboard response
 */
export interface MostGiftedContentLeaderboardDto {
  entries: MostGiftedContentDto[];
  period: string;
  contentType?: string;
  lastUpdated?: string;
}
