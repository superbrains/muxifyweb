import React, { useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { PhotoAdsTab } from '../components/ad-library/PhotoAdsTab';
import { VideoAdsTab } from '../components/ad-library/VideoAdsTab';
import { AudioAdsTab } from '../components/ad-library/AudioAdsTab';

export const AdLibrary: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'audio'>('photo');

    const tabs = [
        { id: 'photo', label: 'Photo Ads', icon: FiImage },
        { id: 'video', label: 'Video Ads', icon: FiVideo },
        { id: 'audio', label: 'Audio Ads', icon: FiMusic },
    ];

    return (
        <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
            <VStack align="stretch" gap={0}>
                {/* Tabs */}
                <Box>
                    <AnimatedTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={(tabId) => setActiveTab(tabId as 'photo' | 'video' | 'audio')}
                        size="md"
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
                {activeTab === 'photo' && <PhotoAdsTab />}
                {activeTab === 'video' && <VideoAdsTab />}
                {activeTab === 'audio' && <AudioAdsTab />}
            </VStack>
        </Box>
    );
};

export default AdLibrary;


