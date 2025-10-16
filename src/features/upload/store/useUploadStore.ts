import { create } from "zustand";

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

interface UploadState {
  // Common fields
  tracks: Track[];
  coverArt: UploadFile | null;
  genre: string[];
  releaseType: string[];
  unlockCost: string[];
  allowSponsorship: string[];
  releaseYear: string;

  // Mix tab specific
  musicianName: string;

  // Album tab specific
  selectedArtists: Artist[];
  trackTitles: Record<string, string>;

  // Tab state
  activeTab: "music" | "video";
  albumTab: "mix" | "album";

  // Actions
  setTracks: (tracks: Track[]) => void;
  addTrack: (track: Track) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  removeTrack: (trackId: string) => void;
  setCoverArt: (coverArt: UploadFile | null) => void;
  setGenre: (genre: string[]) => void;
  setReleaseType: (releaseType: string[]) => void;
  setUnlockCost: (unlockCost: string[]) => void;
  setAllowSponsorship: (allowSponsorship: string[]) => void;
  setReleaseYear: (releaseYear: string) => void;
  setMusicianName: (musicianName: string) => void;
  setSelectedArtists: (selectedArtists: Artist[]) => void;
  setTrackTitles: (trackTitles: Record<string, string>) => void;
  setActiveTab: (activeTab: "music" | "video") => void;
  setAlbumTab: (albumTab: "mix" | "album") => void;

  // Reset
  reset: () => void;
}

const initialState = {
  tracks: [],
  coverArt: null,
  genre: ["afrobeat"],
  releaseType: ["new-release"],
  unlockCost: ["100.00"],
  allowSponsorship: ["yes"],
  releaseYear: "",
  musicianName: "",
  selectedArtists: [],
  trackTitles: {},
  activeTab: "music" as const,
  albumTab: "mix" as const,
};

export const useUploadStore = create<UploadState>((set) => ({
  ...initialState,

  setTracks: (tracks) => {
    console.log("[UploadStore] setTracks:", tracks);
    set({ tracks });
  },
  addTrack: (track) => {
    console.log("[UploadStore] addTrack:", track);
    set((state) => {
      const newTracks = [...state.tracks, track];
      console.log("[UploadStore] New tracks array:", newTracks);
      return { tracks: newTracks };
    });
  },
  updateTrack: (trackId, updates) => {
    console.log("[UploadStore] updateTrack:", trackId, updates);
    set((state) => {
      const newTracks = state.tracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      );
      console.log("[UploadStore] Updated tracks array:", newTracks);
      return { tracks: newTracks };
    });
  },
  removeTrack: (trackId) => {
    console.log("[UploadStore] removeTrack:", trackId);
    set((state) => {
      const newTracks = state.tracks.filter((track) => track.id !== trackId);
      console.log("[UploadStore] Remaining tracks:", newTracks);
      return { tracks: newTracks };
    });
  },
  setCoverArt: (coverArt) => {
    console.log("[UploadStore] setCoverArt:", coverArt?.name);
    set({ coverArt });
  },
  setGenre: (genre) => set({ genre }),
  setReleaseType: (releaseType) => set({ releaseType }),
  setUnlockCost: (unlockCost) => set({ unlockCost }),
  setAllowSponsorship: (allowSponsorship) => set({ allowSponsorship }),
  setReleaseYear: (releaseYear) => set({ releaseYear }),
  setMusicianName: (musicianName) => set({ musicianName }),
  setSelectedArtists: (selectedArtists) => set({ selectedArtists }),
  setTrackTitles: (trackTitles) => set({ trackTitles }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setAlbumTab: (albumTab) => set({ albumTab }),

  reset: () => {
    console.log("[UploadStore] reset");
    set(initialState);
  },
}));
