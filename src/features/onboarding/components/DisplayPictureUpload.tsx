import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Text,
    VStack,
    Image,
    Input,
} from '@chakra-ui/react';
import { useToast } from '@shared/hooks';
import { GalleryAddIcon } from '@/shared/icons/CustomIcons';

export const DisplayPictureUpload: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const navigate = useNavigate();

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            toast.error('No image selected', 'Please select a display picture.');
            return;
        }

        setLoading(true);
        try {
            // Here you would typically upload the image to your server
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Display picture uploaded!', 'Your profile picture has been updated.');
            navigate('/onboarding/artist/identity-verification');
        } catch {
            toast.error('Upload failed', 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack gap={4} align="center">
            <Box textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={1}>
                    Display Picture
                </Text>
                <Text fontSize="xs" color="gray.600" mb={4}>
                    This is the image of you the fans will see
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
                            alt="Display picture preview"
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
                    mt="40px"
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
