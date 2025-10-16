import { create } from "zustand";
import type { MusicTrack } from "@shared/types";
import type { UploadProgress } from "../types/uploadMusic.d";

// UI-level types for local upload session (separate from persisted MusicTrack)
interface UploadFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "ready" | "error";
  file: File;
}

interface Track extends UploadFile {
  title: string;
}

interface Artist {
  id: string;
  name: string;
  role: string;
}

interface MixSliceState {
  tracks: Track[];
  coverArt: UploadFile | null;
  trackTitle: string;
  selectedArtists: string[];
  genre: string[];
  releaseType: string[];
  unlockCost: string[];
  allowSponsorship: string[];
  releaseYear: string;
  uploads: UploadProgress[];
}

interface AlbumSliceState {
  tracks: Track[];
  coverArt: UploadFile | null;
  selectedArtists: Artist[];
  trackArtists: Record<string, string[]>;
  trackTitles: Record<string, string>;
  genre: string[];
  releaseType: string[];
  unlockCost: string[];
  allowSponsorship: string[];
  releaseYear: string;
  uploads: UploadProgress[];
}

interface UploadMusicState {
  // Persisted resources from API
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

  // UI session state (separate for Mix vs Album)
  mix: MixSliceState;
  album: AlbumSliceState;

  // Mix actions
  mixAddTrack: (track: Track) => void;
  mixUpdateTrack: (id: string, updates: Partial<Track>) => void;
  mixRemoveTrack: (id: string) => void;
  mixSetCoverArt: (file: UploadFile | null) => void;
  mixSetTrackTitle: (title: string) => void;
  mixSetSelectedArtists: (artists: string[]) => void;
  mixAddArtist: (artist: string) => void;
  mixUpdateArtist: (index: number, artist: string) => void;
  mixRemoveArtist: (index: number) => void;
  mixSetGenre: (value: string[]) => void;
  mixSetReleaseType: (value: string[]) => void;
  mixSetUnlockCost: (value: string[]) => void;
  mixSetAllowSponsorship: (value: string[]) => void;
  mixSetReleaseYear: (value: string) => void;
  mixAddUpload: (upload: UploadProgress) => void;
  mixUpdateUpload: (fileId: string, updates: Partial<UploadProgress>) => void;
  mixRemoveUpload: (fileId: string) => void;
  resetMix: () => void;

  // Album actions
  albumAddTrack: (track: Track) => void;
  albumUpdateTrack: (id: string, updates: Partial<Track>) => void;
  albumRemoveTrack: (id: string) => void;
  albumSetCoverArt: (file: UploadFile | null) => void;
  albumSetSelectedArtists: (artists: Artist[]) => void;
  albumSetTrackArtists: (artists: Record<string, string[]>) => void;
  albumSetTrackTitle: (trackId: string, title: string) => void;
  albumSetTrackTitles: (titles: Record<string, string>) => void;
  albumSetGenre: (value: string[]) => void;
  albumSetReleaseType: (value: string[]) => void;
  albumSetUnlockCost: (value: string[]) => void;
  albumSetAllowSponsorship: (value: string[]) => void;
  albumSetReleaseYear: (value: string) => void;
  albumAddUpload: (upload: UploadProgress) => void;
  albumUpdateUpload: (fileId: string, updates: Partial<UploadProgress>) => void;
  albumRemoveUpload: (fileId: string) => void;
  resetAlbum: () => void;
}

