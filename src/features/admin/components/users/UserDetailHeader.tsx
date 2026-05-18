import React from 'react';
import { Avatar, Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { StatusBadge } from '../StatusBadge';
import { accountStatusStyle, roleLabel } from '../../lib/statusColor';
import { adminDate } from '../../lib/format';
import type { AdminUserDetailDto } from '../../types';

interface UserDetailHeaderProps {
    user: AdminUserDetailDto;
    onSuspend: () => void;
    onActivate: () => void;
    actionPending?: boolean;
}

/** Profile header for the user detail page — identity + lifecycle action. */
export const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({
    user,
    onSuspend,
    onActivate,
    actionPending,
}) => {
    const suspended = user.status === 'Suspended';

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
            <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
                <HStack gap={4} minW={0}>
                    <Avatar.Root size="xl" flexShrink={0}>
                        {user.avatarUrl && (
                            <Avatar.Image src={user.avatarUrl} alt={user.name} />
                        )}
                        <Avatar.Fallback name={user.name} />
                    </Avatar.Root>
                    <VStack align="start" gap={1} minW={0}>
                        <Text
                            fontSize="md"
                            fontWeight="bold"
                            color="gray.900"
                            fontFamily="Poppins"
                            lineClamp={1}
                        >
                            {user.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" lineClamp={1}>
                            {user.email}
                        </Text>
                        <HStack gap={2} mt={1} flexWrap="wrap">
                            <Box
                                bg="gray.100"
                                color="gray.700"
                                fontSize="10px"
                                fontWeight="semibold"
                                px={2.5}
                                py={1}
                                borderRadius="full"
                            >
                                {roleLabel(user.role)}
                            </Box>
                            <StatusBadge style={accountStatusStyle(user.status)} />
                            <Text fontSize="10px" color="gray.400">
                                Joined {adminDate(user.createdAt)}
                            </Text>
                        </HStack>
                    </VStack>
                </HStack>

                <Button
                    size="sm"
                    fontSize="xs"
                    fontWeight="medium"
                    borderRadius="10px"
                    onClick={suspended ? onActivate : onSuspend}
                    disabled={actionPending}
                    bg={suspended ? '#16A34A' : 'white'}
                    color={suspended ? 'white' : '#C53030'}
                    borderWidth={suspended ? '0' : '1px'}
                    borderColor="#FECACA"
                    _hover={{ bg: suspended ? '#15803D' : '#FEF2F2' }}
                >
                    {suspended ? 'Reactivate account' : 'Suspend account'}
                </Button>
            </HStack>
        </Box>
    );
};
