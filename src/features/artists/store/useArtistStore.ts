import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";

export interface Artist {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  genre?: string;
  userType?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArtistState {
  artists: Artist[];
  selectedArtistId: string | null;
  
  // Actions
  addArtist: (artist: Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>) => Artist;
  updateArtist: (id: string, updates: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
  setSelectedArtist: (artistId: string | null) => void;
  getSelectedArtist: () => Artist | null;
  getArtistById: (id: string) => Artist | undefined;
}

export const useArtistStore = create<ArtistState>()(
  persist(
    (set, get) => ({
      artists: [],
      selectedArtistId: null,

      addArtist: (artistData) => {
        const newArtist: Artist = {
          ...artistData,
          id: `artist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          artists: [...state.artists, newArtist],
        }));
        
        return newArtist;
      },

      updateArtist: (id, updates) => {
        set((state) => ({
          artists: state.artists.map((artist) =>
            artist.id === id
              ? { ...artist, ...updates, updatedAt: new Date().toISOString() }
              : artist
          ),
        }));
      },

      deleteArtist: (id) => {
        set((state) => ({
          artists: state.artists.filter((artist) => artist.id !== id),
          selectedArtistId: state.selectedArtistId === id ? null : state.selectedArtistId,
        }));
      },

      setSelectedArtist: (artistId) => {
        set({ selectedArtistId: artistId });
      },

      getSelectedArtist: () => {
        const state = get();
        if (!state.selectedArtistId) return null;
        return state.artists.find((a) => a.id === state.selectedArtistId) || null;
      },

      getArtistById: (id) => {
        return get().artists.find((artist) => artist.id === id);
      },
    }),
    {
      name: "artist-storage",
      storage: indexedDbStorage,
      partialize: (state) => ({
        artists: state.artists,
        selectedArtistId: state.selectedArtistId,
      }),
    }
  )
);

