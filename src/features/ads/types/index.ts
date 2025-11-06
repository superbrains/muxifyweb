export interface AdCampaign {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'audio';
  location: {
    country: string;
    state: string;
  };
  target: {
    type: 'music' | 'video' | 'audio';
    genre?: string;
    artists?: string[];
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
  };
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  isPaused?: boolean;
  isStopped?: boolean;
  createdAt: string;
  updatedAt: string;
  // Media files (base64 encoded)
  mediaData?: string;
  mediaName?: string;
  mediaSize?: string;
}


