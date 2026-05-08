import { useCallback, useRef, useState } from 'react';
import type { UploadProgressDetail, UploadStage } from '@/shared/types/upload';

const SAMPLE_WINDOW_MS = 3000;
const EMA_WEIGHT = 0.3;
const EMIT_THROTTLE_MS = 250;
const ETA_MAX_SECONDS = 3 * 3600;

export function formatSpeed(bytesPerSecond: number): string {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '—';
  const kb = bytesPerSecond / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB/s`;
  return `${(kb / 1024).toFixed(1)} MB/s`;
}

export function formatEta(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds)) return '—';
  if (seconds < 1) return 'almost done';
  if (seconds < 60) return `${Math.round(seconds)} sec left`;
  const minutes = Math.round(seconds / 60);
  if (minutes === 1) return 'about 1 min left';
  if (minutes < 60) return `about ${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (remainingMin === 0) return `about ${hours} hr left`;
  return `about ${hours} hr ${remainingMin} min left`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export interface UploadProgressTracker {
  uploadProgress: UploadProgressDetail | null;
  start: (total: number) => void;
  onEvent: (event: { loaded: number; total: number; progress: number }) => void;
  markFinalizing: () => void;
  markCompleted: () => void;
  markFailed: (error: string) => void;
  reset: () => void;
}

export function useUploadProgressTracker(): UploadProgressTracker {
  const [uploadProgress, setUploadProgress] = useState<UploadProgressDetail | null>(null);
  const samplesRef = useRef<{ t: number; loaded: number }[]>([]);
  const displayedSpeedRef = useRef(0);
  const lastEmitRef = useRef(0);
  const lastStageRef = useRef<UploadStage | null>(null);

  const reset = useCallback(() => {
    samplesRef.current = [];
    displayedSpeedRef.current = 0;
    lastEmitRef.current = 0;
    lastStageRef.current = null;
    setUploadProgress(null);
  }, []);

  const start = useCallback((total: number) => {
    samplesRef.current = [];
    displayedSpeedRef.current = 0;
    lastEmitRef.current = 0;
    lastStageRef.current = 'preparing';
    setUploadProgress({
      stage: 'preparing',
      progress: 0,
      loaded: 0,
      total,
      speedBps: 0,
      etaSeconds: null,
    });
  }, []);

  const onEvent = useCallback(
    (event: { loaded: number; total: number; progress: number }) => {
      const now = Date.now();
      const samples = samplesRef.current;
      samples.push({ t: now, loaded: event.loaded });
      while (samples.length > 0 && now - samples[0].t > SAMPLE_WINDOW_MS) {
        samples.shift();
      }

      let speedBps = 0;
      if (samples.length >= 2) {
        const oldest = samples[0];
        const latest = samples[samples.length - 1];
        const dt = latest.t - oldest.t;
        if (dt > 0) {
          const rawSpeed = ((latest.loaded - oldest.loaded) / dt) * 1000;
          displayedSpeedRef.current =
            EMA_WEIGHT * rawSpeed + (1 - EMA_WEIGHT) * displayedSpeedRef.current;
          speedBps = Math.max(0, displayedSpeedRef.current);
        }
      }

      const remaining = Math.max(0, event.total - event.loaded);
      const etaSeconds =
        speedBps > 0 ? Math.min(ETA_MAX_SECONDS, remaining / speedBps) : null;

      const nextStage: UploadStage = event.progress >= 95 ? 'finalizing' : 'uploading';
      const stageChanged = lastStageRef.current !== nextStage;
      const shouldEmit = stageChanged || now - lastEmitRef.current >= EMIT_THROTTLE_MS;
      if (!shouldEmit) return;

      lastEmitRef.current = now;
      lastStageRef.current = nextStage;
      setUploadProgress({
        stage: nextStage,
        progress: event.progress,
        loaded: event.loaded,
        total: event.total,
        speedBps,
        etaSeconds,
      });
    },
    []
  );

  const markFinalizing = useCallback(() => {
    lastStageRef.current = 'finalizing';
    setUploadProgress((prev) => (prev ? { ...prev, stage: 'finalizing' } : prev));
  }, []);

  const markCompleted = useCallback(() => {
    lastStageRef.current = 'completed';
    setUploadProgress((prev) =>
      prev
        ? {
            ...prev,
            stage: 'completed',
            progress: 100,
            loaded: prev.total,
            etaSeconds: 0,
          }
        : prev
    );
  }, []);

  const markFailed = useCallback((error: string) => {
    lastStageRef.current = 'failed';
    setUploadProgress((prev) =>
      prev
        ? { ...prev, stage: 'failed', error }
        : {
            stage: 'failed',
            progress: 0,
            loaded: 0,
            total: 0,
            speedBps: 0,
            etaSeconds: null,
            error,
          }
    );
  }, []);

  return {
    uploadProgress,
    start,
    onEvent,
    markFinalizing,
    markCompleted,
    markFailed,
    reset,
  };
}
