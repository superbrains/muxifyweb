import { axiosInstance } from '@app/lib/axiosInstance';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type {
  ArtistPublicProfileDto,
  ArtistContentListDto,
  ArtistTrackDto,
  ArtistAlbumDto,
  ArtistVideoDto,
  NewReleaseDto,
  FollowResultDto,
  TrackSortBy,
} from '@shared/types/artist';

const ARTISTS_BASE = '/artists';

/**
 * Artist API service
 * Handles all artist-related public API calls
 */
export const artistService = {
  // ============================================
  // Artist Profile
  // ============================================

  /**
   * GET /api/v1/artists/{id}
   * Get public profile for a specific artist
   */
  async getArtistProfile(artistId: string): Promise<ArtistPublicProfileDto> {
    try {
      const response = await axiosInstance.get<ArtistPublicProfileDto>(
        `${ARTISTS_BASE}/${artistId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist profile'));
    }
  },

  // ============================================
  // Artist Tracks
  // ============================================

  /**
   * GET /api/v1/artists/{id}/tracks
   * Get paginated list of tracks for an artist
   */
  async getArtistTracks(
    artistId: string,
    page = 1,
    pageSize = 20,
    sortBy?: TrackSortBy
  ): Promise<ArtistContentListDto<ArtistTrackDto>> {
    try {
      const response = await axiosInstance.get<ArtistContentListDto<ArtistTrackDto>>(
        `${ARTISTS_BASE}/${artistId}/tracks`,
        {
          params: { page, pageSize, sortBy },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist tracks'));
    }
  },

  // ============================================
  // Artist Albums
  // ============================================

  /**
   * GET /api/v1/artists/{id}/albums
   * Get paginated list of albums for an artist
   */
  async getArtistAlbums(
    artistId: string,
    page = 1,
    pageSize = 20
  ): Promise<ArtistContentListDto<ArtistAlbumDto>> {
    try {
      const response = await axiosInstance.get<ArtistContentListDto<ArtistAlbumDto>>(
        `${ARTISTS_BASE}/${artistId}/albums`,
        {
          params: { page, pageSize },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist albums'));
    }
  },

  // ============================================
  // Artist Videos
  // ============================================

  /**
   * GET /api/v1/artists/{id}/videos
   * Get paginated list of videos for an artist
   */
  async getArtistVideos(
    artistId: string,
    page = 1,
    pageSize = 20
  ): Promise<ArtistContentListDto<ArtistVideoDto>> {
    try {
      const response = await axiosInstance.get<ArtistContentListDto<ArtistVideoDto>>(
        `${ARTISTS_BASE}/${artistId}/videos`,
        {
          params: { page, pageSize },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist videos'));
    }
  },

  // ============================================
  // New Releases
  // ============================================

  /**
   * GET /api/v1/artists/{id}/new-releases
   * Get new releases for an artist within specified days
   */
  async getArtistNewReleases(
    artistId: string,
    days = 30,
    page = 1,
    pageSize = 20
  ): Promise<ArtistContentListDto<NewReleaseDto>> {
    try {
      const response = await axiosInstance.get<ArtistContentListDto<NewReleaseDto>>(
        `${ARTISTS_BASE}/${artistId}/new-releases`,
        {
          params: { days, page, pageSize },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch artist new releases'));
    }
  },

  // ============================================
  // Follow/Unfollow
  // ============================================

  /**
   * POST /api/v1/artists/{id}/follow
   * Follow an artist
   */
  async followArtist(artistId: string): Promise<FollowResultDto> {
    try {
      const response = await axiosInstance.post<FollowResultDto>(
        `${ARTISTS_BASE}/${artistId}/follow`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to follow artist'));
    }
  },

  /**
   * DELETE /api/v1/artists/{id}/follow
   * Unfollow an artist
   */
  async unfollowArtist(artistId: string): Promise<FollowResultDto> {
    try {
      const response = await axiosInstance.delete<FollowResultDto>(
        `${ARTISTS_BASE}/${artistId}/follow`
      );
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to unfollow artist'));
    }
  },

  /**
   * Toggle follow state for an artist
   * Follows if not following, unfollows if following
   */
  async toggleFollow(artistId: string, isCurrentlyFollowing: boolean): Promise<FollowResultDto> {
    if (isCurrentlyFollowing) {
      return this.unfollowArtist(artistId);
    }
    return this.followArtist(artistId);
  },
};
