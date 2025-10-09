import { api } from "@shared/services/api";
import type { MusicTrack } from "@shared/types";

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

export const uploadMusicService = {
  uploadTrack: (data: UploadMusicData) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("title", data.title);
    formData.append("artist", data.artist);
    if (data.album) formData.append("album", data.album);
    formData.append("genre", data.genre);
    if (data.releaseDate) formData.append("releaseDate", data.releaseDate);

    return api.post<MusicTrack>("/music/upload", formData);
  },

  getTracks: () => api.get<MusicTrack[]>("/music"),

  updateTrack: (id: string, data: Partial<MusicTrack>) =>
    api.put<MusicTrack>(`/music/${id}`, data),

  deleteTrack: (id: string) => api.delete(`/music/${id}`),

  getTrack: (id: string) => api.get<MusicTrack>(`/music/${id}`),
};
