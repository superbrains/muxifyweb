import { create } from "zustand";
import type { MusicTrack } from "@shared/types";
import type { UploadProgress } from "../types/uploadMusic.d";

interface UploadMusicState {
  tracks: MusicTrack[];
  uploads: UploadProgress[];
  isLoading: boolean;
  addTrack: (track: MusicTrack) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<MusicTrack>) => void;
  addUpload: (upload: UploadProgress) => void;
  removeUpload: (fileId: string) => void;
  updateUpload: (fileId: string, updates: Partial<UploadProgress>) => void;
  setLoading: (loading: boolean) => void;
}

export const useUploadMusicStore = create<UploadMusicState>((set) => ({
  tracks: [],
  uploads: [],
  isLoading: false,
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== id),
    })),
  updateTrack: (id, updates) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === id ? { ...track, ...updates } : track
      ),
    })),
  addUpload: (upload) =>
    set((state) => ({ uploads: [...state.uploads, upload] })),
  removeUpload: (fileId) =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.fileId !== fileId),
    })),
  updateUpload: (fileId, updates) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.fileId === fileId ? { ...upload, ...updates } : upload
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
