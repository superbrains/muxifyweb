import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoAdsFlow1 } from './video-ads/flow-1/VideoAdsFlow1';
import { VideoAdsFlow2 } from './video-ads/flow-2/VideoAdsFlow2';
import { VideoAdsFlow3 } from './video-ads/flow-3/VideoAdsFlow3';

interface VideoAdsTabProps {
    editCampaignId?: string | null;
}

export const VideoAdsTab: React.FC<VideoAdsTabProps> = ({ editCampaignId }) => {
    const [flow, setFlow] = useState(1);
    const navigate = useNavigate();
    
    const handleNext = () => {
        // Flow 1 -> Flow 2: Validation is handled by VideoAdsFlow1 component
        // Flow 2 -> Flow 3: Validation is handled by VideoAdsFlow2 component
        if (flow === 1) {
            setFlow(2);
        } else if (flow === 2) {
            setFlow(3);
        }
    };
    
    const handleBack = () => {
        if (flow > 1) {
            setFlow(flow - 1);
        } else {
            navigate(-1);
        }
    };
    
    if (flow === 3) {
        return (
            <VideoAdsFlow3
                onNext={handleNext}
                onBack={handleBack}
                onResetFlow={() => setFlow(1)}
                editCampaignId={editCampaignId}
            />
        );
    }
    
    if (flow === 2) {
        return (
            <VideoAdsFlow2
                onNext={handleNext}
                onBack={handleBack}
            />
        );
    }
    
    // Flow 1: Upload Video & Basic Info
    return (
        <VideoAdsFlow1
            onNext={handleNext}
            onBack={handleBack}
        />
    );
};
