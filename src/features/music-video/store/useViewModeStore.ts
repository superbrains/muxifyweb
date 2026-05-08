import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ViewMode = "grid" | "table";

interface ViewModeState {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      mode: "grid",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "muxify.media.view",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
