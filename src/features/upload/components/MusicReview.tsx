import React, { useState, useEffect } from 'react';
import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedTabs, UploadProgressModal } from '@shared/components';
import { MixReview } from './MixReview';
import { AlbumReview } from './AlbumReview';
import { UploadSuccessPage } from './UploadSuccessPage';
import { useUploadMusicStore } from '@uploadMusic/store/useUploadMusicStore';
import { useUserType } from '@/features/auth/hooks/useUserType';
import type { UploadProgressDetail } from '@shared/types/upload';

interface MusicReviewProps {
    albumTab: 'mix' | 'album';
    setAlbumTab: (tab: 'mix' | 'album') => void;
    onPublish: () => Promise<void>;
    isDisabled?: boolean;
    isPublishing?: boolean;
    uploadProgress?: UploadProgressDetail | null;
    albumProgress?: { current: number; total: number };
    onResetUploadProgress?: () => void;
}

export const MusicReview: React.FC<MusicReviewProps> = ({
    albumTab,
    setAlbumTab,
    onPublish,
    isDisabled = false,
    isPublishing: externalIsPublishing = false,
    uploadProgress = null,
    albumProgress,
    onResetUploadProgress,
}) => {
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const isCurrentlyPublishing = isPublishing || externalIsPublishing;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetMix, resetAlbum, mix, album } = useUploadMusicStore();
    const { isPodcaster, isDJ, isMusician } = useUserType();

    // Build a short-lived blob URL for the cover art preview shown in the modal.
    // Object URLs leak if not revoked, so cleanup on change/unmount.
    const isMixTab = albumTab === 'mix';
    const coverArtFile = isMixTab ? mix.coverArt?.file : album.coverArt?.file;
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (!coverArtFile) {
            setCoverPreviewUrl(undefined);
            return;
        }
        const url = URL.createObjectURL(coverArtFile);
        setCoverPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [coverArtFile]);

    const modalTitle = isMixTab
        ? mix.trackTitle || mix.tracks[0]?.name?.replace(/\.[^/.]+$/, '') || 'Untitled track'
        : album.selectedArtists[0]?.name || 'Untitled album';

    const modalFileSize = (() => {
        if (isMixTab) return mix.tracks[0]?.file?.size ?? 0;
        if (albumProgress) {
            const idx = Math.max(0, albumProgress.current - 1);
            return album.tracks[idx]?.file?.size ?? 0;
        }
        return album.tracks[0]?.file?.size ?? 0;
    })();

    const stage = uploadProgress?.stage ?? null;
    const showProgressModal = isCurrentlyPublishing || stage === 'failed' || stage === 'completed';
    
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
            // Call the parent's publish function which makes the real API call
            await onPublish();

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
            // Error toast is already shown by the parent's useUploadMusic hook
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnderstand = () => {
        // Navigate to dashboard
        navigate('/');
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
            <UploadProgressModal
                isOpen={showProgressModal}
                title={modalTitle}
                thumbnailUrl={coverPreviewUrl}
                fileSize={modalFileSize}
                progress={uploadProgress ?? null}
                albumProgress={albumProgress}
                onRetry={() => {
                    onResetUploadProgress?.();
                    void handlePublish();
                }}
                onClose={() => {
                    onResetUploadProgress?.();
                }}
            />

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
                    loading={isCurrentlyPublishing}
                    loadingText="Publishing..."
                    disabled={isCurrentlyPublishing}
                >
                    {!isCurrentlyPublishing && (
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

