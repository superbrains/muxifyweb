export type UploadStage =
  | 'preparing'
  | 'uploading'
  | 'finalizing'
  | 'processing'
  | 'completed'
  | 'failed';

export interface UploadProgressDetail {
  stage: UploadStage;
  progress: number;
  loaded: number;
  total: number;
  speedBps: number;
  etaSeconds: number | null;
  error?: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  progress: number;
}
