import React from 'react';
import {
    VStack,
    Icon,
    Box,
} from '@chakra-ui/react';
import { HiOutlineMenu } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/shared/store/useSidebarStore';
import { MuxifyLogoIcon } from '@/shared/icons/CustomIcons';
import { useWindowWidth } from '../hooks/useWindowsWidth';

export interface SidebarNavContext {
    currentPath: string;
    isCollapsed: boolean;
    isInitialRender: boolean;
    onNavigate: (path: string) => void;
    onItemClick: () => void;
}

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    /**
     * Supplies the navigation body. Required, and deliberately so: `Sidebar` is
     * shared chrome that must not know any route. The creator app passes
     * `CreatorSidebarNav` and the admin app passes `AdminSidebarNav`, which is
     * what keeps each app's route table out of the other's bundle entirely —
     * not merely lazy-loaded, but absent. Do not import either from this file.
     */
    renderNav: (ctx: SidebarNavContext) => React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, renderNav }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleCollapse, setMobileOpen, isMobileOpen } = useSidebarStore();
    const [isInitialRender, setIsInitialRender] = React.useState(true);

    const bgColor = 'white';
    const borderColor = 'gray.200';

    const { windowWidth } = useWindowWidth();
    const isMobile = windowWidth < 768;

    // Prevent animation flash on initial render
    React.useEffect(() => {
        setIsInitialRender(false);
    }, []);

    // On mobile, show full width when menu is open, otherwise collapsed
    const shouldShowCollapsed = isMobile ? !isMobileOpen : isCollapsed;

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
                {renderNav({
                    currentPath: location.pathname,
                    isCollapsed: shouldShowCollapsed,
                    isInitialRender,
                    onNavigate: handleNavClick,
                    onItemClick: () => {
                        if (isMobile) setMobileOpen(false);
                    },
                })}

            </VStack>
        </motion.div>
    );
};