import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SingleItem, AlbumItem, MusicStoreState } from "../types";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";

export const useMusicStore = create<MusicStoreState>()(
  persist(
    (set, get) => ({
      singles: [],
      albums: [],

      addSingle: (item: SingleItem) => {
        set((state) => ({
          singles: [item, ...state.singles],
        }));
      },

      addAlbum: (item: AlbumItem) => {
        set((state) => ({
          albums: [item, ...state.albums],
        }));
      },

      removeSingle: (id: string) => {
        set((state) => ({
          singles: state.singles.filter((item) => item.id !== id),
        }));
      },

      removeAlbum: (id: string) => {
        set((state) => ({
          albums: state.albums.filter((item) => item.id !== id),
        }));
      },

      updateSingle: (id: string, updatedItem: Partial<SingleItem>) => {
        set((state) => ({
          singles: state.singles.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));
      },

      updateAlbum: (id: string, updatedItem: Partial<AlbumItem>) => {
        set((state) => ({
          albums: state.albums.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));
      },

      getSingleById: (id: string) => {
        return get().singles.find((item) => item.id === id);
      },

      getAlbumById: (id: string) => {
        return get().albums.find((item) => item.id === id);
      },
    }),
    {
      name: "muxify-music-storage",
      storage: indexedDbStorage,
    }
  )
);
