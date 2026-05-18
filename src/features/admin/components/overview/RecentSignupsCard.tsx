import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { IdentityCell } from '../IdentityCell';
import { roleLabel } from '../../lib/statusColor';
import { adminRelative } from '../../lib/format';
import type { AdminUserDto } from '../../types';

interface RecentSignupsCardProps {
    users: AdminUserDto[];
}

/** Compact list of the most recent platform signups. */
export const RecentSignupsCard: React.FC<RecentSignupsCardProps> = ({ users }) => {
    const navigate = useNavigate();

    return (
        <Box
            bg="white"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            h="full"
        >
            <HStack justify="space-between" mb={3}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                    Recent signups
                </Text>
                <Text
                    as="button"
                    fontSize="10px"
                    color="primary.500"
                    fontWeight="medium"
                    onClick={() => navigate('/admin/users')}
                    _hover={{ textDecoration: 'underline' }}
                >
                    View all
                </Text>
            </HStack>

            {users.length === 0 ? (
                <Text fontSize="xs" color="gray.500" py={4} textAlign="center">
                    No recent signups.
                </Text>
            ) : (
                <VStack align="stretch" gap={1}>
                    {users.map((u) => (
                        <HStack
                            as="button"
                            key={u.id}
                            justify="space-between"
                            px={2}
                            py={2}
                            borderRadius="10px"
                            transition="background 0.15s"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                        >
                            <IdentityCell
                                name={u.name}
                                secondary={roleLabel(u.role)}
                                avatarUrl={u.avatarUrl}
                                size="xs"
                            />
                            <Text fontSize="10px" color="gray.400" flexShrink={0}>
                                {adminRelative(u.createdAt)}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            )}
        </Box>
    );
};
