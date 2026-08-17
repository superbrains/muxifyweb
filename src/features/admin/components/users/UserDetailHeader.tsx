import React from 'react';
import {
    Box,
    Button,
    HStack,
    SimpleGrid,
    Skeleton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { CustomMenu, UserAvatar } from '@shared/components';
import { StatusBadge } from '../StatusBadge';
import { identityTint } from '@shared/console/lib/identityTint';
import { accountStatusStyle, roleLabel, verificationStatusStyle } from '../../lib/statusColor';
import { adminDate, adminDateTime, adminRelative, formatCount, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useFlagPasswordReset, useForceLogout, useUnlockUser } from '../../hooks/useSecurity';
import type { AdminUserDetailDto, AdminUserProfileDto } from '../../types';

interface DeleteMenuOption {
    label: string;
    value: string;
    color?: string;
    onClick: () => void;
}

interface UserDetailHeaderProps {
    user: AdminUserDetailDto;
    profile?: AdminUserProfileDto;
    profileLoading?: boolean;
    onSuspend: () => void;
    onActivate: () => void;
    onChangeRole: () => void;
    onLock: () => void;
    /** Soft-delete / restore / permanent-delete actions (empty without UsersDelete). */
    deleteMenuOptions?: DeleteMenuOption[];
    actionPending?: boolean;
}

interface QuickStat {
    label: string;
    value: string;
}

/** Role-appropriate headline tiles rendered beneath the identity row. */
const quickStats = (profile?: AdminUserProfileDto): QuickStat[] => {
    if (!profile) return [];
    if (profile.fan) {
        const f = profile.fan;
        return [
            { label: 'Coin balance', value: formatCount(f.coinBalance) },
            { label: 'Coins spent', value: formatCount(f.totalCoinsSpent) },
            { label: 'Gifts sent', value: formatCount(f.totalGiftsSentCount) },
            { label: 'Unlocks', value: formatCount(f.totalUnlocksCount) },
            { label: 'Followers', value: formatCount(f.followerCount) },
        ];
    }
    if (profile.creator) {
        const c = profile.creator;
        return [
            { label: 'Followers', value: formatCount(c.followerCount) },
            { label: 'Tracks', value: formatCount(c.trackCount) },
            { label: 'Uploads', value: formatCount(c.uploads) },
            { label: 'Earnings', value: formatMinorAmount(c.totalEarningsMinor, c.currency) },
        ];
    }
    if (profile.label) {
        const l = profile.label;
        return [
            { label: 'Roster size', value: formatCount(l.artistCount) },
            { label: 'Uploads', value: formatCount(l.uploads) },
            { label: 'Directors', value: formatCount(l.directors.length) },
        ];
    }
    if (profile.adManager) {
        const a = profile.adManager;
        return [
            { label: 'Active campaigns', value: formatCount(a.activeCampaignCount) },
            { label: 'Total campaigns', value: formatCount(a.totalCampaignCount) },
            { label: 'Ad spend', value: formatMinorAmount(a.totalAdSpendMinor) },
        ];
    }
    if (profile.contributor) {
        return [
            { label: 'Active splits', value: formatCount(profile.contributor.activeSplitCount) },
        ];
    }
    return [];
};

/**
 * Profile hero for the user detail page — identity, lifecycle status, the
 * role-appropriate quick stats, and every account action (role change,
 * suspend/reactivate, gated security operations, finance shortcut).
 */
export const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({
    user,
    profile,
    profileLoading,
    onSuspend,
    onActivate,
    onChangeRole,
    onLock,
    deleteMenuOptions = [],
    actionPending,
}) => {
    const navigate = useNavigate();
    const suspended = user.status === 'Suspended';
    const deleted = user.isDeleted;
    const isAdmin = user.role === 'admin';
    const tint = identityTint(user.name);

    const canSecurity = useHasPermission('SecurityManage');
    const canFinance = useHasPermission('FinanceView');
    const forceLogout = useForceLogout();
    const unlock = useUnlockUser();
    const flagReset = useFlagPasswordReset();

    const stats = quickStats(profile);

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
            <Box p={5}>
                <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
                    <HStack gap={4} minW={0}>
                        <UserAvatar
                            name={user.name}
                            src={user.avatarUrl}
                            size="2xl"
                            bg={tint.bg}
                            color={tint.color}
                        />
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
                                <StatusBadge style={verificationStatusStyle(user.verificationStatus)} />
                            </HStack>
                            <HStack gap={3} mt={0.5} flexWrap="wrap">
                                <Text fontSize="10px" color="gray.400">
                                    Joined {adminDate(user.createdAt)}
                                </Text>
                                <Text fontSize="10px" color="gray.400">
                                    Last active {adminRelative(user.lastActiveAt)}
                                </Text>
                                {user.country && (
                                    <Text fontSize="10px" color="gray.400">
                                        {user.country}
                                    </Text>
                                )}
                            </HStack>
                        </VStack>
                    </HStack>

                    <HStack gap={2} flexWrap="wrap">
                        {canFinance && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                variant="outline"
                                onClick={() => navigate('/admin/finance')}
                            >
                                View finance
                            </Button>
                        )}
                        {!deleted && canSecurity && (
                            <CustomMenu
                                options={[
                                    {
                                        label: 'Force logout (all sessions)',
                                        value: 'force-logout',
                                        onClick: () => forceLogout.mutate({ userId: user.id }),
                                    },
                                    {
                                        label: 'Flag password reset',
                                        value: 'flag-reset',
                                        onClick: () => flagReset.mutate({ userId: user.id }),
                                    },
                                    suspended
                                        ? {
                                              label: 'Unlock account',
                                              value: 'unlock',
                                              onClick: () => unlock.mutate({ userId: user.id }),
                                          }
                                        : {
                                              label: 'Lock account',
                                              value: 'lock',
                                              color: '#C53030',
                                              onClick: onLock,
                                          },
                                ]}
                            />
                        )}
                        {!deleted && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                variant="outline"
                                onClick={onChangeRole}
                                disabled={actionPending || isAdmin}
                                title={isAdmin ? 'Admin role changes go through Admin Management.' : undefined}
                            >
                                Change role
                            </Button>
                        )}
                        {!deleted && (
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
                        )}
                        {deleteMenuOptions.length > 0 && (
                            <CustomMenu options={deleteMenuOptions} />
                        )}
                    </HStack>
                </HStack>

                {(profileLoading || stats.length > 0) && (
                    <SimpleGrid
                        columns={{ base: 2, md: Math.max(stats.length, 3), lg: Math.max(stats.length, 4) }}
                        gap={3}
                        mt={5}
                    >
                        {profileLoading && stats.length === 0
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <Skeleton key={i} h="56px" borderRadius="lg" />
                              ))
                            : stats.map((s) => (
                                  <Box key={s.label} bg="gray.50" borderRadius="lg" px={3} py={2.5}>
                                      <Text fontSize="10px" color="gray.500" mb={1}>
                                          {s.label}
                                      </Text>
                                      <Text
                                          fontSize="sm"
                                          fontWeight="semibold"
                                          color="gray.900"
                                          fontVariantNumeric="tabular-nums"
                                      >
                                          {s.value}
                                      </Text>
                                  </Box>
                              ))}
                    </SimpleGrid>
                )}
            </Box>

            {deleted && (
                <HStack bg="#FEF2F2" borderTop="1px solid" borderColor="#FECACA" px={5} py={3} gap={2.5} align="start">
                    <Box color="#C53030" mt={0.5}>
                        <FiAlertTriangle size={14} />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="#C53030">
                            Account soft-deleted {user.deletedAt ? `on ${adminDateTime(user.deletedAt)}` : ''}
                        </Text>
                        {user.deletedReason && (
                            <Text fontSize="xs" color="#9B2C2C" mt={0.5}>
                                {user.deletedReason}
                            </Text>
                        )}
                    </Box>
                </HStack>
            )}

            {!deleted && suspended && (
                <HStack bg="#FEF2F2" borderTop="1px solid" borderColor="#FECACA" px={5} py={3} gap={2.5} align="start">
                    <Box color="#C53030" mt={0.5}>
                        <FiAlertTriangle size={14} />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="#C53030">
                            Account suspended {user.suspendedAt ? `on ${adminDateTime(user.suspendedAt)}` : ''}
                        </Text>
                        {user.suspendedReason && (
                            <Text fontSize="xs" color="#9B2C2C" mt={0.5}>
                                {user.suspendedReason}
                            </Text>
                        )}
                    </Box>
                </HStack>
            )}
        </Box>
    );
};
