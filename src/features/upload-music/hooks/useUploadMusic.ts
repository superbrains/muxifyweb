import { useState, useCallback } from 'react';
import { useUploadMusicStore } from '../store/useUploadMusicStore';
import {
  uploadMusicService,
  validateUploadData,
  type UploadMusicData,
} from '../services/uploadMusicService';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import { useUploadProgressTracker } from '@shared/lib/uploadProgress';
import type { UploadProgressDetail } from '@shared/types/upload';
import type { TrackDto, TrackListDto } from '../types';
import { useUserType } from '@/features/auth/hooks/useUserType';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface UseUploadMusicReturn {
  uploadMusic: (data: UploadMusicData) => Promise<TrackDto | null>;
  deleteTrack: (id: string) => Promise<void>;
  loadTracks: (page?: number, pageSize?: number) => Promise<TrackListDto | null>;
  updateTrack: (id: string, data: Partial<TrackDto>) => Promise<TrackDto | null>;
  uploadProgress: UploadProgressDetail | null;
  resetUploadProgress: () => void;
  loading: boolean;
}

export const useUploadMusic = (): UseUploadMusicReturn => {
  const [loading, setLoading] = useState(false);
  const tracker = useUploadProgressTracker();
  const {
    addTrack,
    removeTrack,
    addUpload,
    removeUpload,
    updateUpload,
    setTracks,
    updateTrack: updateTrackInStore,
  } = useUploadMusicStore();
  const toast = useChakraToast();
  const { isDJ, isPodcaster } = useUserType();

  // Noun used in user-facing toasts. The music upload pipeline is shared
  // across Artists (Track), DJs (Mix), and Podcasters (Episode).
  const mediaNoun = isDJ ? 'mix' : isPodcaster ? 'episode' : 'track';

  const uploadMusic = useCallback(
    async (data: UploadMusicData): Promise<TrackDto | null> => {
      const validationErrors = validateUploadData(data);
      if (validationErrors.length > 0) {
        toast.error('Validation Error', validationErrors[0]);
        return null;
      }

      setLoading(true);
      const uploadId = crypto.randomUUID();
      tracker.start(data.file.size);

      try {
        addUpload({
          fileId: uploadId,
          progress: 0,
          status: 'uploading',
        });

        const track = await uploadMusicService.uploadTrack(data, (event) => {
          tracker.onEvent(event);
          updateUpload(uploadId, { progress: event.progress });
        });

        tracker.markCompleted();
        updateUpload(uploadId, { progress: 100, status: 'completed' });

        addTrack(track as unknown as Parameters<typeof addTrack>[0]);

        toast.success(
          'Upload successful!',
          `Your ${mediaNoun} has been uploaded successfully.`
        );

        setTimeout(() => {
          removeUpload(uploadId);
        }, 2000);

        return track;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Upload failed');
        tracker.markFailed(errorMessage);
        updateUpload(uploadId, {
          status: 'failed',
          error: errorMessage,
        });
        toast.error('Upload failed', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addTrack, addUpload, removeUpload, updateUpload, toast, tracker, mediaNoun]
  );

  const deleteTrack = useCallback(
    async (id: string): Promise<void> => {
      try {
        await uploadMusicService.deleteTrack(id);
        removeTrack(id);
        toast.success(
          `${capitalize(mediaNoun)} deleted`,
          `The ${mediaNoun} has been deleted successfully.`
        );
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Something went wrong');
        toast.error('Delete failed', errorMessage);
        throw error;
      }
    },
    [removeTrack, toast, mediaNoun]
  );

  const loadTracks = useCallback(
    async (page = 1, pageSize = 20): Promise<TrackListDto | null> => {
      try {
        setLoading(true);
        const result = await uploadMusicService.getTracks({ page, pageSize });
        setTracks(result.items as unknown as Parameters<typeof setTracks>[0]);
        return result;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Failed to load tracks');
        toast.error('Failed to load tracks', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setTracks, toast]
  );

  const updateTrack = useCallback(
    async (id: string, data: Partial<TrackDto>): Promise<TrackDto | null> => {
      try {
        const updatedTrack = await uploadMusicService.updateTrack(id, {
          title: data.title,
          description: data.description,
          genre: data.genre,
          releaseDate: data.releaseDate,
          isrc: data.isrc,
          bpm: data.bpm,
          key: data.key,
        });

        updateTrackInStore(id, updatedTrack as unknown as Parameters<typeof updateTrackInStore>[1]);

        toast.success(
          `${capitalize(mediaNoun)} updated`,
          `The ${mediaNoun} has been updated successfully.`
        );

        return updatedTrack;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Update failed');
        toast.error('Update failed', errorMessage);
        return null;
      }
    },
    [updateTrackInStore, toast, mediaNoun]
  );

  return {
    uploadMusic,
    deleteTrack,
    loadTracks,
    updateTrack,
    uploadProgress: tracker.uploadProgress,
    resetUploadProgress: tracker.reset,
    loading,
  };
};
