/**
 * Album-management types — mirror backend AlbumDtos.cs.
 */

export type ReleaseTypeName = 'Single' | 'EP' | 'Album' | 'Mix' | 'Compilation';

export type TrackProcessingStatus = 'processing' | 'ready' | 'failed' | 'deleted';

export interface FeaturedArtistDto {
  id: string;
  userId: string | null;
  name: string;
  role: string;
  isVerified: boolean;
}

export interface AlbumManageTrackDto {
  id: string;
  trackNumber: number | null;
  title: string;
  description?: string | null;
  durationSeconds: number;
  status: TrackProcessingStatus;
  processingError?: string | null;
  isPublished: boolean;
  coverArtThumbnail?: string | null;
  hasCustomCover: boolean;
  isrc?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  allowSponsorship: boolean;
  unlockCostCoins: number;
  playCount: number;
  featuredArtists: FeaturedArtistDto[];
}

export interface AlbumManageDto {
  id: string;
  title: string;
  description?: string | null;
  artistId: string;
  artistName: string;
  coverArtUrl?: string | null;
  coverArtThumbnail?: string | null;
  releaseType: ReleaseTypeName;
  releaseDate?: string | null;
  genreId?: string | null;
  genreName?: string | null;
  upc?: string | null;
  copyright?: string | null;
  label?: string | null;
  isPublished: boolean;
  trackCount: number;
  totalDurationSeconds: number;
  createdAt: string;
  updatedAt?: string | null;
  tracks: AlbumManageTrackDto[];
}

export interface CreateAlbumRequest {
  title: string;
  description?: string;
  genreId?: string;
  genre?: string;
  releaseType?: ReleaseTypeName;
  releaseDate?: string;
  coverArt?: File;
}

export interface UpdateAlbumRequest {
  title?: string;
  description?: string | null;
  genreId?: string;
  genre?: string;
  releaseType?: ReleaseTypeName;
  releaseDate?: string | null;
  upc?: string | null;
  copyright?: string | null;
  label?: string | null;
}

export interface FeaturedArtistInput {
  artistUserId?: string | null;
  artistName: string;
  role?: string;
}
