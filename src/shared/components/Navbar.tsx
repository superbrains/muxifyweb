import React, { useMemo, useState, useRef } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    IconButton,
    Input,
    useBreakpointValue,
    Menu,
    Button,
    Icon,
} from '@chakra-ui/react';
import { MdMenu } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationIcon, SearchIcon, LogoutIcon, HeadphoneIcon, Setting2Icon } from '../icons/CustomIcons';
import { useWindowWidth } from '../hooks/useWindowsWidth';
import { NotificationDropdown } from '@/features/notifications';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { useUserManagementStore, type ArtistOnboardingData, type CompanyOnboardingData, type AdManagerOnboardingData } from '@/features/auth/store/useUserManagementStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface NavbarProps {
    isCollapsed: boolean;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
    isCollapsed,
    userName = 'Davido',
    userRole = 'Artist',
    userAvatar,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
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

    // Notification state
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationButtonRef = useRef<HTMLButtonElement>(null);
    const { unreadCount } = useNotificationStore();

    // Get user data from store
    const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
    const userData = getCurrentUserData();
    const userType = getCurrentUserType();

    // Extract user info based on user type
    const displayName = userData
        ? (userType === 'artist'
            ? (userData as ArtistOnboardingData).fullName || (userData as ArtistOnboardingData).performingName || userName
            : userType === 'company'
                ? (userData as CompanyOnboardingData).companyName || (userData as CompanyOnboardingData).legalCompanyName || userName
                : (userData as AdManagerOnboardingData).fullName || userName)
        : userName;

    const displayRole = userData
        ? (userType === 'artist'
            ? (userData as ArtistOnboardingData).userType === 'artist' ? 'Artist'
                : (userData as ArtistOnboardingData).userType === 'creator' ? 'Creator'
                    : (userData as ArtistOnboardingData).userType === 'dj' ? 'DJ'
                        : (userData as ArtistOnboardingData).userType === 'podcaster' ? 'Podcaster'
                            : userRole
            : userType === 'company'
                ? (userData as CompanyOnboardingData).userType === 'record_label' ? 'Record Label'
                    : (userData as CompanyOnboardingData).userType === 'distribution' ? 'Distribution Company'
                        : (userData as CompanyOnboardingData).userType === 'publisher' ? 'Music Publisher'
                            : (userData as CompanyOnboardingData).userType === 'management' ? 'Management Company'
                                : 'Company'
                : userType === 'ad-manager'
                    ? 'Ad Manager'
                    : userRole)
        : userRole;

    const displayAvatar = userData
        ? (userType === 'artist'
            ? (userData as ArtistOnboardingData).displayPicture
            : userType === 'company'
                ? (userData as CompanyOnboardingData).labelLogo
                : (userData as AdManagerOnboardingData).companyLogo)
        : userAvatar;

    const handleLogout = () => {
        // Clear user management store
        const { clearAllUsers } = useUserManagementStore.getState();
        clearAllUsers();

        // Clear auth store
        const { logout } = useAuthStore.getState();
        logout();

        // Clear notification store (optional, but good practice)
        const { clearAllNotifications } = useNotificationStore.getState();
        clearAllNotifications();

        console.log('Logout clicked - All user data cleared');
        navigate('/login');
    };

    // Get page title based on current route
    const pageTitle = useMemo(() => {
        const path = location.pathname;
        const routeTitles: Record<string, string> = {
            '/dashboard': `Hi ${displayName}`,
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

        return routeTitles[path] || `Hi ${displayName}`;
    }, [location.pathname, displayName]);

    return (
        <Box
            bg={bgColor}
            borderBottom="1px"
            borderColor={borderColor}
            height="70px"
            position="fixed"
            top={0}
            left={windowWidth < 768 ? (isCollapsed ? '72px' : '230px') : (isCollapsed ? '85px' : '230px')}
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
                                ref={notificationButtonRef}
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
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            >
                                <NotificationIcon boxSize={4} color="primary.500" />
                            </IconButton>
                            {/* Notification Badge */}
                            {unreadCount > 0 && (
                                <Box
                                    position="absolute"
                                    top="-2px"
                                    right="-2px"
                                    bg="red.500"
                                    borderRadius="full"
                                    width="6px"
                                    height="6px"
                                />
                            )}

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <NotificationDropdown
                                    isOpen={isNotificationOpen}
                                    onClose={() => setIsNotificationOpen(false)}
                                    triggerRef={notificationButtonRef}
                                />
                            )}
                        </Box>

                        {/* User Profile with Dropdown */}

                        <Button
                            variant="ghost"
                            borderRadius="lg"
                            p={2}
                            _hover={{
                                bg: 'gray.50',
                            }}
                            h="auto"
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
                                    backgroundImage={displayAvatar ? `url(${displayAvatar})` : undefined}
                                    backgroundSize="cover"
                                    backgroundPosition="center"
                                >
                                    {!displayAvatar && displayName?.charAt(0).toUpperCase()}
                                </Box>
                                {showFullNavbar && (
                                    <VStack gap={1} align="start">
                                        <Text
                                            fontSize="11px"
                                            fontWeight="medium"
                                            color="#2d3748"
                                            lineHeight="1"
                                        >
                                            {displayName}
                                        </Text>
                                        <Text
                                            fontSize="10px"
                                            color={placeholderColor}
                                            lineHeight="1"
                                        >
                                            {displayRole}
                                        </Text>
                                    </VStack>
                                )}
                            </HStack>
                        </Button>
                        <Menu.Root>
                            <Menu.Trigger asChild>
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
                            </Menu.Trigger>
                            <Menu.Positioner>
                                <Menu.Content
                                    borderRadius="lg"
                                    boxShadow="lg"
                                    border="none"
                                    p={2}
                                    minW="200px"
                                >
                                    <Menu.Item
                                        value="settings"
                                        onClick={() => navigate('/settings')}
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        <HStack gap={3}>
                                            <Icon as={Setting2Icon} boxSize={4} color="primary.500" />
                                            <Text fontSize="sm" color="gray.900">
                                                Settings
                                            </Text>
                                        </HStack>
                                    </Menu.Item>
                                    <Menu.Item
                                        value="customer-service"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        <HStack gap={3}>
                                            <Icon as={HeadphoneIcon} boxSize={4} color="primary.500" />
                                            <Text fontSize="sm" color="gray.900">
                                                Customer Service
                                            </Text>
                                        </HStack>
                                    </Menu.Item>
                                    <Menu.Item
                                        value="logout"
                                        onClick={handleLogout}
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        <HStack gap={3}>
                                            <Icon as={LogoutIcon} boxSize={4} color="primary.500" />
                                            <Text fontSize="sm" color="gray.900">
                                                Logout
                                            </Text>
                                        </HStack>
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Menu.Root>


                    </HStack>
                </Box>

            </HStack>
        </Box>
    );
};
