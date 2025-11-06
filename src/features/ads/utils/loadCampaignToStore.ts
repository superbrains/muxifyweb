import type { AdCampaign } from '../types';
import type { AdBaseInfo, UploadFile } from '../store/useAdsUploadStore';
import { useAdsUploadStore } from '../store/useAdsUploadStore';

/**
 * Loads campaign data into the upload store for editing
 * This should be called from within a React component or useEffect
 */
export const loadCampaignToStore = (campaign: AdCampaign) => {
    const store = useAdsUploadStore.getState();

    // Convert schedule date string back to Date object
    const scheduleDate = campaign.schedule.date ? new Date(campaign.schedule.date) : null;

    // Parse time from schedule (assuming format like "10:00 AM")
    const timeMatch = campaign.schedule.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    const ampm = timeMatch ? (timeMatch[3].toUpperCase() as 'AM' | 'PM') : 'AM';

    // Create AdBaseInfo
    const adInfo: AdBaseInfo = {
        title: campaign.title,
        location: {
            country: campaign.location.country,
            state: campaign.location.state,
        },
        target: {
            type: campaign.target.type === 'audio' ? 'music' : campaign.target.type,
            genre: campaign.target.genre,
            artists: campaign.target.artists || [],
        },
        schedule: {
            date: scheduleDate,
            startTime: campaign.schedule.startTime,
            endTime: campaign.schedule.endTime,
            ampm: ampm,
        },
    };

    // Create UploadFile from media data
    const getMediaUrl = (): string => {
        if (!campaign.mediaData) return '';
        
        // If already a data URL, use it directly
        if (campaign.mediaData.startsWith('data:')) {
            return campaign.mediaData;
        }
        
        // Determine MIME type based on campaign type and file extension
        let mimeType = 'image/jpeg'; // default
        if (campaign.type === 'video') {
            mimeType = 'video/mp4';
        } else if (campaign.type === 'audio') {
            mimeType = 'audio/mpeg';
        } else if (campaign.mediaName) {
            // Try to determine from file extension
            const extension = campaign.mediaName.split('.').pop()?.toLowerCase();
            if (extension === 'png') mimeType = 'image/png';
            else if (extension === 'gif') mimeType = 'image/gif';
            else if (extension === 'mp4' || extension === 'mov') mimeType = 'video/mp4';
            else if (extension === 'mp3' || extension === 'wav') mimeType = 'audio/mpeg';
        }
        
        return `data:${mimeType};base64,${campaign.mediaData}`;
    };

    const uploadFile: UploadFile | null = campaign.mediaData ? {
        id: `edit_${campaign.id}`,
        name: campaign.mediaName || 'media',
        size: campaign.mediaSize || '0 MB',
        progress: 100,
        status: 'ready',
        url: getMediaUrl(),
    } : null;

    // Get existing store values to preserve them if they exist
    const currentState = store;
    
    // Load data based on campaign type
    if (campaign.type === 'photo') {
        store.photoSetFile(uploadFile);
        store.photoSetAdInfo(adInfo);
        
        // Only set CallToAction if it doesn't exist in store (preserve existing values)
        if (!currentState.photoCallToAction) {
            store.photoSetCallToAction({
                action: 'click',
                link: '',
            });
        }
        
        // Set BudgetReach with campaign budget, but preserve impressions if they exist
        const existingBudgetReach = currentState.photoBudgetReach;
        store.photoSetBudgetReach({
            amount: campaign.budget || 0,
            impressions: existingBudgetReach?.impressions || 0, // Preserve existing impressions
        });
        
        store.setActiveTab('photo');
    } else if (campaign.type === 'video') {
        store.videoSetFile(uploadFile);
        store.videoSetAdInfo(adInfo);
        
        // Only set CallToAction if it doesn't exist in store (preserve existing values)
        if (!currentState.videoCallToAction) {
            store.videoSetCallToAction({
                action: 'click',
                link: '',
            });
        }
        
        // Set BudgetReach with campaign budget, but preserve impressions if they exist
        const existingBudgetReach = currentState.videoBudgetReach;
        store.videoSetBudgetReach({
            amount: campaign.budget || 0,
            impressions: existingBudgetReach?.impressions || 0, // Preserve existing impressions
        });
        
        store.videoSetTrimStart(0);
        store.videoSetTrimEnd(5);
        store.setActiveTab('video');
    } else if (campaign.type === 'audio') {
        store.musicSetFile(uploadFile);
        store.musicSetAdInfo(adInfo);
        
        // Only set CallToAction if it doesn't exist in store (preserve existing values)
        if (!currentState.musicCallToAction) {
            store.musicSetCallToAction({
                action: 'click',
                link: '',
            });
        }
        
        // Set BudgetReach with campaign budget, but preserve impressions if they exist
        const existingBudgetReach = currentState.musicBudgetReach;
        store.musicSetBudgetReach({
            amount: campaign.budget || 0,
            impressions: existingBudgetReach?.impressions || 0, // Preserve existing impressions
        });
        
        store.musicSetTrimStart(0);
        store.musicSetTrimEnd(5);
        store.setActiveTab('audio');
    }
};

