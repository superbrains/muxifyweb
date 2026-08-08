/**
 * Direct-to-storage audio upload hook.
 *
 * Three-phase flow that matches the backend:
 *   1. POST /uploads/begin            → { sessionId, uploadUri (presigned PUT), requiredContentType }
 *   2. PUT the file to uploadUri      → straight to object storage in one request. No JWT: the
 *                                       signed URL *is* the credential, and attaching an
 *                                       Authorization header would break the signature. This also
 *                                       bypasses our origin and the Cloudflare edge entirely, so
 *                                       the 100 MB edge body limit does not apply.
 *   3. POST /uploads/{id}/complete    → backend copies the staged object into its final container,
 *                                       creates the Track entity (with albumId), enqueues processing.
 *
 * Real bytes-on-wire progress, suitable for files up to 2 GB.
 *
 * Note there is no resume on a dropped connection — a single PUT either lands or it doesn't. That
 * is an accepted trade for deleting the provider-specific block/commit machinery this replaced.
 * If large-file resumability is ever needed, the answer is S3 multipart, not the old block API.
 */

import { useCallback, useRef, useState } from 'react';
import axios, { type CancelTokenSource } from 'axios';
import { axiosInstance, ensureFreshAccessToken } from '@app/lib/axiosInstance';
import type { TrackDto } from '../types';
import type { FeaturedArtistInput } from '../types/album';

export type UploadPhase = 'idle' | 'staging' | 'uploading' | 'finalizing' | 'done' | 'error' | 'aborted';

interface BeginUploadResponse {
  sessionId: string;
  uploadUri: string;
  expiresAt: string;
  /**
   * The exact Content-Type the PUT must carry. Send it verbatim rather than the file's own MIME
   * type: browsers normalize MIME types (audio/mp3 → audio/mpeg), and if the storage provider
   * ever signs the content-type header a mismatch becomes an intermittent 403.
   */
  requiredContentType: string;
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
  /** Record-label releasing on behalf of a roster artist. */
  onBehalfOfArtistId?: string;
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

        // 2. Upload the whole file directly to object storage with the presigned PUT.
        // Deliberately plain `axios`, not `axiosInstance`: the interceptor would attach our
        // Authorization header, which both breaks the request signature and leaks the JWT to a
        // third-party host.
        setPhase('uploading');
        cancelTokenRef.current = axios.CancelToken.source();
        await axios.put(session.uploadUri, file, {
          headers: { 'Content-Type': session.requiredContentType },
          cancelToken: cancelTokenRef.current.token,
          timeout: 0,                 // axios' default would kill a multi-GB upload mid-flight
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          onUploadProgress: (e) => {
            const loaded = e.loaded ?? 0;
            setBytesUploaded(loaded);
            // Hold at 99 until /complete returns — the upload is not "done" until we say so.
            setProgress(Math.min(99, Math.round((loaded / file.size) * 100)));
          },
          // Stop axios from trying to JSON-stringify the File; stream it straight through.
          transformRequest: [(d) => d],
        });
        setBytesUploaded(file.size);

        // 3. Complete: tell our backend to finalize, persist the Track, and enqueue processing.
        // A 2 GB upload can take many minutes; refresh the access token if it's close to expiry
        // so /complete doesn't 401 right at the finish line.
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
            onBehalfOfArtistId: complete.onBehalfOfArtistId,
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
