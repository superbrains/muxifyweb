import { useCallback, useRef, useState } from 'react';
import type { AxiosProgressEvent } from 'axios';
import { useUploadProgressTracker } from '@shared/lib/uploadProgress';
import { useToast } from '@/shared/hooks/useToast';
import { useAdsStore } from '../store/useAdsStore';
import { adsService } from '../services/adsService';
import type { UploadFile } from '../store/useAdsUploadStore';
import type { CreateCampaignRequest } from '../types';

export type PublishOutcome = 'review' | 'live' | 'draft';

export interface PublishOptions {
  /** Creative file — source of the base64 payload, byte size and thumbnail. */
  creativeFile: UploadFile | null;
  /** Builds the API request once the creative is resolved to base64. */
  buildRequest: (mediaData?: string) => CreateCampaignRequest;
  /** When set, updates an existing campaign instead of creating + submitting. */
  editCampaignId?: string | null;
  /** Clears the relevant ad upload store slice on a confirmed save. */
  onSaved: () => void;
}

/** Best-effort byte size for the progress total before axios reports the real one. */
function estimateBytes(creativeFile: UploadFile | null): number {
  if (creativeFile?.file) return creativeFile.file.size;
  // Edit mode with only a data URL — approximate from base64 length (~3/4 of chars).
  const dataUrl = creativeFile?.url;
  if (dataUrl?.startsWith('data:')) {
    const base64 = dataUrl.split(',')[1] ?? '';
    return Math.floor((base64.length * 3) / 4);
  }
  return 0;
}

/** Converts a `data:` URL into a File so it can be uploaded as multipart. */
function dataUrlToFile(dataUrl: string, name = 'creative'): File | null {
  const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const mime = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const binary = isBase64 ? atob(match[3]) : decodeURIComponent(match[3]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const ext = (mime.split('/')[1] || 'bin').split('+')[0];
  return new File([bytes], `${name}.${ext}`, { type: mime });
}

/**
 * Resolves the creative to a hosted URL: uploads a File (or a data-URL converted
 * to a File) to blob storage with progress, passes through an already-hosted URL
 * (edit mode), or returns undefined when there's no new creative so an update
 * keeps the existing one. Replaces inlining the creative as base64 in the JSON
 * body, which blew the request timeout for audio/video.
 */
async function resolveCreativeUrl(
  creativeFile: UploadFile | null,
  onUploadProgress: (event: AxiosProgressEvent) => void,
): Promise<string | undefined> {
  let file: File | null = creativeFile?.file ?? null;
  if (!file && creativeFile?.url?.startsWith('data:')) {
    file = dataUrlToFile(creativeFile.url);
  }
  if (file) {
    const { url } = await adsService.uploadCreative(file, onUploadProgress);
    return url;
  }
  if (creativeFile?.url && !creativeFile.url.startsWith('data:')) {
    return creativeFile.url; // already hosted — reuse as-is
  }
  return undefined;
}

/**
 * Orchestrates ad-campaign publishing with the shared upload progress modal.
 * Drives the tracker through preparing → uploading → finalizing → completed,
 * mirroring how track (audio/video) uploads report progress.
 */
export function useCampaignPublish() {
  const tracker = useUploadProgressTracker();
  const { createCampaignApi, updateCampaignApi } = useAdsStore();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishOutcome, setPublishOutcome] = useState<PublishOutcome>('review');
  const lastOptsRef = useRef<PublishOptions | null>(null);

  const publish = useCallback(
    async (opts: PublishOptions) => {
      lastOptsRef.current = opts;
      const { creativeFile, buildRequest, editCampaignId, onSaved } = opts;
      const isEditMode = !!editCampaignId;

      setIsModalOpen(true);
      tracker.start(estimateBytes(creativeFile));

      // Forward axios upload events into the tracker (real byte progress).
      const onUploadProgress = (event: AxiosProgressEvent) => {
        const total = event.total ?? 0;
        const loaded = event.loaded ?? 0;
        const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;
        tracker.onEvent({ loaded, total: total || loaded, progress });
      };

      try {
        // Uploading — push the creative binary to blob storage first (the heavy
        // transfer). The campaign create/update then carries only the URL, so the
        // JSON body is tiny and no longer blows the 30s request timeout.
        const creativeUrl = await resolveCreativeUrl(creativeFile, onUploadProgress);

        // Finalizing — persist the campaign (small JSON now).
        tracker.markFinalizing();
        const apiRequest = buildRequest(creativeUrl);

        if (isEditMode && editCampaignId) {
          const ok = await updateCampaignApi(editCampaignId, apiRequest);
          if (!ok) {
            const message = useAdsStore.getState().error || 'Please try again.';
            tracker.markFailed(message);
            toast.error('Could not update campaign', message);
            return;
          }
          setPublishOutcome('review');
          tracker.markCompleted();
        } else {
          const campaignId = await createCampaignApi(apiRequest);
          if (!campaignId) {
            const message =
              useAdsStore.getState().error || 'Failed to create the campaign. Please try again.';
            tracker.markFailed(message);
            toast.error('Could not publish ad', message);
            return;
          }
          // Submit the freshly-created draft for admin approval.
          try {
            const res = await adsService.submitCampaign(campaignId);
            setPublishOutcome(res.status === 'Active' ? 'live' : 'review');
          } catch (submitError) {
            toast.error(
              'Saved as draft — not yet submitted',
              submitError instanceof Error
                ? submitError.message
                : 'Open the campaign in your library and submit it again for review.'
            );
            setPublishOutcome('draft');
          }
          tracker.markCompleted();
        }

        // Confirmed save — clear the upload store slice. The success page is
        // shown when the completed modal auto-closes (see handleModalClose).
        onSaved();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Something went wrong while publishing.';
        tracker.markFailed(message);
        toast.error('Could not publish ad', message);
      }
    },
    [tracker, createCampaignApi, updateCampaignApi, toast]
  );

  const retry = useCallback(() => {
    if (lastOptsRef.current) void publish(lastOptsRef.current);
  }, [publish]);

  /** Modal close handler: on success advance to the success page, else just dismiss. */
  const handleModalClose = useCallback(() => {
    const completed = tracker.uploadProgress?.stage === 'completed';
    setIsModalOpen(false);
    tracker.reset();
    if (completed) setIsPublished(true);
  }, [tracker]);

  /** Dismiss the success page (e.g. when the user chooses "Create More"). */
  const dismissSuccess = useCallback(() => setIsPublished(false), []);

  return {
    uploadProgress: tracker.uploadProgress,
    isModalOpen,
    isPublished,
    publishOutcome,
    publish,
    retry,
    handleModalClose,
    dismissSuccess,
  };
}