export const useUploadMusicStore = create<UploadMusicState>((set) => ({
  // Persisted
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

  // UI session (separated by tab)
  mix: {
    tracks: [],
    coverArt: null,
    trackTitle: "",
    selectedArtists: [],
    genre: ["afrobeat"],
    releaseType: ["new-release"],
    unlockCost: ["100.00"],
    allowSponsorship: ["yes"],
    releaseYear: "",
    uploads: [],
  },
  album: {
    tracks: [],
    coverArt: null,
    selectedArtists: [],
    trackArtists: {},
    trackTitles: {},
    genre: ["afrobeat"],
    releaseType: ["new-release"],
    unlockCost: ["100.00"],
    allowSponsorship: ["yes"],
    releaseYear: "",
    uploads: [],
  },

  // Mix actions
  mixAddTrack: (track) =>
    set((state) => ({
      mix: { ...state.mix, tracks: [...state.mix.tracks, track] },
    })),
  mixUpdateTrack: (id, updates) =>
    set((state) => ({
      mix: {
        ...state.mix,
        tracks: state.mix.tracks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      },
    })),
  mixRemoveTrack: (id) =>
    set((state) => ({
      mix: {
        ...state.mix,
        tracks: state.mix.tracks.filter((t) => t.id !== id),
      },
    })),
  mixSetCoverArt: (file) =>
    set((state) => ({ mix: { ...state.mix, coverArt: file } })),
  mixSetTrackTitle: (title) =>
    set((state) => ({ mix: { ...state.mix, trackTitle: title } })),
  mixSetSelectedArtists: (artists) =>
    set((state) => ({ mix: { ...state.mix, selectedArtists: artists } })),
  mixAddArtist: (artist) =>
    set((state) => ({
      mix: {
        ...state.mix,
        selectedArtists: [...state.mix.selectedArtists, artist],
      },
    })),
  mixUpdateArtist: (index, artist) =>
    set((state) => ({
      mix: {
        ...state.mix,
        selectedArtists: state.mix.selectedArtists.map((a, i) =>
          i === index ? artist : a
        ),
      },
    })),
  mixRemoveArtist: (index) =>
    set((state) => ({
      mix: {
        ...state.mix,
        selectedArtists: state.mix.selectedArtists.filter(
          (_, i) => i !== index
        ),
      },
    })),
  mixSetGenre: (value) =>
    set((state) => ({ mix: { ...state.mix, genre: value } })),
  mixSetReleaseType: (value) =>
    set((state) => ({ mix: { ...state.mix, releaseType: value } })),
  mixSetUnlockCost: (value) =>
    set((state) => ({ mix: { ...state.mix, unlockCost: value } })),
  mixSetAllowSponsorship: (value) =>
    set((state) => ({ mix: { ...state.mix, allowSponsorship: value } })),
  mixSetReleaseYear: (value) =>
    set((state) => ({ mix: { ...state.mix, releaseYear: value } })),
  mixAddUpload: (upload) =>
    set((state) => ({
      mix: { ...state.mix, uploads: [...state.mix.uploads, upload] },
    })),
  mixUpdateUpload: (fileId, updates) =>
    set((state) => ({
      mix: {
        ...state.mix,
        uploads: state.mix.uploads.map((u) =>
          u.fileId === fileId ? { ...u, ...updates } : u
        ),
      },
    })),
  mixRemoveUpload: (fileId) =>
    set((state) => ({
      mix: {
        ...state.mix,
        uploads: state.mix.uploads.filter((u) => u.fileId !== fileId),
      },
    })),
  resetMix: () =>
    set(() => ({
      mix: {
        tracks: [],
        coverArt: null,
        trackTitle: "",
        selectedArtists: [],
        genre: ["afrobeat"],
        releaseType: ["new-release"],
        unlockCost: ["100.00"],
        allowSponsorship: ["yes"],
        releaseYear: "",
        uploads: [],
      },
    })),

  // Album actions
  albumAddTrack: (track) =>
    set((state) => ({
      album: { ...state.album, tracks: [...state.album.tracks, track] },
    })),
  albumUpdateTrack: (id, updates) =>
    set((state) => ({
      album: {
        ...state.album,
        tracks: state.album.tracks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      },
    })),
  albumRemoveTrack: (id) =>
    set((state) => ({
      album: {
        ...state.album,
        tracks: state.album.tracks.filter((t) => t.id !== id),
      },
    })),
  albumSetCoverArt: (file) =>
    set((state) => ({ album: { ...state.album, coverArt: file } })),
  albumSetSelectedArtists: (artists) =>
    set((state) => ({ album: { ...state.album, selectedArtists: artists } })),
  albumSetTrackArtists: (artists) =>
    set((state) => ({ album: { ...state.album, trackArtists: artists } })),
  albumSetTrackTitle: (trackId, title) =>
    set((state) => ({
      album: {
        ...state.album,
        trackTitles: { ...state.album.trackTitles, [trackId]: title },
      },
    })),
  albumSetTrackTitles: (titles) =>
    set((state) => ({ album: { ...state.album, trackTitles: titles } })),
  albumSetGenre: (value) =>
    set((state) => ({ album: { ...state.album, genre: value } })),
  albumSetReleaseType: (value) =>
    set((state) => ({ album: { ...state.album, releaseType: value } })),
  albumSetUnlockCost: (value) =>
    set((state) => ({ album: { ...state.album, unlockCost: value } })),
  albumSetAllowSponsorship: (value) =>
    set((state) => ({ album: { ...state.album, allowSponsorship: value } })),
  albumSetReleaseYear: (value) =>
    set((state) => ({ album: { ...state.album, releaseYear: value } })),
  albumAddUpload: (upload) =>
    set((state) => ({
      album: { ...state.album, uploads: [...state.album.uploads, upload] },
    })),
  albumUpdateUpload: (fileId, updates) =>
    set((state) => ({
      album: {
        ...state.album,
        uploads: state.album.uploads.map((u) =>
          u.fileId === fileId ? { ...u, ...updates } : u
        ),
      },
    })),
  albumRemoveUpload: (fileId) =>
    set((state) => ({
      album: {
        ...state.album,
        uploads: state.album.uploads.filter((u) => u.fileId !== fileId),
      },
    })),
  resetAlbum: () =>
    set(() => ({
      album: {
        tracks: [],
        coverArt: null,
        selectedArtists: [],
        trackArtists: {},
        trackTitles: {},
        genre: ["afrobeat"],
        releaseType: ["new-release"],
        unlockCost: ["100.00"],
        allowSponsorship: ["yes"],
        releaseYear: "",
        uploads: [],
      },
    })),
}));
