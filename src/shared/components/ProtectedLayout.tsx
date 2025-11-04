import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebarStore } from '@/shared/store/useSidebarStore';
import { useWindowWidth } from '../hooks/useWindowsWidth';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useArtistStore } from '@/features/artists/store/useArtistStore';
import { useAdsStore } from '@/features/ads/store/useAdsStore';

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
    const { isCollapsed, isMobileOpen, setMobileOpen, setCollapsed } = useSidebarStore();
    const [isInitialRender, setIsInitialRender] = React.useState(true);
    const [isChecking, setIsChecking] = React.useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Responsive behavior using custom hook to prevent flash
    const { windowWidth } = useWindowWidth();
    const isMobile = windowWidth < 768;
    const { isRecordLabel, isAdManager } = useUserType();
    const { artists } = useArtistStore();
    const { campaigns } = useAdsStore();

    // Auto-collapse sidebar on mobile and close mobile menu when screen changes
    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
        if (!isMobile) {
            setMobileOpen(false);
        }
    }, [isMobile, setMobileOpen, setCollapsed]);

    // Prevent animation flash on initial render
    useEffect(() => {
        setIsInitialRender(false);
    }, []);

    // Redirect record labels without artists to add artist page
    useEffect(() => {
        if (isRecordLabel !== undefined) {
            setIsChecking(false);
            if (isRecordLabel && artists.length === 0 && !location.pathname.startsWith('/add-artist')) {
                navigate('/add-artist', { replace: true });
            }
        }
    }, [isRecordLabel, artists.length, navigate, location.pathname]);

    // Redirect ad managers without campaigns to empty state page
    useEffect(() => {
        if (isAdManager !== undefined) {
            if (isAdManager && campaigns.length === 0 && !location.pathname.startsWith('/ads')) {
                navigate('/ads', { replace: true });
            } else if (isAdManager && campaigns.length > 0 && location.pathname === '/ads') {
                navigate('/ads/dashboard', { replace: true });
            }
        }
    }, [isAdManager, campaigns.length, navigate, location.pathname]);

    // Early return to prevent rendering if redirecting or still checking
    if (isChecking || 
        (isRecordLabel && artists.length === 0 && !location.pathname.startsWith('/add-artist')) ||
        (isAdManager && campaigns.length === 0 && !location.pathname.startsWith('/ads'))) {
        return null;
    }

    return (
        <Box minHeight="100vh" bg="gray.50">
            {/* Sidebar */}
            <motion.div
                initial={{
                    x: isMobile && !isMobileOpen ? '-100%' : 0,
                }}
                animate={{
                    x: isMobile && !isMobileOpen ? '-100%' : 0,
                }}
                transition={isInitialRender ? { duration: 0 } : {
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    zIndex: 1000,
                }}
            >
                <Sidebar
                    isCollapsed={isCollapsed}
                    onToggle={() => { }} // No toggle needed as per requirements
                />
            </motion.div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            zIndex: 999,
                        }}
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <motion.div
                initial={{
                    marginLeft: isMobile ? 72 : (isCollapsed ? 105 : 230),
                }}
                animate={{
                    marginLeft: isMobile ? 72 : (isCollapsed ? 105 : 230),
                }}
                transition={isInitialRender ? { duration: 0 } : {
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                style={{
                    minHeight: '100vh',
                }}
            >
                {/* Navbar */}
                <Navbar
                    isCollapsed={isCollapsed}
                />

                {/* Page Content */}
                <Box
                    mt="70px"
                    p={{ base: 2, md: 6, lg: 6 }}
                    minHeight="calc(100vh - 70px)"
                    bg="gray.blue.100"
                    position="relative"
                >
                    {children}
                </Box>
            </motion.div>
        </Box>
    );
};
