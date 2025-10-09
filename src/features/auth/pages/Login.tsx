import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import {
    Box,
    VStack,
    Heading,
    Text,
    Link,
    Icon
} from '@chakra-ui/react';
import MuxifyLogoIcon from '@/shared/icons/CustomIcons';
import { MdOutlineArrowForward } from "react-icons/md";

export const Login: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            minH="100vh"
            w="full"
            bg="primary.100"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={{ base: 4, sm: 4, lg: 6 }}
        >
            <VStack gap={6} w="full" maxW="370px" mx="auto">
                {/* Header with Logo */}
                <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                    <MuxifyLogoIcon
                        color="primary.500"
                        h="full"
                        w="full"
                    />
                </Box>

                {/* Main Login Card */}
                <Box
                    w="full"
                    maxW="370px"
                    bg="white"
                    borderRadius="20px"
                    py={6}
                    px={10}
                    pb={10}
                >
                    <VStack gap={4} align="center">
                        <Box textAlign="center">
                            <Heading
                                size="lg"
                                color="black"
                                mb={1}
                            >
                                Login
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="gray.600"
                            >
                                Sign in to your Muxify account
                            </Text>
                        </Box>
                        <LoginForm />
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
                        I don’t have account?{' '}
                        <Link
                            onClick={() => navigate('/join')}
                            fontWeight="medium"
                            color="primary.500"
                            cursor="pointer"
                            _hover={{ color: 'primary.600' }}
                        >
                            Sign up
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

export default Login;
