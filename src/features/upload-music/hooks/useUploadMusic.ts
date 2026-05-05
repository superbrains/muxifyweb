import { useState, useCallback } from 'react';
import { useUploadMusicStore } from '../store/useUploadMusicStore';
import {
  uploadMusicService,
  validateUploadData,
  type UploadMusicData,
} from '../services/uploadMusicService';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import type { TrackDto, TrackListDto } from '../types';

interface UseUploadMusicReturn {
  uploadMusic: (data: UploadMusicData) => Promise<TrackDto | null>;
  deleteTrack: (id: string) => Promise<void>;
  loadTracks: (page?: number, pageSize?: number) => Promise<TrackListDto | null>;
  updateTrack: (id: string, data: Partial<TrackDto>) => Promise<TrackDto | null>;
  loading: boolean;
}

export const useUploadMusic = (): UseUploadMusicReturn => {
  const [loading, setLoading] = useState(false);
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

  const uploadMusic = useCallback(
    async (data: UploadMusicData): Promise<TrackDto | null> => {
      // Validate upload data before submitting
      const validationErrors = validateUploadData(data);
      if (validationErrors.length > 0) {
        toast.error('Validation Error', validationErrors[0]);
        return null;
      }

      setLoading(true);
      const uploadId = crypto.randomUUID();

      try {
        // Add upload progress entry
        addUpload({
          fileId: uploadId,
          progress: 0,
          status: 'uploading',
        });

        // Upload with real progress tracking
        const track = await uploadMusicService.uploadTrack(data, (progress) => {
          updateUpload(uploadId, { progress });
        });

        // Mark as completed
        updateUpload(uploadId, { progress: 100, status: 'completed' });

        // Add the new track to store (cast to MusicTrack type)
        addTrack(track as unknown as Parameters<typeof addTrack>[0]);

        toast.success(
          'Upload successful!',
          'Your track has been uploaded successfully.'
        );

        // Remove upload progress after a delay
        setTimeout(() => {
          removeUpload(uploadId);
        }, 2000);

        return track;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Upload failed');
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
    [addTrack, addUpload, removeUpload, updateUpload, toast]
  );

  const deleteTrack = useCallback(
    async (id: string): Promise<void> => {
      try {
        await uploadMusicService.deleteTrack(id);
        removeTrack(id);
        toast.success(
          'Track deleted',
          'The track has been deleted successfully.'
        );
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Something went wrong');
        toast.error('Delete failed', errorMessage);
        throw error;
      }
    },
    [removeTrack, toast]
  );

  const loadTracks = useCallback(
    async (page = 1, pageSize = 20): Promise<TrackListDto | null> => {
      try {
        setLoading(true);
        const result = await uploadMusicService.getTracks({ page, pageSize });

        // Update store with loaded tracks (cast to MusicTrack array)
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

        // Update track in store
        updateTrackInStore(id, updatedTrack as unknown as Parameters<typeof updateTrackInStore>[1]);

        toast.success(
          'Track updated',
          'The track has been updated successfully.'
        );

        return updatedTrack;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Update failed');
        toast.error('Update failed', errorMessage);
        return null;
      }
    },
    [updateTrackInStore, toast]
  );

  return {
    uploadMusic,
    deleteTrack,
    loadTracks,
    updateTrack,
    loading,
  };
};
