import React, { useState, useEffect } from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { FiMusic, FiVideo } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { MusicTab } from '../components/MusicTab';
import { VideoTab } from '../components/VideoTab';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { ArtistDropdown } from '@/shared/components/ArtistDropdown';

export const MusicVideos: React.FC = () => {
    const { isPodcaster, isCreator, isRecordLabel } = useUserType();
    const [activeTab, setActiveTab] = useState<'music' | 'video'>(isCreator ? 'video' : 'music');

    // Get tabs based on user type
    const getMainTabs = () => {
        if (isPodcaster) {
            return [
                { id: 'audio', label: 'Audio', icon: FiMusic },
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        if (isCreator) {
            // Creators only have video tab
            return [
                { id: 'video', label: 'Video', icon: FiVideo },
            ];
        }
        return [
            { id: 'music', label: 'Music', icon: FiMusic },
            { id: 'video', label: 'Video', icon: FiVideo },
        ];
    };

    const mainTabs = getMainTabs();
    
    // For creators, force video tab
    useEffect(() => {
        if (isCreator && activeTab !== 'video') {
            setActiveTab('video');
        }
    }, [isCreator, activeTab]);

    return (
        <Box bg="white" minH="100vh" p={{ base: 4, md: 6 }}>
            {/* Main Tabs */}
            <Box mb={6}>
                <HStack justify="space-between" align="center">
                    <Box flex={1}>
                <AnimatedTabs
                            tabs={mainTabs}
                            activeTab={isPodcaster && activeTab === 'music' ? 'audio' : activeTab}
                            onTabChange={(tab) => {
                                const actualTab = isPodcaster && tab === 'audio' ? 'music' : tab;
                                setActiveTab(actualTab as 'music' | 'video');
                            }}
                    size="lg"
                />
                    </Box>
                    {isRecordLabel && (
                        <Box ml={4}>
                            <ArtistDropdown />
                        </Box>
                    )}
                </HStack>
            </Box>

            {/* Content */}
            {activeTab === 'music' ? <MusicTab /> : <VideoTab />}
        </Box>
    );
};

export default MusicVideos;

