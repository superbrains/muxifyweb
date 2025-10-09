import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Icon,
} from '@chakra-ui/react';
import MuxifyLogoIcon, { ArtistIconComponent } from '@/shared/icons/CustomIcons';

export const CompanyOnboarding: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            minH="100vh"
            w="full"
            bg="primary.100"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={{ base: 6, sm: 6, lg: 8 }}
        >
            <VStack gap={8} w="full" maxW="500px" mx="auto">
                {/* Header with Logo */}
                <Box h="80px" w="180px" display="flex" justifyContent="center" alignItems="center">
                    <MuxifyLogoIcon
                        color="primary.500"
                        h="full"
                        w="full"
                    />
                </Box>

                {/* Main Content */}
                <Box
                    w="full"
                    maxW="500px"
                    bg="white"
                    borderRadius="26.78px"
                    py={8}
                    px={11}
                >
                    <VStack gap={6} align="center">
                        <ArtistIconComponent boxSize={20} color="primary.500" />

                        <Box textAlign="center">
                            <Heading
                                size="xl"
                                color="black"
                                mb={2}
                            >
                                Company Onboarding
                            </Heading>
                            <Text
                                fontSize="sm"
                                color="gray.600"
                            >
                                Welcome to Muxify! Let's set up your recording and distribution company profile.
                            </Text>
                        </Box>

                        <Button
                            onClick={() => navigate('/register?type=company')}
                            bg="primary.500"
                            color="white"
                            size="lg"
                            fontSize="sm"
                            width="full"
                            fontWeight="medium"
                            borderRadius="10px"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Continue Registration
                        </Button>

                        <Button
                            onClick={() => navigate('/join')}
                            variant="outline"
                            size="md"
                            fontSize="sm"
                            width="full"
                            fontWeight="medium"
                            borderRadius="10px"
                            borderColor="gray.300"
                            color="gray.700"
                            _hover={{
                                bg: 'gray.50',
                                borderColor: 'gray.400'
                            }}
                        >
                            Back to User Types
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default CompanyOnboarding;
