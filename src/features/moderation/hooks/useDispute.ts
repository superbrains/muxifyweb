import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackService } from '@uploadMusic/services/trackService';
import { videoService } from '@uploadVideo/services/videoService';
import type { TrackDto } from '@uploadMusic/types';
import type { VideoDto } from '@uploadVideo/types';

/**
 * Submits a dispute on a held track. On success, every cache that may show this
 * track's hold/dispute state is refreshed — the dispute page, album editor, and
 * music-videos list all reflect the new "submitted" state without a manual reload.
 */
export const useDisputeTrack = (trackId: string) => {
    const qc = useQueryClient();
    return useMutation<TrackDto, Error, string>({
        mutationFn: (reason: string) => trackService.disputeTrack(trackId, reason),
        onSuccess: (updated) => {
            qc.setQueryData(['music', 'track', trackId], updated);
            qc.invalidateQueries({ queryKey: ['content', 'track', trackId] });
            qc.invalidateQueries({ queryKey: ['album'] });
            qc.invalidateQueries({ queryKey: ['music', 'list'] });
        },
    });
};

/**
 * Submits a dispute on a held video. Mirrors `useDisputeTrack`.
 */
export const useDisputeVideo = (videoId: string) => {
    const qc = useQueryClient();
    return useMutation<VideoDto, Error, string>({
        mutationFn: (reason: string) => videoService.disputeVideo(videoId, reason),
        onSuccess: (updated) => {
            qc.setQueryData(['video', videoId], updated);
            qc.invalidateQueries({ queryKey: ['content', 'video', videoId] });
            qc.invalidateQueries({ queryKey: ['video', 'list'] });
        },
    });
};
