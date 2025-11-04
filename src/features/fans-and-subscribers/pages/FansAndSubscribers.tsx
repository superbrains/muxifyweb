import React, { useState, useEffect } from 'react';
import { VStack, HStack, Box } from '@chakra-ui/react';
import { AnimatedTabs } from '@shared/components';
import { MusicTab, VideoTab } from '../components';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';
import { FiMusic, FiVideo } from 'react-icons/fi';

export const FansAndSubscribers: React.FC = () => {
    const { isPodcaster, isCreator, isRecordLabel } = useUserType();
    const [activeTab, setActiveTab] = useState<'music' | 'video'>(isCreator ? 'video' : 'music');

    const getContentTabs = () => {
        if (isPodcaster) {
            return [
                { id: 'audio', label: 'Audio', icon: FiMusic },
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        if (isCreator) {
            return [
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        return [
            { id: 'music', label: 'Music', icon: FiMusic },
            { id: 'video', label: 'Video', icon: FiVideo },
    ];
    };

    const contentTabs = getContentTabs();
    
    useEffect(() => {
        if (isCreator && activeTab !== 'video') {
            setActiveTab('video');
        }
    }, [isCreator, activeTab]);

    return (
        <VStack align="stretch" gap={6} px={7}>
            {/* Content Tabs */}
            <HStack justify="space-between" align="center">
                <Box flex={1}>
            <AnimatedTabs
                tabs={contentTabs}
                        activeTab={isPodcaster && activeTab === 'music' ? 'audio' : activeTab}
                        onTabChange={(tabId) => {
                            const actualTab = isPodcaster && tabId === 'audio' ? 'music' : tabId;
                            setActiveTab(actualTab as 'music' | 'video');
                        }}
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
                {isRecordLabel && (
                    <Box ml={4}>
                        <ArtistDropdown />
                    </Box>
                )}
            </HStack>

            {/* Tab Content */}
            {activeTab === 'music' ? <MusicTab /> : <VideoTab />}
        </VStack>
    );
};

export default FansAndSubscribers;
