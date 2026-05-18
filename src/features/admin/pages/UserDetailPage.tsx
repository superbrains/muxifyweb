import React from 'react';
import { Box, HStack, Icon, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminError, AdminLoading } from '../components/AdminStateBlock';
import { AnimatedTabs, ConfirmModal } from '@shared/components';
import { StatusBadge } from '../components/StatusBadge';
import { ReasonDialog } from '../components/ReasonDialog';
import { UserDetailHeader } from '../components/users/UserDetailHeader';
import { useActivateUser, useSuspendUser, useUser } from '../hooks/useUsers';
import { verificationStatusStyle } from '../lib/statusColor';
import { adminDateTime, formatCount, formatMinorAmount } from '../lib/format';
import type { AdminUserDetailDto } from '../types';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
}) => (
    <HStack justify="space-between" align="start" gap={4} py={1.5}>
        <Text
            fontSize="10px"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.4px"
            fontWeight="semibold"
            flexShrink={0}
        >
            {label}
        </Text>
        <Box fontSize="xs" color="gray.800" textAlign="right">
            {value ?? '—'}
        </Box>
    </HStack>
);

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5}>
        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={3}>
            {title}
        </Text>
        {children}
    </Box>
);

const ProfileTab: React.FC<{ user: AdminUserDetailDto }> = ({ user }) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Panel title="Account">
            <Stack gap={0}>
                <Field label="User ID" value={user.id} />
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={user.phoneNumber} />
                <Field label="Country" value={user.country} />
            </Stack>
        </Panel>
        <Panel title="Verification">
            <Stack gap={0}>
                <Field
                    label="Status"
                    value={
                        <StatusBadge
                            style={verificationStatusStyle(user.verificationStatus)}
                        />
                    }
                />
                {user.verificationRejectionReason && (
                    <Field
                        label="Rejection reason"
                        value={user.verificationRejectionReason}
                    />
                )}
                {user.suspendedAt && (
                    <Field label="Suspended" value={adminDateTime(user.suspendedAt)} />
                )}
                {user.suspendedReason && (
                    <Field label="Suspension reason" value={user.suspendedReason} />
                )}
            </Stack>
        </Panel>
    </SimpleGrid>
);

const ActivityTab: React.FC<{ user: AdminUserDetailDto }> = ({ user }) => {
    const s = user.stats ?? {};
    return (
        <Panel title="Activity & stats">
            <Stack gap={0}>
                <Field label="Last active" value={adminDateTime(user.lastActiveAt)} />
                {s.uploads !== undefined && (
                    <Field label="Uploads" value={formatCount(s.uploads)} />
                )}
                {s.rosterCount !== undefined && (
                    <Field label="Roster size" value={formatCount(s.rosterCount)} />
                )}
                {s.totalRevenueMinor !== undefined && (
                    <Field
                        label="Total revenue"
                        value={formatMinorAmount(s.totalRevenueMinor, s.currency)}
                    />
                )}
            </Stack>
        </Panel>
    );
};

const UserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { data, isLoading, error } = useUser(userId ?? null);

    const [tab, setTab] = React.useState('profile');
    const [suspendOpen, setSuspendOpen] = React.useState(false);
    const [activateOpen, setActivateOpen] = React.useState(false);

    const suspend = useSuspendUser();
    const activate = useActivateUser();

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <HStack
                as="button"
                gap={1.5}
                color="gray.500"
                _hover={{ color: 'primary.500' }}
                w="fit-content"
                onClick={() => navigate('/admin/users')}
            >
                <Icon as={FiArrowLeft} boxSize={4} />
                <Text fontSize="xs" fontWeight="medium">
                    Back to users
                </Text>
            </HStack>

            {isLoading ? (
                <AdminLoading />
            ) : error || !data ? (
                <AdminError error={error} message="This user could not be found." />
            ) : (
                <>
                    <UserDetailHeader
                        user={data}
                        onSuspend={() => setSuspendOpen(true)}
                        onActivate={() => setActivateOpen(true)}
                        actionPending={suspend.isPending || activate.isPending}
                    />

                    <Box>
                        <AnimatedTabs
                            tabs={[
                                { id: 'profile', label: 'Profile' },
                                { id: 'activity', label: 'Activity' },
                            ]}
                            activeTab={tab}
                            onTabChange={setTab}
                            size="sm"
                        />
                    </Box>

                    {tab === 'profile' ? (
                        <ProfileTab user={data} />
                    ) : (
                        <ActivityTab user={data} />
                    )}

                    <ReasonDialog
                        isOpen={suspendOpen}
                        onClose={() => setSuspendOpen(false)}
                        onConfirm={(reason) =>
                            suspend.mutate(
                                { userId: data.id, reason },
                                { onSuccess: () => setSuspendOpen(false) },
                            )
                        }
                        title={`Suspend ${data.name}`}
                        message="The user will be signed out and blocked from signing in until reactivated."
                        reasonLabel="Suspension reason"
                        placeholder="e.g. Repeated violations of the content policy after warnings."
                        confirmText="Suspend account"
                        confirmColor="red"
                        isLoading={suspend.isPending}
                    />

                    <ConfirmModal
                        isOpen={activateOpen}
                        onClose={() => setActivateOpen(false)}
                        onConfirm={() =>
                            activate.mutate(data.id, {
                                onSuccess: () => setActivateOpen(false),
                            })
                        }
                        title="Reactivate account?"
                        message={`${data.name} will be able to sign in again immediately.`}
                        confirmText="Reactivate"
                        confirmColor="blue"
                        isLoading={activate.isPending}
                    />
                </>
            )}
        </VStack>
    );
};

export default UserDetailPage;
