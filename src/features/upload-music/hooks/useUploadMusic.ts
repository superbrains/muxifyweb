import { useState } from "react";
import { useUploadMusicStore } from "../store/useUploadMusicStore";
import { uploadMusicService } from "../services/uploadMusicService";
import type { UploadMusicData } from "../services/uploadMusicService";
import { useChakraToast } from "@shared/hooks";

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: unknown } }).response !== null
  ) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (typeof data === "object" && data && "message" in data) {
      const message = (data as { message?: string }).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  return fallback;
};

export const useUploadMusic = () => {
  const [loading, setLoading] = useState(false);
  const { addTrack, removeTrack, addUpload, removeUpload, updateUpload } =
    useUploadMusicStore();
  const toast = useChakraToast();

  const uploadMusic = async (data: UploadMusicData) => {
    setLoading(true);
    const uploadId = Math.random().toString(36).substr(2, 9);

    try {
      // Add upload progress
      addUpload({
        fileId: uploadId,
        progress: 0,
        status: "uploading",
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        updateUpload(uploadId, { progress: Math.min(90, Math.random() * 100) });
      }, 500);

      const response = await uploadMusicService.uploadTrack(data);

      clearInterval(progressInterval);
      updateUpload(uploadId, { progress: 100, status: "completed" });

      // Add the new track
      addTrack(response.data);

      toast.success(
        "Upload successful!",
        "Your track has been uploaded successfully."
      );

      // Remove upload progress after a delay
      setTimeout(() => {
        removeUpload(uploadId);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Upload failed");
      updateUpload(uploadId, {
        status: "failed",
        error: errorMessage,
      });
      toast.error("Upload failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrack = async (id: string) => {
    try {
      await uploadMusicService.deleteTrack(id);
      removeTrack(id);
      toast.success(
        "Track deleted",
        "The track has been deleted successfully."
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Something went wrong");
      toast.error("Delete failed", errorMessage);
    }
  };

  const loadTracks = async () => {
    try {
      await uploadMusicService.getTracks();
      // This would typically update the store with all tracks
      // For now, we'll just show a success message
      toast.success(
        "Tracks loaded",
        "Your tracks have been loaded successfully."
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Something went wrong");
      toast.error("Failed to load tracks", errorMessage);
    }
  };

  return {
    uploadMusic,
    deleteTrack,
    loadTracks,
    loading,
  };
};
