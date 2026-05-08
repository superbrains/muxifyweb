/**
 * Album management service — wraps /api/v1/albums and the chunked-upload + track endpoints
 * the album editor needs. Mirrors uploadMusicService.ts in style.
 */

import { axiosInstance } from '@app/lib/axiosInstance';
import type {
  AlbumManageDto,
  CreateAlbumRequest,
  UpdateAlbumRequest,
} from '../types/album';

export const albumService = {
  /**
   * Create a draft album. Optional cover art is uploaded in the same multipart request.
   * POST /api/v1/albums
   */
  createDraft: async (req: CreateAlbumRequest): Promise<AlbumManageDto> => {
    const formData = new FormData();
    formData.append('title', req.title);
    if (req.description) formData.append('description', req.description);
    if (req.genreId) formData.append('genreId', req.genreId);
    if (req.genre) formData.append('genre', req.genre);
    if (req.releaseType) formData.append('releaseType', req.releaseType);
    if (req.releaseDate) formData.append('releaseDate', req.releaseDate);
    if (req.coverArt) formData.append('coverArt', req.coverArt);

    const response = await axiosInstance.post<AlbumManageDto>('/albums', formData, {
      timeout: 120000,
    });
    return response.data;
  },

  /**
   * GET /api/v1/albums?includeDrafts=true
   */
  listMyAlbums: async (includeDrafts = true): Promise<AlbumManageDto[]> => {
    const response = await axiosInstance.get<AlbumManageDto[]>('/albums', {
      params: { includeDrafts },
    });
    return response.data;
  },

  /**
   * GET /api/v1/albums/{id} — artist-facing detail with drafts and processing tracks.
   */
  getAlbum: async (id: string): Promise<AlbumManageDto> => {
    const response = await axiosInstance.get<AlbumManageDto>(`/albums/${id}`);
    return response.data;
  },

  /**
   * PUT /api/v1/albums/{id}
   */
  updateAlbum: async (id: string, req: UpdateAlbumRequest): Promise<AlbumManageDto> => {
    const response = await axiosInstance.put<AlbumManageDto>(`/albums/${id}`, req);
    return response.data;
  },

  /**
   * PATCH /api/v1/albums/{id}/cover-art (multipart) — replaces cover and cascades to tracks
   * that don't have a custom override.
   */
  updateCoverArt: async (id: string, coverArt: File): Promise<AlbumManageDto> => {
    const formData = new FormData();
    formData.append('coverArt', coverArt);
    const response = await axiosInstance.patch<AlbumManageDto>(`/albums/${id}/cover-art`, formData);
    return response.data;
  },

  /**
   * POST /api/v1/albums/{id}/tracks/reorder
   */
  reorderTracks: async (id: string, trackOrder: string[]): Promise<AlbumManageDto> => {
    const response = await axiosInstance.post<AlbumManageDto>(
      `/albums/${id}/tracks/reorder`,
      { trackOrder },
    );
    return response.data;
  },

  /**
   * POST /api/v1/albums/{id}/publish
   */
  publishAlbum: async (id: string): Promise<AlbumManageDto> => {
    const response = await axiosInstance.post<AlbumManageDto>(`/albums/${id}/publish`);
    return response.data;
  },

  /**
   * POST /api/v1/albums/{id}/unpublish
   */
  unpublishAlbum: async (id: string): Promise<AlbumManageDto> => {
    const response = await axiosInstance.post<AlbumManageDto>(`/albums/${id}/unpublish`);
    return response.data;
  },

  /**
   * DELETE /api/v1/albums/{id}
   */
  deleteAlbum: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/albums/${id}`);
  },
};
