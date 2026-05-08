/**
 * Music Upload Types
 * Maps to backend DTOs from Muxify.Modules.Media.Application.DTOs
 */

// =============================================================================
// Upload Request Types
// =============================================================================

/**
 * Request data for uploading a music track
 */
export interface UploadTrackRequest {
  file: File;
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  releaseDate?: string;
  description?: string;
  coverArt?: File;
}

/**
 * Request data for updating track metadata
 * Maps to UpdateTrackRequest in MusicEndpoints.cs
 */
export interface UpdateTrackRequest {
  title?: string;
  description?: string;
  genre?: string;
  releaseDate?: string;
  isrc?: string;
  bpm?: number;
  key?: string;
  allowSponsorship?: boolean;
}

// =============================================================================
// Response Types (from backend DTOs)
// =============================================================================

/**
 * Track data returned from the API
 * Maps to TrackDto from Muxify.Modules.Media.Application.DTOs
 */
export interface TrackDto {
  id: string;
  title: string;
  description?: string;
  filename: string;
  fileSize: number;
  fileType: string;
  duration: number;
  thumbnail?: string;
  status: TrackStatus;
  createdAt: string;
  updatedAt?: string;

  // Music-specific fields
  artist: string;
  album?: string;
  genre?: string;
  releaseDate?: string;
  isrc?: string;
  bpm?: number;
  key?: string;

  // Metrics
  playCount: number;
  likeCount: number;
  isPublished: boolean;
}

/**
 * Track status enum
 */
export type TrackStatus =
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'published'
  | 'draft';

/**
 * Paginated track list response
 * Maps to TrackListDto from backend
 */
export interface TrackListDto {
  items: TrackDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Featured artist information
 * Maps to FeaturedArtistDto from backend
 */
export interface FeaturedArtistDto {
  userId?: string;
  name: string;
  role: string;
}

// =============================================================================
// Upload Progress Types
// =============================================================================

/**
 * Upload progress tracking
 */
export interface UploadProgress {
  fileId: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

/**
 * Upload callback for progress tracking. Emits the full byte-level event so
 * consumers can derive speed/ETA themselves.
 */
export type UploadProgressCallback = (event: {
  loaded: number;
  total: number;
  progress: number;
}) => void;

// =============================================================================
// Validation Constants
// =============================================================================

/**
 * Supported audio file formats
 */
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',      // MP3
  'audio/wav',       // WAV
  'audio/flac',      // FLAC
  'audio/aac',       // AAC
  'audio/ogg',       // OGG
  'audio/x-m4a',     // M4A
] as const;

/**
 * Supported audio file extensions
 */
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'] as const;

/**
 * Maximum file size in bytes (100MB)
 */
export const MAX_AUDIO_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Maximum cover art file size in bytes (5MB)
 */
export const MAX_COVER_ART_SIZE = 5 * 1024 * 1024;

/**
 * Supported cover art formats
 */
export const SUPPORTED_COVER_ART_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

// =============================================================================
// Query Parameters
// =============================================================================

/**
 * Parameters for listing tracks
 */
export interface ListTracksParams {
  page?: number;
  pageSize?: number;
}
