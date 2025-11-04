import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Button,
    Text,
} from '@chakra-ui/react';
import { ArtistIcon } from '@/shared/icons/CustomIcons';

export const AddArtist: React.FC = () => {
    const navigate = useNavigate();

    const handleAddArtist = () => {
        navigate('/add-artist/register');
    };

    return (
        <Box
            minH="90vh"
            w="full"
            bg="white"
            borderRadius="20px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            px={4}
            py={6}
        >
            <VStack gap={6} align="center">
                {/* Artist Icon */}
                <Box 
                    position="relative"
                    w="69px"
                    h="69px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    {/* Background circle */}
                    <Box
                        position="absolute"
                        w="69px"
                        h="69px"
                        borderRadius="full"
                        bg="#f7f7f7"
                    />
                    {/* Artist icon positioned on the background */}
                    <Box position="relative" zIndex={1}>
                        <ArtistIcon color="primary.500" h="32px" w="32px" />
                    </Box>
                </Box>

                {/* Message */}
                <Text
                    fontSize="md"
                    color="#969696"
                    textAlign="center"
                    maxW="303px"
                >
                    You do not have a payout account
                </Text>

                {/* Add New Artist Button */}
                <Button
                    onClick={handleAddArtist}
                    bg="primary.500"
                    color="white"
                    size="md"
                    fontSize="sm"
                    fontWeight="semibold"
                    px={8}
                    py={3}
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Add New Artist
                </Button>
            </VStack>
        </Box>
    );
};

export default AddArtist;
