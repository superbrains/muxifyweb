import { create } from "zustand";

// UI-level types for local upload session
interface UploadFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "ready" | "error";
  file: File;
  url?: string;
}

interface VideoUploadState {
  // Video file
  videoFile: UploadFile | null;

  // Thumbnails
  thumbnails: UploadFile[];

  // Song Credits - Track Links
  trackLinks: string[];

  // Form data
  releaseType: string[];
  unlockCost: string[];
  allowSponsorship: string[];

  // Actions
  setVideoFile: (file: UploadFile | null) => void;
  addThumbnail: (file: UploadFile) => void;
  removeThumbnail: (index: number) => void;
  addTrackLink: () => void;
  updateTrackLink: (index: number, link: string) => void;
  removeTrackLink: (index: number) => void;
  setReleaseType: (value: string[]) => void;
  setUnlockCost: (value: string[]) => void;
  setAllowSponsorship: (value: string[]) => void;
  resetVideoUpload: () => void;
}

const initialState = {
  videoFile: null,
  thumbnails: [],
  trackLinks: [""],
  releaseType: ["new-release"],
  unlockCost: ["100.00"],
  allowSponsorship: ["yes"],
};

export const useUploadVideoStore = create<VideoUploadState>((set) => ({
  ...initialState,

  setVideoFile: (file) => set({ videoFile: file }),

  addThumbnail: (file) =>
    set((state) => {
      console.log("[VideoStore] addThumbnail called for:", file.id, file.name);
      console.log(
        "[VideoStore] Current thumbnails count:",
        state.thumbnails.length
      );
      console.log(
        "[VideoStore] Adding thumbnail, new count will be:",
        state.thumbnails.length + 1
      );
      return {
        thumbnails: [...state.thumbnails, file],
      };
    }),

  removeThumbnail: (index) =>
    set((state) => {
      console.log("[VideoStore] removeThumbnail called for index:", index);
      console.log(
        "[VideoStore] Current thumbnails count:",
        state.thumbnails.length
      );
      return {
        thumbnails: state.thumbnails.filter((_, i) => i !== index),
      };
    }),

  addTrackLink: () =>
    set((state) => ({
      trackLinks: [...state.trackLinks, ""],
    })),

  updateTrackLink: (index, link) =>
    set((state) => ({
      trackLinks: state.trackLinks.map((item, i) =>
        i === index ? link : item
      ),
    })),

  removeTrackLink: (index) =>
    set((state) => ({
      trackLinks:
        state.trackLinks.length > 1
          ? state.trackLinks.filter((_, i) => i !== index)
          : state.trackLinks,
    })),

  setReleaseType: (value) => set({ releaseType: value }),

  setUnlockCost: (value) => set({ unlockCost: value }),

  setAllowSponsorship: (value) => set({ allowSponsorship: value }),

  resetVideoUpload: () => set(initialState),
}));
