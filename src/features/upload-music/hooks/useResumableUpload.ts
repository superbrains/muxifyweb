/**
 * Resumable / chunked audio upload hook.
 *
 * Three-phase flow that matches the backend:
 *   1. POST /uploads/begin            → { sessionId, uploadUri (SAS), recommendedBlockSize }
 *   2. PUT each block to uploadUri    → Azure Blob block upload (no JWT, signed URL is the credential)
 *   3. PUT block-list                 → Azure commits the blocks into a single blob
 *   4. POST /uploads/{id}/complete    → backend moves the staged blob into its final container,
 *                                       creates the Track entity (with albumId), enqueues processing.
 *
 * Real bytes-on-wire progress, suitable for files up to 2 GB.
 */

import { useCallback, useRef, useState } from 'react';
import axios, { type CancelTokenSource } from 'axios';
import { axiosInstance, ensureFreshAccessToken } from '@app/lib/axiosInstance';
import type { TrackDto } from '../types';
import type { FeaturedArtistInput } from '../types/album';

export type UploadPhase = 'idle' | 'staging' | 'uploading' | 'committing' | 'finalizing' | 'done' | 'error' | 'aborted';

interface BeginUploadResponse {
  sessionId: string;
  uploadUri: string;
  expiresAt: string;
  recommendedBlockSize: number;
}

interface CompleteUploadResponse {
  mediaType: 'audio' | 'video';
  track: TrackDto | null;
}

export interface CompleteAudioUploadInput {
  title: string;
  description?: string;
  genre?: string;
  album?: string;                            // legacy: name-based attach
  albumId?: string;                          // preferred: explicit album linkage
  trackNumber?: number;
  releaseDate?: string;
  featuredArtists?: FeaturedArtistInput[];
  unlockCostCoins?: number;
  allowSponsorship?: boolean;
}

export interface UseResumableUploadResult {
  phase: UploadPhase;
  progress: number;          // 0-100
  bytesUploaded: number;
  totalBytes: number;
  error: string | null;
  track: TrackDto | null;
  start: (file: File, complete: CompleteAudioUploadInput) => Promise<TrackDto>;
  abort: () => void;
  reset: () => void;
}

/**
 * Build the Azure Blob block-list XML the commit step needs.
 * Each block has a base64-encoded ID; we keep them in upload order.
 */
function buildBlockListXml(blockIds: string[]): string {
  const items = blockIds.map((id) => `<Latest>${id}</Latest>`).join('');
  return `<?xml version="1.0" encoding="utf-8"?><BlockList>${items}</BlockList>`;
}

/**
 * Azure block IDs must be base64 strings of the same length across all blocks in the upload.
 * 16-byte left-padded index → 24-character base64. Plenty of room for very large files.
 */
function blockId(index: number): string {
  const padded = index.toString().padStart(16, '0');
  // Browser-only — the SAS upload only runs in the page; no SSR fallback needed.
  return window.btoa(padded);
}

export function useResumableUpload(): UseResumableUploadResult {
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [bytesUploaded, setBytesUploaded] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<TrackDto | null>(null);

  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const abortedRef = useRef(false);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress(0);
    setBytesUploaded(0);
    setTotalBytes(0);
    setError(null);
    setTrack(null);
    abortedRef.current = false;
    cancelTokenRef.current = null;
  }, []);

  const abort = useCallback(() => {
    abortedRef.current = true;
    cancelTokenRef.current?.cancel('Upload aborted by user.');
    setPhase('aborted');
  }, []);

  const start = useCallback(
    async (file: File, complete: CompleteAudioUploadInput): Promise<TrackDto> => {
      reset();
      setTotalBytes(file.size);

      try {
        // 1. Begin upload session.
        setPhase('staging');
        const beginResponse = await axiosInstance.post<BeginUploadResponse>('/uploads/begin', {
          mediaType: 'Audio',
          fileName: file.name,
          contentType: file.type || 'audio/mpeg',
          sizeBytes: file.size,
        });
        const session = beginResponse.data;

        // Azure block size must divide evenly into the file size; we tolerate any positive
        // recommended size from the server and floor block count from there.
        const blockSize = Math.max(session.recommendedBlockSize ?? 8 * 1024 * 1024, 1024 * 1024);
        const blockCount = Math.max(1, Math.ceil(file.size / blockSize));
        const blockIds: string[] = [];

        // 2. Upload blocks directly to Azure Blob via SAS URL.
        setPhase('uploading');
        cancelTokenRef.current = axios.CancelToken.source();
        let cumulativeBytes = 0;
        for (let i = 0; i < blockCount; i++) {
          if (abortedRef.current) throw new Error('Upload aborted.');

          const start = i * blockSize;
          const end = Math.min(start + blockSize, file.size);
          const blob = file.slice(start, end);
          const id = blockId(i);
          blockIds.push(id);

          const blockUrl = `${session.uploadUri}&comp=block&blockid=${encodeURIComponent(id)}`;
          // Capture this block's start position for the progress callback so per-block
          // loaded bytes accumulate correctly.
          const blockStart = cumulativeBytes;
          await axios.put(blockUrl, blob, {
            headers: {
              'x-ms-blob-type': 'BlockBlob',
              'Content-Type': file.type || 'application/octet-stream',
            },
            cancelToken: cancelTokenRef.current.token,
            onUploadProgress: (e) => {
              const loaded = blockStart + (e.loaded ?? 0);
              setBytesUploaded(loaded);
              setProgress(Math.min(99, Math.round((loaded / file.size) * 100)));
            },
            // The browser already buffers efficiently; let axios stream the slice straight through.
            transformRequest: [(d) => d],
          });
          cumulativeBytes = end;
          setBytesUploaded(cumulativeBytes);
        }

        // 3. Commit block list — tells Azure to assemble the blocks into a single blob.
        setPhase('committing');
        const commitUrl = `${session.uploadUri}&comp=blocklist`;
        await axios.put(commitUrl, buildBlockListXml(blockIds), {
          headers: { 'Content-Type': 'application/xml' },
        });

        // 4. Complete: tell our backend to finalize, persist the Track, and enqueue processing.
        // Block uploads to Azure can take many minutes; refresh the access token if it's
        // close to expiry so /complete doesn't 401 right at the finish line.
        setPhase('finalizing');
        await ensureFreshAccessToken(60);
        const completeResponse = await axiosInstance.post<CompleteUploadResponse>(
          `/uploads/${session.sessionId}/complete`,
          {
            artistName: '',  // backend falls back to the JWT "name" claim
            title: complete.title,
            description: complete.description,
            genre: complete.genre,
            album: complete.album,
            albumId: complete.albumId,
            trackNumber: complete.trackNumber,
            releaseDate: complete.releaseDate,
            featuredArtists: complete.featuredArtists,
            unlockCostCoins: complete.unlockCostCoins,
            allowSponsorship: complete.allowSponsorship,
          },
        );

        const created = completeResponse.data.track;
        if (!created) throw new Error('Backend completed upload but returned no track.');

        setTrack(created);
        setPhase('done');
        setProgress(100);
        return created;
      } catch (err: unknown) {
        if (abortedRef.current) {
          setPhase('aborted');
          throw err;
        }
        let message = 'Upload failed.';
        if (axios.isAxiosError(err)) {
          message = err.response?.data?.detail ?? err.response?.data?.title ?? err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        setPhase('error');
        throw err;
      }
    },
    [reset],
  );

  return { phase, progress, bytesUploaded, totalBytes, error, track, start, abort, reset };
}
