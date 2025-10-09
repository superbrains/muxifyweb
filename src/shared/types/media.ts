export interface MediaFile {
  id: string;
  title: string;
  description?: string;
  filename: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  thumbnail?: string;
  status: "uploading" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface MusicTrack extends MediaFile {
  artist: string;
  album?: string;
  genre: string;
  releaseDate?: string;
  isrc?: string;
  bpm?: number;
  key?: string;
}

export interface VideoContent extends MediaFile {
  resolution: string;
  aspectRatio: string;
  fps?: number;
  codec?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
}
