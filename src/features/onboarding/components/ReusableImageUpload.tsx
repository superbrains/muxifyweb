import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Text,
    VStack,
    Image,
    Input,
} from '@chakra-ui/react';
import { useChakraToast } from '@shared/hooks';
import { GalleryAddIcon } from '@/shared/icons/CustomIcons';
import { useUserManagementStore, type UserType } from '@/features/auth/store/useUserManagementStore';
import { useArtistStore } from '@/features/artists/store/useArtistStore';
import { compressImage } from '@/shared/lib/fileUtils';
import { userService } from '@/shared/services/userService';
import { profileService } from '@/features/onboarding/services/profileService';
import { useUserStore } from '@/app/store/useUserStore';
import type { UserRole } from '@shared/types/user';

const mapBackendRoleToUserType = (role?: UserRole): UserType | null => {
    switch (role) {
        case 'artist':
        case 'dj':
        case 'creator':
            return 'artist';
        case 'record_label':
            return 'company';
        case 'ad_manager':
            return 'ad-manager';
        default:
            return null;
    }
};

interface ReusableImageUploadProps {
    title: string;
    subtitle: string;
    nextRoute: string;
    uploadType?: 'logo' | 'display-picture';
}

export const ReusableImageUpload: React.FC<ReusableImageUploadProps> = ({
    title,
    subtitle,
    nextRoute,
    uploadType = 'display-picture'
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toast = useChakraToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { saveDisplayPicture, saveLabelLogo, saveCompanyLogo, setCurrentUser, getCurrentUserType, completeOnboarding } = useUserManagementStore();
    const { updateArtist } = useArtistStore();
    const { updateUser, user } = useUserStore();

    const userId = (location.state as { userId?: string })?.userId;
    const artistId = (location.state as { artistId?: string })?.artistId;
    // Prefer the local onboarding store (set during fresh signup) but fall back
    // to the authenticated user's backend role for returning users whose local
    // store was wiped by a version migration or never initialized via login.
    const userType = getCurrentUserType() ?? mapBackendRoleToUserType(user?.role);
    const isAddArtistFlow = !!artistId;

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid file type', 'Please select an image file.');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large', 'Please select an image smaller than 5MB.');
                return;
            }

            // Store the original file for API upload
            setSelectedFile(file);

            // Compress and display the image preview
            try {
                const compressedImage = await compressImage(file, 800, 800, 0.7);
                setSelectedImage(compressedImage);
            } catch (error) {
                console.error('Error compressing image:', error);
                toast.error('Image processing failed', 'Please try again.');
            }
        }
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        if (!selectedImage || !selectedFile) {
            toast.error('No image selected', `Please select a ${uploadType === 'logo' ? 'logo' : 'display picture'}.`);
            return;
        }

        // Validate based on flow type
        if (!isAddArtistFlow && !userId) {
            toast.error('User ID missing', 'Please start the onboarding process again.');
            return;
        }

        if (isAddArtistFlow && !artistId) {
            toast.error('Artist ID missing', 'Please start the add artist process again.');
            return;
        }

        setLoading(true);
        try {
            // Save image to store based on upload type and user type
            let saved = false;
            let avatarUrl: string | undefined;

            // Handle artist display picture upload (for add artist flow)
            if (isAddArtistFlow && uploadType === 'display-picture' && artistId) {
                updateArtist(artistId, {
                    avatar: selectedImage,
                });
                // Verify the save was successful
                const { getArtistById } = useArtistStore.getState();
                const updatedArtist = getArtistById(artistId);
                if (!updatedArtist || !updatedArtist.avatar) {
                    throw new Error('Failed to save display picture. Please try again.');
                }
                saved = true;
            } else if (!isAddArtistFlow && userId) {
                // The backend is the source of truth for the uploaded asset.
                // The local zustand cache is just a UI mirror — saveLabelLogo et al.
                // no-op when the userId isn't in the store (returning user, post-
                // migration reset, etc.), so we don't gate the upload on it.
                setCurrentUser(userId);

                if (uploadType === 'display-picture' && userType === 'artist') {
                    const result = await userService.uploadAvatar(selectedFile);
                    avatarUrl = result.avatarUrl;
                    updateUser({ avatar: avatarUrl });
                    saveDisplayPicture(userId, selectedImage);
                    saved = true;
                } else if (uploadType === 'logo' && userType === 'company') {
                    const { logoUrl } = await profileService.uploadCompanyLogo(selectedFile);
                    updateUser({ avatar: logoUrl });
                    saveLabelLogo(userId, logoUrl);
                    saved = true;
                } else if (uploadType === 'logo' && userType === 'ad-manager') {
                    const result = await userService.uploadAvatar(selectedFile);
                    avatarUrl = result.avatarUrl;
                    updateUser({ avatar: avatarUrl });
                    saveCompanyLogo(userId, selectedImage);
                    completeOnboarding(userId);
                    saved = true;
                }
            }

            if (!saved) {
                throw new Error(`Cannot save ${uploadType === 'logo' ? 'logo' : 'display picture'} for user type: ${userType}`);
            }

            toast.success(`${uploadType === 'logo' ? 'Logo' : 'Display picture'} uploaded!`, `Your ${uploadType === 'logo' ? 'logo' : 'profile picture'} has been updated.`);
            navigate(nextRoute, {
                state: { userId, artistId }
            });
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Please try again.';
            toast.error('Upload failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    {title}
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    {subtitle}
                </Text>
            </Box>

            <Box w="full" display="flex" justifyContent="center">
                <Box
                    position="relative"
                    w="150px"
                    h="150px"
                    borderRadius="full"
                    borderColor="primary.500"
                    bg={selectedImage ? "transparent" : "primary.50"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={handleUpload}
                    _hover={{
                        borderColor: "primary.600",
                        bg: selectedImage ? "transparent" : "gray.100"
                    }}
                    transition="all 0.2s ease"
                >
                    {selectedImage ? (
                        <Image
                            src={selectedImage}
                            alt={`${uploadType} preview`}
                            w="full"
                            h="full"
                            borderRadius="full"
                            objectFit="cover"
                        />
                    ) : (
                        <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                            <GalleryAddIcon
                                color="primary.500"
                                h="full"
                                w="full"
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                display="none"
            />

            <VStack gap={2} w="full">
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    bg="primary.500"
                    color="white"
                    size="md"
                    fontSize="xs"
                    width="full"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                    disabled={!selectedImage}
                >
                    Continue
                </Button>

            </VStack>
        </VStack>
    );
};
