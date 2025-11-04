import React from 'react';
import {
    VStack,
    HStack,
    Text,
    Icon,
    Box,
} from '@chakra-ui/react';
import { HiOutlineMenu } from 'react-icons/hi';
import { FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/shared/store/useSidebarStore';
import {
    DashboardIcon,
    LeaderboardIcon,
    EarningsAndRoyaltyIcon,
    MusicIcon,
    SalesIcon,
    FansAndSubscribersIcon,
    PaymentsIcon,
    MuxifyLogoIcon,
    StatusUpIcon,
    GraphIcon,
    WalletMoneyIcon,
} from '@/shared/icons/CustomIcons';
import { useWindowWidth } from '../hooks/useWindowsWidth';
import { useUserType } from '@/features/auth/hooks/useUserType';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

interface NavItem {
    icon: React.ComponentType<{ boxSize?: number; color?: string }>;
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: LeaderboardIcon, label: 'Leaderboard', path: '/leaderboard' },
    { icon: EarningsAndRoyaltyIcon, label: 'Earnings & Royalty', path: '/earning-royalty' },
    { icon: MusicIcon, label: 'Music/Videos', path: '/music-videos' },
    { icon: SalesIcon, label: 'Sales Report', path: '/sales-report' },
    { icon: FansAndSubscribersIcon, label: 'Fans & Subscribers', path: '/fans-subscribers' },
    { icon: PaymentsIcon, label: 'Payments', path: '/payments' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleCollapse, setMobileOpen, isMobileOpen } = useSidebarStore();
    const [isInitialRender, setIsInitialRender] = React.useState(true);
    const { isRecordLabel, isAdManager } = useUserType();

    const bgColor = 'white';
    const borderColor = 'gray.200';
    const inactiveColor = 'primary.500';
    const textColor = 'gray.blue.700';

    const { windowWidth } = useWindowWidth();
    const isMobile = windowWidth < 768;

    // Prevent animation flash on initial render
    React.useEffect(() => {
        setIsInitialRender(false);
    }, []);

    // On mobile, show full width when menu is open, otherwise collapsed
    const shouldShowCollapsed = isMobile ? !isMobileOpen : isCollapsed;

    // Ad Manager specific nav items
    const adManagerNavItems: NavItem[] = [
        { icon: DashboardIcon, label: 'Dashboard', path: '/' },
        { icon: LeaderboardIcon, label: 'Leaderboard', path: '/ads/leaderboard' },
        { icon: StatusUpIcon, label: 'Spending', path: '/ads/spending' },
        { icon: GraphIcon, label: 'Ad Report', path: '/ads/report' },
        { icon: WalletMoneyIcon, label: 'Payments', path: '/ads/payments' },
    ];

    // Get the appropriate nav items based on user type
    const getNavItems = () => {
        if (isAdManager) {
            return adManagerNavItems;
        }
        return navItems;
    };

    const currentNavItems = getNavItems();

    const handleNavClick = (path: string) => {
        // If we're on the same path, toggle collapse state
        if (location.pathname === path) {
            if (isMobile) {
                setMobileOpen(false);
            } else {
                toggleCollapse();
            }
        } else {
            // Navigate to new path
            navigate(path);
            // Close mobile menu after navigation
            if (isMobile) {
                setMobileOpen(false);
            }
        }
    };

    return (
        <motion.div
            initial={{
                width: isMobile ? (shouldShowCollapsed ? 72 : 230) : (shouldShowCollapsed ? 105 : 230),
            }}
            animate={{
                width: isMobile ? (shouldShowCollapsed ? 72 : 230) : (shouldShowCollapsed ? 105 : 230),
            }}
            transition={isInitialRender ? { duration: 0 } : {
                duration: 0.3,
                ease: "easeInOut",
            }}
            style={{
                padding: windowWidth < 768 ? '8px 12px 8px 12px' : '8px 27px 8px 27px',
                backgroundColor: bgColor,
                borderRight: `1px solid ${borderColor}`,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1000,
                overflow: 'hidden',
            }}
        >
            <VStack gap={0} height="100%" align="stretch">
                {/* Logo Section */}
                <motion.div
                    style={{
                        padding: '12px',
                        margin: `${shouldShowCollapsed ? '0px 0 0px 0' : '17px 0 17px 0'}`,
                        borderBottom: `1px solid ${borderColor}`,
                        minHeight: '60px',
                        display: 'flex',
                        height: '32px',
                        alignItems: 'center',
                        justifyContent: shouldShowCollapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        gap: isMobile && !shouldShowCollapsed ? '12px' : '0',
                    }}
                >
                    {isMobile ? (
                        <>
                            <Box
                                as="button"
                                onClick={() => setMobileOpen(!isMobileOpen)}
                                cursor="pointer"
                                p={1.5}
                                borderRadius="md"
                                _hover={{ bg: 'gray.100' }}
                                transition="background 0.2s"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon
                                    as={HiOutlineMenu}
                                    boxSize={4}
                                    color="primary.500"
                                />
                            </Box>
                            {!shouldShowCollapsed && (
                                <motion.div
                                    initial={isInitialRender ? { opacity: 1, width: 140 } : { opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 140 }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={isInitialRender ? { duration: 0 } : {
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MuxifyLogoIcon w="full" h="full" color="red.500" />
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={false}
                            animate={{
                                width: shouldShowCollapsed ? 40 : 140,
                            }}
                            transition={isInitialRender ? { duration: 0 } : {
                                duration: 0.3,
                                ease: "easeInOut",
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MuxifyLogoIcon w="full" h="full" position={shouldShowCollapsed ? "absolute" : ""} color="red.500" />
                        </motion.div>
                    )}
                </motion.div>

                {/* Navigation Items */}
                <VStack gap={3} flex={1} align="stretch" zIndex={1000}>
                    {currentNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const IconComponent = item.icon;

                        return (
                            <motion.button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                initial={false}
                                animate={{
                                    backgroundColor: isActive ? '#f94444' : 'transparent',
                                    borderRadius: shouldShowCollapsed ? 7 : 9,
                                    padding: shouldShowCollapsed ? 9 : 13,
                                    marginLeft: 5,
                                    marginRight: 5,
                                }}
                                transition={isInitialRender ? { duration: 0 } : {
                                    duration: 0.2,
                                    ease: "easeInOut",
                                }}
                                whileHover={{
                                    backgroundColor: isActive ? '#ff5353' : '#F7FAFC',
                                    x: 2,
                                }}
                                whileTap={{
                                    x: 0,
                                }}
                                style={{
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: shouldShowCollapsed ? 'center' : 'flex-start',
                                    minHeight: '36px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                }}
                            >
                                <HStack gap={shouldShowCollapsed ? 0 : 4} width="100%">
                                    <Icon
                                        as={IconComponent}
                                        boxSize={5}
                                        color={isActive ? 'white' : inactiveColor}
                                        ml={shouldShowCollapsed ? '1.5px' : '0'}
                                    />
                                    <AnimatePresence mode="wait">
                                        {!shouldShowCollapsed && (
                                            <motion.div
                                                key={`text-${item.path}`}
                                                initial={isInitialRender ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={isInitialRender ? { duration: 0 } : {
                                                    duration: 0.2,
                                                    ease: "easeInOut",
                                                }}
                                                style={{
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight={isActive ? 'semibold' : 'normal'}
                                                    color={isActive ? 'white' : textColor}
                                                    textAlign="left"
                                                    fontFamily="Poppins"
                                                >
                                                    {item.label}
                                                </Text>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </HStack>
                            </motion.button>
                        );
                    })}
                </VStack>

                {/* Add Artist Button - Only for Record Labels */}
                {isRecordLabel && (
                    <motion.div
                        style={{
                            marginTop: 'auto',
                            paddingBottom: windowWidth < 768 ? '16px' : '16px',

                        }}
                        initial={false}
                        animate={{
                            width: shouldShowCollapsed ? 'auto' : '100%',
                        }}
                        transition={isInitialRender ? { duration: 0 } : {
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                    >
                        {shouldShowCollapsed ? (
                            <motion.button
                                style={{
                                    background: '#f94444',
                                    color: 'white',
                                    borderRadius: '7px',
                                    width: '40px',
                                    height: '40px',
                                    minWidth: '40px',
                                    padding: 0,
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={() => navigate('/add-artist')}
                                whileHover={{ backgroundColor: '#ff5353', x: 2 }}
                                whileTap={{ x: 0 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                }}
                                aria-label="Add Artist"
                            >
                                <Icon as={FiPlus} boxSize={5} />
                            </motion.button>
                        ) : (
                            <motion.button
                                style={{
                                    background: '#f94444',
                                    color: 'white',
                                    borderRadius: '9px',
                                    width: '100%',
                                    height: '40px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                                onClick={() => navigate('/add-artist')}
                                whileHover={{ backgroundColor: '#ff5353', x: 2 }}
                                whileTap={{ x: 0 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                }}
                            >
                                <Icon as={FiPlus} boxSize={4} />
                                <AnimatePresence mode="wait">
                                    {!shouldShowCollapsed && (
                                        <motion.span
                                            key="add-artist-text"
                                            initial={isInitialRender ? { opacity: 1 } : { opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={isInitialRender ? { duration: 0 } : {
                                                duration: 0.2,
                                                ease: "easeInOut",
                                            }}
                                            className='white-space-nowrap'
                                        >
                                            Add New Artist
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </VStack>
        </motion.div>
    );
};