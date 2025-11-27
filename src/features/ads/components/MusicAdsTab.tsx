import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicAdsFlow1 } from './music-ads/flow-1/MusicAdsFlow1';
import { MusicAdsFlow2 } from './music-ads/flow-2/MusicAdsFlow2';
import { MusicAdsFlow3 } from './music-ads/flow-3/MusicAdsFlow3';

interface MusicAdsTabProps {
    editCampaignId?: string | null;
}

export const MusicAdsTab: React.FC<MusicAdsTabProps> = ({ editCampaignId }) => {
    const [flow, setFlow] = useState(1);
    const navigate = useNavigate();

    const handleNext = () => {
        // Flow 1 -> Flow 2: Validation is handled by MusicAdsFlow1 component
        // Flow 2 -> Flow 3: Validation is handled by MusicAdsFlow2 component
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
            <MusicAdsFlow3
                onNext={handleNext}
                onBack={handleBack}
                onResetFlow={() => setFlow(1)}
                editCampaignId={editCampaignId}
            />
        );
    }

    if (flow === 2) {
        return (
            <MusicAdsFlow2
                onNext={handleNext}
                onBack={handleBack}
            />
        );
    }

    // Flow 1: Upload Music & Basic Info
    return (
        <MusicAdsFlow1
            onNext={handleNext}
            onBack={handleBack}
        />
    );
};
