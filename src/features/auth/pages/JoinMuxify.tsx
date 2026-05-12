import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Heading,
    Text,
    Link,
    Icon,
} from '@chakra-ui/react';
import MuxifyLogoIcon, {
    MusicDashboardIcon,
    ArtistIcon,
    ChartSquareIcon
} from '@/shared/icons/CustomIcons';
import { MdOutlineArrowForward } from "react-icons/md";
import { UserTypeCard } from '../components/UserTypeCard';

export const JoinMuxify: React.FC = () => {
    const navigate = useNavigate();

    const userTypes = [
        {
            id: 'artist',
            title: 'Artist, Creators, DJs & Podcasters',
            description: 'Upload music, grow your fanbase, and earn from streams, gifts and unlocks.',
            icon: ArtistIcon,
            route: '/onboarding/artist/register'
        },
        {
            id: 'company',
            title: 'Recording & Distribution Company',
            description: 'Manage your roster, distribute releases and track royalties in one place.',
            icon: MusicDashboardIcon,
            route: '/onboarding/company/register'
        },
        {
            id: 'ad-manager',
            title: 'Ad Manager',
            description: 'Launch targeted campaigns and reach engaged music audiences across Muxify.',
            icon: ChartSquareIcon,
            route: '/onboarding/ad-manager/register'
        }
    ];

    const handleUserTypeSelect = (route: string) => {
        navigate(route);
    };

    return (
        <Box
            minH="100vh"
            w="full"
            bg="primary.100"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={{ base: 4, sm: 4, lg: 6 }}
            py={6}
        >
            <VStack gap={6} w="full" maxW="420px" mx="auto">
                {/* Header with Logo */}
                <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                    <MuxifyLogoIcon
                        color="primary.500"
                        h="full"
                        w="full"
                    />
                </Box>

                {/* Main Join Card */}
                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="20px"
                    py={6}
                    px={10}
                    pb={10}
                >
                    <VStack gap={4} align="start">
                        <Box textAlign="center" w="full">
                            <Heading
                                size="lg"
                                color="black"
                                mb={1}
                            >
                                Join Muxify
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="gray.600"
                                textAlign="center"
                            >
                                Tell us how you plan to use Muxify so we can tailor your experience.
                            </Text>
                        </Box>

                        {/* User Type Options */}
                        <VStack gap={3} w="full">
                            {userTypes.map((userType) => (
                                <UserTypeCard
                                    key={userType.id}
                                    title={userType.title}
                                    description={userType.description}
                                    icon={userType.icon}
                                    onClick={() => handleUserTypeSelect(userType.route)}
                                />
                            ))}
                        </VStack>
                    </VStack>
                </Box>

                {/* Footer Login Link */}
                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="lg"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    p={3}
                >
                    <Text
                        fontSize="xs"
                        color="gray.600"
                        textAlign="center"
                    >
                        Already have account?{' '}
                        <Link
                            onClick={() => navigate('/login')}
                            fontWeight="medium"
                            color="primary.500"
                            cursor="pointer"
                            _hover={{ color: 'primary.600' }}
                        >
                            Login
                        </Link>
                    </Text>
                    <Box position="absolute" right={4}>
                        <Icon color="primary.500">
                            <MdOutlineArrowForward />
                        </Icon>
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
};

export default JoinMuxify;
