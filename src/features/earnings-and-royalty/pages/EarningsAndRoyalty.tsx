import React, { useState, useEffect } from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { FiMusic, FiVideo } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { MusicTab } from '../components/MusicTab';
import { VideoTab } from '../components/VideoTab';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';

export const EarningsAndRoyalty: React.FC = () => {
    const { isPodcaster, isCreator, isRecordLabel } = useUserType();
    const [activeTab, setActiveTab] = useState<'music' | 'video'>(isCreator ? 'video' : 'music');

    const getTabs = () => {
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

    const tabs = getTabs();
    
    useEffect(() => {
        if (isCreator && activeTab !== 'video') {
            setActiveTab('video');
        }
    }, [isCreator, activeTab]);

    return (
        <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
            {/* Main Tabs */}
            <HStack justify="space-between" align="center" mb={6}>
                <Box flex={1}>
                <AnimatedTabs
                        tabs={tabs}
                        activeTab={isPodcaster && activeTab === 'music' ? 'audio' : activeTab}
                        onTabChange={(tab) => {
                            const actualTab = isPodcaster && tab === 'audio' ? 'music' : tab;
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

            {/* Content */}
            {activeTab === 'music' ? <MusicTab /> : <VideoTab />}
        </Box>
    );
};

export default EarningsAndRoyalty;
