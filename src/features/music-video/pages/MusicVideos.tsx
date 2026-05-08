import React, { useState, useEffect } from 'react';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
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
        <Box p={{ base: 4, md: 8, lg: 10 }} maxW="1440px" mx="auto">
            {/* Page heading */}
            <VStack align="stretch" gap={1} mb={8}>
                <Heading
                    as="h1"
                    fontSize={{ base: '24px', md: '30px' }}
                    fontWeight="700"
                    letterSpacing="-0.02em"
                    color="gray.blue.800"
                    lineHeight="1.1"
                >
                    Music & Videos
                </Heading>
                <Text fontSize="13px" color="gray.blue.700">
                    Manage and preview everything you've published.
                </Text>
            </VStack>

            {/* Main Tabs */}
            <Box mb={6}>
                <HStack justify="space-between" align="center" gap={4} flexWrap="wrap">
                    <AnimatedTabs
                        tabs={mainTabs}
                        activeTab={isPodcaster && activeTab === 'music' ? 'audio' : activeTab}
                        onTabChange={(tab) => {
                            const actualTab = isPodcaster && tab === 'audio' ? 'music' : tab;
                            setActiveTab(actualTab as 'music' | 'video');
                        }}
                        size="lg"
                    />
                    {isRecordLabel && (
                        <Box>
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

