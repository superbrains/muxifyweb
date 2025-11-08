import React, { useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { AnimatedTabs } from '@shared/components';
import { GalleryIcon, MusicFilledIcon, VideoPlayIcon } from '@/shared/icons/CustomIcons';
import { PhotoAdsTab } from '../components/ad-library/PhotoAdsTab';
import { VideoAdsTab } from '../components/ad-library/VideoAdsTab';
import { AudioAdsTab } from '../components/ad-library/AudioAdsTab';

type AdTabId = 'photo' | 'video' | 'audio';

interface AdTab {
    id: AdTabId;
    label: string;
    icon: React.ElementType;
}

const AD_TABS: AdTab[] = [
    { id: 'photo', label: 'Photo Ads', icon: GalleryIcon },
    { id: 'video', label: 'Video Ads', icon: VideoPlayIcon },
    { id: 'audio', label: 'Audio Ads', icon: MusicFilledIcon },
];

const isAdTabId = (value: string): value is AdTabId =>
    AD_TABS.some((tab) => tab.id === value);

export const AdLibrary: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdTabId>('photo');

    return (
        <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
            <VStack align="stretch" gap={0}>
                <Box>
                    <AnimatedTabs
                        tabs={AD_TABS}
                        activeTab={activeTab}
                        onTabChange={(tabId) => {
                            if (isAdTabId(tabId)) {
                                setActiveTab(tabId);
                            }
                        }}
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

                {activeTab === 'photo' && <PhotoAdsTab />}
                {activeTab === 'video' && <VideoAdsTab />}
                {activeTab === 'audio' && <AudioAdsTab />}
            </VStack>
        </Box>
    );
};

export default AdLibrary;