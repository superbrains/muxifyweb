import React, { useState, useEffect } from 'react';
import {
    Box,
} from '@chakra-ui/react';
import { FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhotoAdsFlow1 } from '../components/photo-ads/flow-1/PhotoAdsFlow1';
import { PhotoAdsFlow2 } from '../components/photo-ads/flow-2/PhotoAdsFlow2';
import { PhotoAdsFlow3 } from '../components/photo-ads/flow-3/PhotoAdsFlow3';
import { VideoAdsTab } from '../components/VideoAdsTab';
import { MusicAdsTab } from '../components/MusicAdsTab';
import { useAdsStore } from '../store/useAdsStore';
import { useAdsUploadStore } from '../store/useAdsUploadStore';
import { loadCampaignToStore } from '../utils/loadCampaignToStore';

export const CreateCampaign: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('photo');
    const [photoFlow, setPhotoFlow] = useState(1);
    const [editCampaignId, setEditCampaignId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { getCampaignById } = useAdsStore();
    const { resetPhotoAds, resetVideoAds, resetMusicAds } = useAdsUploadStore();

    // Set active tab and load campaign data from URL params
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const idParam = searchParams.get('id');

        if (tabParam && ['photo', 'video', 'audio'].includes(tabParam)) {
            setActiveTab(tabParam);
            // Reset photo flow when switching tabs
            if (tabParam !== 'photo') {
                setPhotoFlow(1);
            }
        }

        // If there's an ID param, we're editing - load campaign data
        if (idParam) {
            const campaign = getCampaignById(idParam);
            if (campaign) {
                setEditCampaignId(idParam);
                loadCampaignToStore(campaign);
                // Start from flow 1 when editing
                setPhotoFlow(1);
            }
        } else {
            // No ID param means new campaign - reset the store for the active tab
            setEditCampaignId(null);
            const currentTab = tabParam || activeTab;
            if (currentTab === 'photo') {
                resetPhotoAds();
            } else if (currentTab === 'video') {
                resetVideoAds();
            } else if (currentTab === 'audio') {
                resetMusicAds();
            }
        }
    }, [searchParams, getCampaignById, activeTab, resetPhotoAds, resetVideoAds, resetMusicAds]);

    // Get campaign type when editing to determine which tab to disable
    const editCampaign = editCampaignId ? getCampaignById(editCampaignId) : null;
    const editCampaignType = editCampaign?.type;

    const tabs = [
        { 
            id: 'photo', 
            label: 'Photo Ads', 
            icon: FiImage,
            disabled: editCampaignId ? editCampaignType !== 'photo' : false,
        },
        { 
            id: 'video', 
            label: 'Video Ads', 
            icon: FiVideo,
            disabled: editCampaignId ? editCampaignType !== 'video' : false,
        },
        { 
            id: 'audio', 
            label: 'Audio Ads', 
            icon: FiMusic,
            disabled: editCampaignId ? editCampaignType !== 'audio' : false,
        },
    ];

    const handleTabChange = (tabId: string) => {
        // Prevent tab switching when editing
        if (editCampaignId && editCampaignType && tabId !== editCampaignType) {
            return;
        }
        setActiveTab(tabId);
    };

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
                    onTabChange={handleTabChange}
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
                <PhotoAdsFlow3 
                    onNext={handlePhotoFlowNext} 
                    onBack={handlePhotoFlowBack}
                    onResetFlow={() => setPhotoFlow(1)}
                    editCampaignId={editCampaignId}
                />
            )}
            {activeTab === 'video' && <VideoAdsTab editCampaignId={editCampaignId} />}
            {activeTab === 'audio' && <MusicAdsTab editCampaignId={editCampaignId} />}
        </Box>
    );
};

export default CreateCampaign;
