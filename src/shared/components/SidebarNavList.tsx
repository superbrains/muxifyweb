import React from 'react';
import { HStack, Text, Icon, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavItem {
    icon: React.ComponentType<{ boxSize?: number; color?: string }>;
    label: string;
    path: string;
}

interface SidebarNavListProps {
    items: NavItem[];
    currentPath: string;
    /** Collapsed rail (icons only) vs expanded (icon + label). */
    isCollapsed: boolean;
    /** Suppresses entry animation on the very first paint. */
    isInitialRender: boolean;
    onNavigate: (path: string) => void;
}

const isItemActive = (currentPath: string, targetPath: string) => {
    if (targetPath === '/') {
        return currentPath === '/';
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

/**
 * The flat icon+label nav rail shared by every role's sidebar. Extracted from
 * `Sidebar` so the admin console can reuse the identical collapsed rail from
 * its own lazily-loaded nav component without `Sidebar` having to import any
 * admin code — see `features/admin/components/AdminSidebarNav`.
 */
export const SidebarNavList: React.FC<SidebarNavListProps> = ({
    items,
    currentPath,
    isCollapsed,
    isInitialRender,
    onNavigate,
}) => {
    const inactiveColor = 'primary.500';
    const textColor = 'gray.blue.700';

    return (
        <VStack gap={3} flex={1} align="stretch" zIndex={1000} overflowY="auto" overflowX="hidden">
            {items.map((item) => {
                const isActive = isItemActive(currentPath, item.path);
                const IconComponent = item.icon;

                return (
                    <motion.button
                        key={item.path}
                        onClick={() => onNavigate(item.path)}
                        initial={false}
                        animate={{
                            backgroundColor: isActive ? '#f94444' : 'transparent',
                            borderRadius: isCollapsed ? 7 : 9,
                            padding: isCollapsed ? 9 : 13,
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
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            minHeight: '36px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <HStack gap={isCollapsed ? 0 : 4} width="100%">
                            <Icon
                                as={IconComponent}
                                boxSize={5}
                                color={isActive ? 'white' : inactiveColor}
                                ml={isCollapsed ? '1.5px' : '0'}
                            />
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
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
    );
};
