import React from 'react';
import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiChevronRight, FiFileText, FiLifeBuoy } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { AdminOverviewDto } from '../../types';

interface QueueRowProps {
    icon: IconType;
    iconBg: string;
    iconColor: string;
    label: string;
    count: number;
    to: string;
}

const QueueRow: React.FC<QueueRowProps> = ({
    icon,
    iconBg,
    iconColor,
    label,
    count,
    to,
}) => {
    const navigate = useNavigate();
    return (
        <HStack
            as="button"
            onClick={() => navigate(to)}
            w="full"
            justify="space-between"
            px={3}
            py={2.5}
            borderRadius="12px"
            transition="background 0.15s"
            _hover={{ bg: 'gray.50' }}
        >
            <HStack gap={3} minW={0}>
                <Box bg={iconBg} p={2} borderRadius="10px" flexShrink={0}>
                    <Icon as={icon} boxSize={4} color={iconColor} />
                </Box>
                <VStack align="start" gap={0} minW={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                        {count.toLocaleString()} {label}
                    </Text>
                    <Text fontSize="10px" color="gray.500">
                        {count > 0 ? 'Needs your attention' : 'All clear'}
                    </Text>
                </VStack>
            </HStack>
            <Icon as={FiChevronRight} boxSize={4} color="gray.400" />
        </HStack>
    );
};

interface PendingQueueCardProps {
    overview: AdminOverviewDto;
}

/** "Needs attention" card linking to the verification, ticket and moderation queues. */
export const PendingQueueCard: React.FC<PendingQueueCardProps> = ({ overview }) => (
    <Box
        bg="white"
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        h="full"
    >
        <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={3}>
            Needs attention
        </Text>
        <VStack align="stretch" gap={1}>
            <QueueRow
                icon={FiFileText}
                iconBg="#FFF9E6"
                iconColor="#D97706"
                label="verifications to review"
                count={overview.pendingVerifications}
                to="/admin/verifications"
            />
            <QueueRow
                icon={FiLifeBuoy}
                iconBg="#ECF7FF"
                iconColor="#3B82F6"
                label="open support tickets"
                count={overview.openTickets}
                to="/admin/support"
            />
            <QueueRow
                icon={FiAlertTriangle}
                iconBg="#FEF2F2"
                iconColor="#E53E3E"
                label="flagged items"
                count={overview.flaggedContent}
                to="/admin/support?tab=moderation"
            />
        </VStack>
    </Box>
);
