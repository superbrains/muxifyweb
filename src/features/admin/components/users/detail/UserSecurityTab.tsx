import React from 'react';
import { Box } from '@chakra-ui/react';
import { ConfirmActionModal } from '@shared/console';
import { SecurityPanelBody } from '../../security/SecurityPanelBody';
import { useLockUser } from '../../../hooks/useSecurity';

/**
 * Security tab on the user detail page — the same per-user panel the Security
 * Activity drawer shows (sessions, devices, lock/force-logout actions).
 */
export const UserSecurityTab: React.FC<{ userId: string; userName: string }> = ({
    userId,
    userName,
}) => {
    const [lockOpen, setLockOpen] = React.useState(false);
    const lock = useLockUser();

    return (
        <Box
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            p={5}
            maxW="3xl"
        >
            <SecurityPanelBody
                userId={userId}
                onLock={() => setLockOpen(true)}
                kpiColumns={3}
            />

            <ConfirmActionModal
                isOpen={lockOpen}
                onClose={() => setLockOpen(false)}
                onConfirm={(reason) =>
                    lock.mutate(
                        { userId, reason },
                        { onSuccess: () => setLockOpen(false) },
                    )
                }
                title={`Lock ${userName}`}
                message="The user will be signed out of every session and blocked from signing in until unlocked."
                reasonLabel="Lock reason"
                placeholder="e.g. Suspicious sign-in activity from multiple regions."
                confirmText="Lock account"
                tone="danger"
                isLoading={lock.isPending}
            />
        </Box>
    );
};
