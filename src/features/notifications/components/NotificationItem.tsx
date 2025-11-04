import React from 'react';
import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import type { Notification } from '../types';

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onClick,
}) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    };

    return (
        <Box
            px="15px"
            py="18px"
            cursor="pointer"
            bg={notification.isRead ? 'white' : 'primary.50'}
            _hover={{
                bg: notification.isRead ? 'gray.50' : 'primary.100',
            }}
            transition="background-color 0.2s"
            onClick={onClick}
        >
            <VStack align="stretch" gap="5px">
                <HStack justify="space-between" align="start">
                    <VStack align="start" gap="5px" flex={1}>
                        <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="primary.500"
                            lineHeight="normal"
                        >
                            {notification.title}
                        </Text>
                        <Text
                            fontSize="xs"
                            fontWeight="normal"
                            color="gray.600"
                            lineHeight="normal"
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                        >
                            {notification.message}
                        </Text>
                    </VStack>
                    {!notification.isRead && (
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="primary.500"
                            flexShrink={0}
                            mt={1}
                        />
                    )}
                </HStack>
                {notification.actionLabel && (
                    <Text
                        fontSize="xs"
                        color="primary.500"
                        fontWeight="medium"
                        mt={1}
                    >
                        {notification.actionLabel}
                    </Text>
                )}
                <Text
                    fontSize="2xs"
                    color="gray.400"
                    mt={1}
                >
                    {formatTime(notification.createdAt)}
                </Text>
            </VStack>
        </Box>
    );
};

