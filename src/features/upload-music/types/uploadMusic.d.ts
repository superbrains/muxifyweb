export interface UploadMusicData {
  title: string;
  artist: string;
  album?: string;
  genre: string;
  releaseDate?: string;
  file: File;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
}
