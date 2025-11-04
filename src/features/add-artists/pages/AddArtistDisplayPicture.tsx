import React from 'react';
import {
    Box,
} from '@chakra-ui/react';
import { ReusableImageUpload } from '@/features/onboarding/components/ReusableImageUpload';

export const AddArtistDisplayPicture: React.FC = () => {
    return (
        <Box
            minH="100vh"
            w="full"
            bg="white"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            px={4}
            py={8}
        >
            {/* Main Form Container */}
            <Box
                width="100%"
                maxWidth="370px"
                mx="auto"
                bg="white"
                border="1px solid #e4e4e4"
                borderRadius="20px"
                py={6}
                px={10}
                pb={10}
            >
                <ReusableImageUpload
                    title="Display Picture"
                    subtitle="Upload a profile picture for the artist"
                    nextRoute="/add-artist/identity-verification"
                    uploadType="display-picture"
                />
            </Box>
        </Box>
    );
};

export default AddArtistDisplayPicture;

