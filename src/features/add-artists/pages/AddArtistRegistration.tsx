import React from 'react';
import {
    Box,
} from '@chakra-ui/react';
import { AddArtistRegistrationForm } from '../components/AddArtistRegistrationForm';

export const AddArtistRegistration: React.FC = () => {
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
                <AddArtistRegistrationForm />
            </Box>
        </Box>
    );
};

export default AddArtistRegistration;

