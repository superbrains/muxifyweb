import React from 'react';
import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { AdminError, AdminLoading } from '../components/AdminStateBlock';
import { AnimatedTabs, ConfirmModal } from '@shared/components';
import { AdminPageLayout } from '../components/ui';
import { ReasonDialog } from '../components/ReasonDialog';
import { UserDetailHeader } from '../components/users/UserDetailHeader';
import { ChangeUserRoleModal } from '../components/users/ChangeUserRoleModal';
import { OverviewTab } from '../components/users/detail/OverviewTab';
import { RoleProfileTab } from '../components/users/detail/RoleProfileTab';
import { UserSecurityTab } from '../components/users/detail/UserSecurityTab';
import { UserAuditTab } from '../components/users/detail/UserAuditTab';
import { ConfirmActionModal } from '../components/ui';
import { useActivateUser, useSuspendUser, useUser, useUserProfile } from '../hooks/useUsers';
import { useHasPermission } from '../hooks/useAdminManagement';
import { useLockUser } from '../hooks/useSecurity';
import { roleLabel } from '../lib/statusColor';

/** Label for the role-specific tab, e.g. "Artist profile". */
const profileTabLabel = (role?: string): string =>
    role ? `${roleLabel(role)} profile` : 'Profile';

const UserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { data, isLoading, error } = useUser(userId ?? null);
    const profile = useUserProfile(userId ?? null);
    const canSecurityView = useHasPermission('SecurityView');

    const [tab, setTab] = React.useState('overview');
    const [suspendOpen, setSuspendOpen] = React.useState(false);
    const [activateOpen, setActivateOpen] = React.useState(false);
    const [roleOpen, setRoleOpen] = React.useState(false);
    const [lockOpen, setLockOpen] = React.useState(false);

    const suspend = useSuspendUser();
    const activate = useActivateUser();
    const lock = useLockUser();

    const tabs = React.useMemo(() => {
        const list = [
            { id: 'overview', label: 'Overview' },
            { id: 'profile', label: profileTabLabel(data?.role) },
        ];
        if (canSecurityView) list.push({ id: 'security', label: 'Security' });
        list.push({ id: 'activity', label: 'Activity' });
        return list;
    }, [data?.role, canSecurityView]);

    return (
        <AdminPageLayout
            title={data?.name ?? 'User detail'}
            subtitle={data?.email}
            breadcrumbs={[
                { label: 'Users & Roles' },
                { label: 'All Users', to: '/admin/users' },
                { label: data?.name ?? 'Detail' },
            ]}
        >
            {isLoading ? (
                <AdminLoading />
            ) : error || !data ? (
                <AdminError error={error} message="This user could not be found." />
            ) : (
                <>
                    <UserDetailHeader
                        user={data}
                        profile={profile.data}
                        profileLoading={profile.isLoading}
                        onSuspend={() => setSuspendOpen(true)}
                        onActivate={() => setActivateOpen(true)}
                        onChangeRole={() => setRoleOpen(true)}
                        onLock={() => setLockOpen(true)}
                        actionPending={suspend.isPending || activate.isPending}
                    />

                    <Box>
                        <AnimatedTabs
                            tabs={tabs}
                            activeTab={tab}
                            onTabChange={setTab}
                            size="sm"
                        />
                    </Box>

                    {tab === 'overview' && <OverviewTab user={data} profile={profile.data} />}
                    {tab === 'profile' &&
                        (profile.isLoading && !profile.data ? (
                            <AdminLoading />
                        ) : profile.error || !profile.data ? (
                            <AdminError
                                error={profile.error}
                                message="Could not load this user's profile."
                            />
                        ) : (
                            <RoleProfileTab profile={profile.data} />
                        ))}
                    {tab === 'security' && canSecurityView && (
                        <UserSecurityTab userId={data.id} userName={data.name} />
                    )}
                    {tab === 'activity' && <UserAuditTab userId={data.id} />}

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

                    <ConfirmActionModal
                        isOpen={lockOpen}
                        onClose={() => setLockOpen(false)}
                        onConfirm={(reason) =>
                            lock.mutate(
                                { userId: data.id, reason },
                                { onSuccess: () => setLockOpen(false) },
                            )
                        }
                        title={`Lock ${data.name}`}
                        message="The user will be signed out of every session and blocked from signing in until unlocked."
                        reasonLabel="Lock reason"
                        placeholder="e.g. Suspicious sign-in activity from multiple regions."
                        confirmText="Lock account"
                        tone="danger"
                        isLoading={lock.isPending}
                    />

                    <ChangeUserRoleModal
                        isOpen={roleOpen}
                        onClose={() => setRoleOpen(false)}
                        user={data}
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default UserDetailPage;
