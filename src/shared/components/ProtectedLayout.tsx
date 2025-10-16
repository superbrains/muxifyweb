import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebarStore } from '@/shared/store/useSidebarStore';
import { useWindowWidth } from '../hooks/useWindowsWidth';

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
    const { isCollapsed, isMobileOpen, setMobileOpen, setCollapsed } = useSidebarStore();
    const [isInitialRender, setIsInitialRender] = React.useState(true);

    // Responsive behavior using custom hook to prevent flash
    const { windowWidth } = useWindowWidth();
    const isMobile = windowWidth < 768;

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
                    px={{ base: 2, md: 6, lg: 6 }}
                    py={{ base: 2, md: 6, lg: 6 }}
                    minHeight="calc(100vh - 70px)"
                    bg="gray.blue.50"
                >
                    {children}
                </Box>
            </motion.div>
        </Box>
    );
};
