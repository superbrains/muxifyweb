/**
 * Mirrors backend `DuplicateMatchSummaryDto` (Modules/Media/Application/DTOs).
 * Surfaced on held tracks/videos so the artist-facing dispute page can render
 * confidence, matched-content link, and the artist's prior dispute (if any)
 * without follow-up requests.
 */

export type DuplicateMatchTier = 'Exact' | 'High' | 'Medium' | 'Low';

export type DuplicateMatchStatus = 'PendingReview' | 'Confirmed' | 'Dismissed' | 'AutoCleared';

export interface DuplicateMatchSummary {
  id: string;
  tier: DuplicateMatchTier;
  /** Normalized similarity score in the range 0..1. */
  score: number;
  status: DuplicateMatchStatus;
  /** "sha256" | "chromaprint" | "video-phash" | "video-audio". */
  matchMethod: string;
  matchedTrackId?: string | null;
  matchedVideoId?: string | null;
  matchedTitle?: string | null;
  matchedArtistName?: string | null;
  detectedAtUtc: string;
  /** Artist's dispute explanation; null until they dispute. */
  artistDisputeNote?: string | null;
  /** When the artist submitted their dispute; null until they dispute. */
  disputedAtUtc?: string | null;
}
