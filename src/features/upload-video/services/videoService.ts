/**
 * Video Upload Service
 * Integrates with the backend API endpoints from VideoEndpoints.cs
 * Note: Backend uses /api/v1/video (singular), not /api/v1/videos (plural)
 */

import axios from 'axios';
import { axiosInstance, ensureFreshAccessToken } from '@app/lib/axiosInstance';
import type { AxiosProgressEvent } from 'axios';
import type {
  UpdateVideoRequest,
  VideoDto,
  VideoListDto,
  ListVideosParams,
  UploadProgressCallback,
  VideoType,
} from '../types';

// =============================================================================
// Direct-to-storage upload DTOs (mirror backend BeginUploadResultDto / CompleteUploadResultDto)
// =============================================================================

interface BeginUploadRequest {
  mediaType: 'Audio' | 'Video';
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

interface BeginUploadResult {
  sessionId: string;
  uploadUri: string;
  expiresAt: string;
  /**
   * The exact Content-Type the PUT to `uploadUri` must carry. Send verbatim — do not substitute
   * the file's own MIME type. The final object is re-typed from its extension on commit.
   */
  requiredContentType: string;
}

interface CompleteUploadRequest {
  artistName?: string;
  title: string;
  description?: string;
  genre?: string;
  videoType?: VideoType;
  trackId?: string;
  thumbnailUrl?: string;
  /** Unlock price in coins (10 coins = ₦1). 0 = free. */
  unlockCostCoins?: number;
}

interface CompleteUploadResult {
  mediaType: string;
  video?: VideoDto;
}

// =============================================================================
// Service Types
// =============================================================================

export interface UploadVideoData {
  title: string;
  description?: string;
  videoType?: VideoType;
  genre?: string;
  trackId?: string;
  artistName?: string;
  file: File;
  thumbnail?: File;
  /** Unlock price in coins (10 coins = ₦1). 0 = free. */
  unlockCostCoins?: number;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// =============================================================================
// Service Implementation
// =============================================================================

export const videoService = {
  /**
   * Upload a new video direct to object storage.
   *   1. POST /api/v1/uploads/begin             → presigned PUT URL for the staging object
   *   2. PUT  <presignedUrl>                    → file goes straight to storage, one request
   *   3. POST /api/v1/uploads/{id}/complete     → backend moves staging → final and creates the Video row
   *   4. POST /api/v1/video/{id}/thumbnail      → optional thumbnail attach
   *
   * The bare `axios.put` in step 2 deliberately bypasses `axiosInstance` — the presigned URL is
   * itself the credential, so adding our `Authorization: Bearer ...` header would both break the
   * request signature and leak the JWT to a third-party host. Step 2 also bypasses Cloudflare, so
   * the edge's 100 MB request-body limit does not apply here.
   */
  uploadVideo: async (
    data: UploadVideoData,
    onProgress?: UploadProgressCallback
  ): Promise<VideoDto> => {
    // Step 1 — begin
    const begin = await axiosInstance.post<BeginUploadResult>('/uploads/begin', {
      mediaType: 'Video',
      fileName: data.file.name,
      contentType: data.file.type || 'application/octet-stream',
      sizeBytes: data.file.size,
    } as BeginUploadRequest);

    // Step 2 — PUT the whole file to the presigned URL. Send `requiredContentType` verbatim:
    // the server states the exact header value it expects rather than letting the browser's
    // normalized MIME type drift out of sync with what was signed.
    await axios.put(begin.data.uploadUri, data.file, {
      headers: { 'Content-Type': begin.data.requiredContentType },
      timeout: 0, // no timeout — large uploads can take a while
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          // Cap at 95% so the UI doesn't sit at 100% while /complete is still running
          const progress = Math.min(95, Math.round((progressEvent.loaded * 95) / progressEvent.total));
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            progress,
          });
        }
      },
      transformRequest: [(d) => d], // prevent axios from JSON-stringifying the File
    });

    // Step 3 — complete. Direct-to-blob uploads can take many minutes; refresh
    // the access token if it's close to expiry so /complete doesn't 401 right
    // at the finish line.
    await ensureFreshAccessToken(60);
    const complete = await axiosInstance.post<CompleteUploadResult>(
      `/uploads/${begin.data.sessionId}/complete`,
      {
        artistName: data.artistName,
        title: data.title,
        description: data.description,
        genre: data.genre,
        videoType: data.videoType,
        trackId: data.trackId,
        unlockCostCoins: data.unlockCostCoins,
      } as CompleteUploadRequest
    );

    if (!complete.data.video) {
      throw new Error('Upload completed but server returned no video record.');
    }

    let video = complete.data.video;

    // Step 4 — attach thumbnail if provided. Failure here is non-fatal: the video
    // exists, ProcessVideoJob will auto-generate a thumbnail at the 10% timestamp.
    if (data.thumbnail) {
      try {
        video = await videoService.uploadThumbnail(video.id, data.thumbnail);
      } catch (err) {
        console.warn('Thumbnail attach failed; backend will auto-generate one.', err);
      }
    }

    onProgress?.({
      loaded: data.file.size,
      total: data.file.size,
      progress: 100,
    });
    return video;
  },

  /**
   * List user's videos with pagination
   * GET /api/v1/video
   */
  getVideos: async (params?: ListVideosParams): Promise<VideoListDto> => {
    const response = await axiosInstance.get<VideoListDto>('/video', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Get a single video by ID
   * GET /api/v1/video/{id}
   */
  getVideo: async (id: string): Promise<VideoDto> => {
    const response = await axiosInstance.get<VideoDto>(`/video/${id}`);
    return response.data;
  },

  /**
   * Update video metadata
   * PUT /api/v1/video/{id}
   */
  updateVideo: async (id: string, data: UpdateVideoRequest): Promise<VideoDto> => {
    const response = await axiosInstance.put<VideoDto>(`/video/${id}`, data);
    return response.data;
  },

  /**
   * Delete a video
   * DELETE /api/v1/video/{id}
   */
  deleteVideo: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/video/${id}`);
  },

  /**
   * Dispute a duplicate-detection hold on a video. The reason is attached to the
   * open moderation case and surfaced to moderators for review.
   * POST /api/v1/video/{id}/dispute
   */
  disputeVideo: async (id: string, reason: string): Promise<VideoDto> => {
    const response = await axiosInstance.post<VideoDto>(`/video/${id}/dispute`, { reason });
    return response.data;
  },

  /**
   * Upload thumbnail for an existing video
   */
  uploadThumbnail: async (
    videoId: string,
    thumbnail: File,
    onProgress?: UploadProgressCallback
  ): Promise<VideoDto> => {
    const formData = new FormData();
    formData.append('thumbnail', thumbnail);

    const response = await axiosInstance.post<VideoDto>(
      `/video/${videoId}/thumbnail`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              progress,
            });
          }
        },
      }
    );

    return response.data;
  },
};

// =============================================================================
// Validation Helpers
// =============================================================================

import {
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_VIDEO_EXTENSIONS,
  MAX_VIDEO_FILE_SIZE,
  MAX_THUMBNAIL_SIZE,
  SUPPORTED_THUMBNAIL_FORMATS,
} from '../types';

/**
 * Validate video file format
 */
export function isValidVideoFormat(file: File): boolean {
  // Check MIME type
  if (SUPPORTED_VIDEO_FORMATS.includes(file.type as typeof SUPPORTED_VIDEO_FORMATS[number])) {
    return true;
  }

  // Fallback: check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_VIDEO_EXTENSIONS.includes(extension as typeof SUPPORTED_VIDEO_EXTENSIONS[number]);
}

/**
 * Validate video file size
 */
export function isValidVideoSize(file: File): boolean {
  return file.size <= MAX_VIDEO_FILE_SIZE;
}

/**
 * Validate thumbnail format
 */
export function isValidThumbnailFormat(file: File): boolean {
  return SUPPORTED_THUMBNAIL_FORMATS.includes(file.type as typeof SUPPORTED_THUMBNAIL_FORMATS[number]);
}

/**
 * Validate thumbnail size
 */
export function isValidThumbnailSize(file: File): boolean {
  return file.size <= MAX_THUMBNAIL_SIZE;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate upload data before submitting
 */
export function validateVideoUploadData(data: UploadVideoData): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.file) {
    errors.push('Video file is required');
  } else {
    if (!isValidVideoFormat(data.file)) {
      errors.push('Invalid video format. Supported formats: MP4, MOV, AVI, WebM, MKV');
    }
    if (!isValidVideoSize(data.file)) {
      errors.push(`File size exceeds maximum limit of ${formatFileSize(MAX_VIDEO_FILE_SIZE)}`);
    }
  }

  // Optional thumbnail validation
  if (data.thumbnail) {
    if (!isValidThumbnailFormat(data.thumbnail)) {
      errors.push('Invalid thumbnail format. Supported formats: JPEG, PNG, WebP');
    }
    if (!isValidThumbnailSize(data.thumbnail)) {
      errors.push(`Thumbnail size exceeds maximum limit of ${formatFileSize(MAX_THUMBNAIL_SIZE)}`);
    }
  }

  return errors;
}
