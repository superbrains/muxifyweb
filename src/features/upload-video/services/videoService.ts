/**
 * Video Upload Service
 * Integrates with the backend API endpoints from VideoEndpoints.cs
 * Note: Backend uses /api/v1/video (singular), not /api/v1/videos (plural)
 */

import axios from 'axios';
import { axiosInstance } from '@app/lib/axiosInstance';
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
// Chunked-upload DTOs (mirror backend BeginUploadResultDto / CompleteUploadResultDto)
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
  recommendedBlockSize: number;
}

interface CompleteUploadRequest {
  artistName?: string;
  title: string;
  description?: string;
  genre?: string;
  videoType?: VideoType;
  trackId?: string;
  thumbnailUrl?: string;
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
  file: File;
  thumbnail?: File;
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
   * Upload a new video using direct-to-blob (chunked) upload.
   *   1. POST /api/v1/uploads/begin             → SAS URL for the staging blob
   *   2. PUT  <sasUri>                          → file goes straight to Azure Blob
   *   3. POST /api/v1/uploads/{id}/complete     → backend moves staging → final and creates the Video row
   *   4. POST /api/v1/video/{id}/thumbnail      → optional thumbnail attach
   *
   * The bare `axios.put` in step 2 deliberately bypasses `axiosInstance` — the SAS is the
   * credential for Azure Blob, and adding our `Authorization: Bearer ...` header would
   * cause Azure to reject the PUT.
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

    // Step 2 — PUT directly to Azure Blob via SAS
    await axios.put(begin.data.uploadUri, data.file, {
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': data.file.type || 'application/octet-stream',
      },
      timeout: 0, // no timeout — large uploads can take a while
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          // Cap at 95% so the UI doesn't sit at 100% while /complete is still running
          const progress = Math.min(95, Math.round((progressEvent.loaded * 95) / progressEvent.total));
          onProgress(progress);
        }
      },
      transformRequest: [(d) => d], // prevent axios from JSON-stringifying the File
    });

    // Step 3 — complete
    const complete = await axiosInstance.post<CompleteUploadResult>(
      `/uploads/${begin.data.sessionId}/complete`,
      {
        title: data.title,
        description: data.description,
        genre: data.genre,
        videoType: data.videoType,
        trackId: data.trackId,
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

    onProgress?.(100);
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
            onProgress(progress);
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
