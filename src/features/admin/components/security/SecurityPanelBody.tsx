import React from 'react';
import { Box, Button, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { FiLock, FiLogOut, FiMonitor, FiRefreshCw, FiUnlock } from 'react-icons/fi';
import { AdminError, StatusBadge } from '../ui';
import { adminDateTime, adminRelative } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useFlagPasswordReset,
    useForceLogout,
    useSecurityDevices,
    useSecuritySessions,
    useSecurityUser,
    useUnlockUser,
} from '../../hooks/useSecurity';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text
        fontSize="10px"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="0.4px"
        color="#7B91B0"
        mb={2}
    >
        {children}
    </Text>
);

export const MetaRow: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
}) => (
    <HStack justify="space-between" align="center" gap={3}>
        <Text fontSize="11px" color="gray.500">
            {label}
        </Text>
        <Box fontSize="xs" color="gray.800" fontWeight="medium" textAlign="right">
            {children}
        </Box>
    </HStack>
);

export const KpiTile: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
}) => (
    <Box bg="gray.50" borderRadius="lg" px={3} py={2.5}>
        <Text fontSize="10px" color="gray.500" mb={1}>
            {label}
        </Text>
        <Box fontSize="sm" fontWeight="semibold" color="gray.900">
            {value}
        </Box>
    </Box>
);

interface SecurityPanelBodyProps {
    userId: string;
    onLock: () => void;
    /** Tile grid columns — 2 fits the drawer, 3 fits the detail-page tab. */
    kpiColumns?: number;
}

/**
 * Per-user security panel: status KPIs, active sessions, devices and the
 * SecurityManage action set. Shared by the Security Activity drawer and the
 * user detail page's Security tab.
 */
export const SecurityPanelBody: React.FC<SecurityPanelBodyProps> = ({
    userId,
    onLock,
    kpiColumns = 2,
}) => {
    const detail = useSecurityUser(userId);
    const sessions = useSecuritySessions(userId);
    const devices = useSecurityDevices(userId);

    const canManage = useHasPermission('SecurityManage');
    const forceLogout = useForceLogout();
    const unlock = useUnlockUser();
    const flagReset = useFlagPasswordReset();

    if (detail.isLoading && !detail.data) {
        return (
            <HStack justify="center" py={10}>
                <Spinner size="md" color="primary.500" />
            </HStack>
        );
    }

    if (detail.error || !detail.data) {
        return (
            <AdminError
                error={detail.error}
                message="Could not load this user's security panel."
            />
        );
    }

    const d = detail.data;
    const isLocked = d.status.toLowerCase() === 'suspended';

    return (
        <VStack align="stretch" gap={6}>
            {/* Status KPIs */}
            <Box>
                <SectionTitle>Account status</SectionTitle>
                <SimpleGrid columns={kpiColumns} gap={3}>
                    <KpiTile label="Status" value={<StatusBadge status={d.status} />} />
                    <KpiTile label="Active sessions" value={String(d.activeSessionCount)} />
                    <KpiTile label="Devices" value={String(d.deviceCount)} />
                    <KpiTile
                        label="Email verified"
                        value={<StatusBadge status={d.isEmailVerified ? 'Verified' : 'Pending'} />}
                    />
                    <KpiTile label="Has PIN" value={d.hasPin ? 'Yes' : 'No'} />
                    <KpiTile label="Last login" value={adminRelative(d.lastLoginAt)} />
                </SimpleGrid>
            </Box>

            <Box>
                <SectionTitle>Identity</SectionTitle>
                <VStack align="stretch" gap={2}>
                    <MetaRow label="Role">{d.role}</MetaRow>
                    {isLocked && (
                        <>
                            <MetaRow label="Locked at">{adminDateTime(d.suspendedAt)}</MetaRow>
                            {d.suspendedReason && (
                                <MetaRow label="Reason">{d.suspendedReason}</MetaRow>
                            )}
                        </>
                    )}
                </VStack>
            </Box>

            {/* Sessions */}
            <Box>
                <SectionTitle>Active sessions</SectionTitle>
                {sessions.isLoading ? (
                    <Spinner size="sm" color="primary.500" />
                ) : (sessions.data?.length ?? 0) === 0 ? (
                    <Text fontSize="xs" color="gray.500">
                        No active sessions.
                    </Text>
                ) : (
                    <VStack align="stretch" gap={2}>
                        {sessions.data?.map((s) => (
                            <Box
                                key={s.id}
                                border="1px solid"
                                borderColor="gray.100"
                                borderRadius="lg"
                                p={3}
                            >
                                <HStack gap={2} mb={1}>
                                    <Box color="gray.400">
                                        <FiMonitor />
                                    </Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                        {s.deviceInfo || 'Unknown device'}
                                    </Text>
                                </HStack>
                                <VStack align="stretch" gap={1}>
                                    <MetaRow label="IP address">{s.ipAddress || '—'}</MetaRow>
                                    <MetaRow label="Started">{adminDateTime(s.createdAt)}</MetaRow>
                                    <MetaRow label="Expires">{adminDateTime(s.expiresAt)}</MetaRow>
                                </VStack>
                            </Box>
                        ))}
                    </VStack>
                )}
            </Box>

            {/* Devices */}
            <Box>
                <SectionTitle>Devices</SectionTitle>
                {devices.isLoading ? (
                    <Spinner size="sm" color="primary.500" />
                ) : (devices.data?.length ?? 0) === 0 ? (
                    <Text fontSize="xs" color="gray.500">
                        No known devices.
                    </Text>
                ) : (
                    <VStack align="stretch" gap={2}>
                        {devices.data?.map((dev) => (
                            <HStack
                                key={dev.id}
                                justify="space-between"
                                border="1px solid"
                                borderColor="gray.100"
                                borderRadius="lg"
                                p={3}
                                gap={3}
                            >
                                <HStack gap={2} minW={0}>
                                    <Box color="gray.400">
                                        <FiMonitor />
                                    </Box>
                                    <VStack align="start" gap={0} minW={0}>
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                            {dev.platform || 'Unknown platform'}
                                        </Text>
                                        <Text fontSize="10px" color="gray.500">
                                            Last used {adminRelative(dev.lastUsedAt)}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <StatusBadge status={dev.isActive ? 'Active' : 'Inactive'} />
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Box>

            {/* Actions */}
            {canManage && (
                <Box>
                    <SectionTitle>Actions</SectionTitle>
                    <VStack align="stretch" gap={2}>
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            justifyContent="flex-start"
                            borderRadius="10px"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => forceLogout.mutate({ userId })}
                            loading={forceLogout.isPending}
                        >
                            <FiLogOut /> Force logout (all sessions)
                        </Button>

                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            justifyContent="flex-start"
                            borderRadius="10px"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => flagReset.mutate({ userId })}
                            loading={flagReset.isPending}
                        >
                            <FiRefreshCw /> Flag password reset
                        </Button>

                        {isLocked ? (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="#16A34A"
                                color="white"
                                justifyContent="flex-start"
                                borderRadius="10px"
                                _hover={{ bg: '#15803D' }}
                                onClick={() => unlock.mutate({ userId })}
                                loading={unlock.isPending}
                            >
                                <FiUnlock /> Unlock account
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                fontSize="xs"
                                bg="#f94444"
                                color="white"
                                justifyContent="flex-start"
                                borderRadius="10px"
                                _hover={{ bg: '#e53939' }}
                                onClick={onLock}
                            >
                                <FiLock /> Lock account
                            </Button>
                        )}
                    </VStack>
                </Box>
            )}
        </VStack>
    );
};
