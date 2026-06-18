// Single/Mix Item structure
export interface SingleItem {
  id: string;
  title: string;
  artist: string; // Joined string of artists
  artists: string[]; // Array of artist names
  releaseDate: string;
  plays: number;
  unlocks: number;
  gifts: number;
  coverArt: string;
  coverArtData?: string; // Base64 data for file reconstruction
  coverArtName?: string; // Original filename
  audioFile?: File;
  audioData?: string; // Base64 data for file reconstruction
  audioName?: string; // Original filename
  /** Original uploaded audio filename (from the API DTO), retained for edit prepopulation. */
  filename?: string;
  /** Uploaded audio file size in bytes (from the API DTO), retained for edit prepopulation. */
  fileSize?: number;
  /** Artist lyrics (plain text or synced LRC) retained for edit prepopulation. */
  lrcContent?: string | null;
  /** ISRC code retained for edit prepopulation. */
  isrc?: string;
  genre: string[];
  releaseType: string[];
  unlockCost: string[];
  allowSponsorship: string[];
  releaseYear: string;
  createdAt: string;
  /** True while the upload is held by the duplicate-detection screen. */
  heldForDuplicateReview?: boolean;
  /** True when the artist has already submitted a dispute on the active hold. */
  hasActiveDispute?: boolean;
}

// Album Item structure
export interface AlbumItem {
  id: string;
  title: string;
  artist: string; // Joined string of artist names
  artists: Array<{ id: string; name: string; role: string }>; // Array of Artist objects
  album: string; // Album name
  releaseDate: string;
  plays: number;
  unlocks: number;
  gifts: number;
  coverArt: string;
  coverArtData?: string; // Base64 data for file reconstruction
  coverArtName?: string; // Original filename
  isPublished?: boolean; // Server-driven; true = published to fans, false/undefined = draft
  tracks: {
    id: string;
    title: string;
    duration: string;
    audioFile: File;
    audioData?: string; // Base64 data for file reconstruction
    audioName?: string; // Original filename
    artists: string[]; // Track-specific artists
  }[];
  genre: string[];
  releaseType: string[];
  unlockCost: string[];
  allowSponsorship: string[];
  releaseYear: string;
  createdAt: string;
}

// Legacy MusicItem (kept for compatibility)
export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  artists?: string[] | Array<{ id: string; name: string; role: string }>;
  album?: string;
  releaseDate: string;
  plays: number;
  unlocks: number;
  gifts: number;
  coverArt: string;
  type: "album" | "single";
  tracks?: MusicTrack[];
  genre?: string[];
  releaseType?: string[];
  unlockCost?: string[];
  allowSponsorship?: string[];
  releaseYear?: string;
  audioFile?: File;
  createdAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  duration: string;
  audioFile: File;
  artists?: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  plays: number;
  unlocks: number;
  gifts: number;
  thumbnail: string;
  videoFile: File;
  videoData?: string; // Base64 data for file reconstruction
  videoName?: string; // Original filename
  /** Original uploaded video filename (from the API DTO), retained for edit prepopulation. */
  filename?: string;
  /** Uploaded video file size in bytes (from the API DTO), retained for edit prepopulation. */
  fileSize?: number;
  /** Video description retained for edit prepopulation. */
  description?: string;
  /** Video type (e.g. MusicVideo, Lyric) retained for edit prepopulation. */
  videoType?: string;
  thumbnails?: string[]; // Preserve extra thumbnails for editing
  thumbnailData?: string[]; // Base64 data for thumbnail reconstruction
  thumbnailNames?: string[]; // Original filenames
  trackLinks?: string[];
  releaseType?: string[];
  unlockCost?: string[];
  allowSponsorship?: string[];
  createdAt: string;
  /** True while the upload is held by the duplicate-detection screen. */
  heldForDuplicateReview?: boolean;
  /** True when the artist has already submitted a dispute on the active hold. */
  hasActiveDispute?: boolean;
}

export interface MusicStoreState {
  singles: SingleItem[]; // For mix/single tracks
  albums: AlbumItem[]; // For albums
  addSingle: (item: SingleItem) => void;
  addAlbum: (item: AlbumItem) => void;
  removeSingle: (id: string) => void;
  removeAlbum: (id: string) => void;
  updateSingle: (id: string, item: Partial<SingleItem>) => void;
  updateAlbum: (id: string, item: Partial<AlbumItem>) => void;
  getSingleById: (id: string) => SingleItem | undefined;
  getAlbumById: (id: string) => AlbumItem | undefined;
}

export interface VideoStoreState {
  videoItems: VideoItem[];
  addVideoItem: (item: VideoItem) => void;
  removeVideoItem: (id: string) => void;
  updateVideoItem: (id: string, item: Partial<VideoItem>) => void;
  getVideoItemById: (id: string) => VideoItem | undefined;
}
