import React, { useMemo } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text, IconButton,
    Input,
    useBreakpointValue,
} from '@chakra-ui/react';
import { MdMenu } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { NotificationIcon, SearchIcon } from '../icons/CustomIcons';
import { useWindowWidth } from '../hooks/useWindowsWidth';

interface NavbarProps {
    isCollapsed: boolean;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
    isCollapsed,
    userName = 'Davido',
    userRole = 'Artist/Musician',
    userAvatar,
}) => {
    const location = useLocation();
    const bgColor = 'white';
    const borderColor = 'gray.200';
    const textColor = '#1a365d'; // Dark blue/navy for greeting
    const placeholderColor = 'gray.500';
    const inputBg = '#f7fafc'; // Light gray/off-white for search
    const searchIconColor = 'red.500'; // Red search icon
    const notificationBg = 'primary.70'; // Light pink/red tint for notification button

    const { windowWidth } = useWindowWidth();
    // Responsive behavior
    const showFullNavbar = useBreakpointValue({ base: false, md: true });

    // Get page title based on current route
    const pageTitle = useMemo(() => {
        const path = location.pathname;
        const routeTitles: Record<string, string> = {
            '/dashboard': `Hi ${userName}`,
            '/upload': 'Upload Media',
            '/upload/review': 'Review',
            '/music-videos': 'Music & Videos',
            '/earning-royalty': 'Earnings & Royalty',
            '/leaderboard': 'Leaderboard',
            '/fans-subscribers': 'Fans & Subscribers',
            '/sales-report': 'Sales Report',
            '/payments': 'Payments',
            '/add-artist': 'Add Artist',
            '/settings': 'Settings',
        };

        return routeTitles[path] || `Hi ${userName}`;
    }, [location.pathname, userName]);

    return (
        <Box
            bg={bgColor}
            borderBottom="1px"
            borderColor={borderColor}
            height="70px"
            position="fixed"
            top={0}
            left={windowWidth < 768 ? (isCollapsed ? '72px' : '230px') : (isCollapsed ? '85px' : '240px')}
            right={0}
            transition="left 0.3s ease"
            zIndex={999}
            px={{ base: 4, md: 6 }}
            py={4}
        >
            <HStack gap={4} height="100%" justify="space-between">
                {/* Left Section - Page Title */}
                <HStack gap={4}>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="bold"
                        color={textColor}
                        display={{ base: 'none', sm: 'block' }}
                    >
                        {pageTitle}
                    </Text>
                </HStack>
                <Box display="flex" alignItems="center" gap={4}>
                    {/* Center Section - Search Bar */}
                    {showFullNavbar && (
                        <Box flex={1} minWidth="300px" mx={4}>
                            <Box position="relative">
                                <SearchIcon
                                    position="absolute"
                                    left={3}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    color={searchIconColor}
                                    zIndex={1}
                                    boxSize={4}
                                />
                                <Input
                                    placeholder="Search here..."
                                    bg={inputBg}
                                    border="none"
                                    borderRadius="10px"
                                    size="sm"
                                    pl={10}
                                    fontSize="xs"
                                    _placeholder={{
                                        color: placeholderColor,
                                    }}
                                    _focus={{
                                        bg: inputBg,
                                        boxShadow: 'none',
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Right Section - Notifications and Profile */}
                    <HStack gap={3}>
                        {/* Notifications */}
                        <Box position="relative">
                            <IconButton
                                aria-label="Notifications"
                                variant="ghost"
                                size="sm"
                                color="red.500"
                                bg={notificationBg}
                                borderRadius="10px"
                                _hover={{
                                    bg: notificationBg,
                                    opacity: 0.8,
                                }}
                            >
                                <NotificationIcon boxSize={4} color="primary.500" />
                            </IconButton>
                            {/* Notification Badge */}
                            <Box
                                position="absolute"
                                top="-2px"
                                right="-2px"
                                bg="red.500"

                                borderRadius="full"
                                width="6px"
                                height="6px"

                            />

                        </Box>

                        {/* User Profile */}
                        <Box
                            cursor="pointer"
                            borderRadius="lg"
                            p={2}
                            _hover={{
                                bg: 'gray.50',
                            }}
                        >
                            <HStack gap={3}>
                                <Box
                                    width={8}
                                    height={8}
                                    borderRadius="full"
                                    bg="red.500"
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    backgroundImage={userAvatar ? `url(${userAvatar})` : undefined}
                                    backgroundSize="cover"
                                    backgroundPosition="center"
                                >
                                    {!userAvatar && userName?.charAt(0).toUpperCase()}
                                </Box>
                                {showFullNavbar && (
                                    <VStack gap={1} align="start">
                                        <Text
                                            fontSize="11px"
                                            fontWeight="medium"
                                            color="#2d3748"
                                            lineHeight="1"
                                        >
                                            {userName}
                                        </Text>
                                        <Text
                                            fontSize="10px"
                                            color={placeholderColor}
                                            lineHeight="1"
                                        >
                                            {userRole}
                                        </Text>
                                    </VStack>
                                )}
                            </HStack>
                        </Box>

                        {/* Static Hamburger Menu */}
                        <IconButton
                            aria-label="Menu"
                            variant="ghost"
                            size="sm"
                            color="#2d3748"
                            _hover={{
                                bg: 'gray.50',
                            }}
                        >
                            <MdMenu />
                        </IconButton>
                    </HStack>
                </Box>

            </HStack>
        </Box>
    );
};
