/**
 * Per-track endpoints used by the album editor (publish/unpublish, cover override,
 * featured artists, move-to-album, delete). Wraps /api/v1/music/{id}/...
 */

import { axiosInstance } from '@app/lib/axiosInstance';
import type { TrackDto } from '../types';
import type { FeaturedArtistDto } from '../types/album';

export const trackService = {
  publishTrack: async (id: string): Promise<TrackDto> => {
    const response = await axiosInstance.post<TrackDto>(`/music/${id}/publish`);
    return response.data;
  },

  unpublishTrack: async (id: string): Promise<TrackDto> => {
    const response = await axiosInstance.post<TrackDto>(`/music/${id}/unpublish`);
    return response.data;
  },

  /** Replace this track's cover with a custom override. */
  setTrackCover: async (id: string, coverArt: File): Promise<TrackDto> => {
    const formData = new FormData();
    formData.append('coverArt', coverArt);
    const response = await axiosInstance.patch<TrackDto>(`/music/${id}/cover-art`, formData);
    return response.data;
  },

  /** Drop the cover override; falls back to the album cover. */
  resetTrackCover: async (id: string): Promise<TrackDto> => {
    const response = await axiosInstance.delete<TrackDto>(`/music/${id}/cover-art`);
    return response.data;
  },

  addFeaturedArtist: async (
    id: string,
    payload: { artistUserId?: string | null; artistName: string; role?: string },
  ): Promise<TrackDto> => {
    const response = await axiosInstance.post<TrackDto>(`/music/${id}/featured-artists`, payload);
    return response.data;
  },

  removeFeaturedArtist: async (
    trackId: string,
    trackArtistId: string,
  ): Promise<TrackDto> => {
    const response = await axiosInstance.delete<TrackDto>(
      `/music/${trackId}/featured-artists/${trackArtistId}`,
    );
    return response.data;
  },

  moveTrackToAlbum: async (
    id: string,
    payload: { albumId: string | null; trackNumber?: number },
  ): Promise<TrackDto> => {
    const response = await axiosInstance.patch<TrackDto>(`/music/${id}/album`, payload);
    return response.data;
  },

  deleteTrack: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/music/${id}`);
  },

  // Re-exported here so consumers don't need to import from two places.
  toFeaturedArtistDto: (raw: unknown): FeaturedArtistDto => raw as FeaturedArtistDto,
};
