import React, { useState, useEffect } from 'react';
import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedTabs } from '@shared/components';
import { MixReview } from './MixReview';
import { AlbumReview } from './AlbumReview';
import { UploadSuccessPage } from './UploadSuccessPage';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { useUserType } from '@/features/auth/hooks/useUserType';

interface MusicReviewProps {
    albumTab: 'mix' | 'album';
    setAlbumTab: (tab: 'mix' | 'album') => void;
    onPublish: () => void;
    isDisabled?: boolean;
}

export const MusicReview: React.FC<MusicReviewProps> = ({ albumTab, setAlbumTab, onPublish, isDisabled = false }) => {
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetMix, resetAlbum } = useUploadMusicStore();
    const { isPodcaster, isDJ, isMusician } = useUserType();
    
    // Get sub tabs based on user type
    const getSubTabs = () => {
        if (isPodcaster) {
            return [
                { id: 'episode', label: 'Episode' },
                { id: 'topic', label: 'Topic' },
            ];
        }
        if (isDJ) {
            return [
                { id: 'mix', label: 'Mix' },
                { id: 'album', label: 'Album' },
            ];
        }
        if (isMusician) {
            return [
                { id: 'single', label: 'Single' },
                { id: 'album', label: 'Album' },
            ];
        }
        // Default
        return [
            { id: 'mix', label: 'Mix' },
            { id: 'album', label: 'Album' },
        ];
    };
    
    const subTabs = getSubTabs();
    
    // Map podcast tabs to internal tabs
    const mapTabId = (tabId: string) => {
        if (isPodcaster) {
            return tabId === 'episode' ? 'mix' : 'album';
        }
        if (isMusician) {
            return tabId === 'single' ? 'mix' : 'album';
        }
        return tabId;
    };
    
    const mapInternalToDisplay = (internalTab: string) => {
        if (isPodcaster) {
            return internalTab === 'mix' ? 'episode' : 'topic';
        }
        if (isMusician) {
            return internalTab === 'mix' ? 'single' : 'album';
        }
        return internalTab;
    };

    console.log('MusicReview rendering with albumTab:', albumTab);

    const handlePublish = async () => {
        setIsPublishing(true);

        try {
            // Simulate API call with async promise
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 2000); // 2 second delay to simulate API call
            });

            // Call the original onPublish function
            onPublish();

            // Clear the store state based on current tab
            if (albumTab === 'mix') {
                resetMix();
            } else {
                resetAlbum();
            }

            // Show success page
            setIsPublished(true);
        } catch (error) {
            console.error('Publish failed:', error);
            // Handle error if needed
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnderstand = () => {
        // Navigate to dashboard
        navigate('/dashboard');
    };

    const handleUploadMore = () => {
        // Close the success page and navigate back to upload
        setIsPublished(false);
        navigate('/upload');
    };

    // Prevent body scroll when success page is shown
    useEffect(() => {
        if (isPublished) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPublished]);

    return (
        <>
            {/* Review Header */}
            <Flex align="center" gap={3} mb={6}>
                <Icon
                    as={FiArrowLeft}
                    boxSize={5}
                    cursor="pointer"
                    onClick={() => {
                        const mixId = searchParams.get('mixId');
                        const albumId = searchParams.get('albumId');
                        let uploadUrl = '/upload';
                        if (mixId) {
                            uploadUrl = `/upload?mixId=${mixId}`;
                        } else if (albumId) {
                            uploadUrl = `/upload?albumId=${albumId}`;
                        }
                        navigate(uploadUrl);
                    }}
                    _hover={{ color: 'primary.500' }}
                />
                <Text fontSize="18px" fontWeight="semibold" color="gray.900">
                    Review
                </Text>
            </Flex>

            {/* Sub Tabs and Publish Button */}
            <Flex justify="space-between" align="center" mb={{ base: 5, md: 7 }}>
                <AnimatedTabs
                    tabs={subTabs}
                    activeTab={mapInternalToDisplay(albumTab)}
                    onTabChange={(tab) => setAlbumTab(mapTabId(tab) as 'mix' | 'album')}
                    size="sm"
                    tabWidth={isPodcaster ? "100px" : "90px"}
                    isDisabled={isDisabled}
                />

                <Button
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="12px"
                    fontWeight="semibold"
                    px={{ base: 5, md: 7 }}
                    h="38px"
                    borderRadius="md"
                    _hover={{ bg: 'primary.600' }}
                    onClick={handlePublish}
                    loading={isPublishing}
                    loadingText="Publishing..."
                    disabled={isPublishing}
                >
                    {!isPublishing && (
                        <>
                            Publish
                            <Icon as={FiArrowRight} boxSize={4} ml={2} />
                        </>
                    )}
                </Button>
            </Flex>

            {/* Content */}
            {albumTab === 'mix' ? <MixReview key="mix" /> : <AlbumReview key="album" />}

            {/* Success Page Modal */}
            {isPublished && (
                <UploadSuccessPage
                    onUnderstand={handleUnderstand}
                    onUploadMore={handleUploadMore}
                />
            )}
        </>
    );
};

