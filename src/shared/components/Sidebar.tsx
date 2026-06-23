import React from 'react';
import {
    VStack,
    HStack,
    Text,
    Icon,
    Box,
} from '@chakra-ui/react';
import { HiOutlineMenu } from 'react-icons/hi';
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
    WalletMoneyIcon,
    AdLibraryIcon,
    ArtistIcon,
    Setting2Icon,
    VerifyIcon,
    HeadphoneIcon,
} from '@/shared/icons/CustomIcons';
import { useWindowWidth } from '../hooks/useWindowsWidth';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useIsAdmin } from '@app/hooks/useIsAdmin';
import { useIsContributor } from '@app/hooks/useIsContributor';
import { SectionNav } from '@/features/admin/components/ui';
import { useAdminNavGroups } from '@/features/admin/config/adminNav';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

interface NavItem {
    icon: React.ComponentType<{ boxSize?: number; color?: string }>;
    label: string;
    path: string;
}

const buildArtistNavItems = (musicVideosLabel: string): NavItem[] => [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: LeaderboardIcon, label: 'Leaderboard', path: '/leaderboard' },
    { icon: EarningsAndRoyaltyIcon, label: 'Earnings & Royalty', path: '/earning-royalty' },
    { icon: MusicIcon, label: musicVideosLabel, path: '/music-videos' },
    { icon: SalesIcon, label: 'Sales Report', path: '/sales-report' },
    { icon: FansAndSubscribersIcon, label: 'Fans & Subscribers', path: '/fans-subscribers' },
    { icon: PaymentsIcon, label: 'Payments', path: '/payments' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/disputes' },
];

const recordLabelNavItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: ArtistIcon, label: 'Artists', path: '/label/roster' },
    { icon: MusicIcon, label: 'Releases', path: '/label/releases' },
    { icon: EarningsAndRoyaltyIcon, label: 'Splits', path: '/label/splits' },
    { icon: PaymentsIcon, label: 'Payouts', path: '/label/payouts' },
    { icon: WalletMoneyIcon, label: 'Requests', path: '/label/withdrawal-requests' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/label/disputes' },
    { icon: Setting2Icon, label: 'Settings', path: '/label/settings' },
];

const contributorNavItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: EarningsAndRoyaltyIcon, label: 'Earnings', path: '/contributor/earnings' },
    { icon: MusicIcon, label: 'Splits', path: '/contributor/splits' },
    { icon: WalletMoneyIcon, label: 'Payouts', path: '/contributor/payouts' },
    { icon: PaymentsIcon, label: 'Payout Accounts', path: '/contributor/payout-accounts' },
    { icon: HeadphoneIcon, label: 'Disputes', path: '/contributor/disputes' },
    { icon: ArtistIcon, label: 'Profile', path: '/contributor/profile' },
];

const adminNavItems: NavItem[] = [
    { icon: DashboardIcon, label: 'Overview', path: '/admin' },
    { icon: VerifyIcon, label: 'Verifications', path: '/admin/verifications' },
    { icon: FansAndSubscribersIcon, label: 'Users', path: '/admin/users' },
    { icon: HeadphoneIcon, label: 'Support', path: '/admin/support' },
    { icon: ArtistIcon, label: 'Management', path: '/admin/management' },
    { icon: WalletMoneyIcon, label: 'Coin Economy', path: '/admin/coin-economy' },
    { icon: StatusUpIcon, label: 'Spotlight', path: '/admin/spotlight' },
    { icon: PaymentsIcon, label: 'Finance', path: '/admin/finance' },
    { icon: Setting2Icon, label: 'Settings', path: '/admin/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleCollapse, setMobileOpen, isMobileOpen } = useSidebarStore();
    const [isInitialRender, setIsInitialRender] = React.useState(true);
    const { isRecordLabel, isAdManager, isPodcaster, isCreator } = useUserType();
    const musicVideosLabel = isPodcaster || isCreator ? 'Video' : 'Music/Videos';
    const isAdmin = useIsAdmin();
    const isContributor = useIsContributor();
    // CR1: scope- and permission-aware 8-group admin navigation.
    const adminNavGroups = useAdminNavGroups();

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
        { icon: AdLibraryIcon, label: 'Ads Library', path: '/ads/library' },
        { icon: StatusUpIcon, label: 'Spending', path: '/ads/spending' },
        { icon: SalesIcon, label: 'Ad Report', path: '/ads/report' },
        { icon: PaymentsIcon, label: 'Payments', path: '/ads/payments' },
        { icon: HeadphoneIcon, label: 'Disputes', path: '/ads/disputes' },
    ];

    // Get the appropriate nav items based on user type
    const getNavItems = () => {
        if (isAdmin) return adminNavItems;
        if (isContributor) return contributorNavItems;
        if (isAdManager) return adManagerNavItems;
        if (isRecordLabel) return recordLabelNavItems;
        return buildArtistNavItems(musicVideosLabel);
    };

    const currentNavItems = getNavItems();

    const isItemActive = React.useCallback(
        (currentPath: string, targetPath: string) => {
            if (targetPath === '/') {
                return currentPath === '/';
            }

            return (
                currentPath === targetPath ||
                currentPath.startsWith(`${targetPath}/`)
            );
        },
        []
    );

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
                width: isMobile ? (shouldShowCollapsed ? 72 : 245) : (shouldShowCollapsed ? 105 : 245),
            }}
            animate={{
                width: isMobile ? (shouldShowCollapsed ? 72 : 245) : (shouldShowCollapsed ? 105 : 245),
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
                {isAdmin && !shouldShowCollapsed ? (
                    <Box flex={1} overflowY="auto" overflowX="hidden" pr={1} pb={4} zIndex={1000}>
                        <SectionNav
                            groups={adminNavGroups}
                            currentPath={location.pathname}
                            onItemClick={() => {
                                if (isMobile) setMobileOpen(false);
                            }}
                        />
                    </Box>
                ) : (
                <VStack gap={3} flex={1} align="stretch" zIndex={1000} overflowY="auto" overflowX="hidden">
                    {currentNavItems.map((item) => {
                        const isActive = isItemActive(location.pathname, item.path);
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
                )}

            </VStack>
        </motion.div>
    );
};