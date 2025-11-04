import React, { useState } from 'react';
import {
    Box,
} from '@chakra-ui/react';
import { FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { useNavigate } from 'react-router-dom';
import { PhotoAdsFlow1 } from '../components/photo-ads/flow-1/PhotoAdsFlow1';
import { PhotoAdsFlow2 } from '../components/photo-ads/flow-2/PhotoAdsFlow2';
import { PhotoAdsFlow3 } from '../components/photo-ads/flow-3/PhotoAdsFlow3';
import { VideoAdsTab } from '../components/VideoAdsTab';
import { MusicAdsTab } from '../components/MusicAdsTab';

export const CreateCampaign: React.FC = () => {
    const [activeTab, setActiveTab] = useState('photo');
    const [photoFlow, setPhotoFlow] = useState(1);
    const navigate = useNavigate();

    const tabs = [
        { id: 'photo', label: 'Photo Ads', icon: FiImage },
        { id: 'video', label: 'Video Ads', icon: FiVideo },
        { id: 'audio', label: 'Audio Ads', icon: FiMusic },
    ];

    const handlePhotoFlowBack = () => {
        if (photoFlow === 1) {
            navigate(-1);
        } else {
            setPhotoFlow(photoFlow - 1);
        }
    };

    const handlePhotoFlowNext = () => {
        setPhotoFlow(photoFlow + 1);
        // TODO: Implement flow 4 (Success)
    };

    return (
        <Box bg="white" minH="100vh" p={{ base: 4, md: 6 }}>
           

            {/* Tabs */}
            <Box mb={6}>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    size="lg"
                    backgroundColor="gray.200"
                    selectedColor="white"
                    textColor="black"
                    iconColor="primary.500"
                    selectedTextColor="black"
                    selectedIconColor="primary.500"
                    tabStyle={2}
                />
            </Box>

            {/* Tab Content */}
            {activeTab === 'photo' && photoFlow === 1 && (
                <PhotoAdsFlow1 onNext={handlePhotoFlowNext} onBack={handlePhotoFlowBack} />
            )}
            {activeTab === 'photo' && photoFlow === 2 && (
                <PhotoAdsFlow2 onNext={handlePhotoFlowNext} onBack={handlePhotoFlowBack} />
            )}
            {activeTab === 'photo' && photoFlow === 3 && (
                <PhotoAdsFlow3 onNext={handlePhotoFlowNext} onBack={handlePhotoFlowBack} />
            )}
            {activeTab === 'video' && <VideoAdsTab />}
            {activeTab === 'audio' && <MusicAdsTab />}
        </Box>
    );
};

export default CreateCampaign;
