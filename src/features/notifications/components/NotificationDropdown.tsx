import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Text,
    Button,
    Portal,
    Spinner,
} from '@chakra-ui/react';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    isOpen,
    onClose,
    triggerRef,
}) => {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotificationStore();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
        markAsRead(notificationId);
        if (actionUrl) {
            navigate(actionUrl);
            onClose();
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const displayedNotifications = notifications.slice(0, 10); // Show max 10 notifications

    if (!isOpen) return null;

    // Calculate position relative to trigger button
    const getPosition = () => {
        if (!triggerRef.current) {
            return { top: '70px', right: '20px' };
        }

        const rect = triggerRef.current.getBoundingClientRect();
        
        return {
            top: `${rect.bottom + 8}px`,
            right: `${window.innerWidth - rect.right}px`,
        };
    };

    const position = getPosition();

    return (
        <Portal>
            <Box
                ref={dropdownRef}
                position="fixed"
                top={position.top}
                right={position.right}
                w="320px"
                maxH="500px"
                borderRadius="10px"
                boxShadow="0px 4px 8px 0px rgba(0,0,0,0.1)"
                border="none"
                bg="white"
                zIndex={1000}
                overflow="hidden"
            >
                <VStack align="stretch" gap={0}>
                    {/* Header */}
                    <Box
                        px="15px"
                        py="12px"
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.900"
                        >
                            Notifications
                        </Text>
                        {unreadCount > 0 && (
                            <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="primary"
                                onClick={handleMarkAllAsRead}
                                fontSize="xs"
                                fontWeight="medium"
                                h="auto"
                                py={1}
                                px={2}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </Box>

                    {/* Notifications List */}
                    <Box
                        maxH="400px"
                        overflowY="auto"
                        css={{
                            '&::-webkit-scrollbar': {
                                width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#e2e8f0',
                                borderRadius: '2px',
                            },
                        }}
                    >
                        {isLoading ? (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                py={8}
                            >
                                <Spinner size="sm" color="primary.500" />
                            </Box>
                        ) : displayedNotifications.length === 0 ? (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                py={8}
                                px={4}
                            >
                                <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    textAlign="center"
                                >
                                    No notifications
                                </Text>
                            </Box>
                        ) : (
                            <VStack align="stretch" gap={0}>
                                {displayedNotifications.map((notification, index) => (
                                    <React.Fragment key={notification.id}>
                                        <NotificationItem
                                            notification={notification}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification.id,
                                                    notification.actionUrl
                                                )
                                            }
                                        />
                                        {index < displayedNotifications.length - 1 && (
                                            <Box
                                                borderBottom="1px solid"
                                                borderColor="gray.100"
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </VStack>
                        )}
                    </Box>

                    {/* Footer */}
                    {notifications.length > 10 && (
                        <>
                            <Box
                                borderTop="1px solid"
                                borderColor="gray.200"
                            />
                            <Box px="15px" py="10px">
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    width="full"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    color="primary.500"
                                    _hover={{
                                        bg: 'primary.50',
                                    }}
                                >
                                    View all notifications
                                </Button>
                            </Box>
                        </>
                    )}
                </VStack>
            </Box>
        </Portal>
    );
};

