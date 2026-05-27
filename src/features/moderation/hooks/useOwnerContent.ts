import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { axiosInstance } from '@app/lib/axiosInstance';
import type { TrackDto } from '@uploadMusic/types';
import type { VideoDto } from '@uploadVideo/types';

/**
 * Owner-facing track fetch (`GET /api/v1/music/{id}` — backend-gated by `userId` check).
 * Returns the full TrackDto including dispute context. Returns 403 for non-owners,
 * which surfaces as a query error — consumers should treat it as "not authorized".
 *
 * Use this for the dispute page and held-state banners. Do NOT conflate with
 * `useTrackDetail`, which hits the fan-facing `/content/tracks/{id}` and lacks
 * `heldForDuplicateReview` / `duplicateMatch`.
 */
export const useOwnerTrack = (
    id: string,
    options?: Omit<UseQueryOptions<TrackDto>, 'queryKey' | 'queryFn'>,
) =>
    useQuery<TrackDto>({
        queryKey: ['music', 'track', id],
        queryFn: async () => {
            const response = await axiosInstance.get<TrackDto>(`/music/${id}`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 30_000,
        retry: false,
        ...options,
    });

/**
 * Owner-facing video fetch (`GET /api/v1/video/{id}`). Returns 403 for non-owners
 * of unpublished/held content. See `useOwnerTrack` for the rationale.
 */
export const useOwnerVideo = (
    id: string,
    options?: Omit<UseQueryOptions<VideoDto>, 'queryKey' | 'queryFn'>,
) =>
    useQuery<VideoDto>({
        queryKey: ['video', id],
        queryFn: async () => {
            const response = await axiosInstance.get<VideoDto>(`/video/${id}`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 30_000,
        retry: false,
        ...options,
    });
