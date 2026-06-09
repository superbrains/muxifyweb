import React from 'react';
import {
    Box,
    Button,
    HStack,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    FiLock,
    FiLogOut,
    FiMonitor,
    FiRefreshCw,
    FiShield,
    FiUnlock,
} from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDateTime, adminRelative } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useFlagPasswordReset,
    useForceLogout,
    useLockUser,
    useSecurityActivity,
    useSecurityDevices,
    useSecuritySessions,
    useSecurityUser,
    useUnlockUser,
} from '../../hooks/useSecurity';
import type {
    SecurityActivityQuery,
    SecurityActivityRowDto,
} from '../../types/security';

const PAGE_SIZE = 15;

/* --------------------------- Reusable sub-blocks -------------------------- */

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

const MetaRow: React.FC<{ label: string; children: React.ReactNode }> = ({
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

/* ---------------------------- Detail drawer body -------------------------- */

interface SecurityDetailProps {
    userId: string;
    onLock: () => void;
}

const SecurityDetailBody: React.FC<SecurityDetailProps> = ({ userId, onLock }) => {
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
                <SimpleGrid columns={2} gap={3}>
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

const KpiTile: React.FC<{ label: string; value: React.ReactNode }> = ({
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

/* --------------------------------- Page ---------------------------------- */

const SecurityActivityPage: React.FC = () => {
    const [query, setQuery] = React.useState<SecurityActivityQuery>({
        search: undefined,
        page: 1,
        pageSize: PAGE_SIZE,
    });
    const [selected, setSelected] = React.useState<SecurityActivityRowDto | null>(null);
    const [lockTarget, setLockTarget] = React.useState<SecurityActivityRowDto | null>(null);

    const { data, isLoading, error } = useSecurityActivity(query);
    const lock = useLockUser();

    const columns: DataColumn<SecurityActivityRowDto>[] = [
        {
            key: 'user',
            header: 'User',
            render: (r) => <IdentityCell name={r.name} secondary={r.email} />,
        },
        {
            key: 'role',
            header: 'Role',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {r.role}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
        },
        {
            key: 'lastLogin',
            header: 'Last login',
            render: (r) => (
                <Text fontSize="xs" color="gray.600">
                    {adminRelative(r.lastLoginAt)}
                </Text>
            ),
        },
        {
            key: 'sessions',
            header: 'Active sessions',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {r.activeSessionCount}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Security Activity"
            subtitle="Monitor sign-in activity, sessions and devices — lock, unlock or force-logout accounts"
            breadcrumbs={[{ label: 'Users & Roles' }, { label: 'Security Activity' }]}
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) =>
                        setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by name or email',
                }}
            />

            {error ? (
                <AdminError error={error} message="Could not load security activity." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(u) => u.userId}
                    onRowClick={(u) => setSelected(u)}
                    loading={isLoading && !data}
                    emptyIcon={FiShield}
                    emptyTitle="No users found"
                    emptyDescription="Nothing matches the current search."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            <DetailDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.name ?? 'Security panel'}
                subtitle={selected?.email}
                size="md"
            >
                {selected && (
                    <SecurityDetailBody
                        userId={selected.userId}
                        onLock={() => setLockTarget(selected)}
                    />
                )}
            </DetailDrawer>

            <ConfirmActionModal
                isOpen={lockTarget !== null}
                onClose={() => setLockTarget(null)}
                onConfirm={(reason) =>
                    lockTarget &&
                    lock.mutate(
                        { userId: lockTarget.userId, reason },
                        { onSuccess: () => setLockTarget(null) },
                    )
                }
                title={`Lock ${lockTarget?.name ?? 'account'}`}
                message="The user will be signed out of every session and blocked from signing in until unlocked."
                reasonLabel="Lock reason"
                placeholder="e.g. Suspicious sign-in activity from multiple regions."
                confirmText="Lock account"
                tone="danger"
                isLoading={lock.isPending}
            />
        </AdminPageLayout>
    );
};

export default SecurityActivityPage;
