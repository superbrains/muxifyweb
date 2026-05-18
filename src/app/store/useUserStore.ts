import { create } from "zustand";
import { tokenStorage } from "@app/lib/axiosInstance";
import type { User } from "@shared/types/user";

/**
 * Session bootstrap status.
 * - `loading`         — a JWT exists; `/users/me` is being fetched.
 * - `authenticated`   — the current user is loaded.
 * - `unauthenticated` — no valid session.
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  /** Drives route gating in `ProtectedRoute` while `AuthBootstrap` runs. */
  status: AuthStatus;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Single source of truth for the signed-in user.
 *
 * Deliberately NOT persisted: the JWT in `localStorage` is the only durable
 * session marker, and `AuthBootstrap` re-fetches `/users/me` on every app boot.
 * Persisting the user object to IndexedDB previously caused two bugs — a stale
 * *previous* user surviving into the next session, and a Zustand rehydration
 * race that clobbered the freshly-logged-in user. Keeping this store purely
 * in-memory removes both.
 */
export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  status: tokenStorage.getAccessToken() ? "loading" : "unauthenticated",
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      status: user ? "authenticated" : "unauthenticated",
    }),
  setStatus: (status) => set({ status }),
  login: (user) =>
    set({ user, isAuthenticated: true, status: "authenticated" }),
  logout: () => {
    tokenStorage.clearTokens();
    set({ user: null, isAuthenticated: false, status: "unauthenticated" });
  },
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },
}));
