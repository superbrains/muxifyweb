/**
 * Video Upload Types
 * Maps to backend DTOs from Muxify.Modules.Media.Application.DTOs
 */

// =============================================================================
// Upload Request Types
// =============================================================================

/**
 * Request data for uploading a video
 * Maps to form fields in VideoEndpoints.cs UploadVideoAsync
 */
export interface UploadVideoRequest {
  file: File;
  title: string;
  description?: string;
  videoType?: VideoType;
  genre?: string;
  trackId?: string;
  thumbnail?: File;
}

/**
 * Request data for updating video metadata
 * Maps to UpdateVideoRequest in VideoEndpoints.cs
 */
export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  videoType?: string;
  genre?: string;
  allowSponsorship?: boolean;
}

// =============================================================================
// Enums
// =============================================================================

/**
 * Video type enum
 * Maps to VideoType from Muxify.Modules.Media.Domain.Enums
 */
export type VideoType =
  | 'MusicVideo'
  | 'Lyric'
  | 'BehindTheScenes'
  | 'Live'
  | 'Interview'
  | 'Documentary'
  | 'Tutorial'
  | 'Visualizer'
  | 'Other';

/**
 * Video status
 */
export type VideoStatus =
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'published'
  | 'draft';

// =============================================================================
// Response Types (from backend DTOs)
// =============================================================================

/**
 * Video data returned from the API
 * Maps to VideoDto from Muxify.Modules.Media.Application.DTOs
 */
export interface VideoDto {
  id: string;
  title: string;
  description?: string;
  filename: string;
  fileSize: number;
  fileType: string;
  duration: number;
  thumbnail?: string;
  status: VideoStatus;
  createdAt: string;
  updatedAt?: string;

  // Video-specific fields
  artist: string;
  videoType: VideoType;
  resolution?: string;
  aspectRatio?: string;
  fps?: number;
  codec?: string;
  genre?: string;

  // Metrics
  viewCount: number;
  likeCount: number;
  isPublished: boolean;
}

/**
 * Paginated video list response
 * Maps to VideoListDto from backend
 */
export interface VideoListDto {
  items: VideoDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
 * Upload callback for progress tracking
 */
export type UploadProgressCallback = (progress: number) => void;

// =============================================================================
// Validation Constants
// =============================================================================

/**
 * Supported video file formats
 */
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/quicktime', // MOV
  'video/x-msvideo', // AVI
  'video/webm',
  'video/x-matroska', // MKV
] as const;

/**
 * Supported video file extensions
 */
export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv'] as const;

/**
 * Maximum file size in bytes (2GB)
 */
export const MAX_VIDEO_FILE_SIZE = 2 * 1024 * 1024 * 1024;

/**
 * Maximum thumbnail file size in bytes (5MB)
 */
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

/**
 * Supported thumbnail formats
 */
export const SUPPORTED_THUMBNAIL_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/**
 * Video type options for UI dropdowns
 */
export const VIDEO_TYPE_OPTIONS: { value: VideoType; label: string }[] = [
  { value: 'MusicVideo', label: 'Music Video' },
  { value: 'Lyric', label: 'Lyric Video' },
  { value: 'BehindTheScenes', label: 'Behind the Scenes' },
  { value: 'Live', label: 'Live Performance' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Documentary', label: 'Documentary' },
  { value: 'Tutorial', label: 'Tutorial' },
  { value: 'Visualizer', label: 'Visualizer' },
  { value: 'Other', label: 'Other' },
];

// =============================================================================
// Query Parameters
// =============================================================================

/**
 * Parameters for listing videos
 */
export interface ListVideosParams {
  page?: number;
  pageSize?: number;
}
