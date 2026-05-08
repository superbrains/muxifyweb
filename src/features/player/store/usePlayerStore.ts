import { create } from "zustand";
import { contentService, getPlatform } from "@shared/services/contentService";

export interface PlayableTrack {
  id: string;
  title: string;
  artist: string;
  coverArtUrl?: string;
  durationSeconds: number;
}

interface PlayerState {
  audio: HTMLAudioElement | null;
  currentTrack: PlayableTrack | null;
  queue: PlayableTrack[];
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  volume: number;
  expiresAt: number | null;
  hasRecorded: boolean;
  error: string | null;

  ensureAudio: () => HTMLAudioElement;
  play: (track: PlayableTrack, queue?: PlayableTrack[]) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  toggle: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  next: () => void;
  prev: () => void;
  pauseForVideo: () => void;
  stop: () => void;
}

const isStreamExpired = (expiresAt: number | null) =>
  expiresAt !== null && Date.now() > expiresAt - 60_000;

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Lazy-initialized singleton audio element. Lives outside React because
  // mutating it should not trigger renders — we only re-render on explicit set().
  let recordTimer: ReturnType<typeof setTimeout> | null = null;

  const clearRecordTimer = () => {
    if (recordTimer) {
      clearTimeout(recordTimer);
      recordTimer = null;
    }
  };

  const scheduleRecordPlay = (trackId: string, durationHint: number) => {
    clearRecordTimer();
    const after = 30_000;
    recordTimer = setTimeout(() => {
      const state = get();
      if (state.currentTrack?.id !== trackId || state.hasRecorded) return;
      contentService
        .recordTrackPlay(trackId, {
          platform: getPlatform(),
          durationSeconds: Math.max(30, Math.floor(state.position || 30)),
        })
        .then(() => set({ hasRecorded: true }))
        .catch(() => {});
      void durationHint;
    }, after);
  };

  const ensureAudio = (): HTMLAudioElement => {
    let { audio } = get();
    if (audio) return audio;

    audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";

    audio.addEventListener("timeupdate", () => {
      set({ position: audio!.currentTime });
      // Pre-emptive refresh when within 60s of expiry.
      const { expiresAt, currentTrack } = get();
      if (
        currentTrack &&
        isStreamExpired(expiresAt) &&
        !audio!.paused &&
        !audio!.ended
      ) {
        void refreshStreamUrl();
      }
    });
    audio.addEventListener("loadedmetadata", () => {
      set({ duration: audio!.duration || 0 });
    });
    audio.addEventListener("play", () => set({ isPlaying: true }));
    audio.addEventListener("pause", () => set({ isPlaying: false }));
    audio.addEventListener("ended", () => {
      set({ isPlaying: false, position: 0 });
      get().next();
    });
    audio.addEventListener("error", () => {
      void refreshStreamUrl();
    });

    set({ audio });
    return audio;
  };

  const refreshStreamUrl = async () => {
    const { currentTrack, audio } = get();
    if (!currentTrack || !audio) return;
    try {
      const savedTime = audio.currentTime;
      const wasPlaying = !audio.paused;
      const stream = await contentService.getTrackStreamUrl(currentTrack.id);
      audio.src = stream.url;
      audio.currentTime = savedTime;
      if (wasPlaying) await audio.play();
      set({
        expiresAt: new Date(stream.expiresAt).getTime(),
        error: null,
      });
    } catch (err) {
      set({ error: (err as Error).message ?? "Stream refresh failed" });
    }
  };

  const playTrackInternal = async (track: PlayableTrack) => {
    const audio = ensureAudio();
    set({
      currentTrack: track,
      isPlaying: false,
      isLoading: true,
      position: 0,
      duration: track.durationSeconds || 0,
      hasRecorded: false,
      expiresAt: null,
      error: null,
    });
    clearRecordTimer();

    try {
      const stream = await contentService.getTrackStreamUrl(track.id);
      audio.src = stream.url;
      set({ expiresAt: new Date(stream.expiresAt).getTime() });
      await audio.play();
      set({ isLoading: false });
      scheduleRecordPlay(track.id, track.durationSeconds);
    } catch (err) {
      set({
        isLoading: false,
        isPlaying: false,
        error: (err as Error).message ?? "Could not start playback",
      });
    }
  };

  return {
    audio: null,
    currentTrack: null,
    queue: [],
    isPlaying: false,
    isLoading: false,
    position: 0,
    duration: 0,
    volume: 1,
    expiresAt: null,
    hasRecorded: false,
    error: null,

    ensureAudio,

    play: async (track, queue = []) => {
      set({ queue });
      await playTrackInternal(track);
    },

    pause: () => {
      const { audio } = get();
      audio?.pause();
    },

    resume: async () => {
      const { audio, currentTrack } = get();
      if (!audio || !currentTrack) return;
      try {
        await audio.play();
      } catch (err) {
        set({ error: (err as Error).message ?? "Resume failed" });
      }
    },

    toggle: () => {
      const { audio, isPlaying } = get();
      if (!audio) return;
      if (isPlaying) audio.pause();
      else void audio.play().catch(() => {});
    },

    seek: (seconds) => {
      const { audio } = get();
      if (!audio) return;
      audio.currentTime = seconds;
      set({ position: seconds });
    },

    setVolume: (v) => {
      const { audio } = get();
      if (audio) audio.volume = v;
      set({ volume: v });
    },

    next: () => {
      const { queue } = get();
      if (!queue.length) return;
      const [head, ...rest] = queue;
      set({ queue: rest });
      void playTrackInternal(head);
    },

    prev: () => {
      const { audio } = get();
      if (!audio) return;
      audio.currentTime = 0;
      set({ position: 0 });
    },

    pauseForVideo: () => {
      const { audio, isPlaying } = get();
      if (audio && isPlaying) audio.pause();
    },

    stop: () => {
      const { audio } = get();
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      clearRecordTimer();
      set({
        currentTrack: null,
        queue: [],
        isPlaying: false,
        position: 0,
        duration: 0,
        expiresAt: null,
        hasRecorded: false,
      });
    },
  };
});
