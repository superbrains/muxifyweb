import { useState, useCallback } from 'react';
import { useUploadVideoStore } from '../store/useUploadVideoStore';
import {
  videoService,
  validateVideoUploadData,
  type UploadVideoData,
} from '../services/videoService';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import { useUploadProgressTracker } from '@shared/lib/uploadProgress';
import type { UploadProgressDetail } from '@shared/types/upload';
import type { VideoDto, VideoListDto, UpdateVideoRequest } from '../types';

interface UseUploadVideoReturn {
  uploadVideo: (data: UploadVideoData) => Promise<VideoDto | null>;
  deleteVideo: (id: string) => Promise<void>;
  loadVideos: (page?: number, pageSize?: number) => Promise<VideoListDto | null>;
  updateVideo: (id: string, data: UpdateVideoRequest) => Promise<VideoDto | null>;
  getVideo: (id: string) => Promise<VideoDto | null>;
  uploadProgress: UploadProgressDetail | null;
  resetUploadProgress: () => void;
  loading: boolean;
}

export const useUploadVideo = (): UseUploadVideoReturn => {
  const [loading, setLoading] = useState(false);
  const tracker = useUploadProgressTracker();
  const { resetVideoUpload } = useUploadVideoStore();
  const toast = useChakraToast();

  const uploadVideo = useCallback(
    async (data: UploadVideoData): Promise<VideoDto | null> => {
      const validationErrors = validateVideoUploadData(data);
      if (validationErrors.length > 0) {
        toast.error('Validation Error', validationErrors[0]);
        return null;
      }

      setLoading(true);
      tracker.start(data.file.size);

      try {
        const video = await videoService.uploadVideo(data, (event) => {
          tracker.onEvent(event);
        });

        tracker.markCompleted();

        toast.success(
          'Upload successful!',
          'Your video has been uploaded successfully.'
        );

        resetVideoUpload();

        return video;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Upload failed');
        tracker.markFailed(errorMessage);
        toast.error('Upload failed', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resetVideoUpload, toast, tracker]
  );

  const deleteVideo = useCallback(
    async (id: string): Promise<void> => {
      try {
        await videoService.deleteVideo(id);
        toast.success(
          'Video deleted',
          'The video has been deleted successfully.'
        );
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Something went wrong');
        toast.error('Delete failed', errorMessage);
        throw error;
      }
    },
    [toast]
  );

  const loadVideos = useCallback(
    async (page = 1, pageSize = 20): Promise<VideoListDto | null> => {
      try {
        setLoading(true);
        const result = await videoService.getVideos({ page, pageSize });
        return result;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Failed to load videos');
        toast.error('Failed to load videos', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const updateVideo = useCallback(
    async (id: string, data: UpdateVideoRequest): Promise<VideoDto | null> => {
      try {
        const updatedVideo = await videoService.updateVideo(id, data);

        toast.success(
          'Video updated',
          'The video has been updated successfully.'
        );

        return updatedVideo;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Update failed');
        toast.error('Update failed', errorMessage);
        return null;
      }
    },
    [toast]
  );

  const getVideo = useCallback(
    async (id: string): Promise<VideoDto | null> => {
      try {
        setLoading(true);
        const video = await videoService.getVideo(id);
        return video;
      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error, 'Failed to load video');
        toast.error('Failed to load video', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return {
    uploadVideo,
    deleteVideo,
    loadVideos,
    updateVideo,
    getVideo,
    uploadProgress: tracker.uploadProgress,
    resetUploadProgress: tracker.reset,
    loading,
  };
};
