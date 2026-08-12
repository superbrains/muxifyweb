/**
 * Music Upload Service
 * Integrates with the backend API endpoints from MusicEndpoints.cs
 */

import { axiosInstance } from '@app/lib/axiosInstance';
import type { AxiosProgressEvent } from 'axios';
import { validateLyrics } from '../lib/lyricsFormat';
import type {
  UpdateTrackRequest,
  TrackDto,
  TrackListDto,
  ListTracksParams,
  UploadProgressCallback,
} from '../types';

// =============================================================================
// Legacy Types (for backward compatibility)
// =============================================================================

export interface UploadMusicData {
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  releaseDate?: string;
  description?: string;
  file: File;
  coverArt?: File;
  // Rights & Metadata (Artist/Record Label audio wizard)
  isrc?: string;
  isrcIsProvisional?: boolean;
  upc?: string;
  iswc?: string;
  // Lyrics — plain text or synchronized LRC; backend accepts both.
  lyrics?: string;
  lyricsLanguage?: string;
  // What a fan pays to unlock the track, in coins (10 coins = ₦1). 0 = free.
  unlockCostCoins?: number;
  // Royalty splits as compact rows: { recipientUserId, recipientRole, percentBps }
  splits?: Array<{
    recipientUserId: string;
    recipientRole: string;
    percentBps: number;
  }>;
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

export const uploadMusicService = {
  /**
   * Upload a new music track with progress tracking
   * POST /api/v1/music/upload
   */
  uploadTrack: async (
    data: UploadMusicData,
    onProgress?: UploadProgressCallback
  ): Promise<TrackDto> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);

    if (data.artist) formData.append('artist', data.artist);
    if (data.album) formData.append('album', data.album);
    if (data.genre) formData.append('genre', data.genre);
    if (data.releaseDate) formData.append('releaseDate', data.releaseDate);
    if (data.description) formData.append('description', data.description);
    if (data.coverArt) formData.append('coverArt', data.coverArt);
    if (data.isrc) formData.append('isrc', data.isrc);
    if (data.isrcIsProvisional) formData.append('isrcIsProvisional', 'true');
    if (data.upc) formData.append('upc', data.upc);
    if (data.iswc) formData.append('iswc', data.iswc);
    if (data.lyrics?.trim()) formData.append('lyrics', data.lyrics);
    if (data.lyricsLanguage) formData.append('lyricsLanguage', data.lyricsLanguage);
    // Explicit null check — 0 is a legitimate price meaning "free".
    if (data.unlockCostCoins != null) {
      formData.append('unlockCostCoins', String(data.unlockCostCoins));
    }
    if (data.splits && data.splits.length > 0) {
      formData.append('splits', JSON.stringify(data.splits));
    }

    const response = await axiosInstance.post<TrackDto>('/music/upload', formData, {
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
      // Increase timeout for large file uploads
      timeout: 300000, // 5 minutes
    });

    return response.data;
  },

  /**
   * List user's tracks with pagination
   * GET /api/v1/music
   */
  getTracks: async (params?: ListTracksParams): Promise<TrackListDto> => {
    const response = await axiosInstance.get<TrackListDto>('/music', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Get a single track by ID
   * GET /api/v1/music/{id}
   */
  getTrack: async (id: string): Promise<TrackDto> => {
    const response = await axiosInstance.get<TrackDto>(`/music/${id}`);
    return response.data;
  },

  /**
   * Update track metadata
   * PUT /api/v1/music/{id}
   */
  updateTrack: async (id: string, data: UpdateTrackRequest): Promise<TrackDto> => {
    const response = await axiosInstance.put<TrackDto>(`/music/${id}`, data);
    return response.data;
  },

  /**
   * Delete a track
   * DELETE /api/v1/music/{id}
   */
  deleteTrack: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/music/${id}`);
  },

  /**
   * Set or replace artist lyrics for a track. Accepts plain text or synced LRC.
   * PUT /api/v1/music/{id}/lyrics
   */
  updateTrackLyrics: async (
    id: string,
    lrc: string,
    language?: string
  ): Promise<void> => {
    await axiosInstance.put(`/music/${id}/lyrics`, { lrc, language });
  },

  /**
   * Remove artist lyrics from a track (falls back to the LrcLib lookup).
   * DELETE /api/v1/music/{id}/lyrics
   */
  deleteTrackLyrics: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/music/${id}/lyrics`);
  },

  /**
   * Replace the cover art of an existing track.
   * PATCH /api/v1/music/{id}/cover-art  (multipart form field: `coverArt`)
   */
  uploadCoverArt: async (
    trackId: string,
    coverArt: File,
    onProgress?: UploadProgressCallback
  ): Promise<TrackDto> => {
    const formData = new FormData();
    formData.append('coverArt', coverArt);

    const response = await axiosInstance.patch<TrackDto>(
      `/music/${trackId}/cover-art`,
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
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_AUDIO_EXTENSIONS,
  MAX_AUDIO_FILE_SIZE,
  MAX_COVER_ART_SIZE,
  SUPPORTED_COVER_ART_FORMATS,
} from '../types';

/**
 * Validate audio file format
 */
export function isValidAudioFormat(file: File): boolean {
  // Check MIME type
  if (SUPPORTED_AUDIO_FORMATS.includes(file.type as typeof SUPPORTED_AUDIO_FORMATS[number])) {
    return true;
  }

  // Fallback: check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_AUDIO_EXTENSIONS.includes(extension as typeof SUPPORTED_AUDIO_EXTENSIONS[number]);
}

/**
 * Validate audio file size
 */
export function isValidAudioSize(file: File): boolean {
  return file.size <= MAX_AUDIO_FILE_SIZE;
}

/**
 * Validate cover art format
 */
export function isValidCoverArtFormat(file: File): boolean {
  return SUPPORTED_COVER_ART_FORMATS.includes(file.type as typeof SUPPORTED_COVER_ART_FORMATS[number]);
}

/**
 * Validate cover art size
 */
export function isValidCoverArtSize(file: File): boolean {
  return file.size <= MAX_COVER_ART_SIZE;
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
export function validateUploadData(data: UploadMusicData): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.file) {
    errors.push('Audio file is required');
  } else {
    if (!isValidAudioFormat(data.file)) {
      errors.push('Invalid audio format. Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A');
    }
    if (!isValidAudioSize(data.file)) {
      errors.push(`File size exceeds maximum limit of ${formatFileSize(MAX_AUDIO_FILE_SIZE)}`);
    }
  }

  // Optional cover art validation
  if (data.coverArt) {
    if (!isValidCoverArtFormat(data.coverArt)) {
      errors.push('Invalid cover art format. Supported formats: JPEG, PNG, WebP');
    }
    if (!isValidCoverArtSize(data.coverArt)) {
      errors.push(`Cover art size exceeds maximum limit of ${formatFileSize(MAX_COVER_ART_SIZE)}`);
    }
  }

  // Optional lyrics validation (size only; plain text and synced LRC both allowed)
  const lyricsError = validateLyrics(data.lyrics);
  if (lyricsError) {
    errors.push(lyricsError);
  }

  return errors;
}
