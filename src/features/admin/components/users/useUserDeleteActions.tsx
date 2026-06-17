import React from 'react';
import { ConfirmModal } from '@shared/components';
import { ConfirmActionModal } from '../ui';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    usePermanentDeleteUser,
    useRestoreUser,
    useSoftDeleteUser,
} from '../../hooks/useUsers';

/** Minimal shape every user-listing row exposes for the delete/restore actions. */
export interface DeletableUser {
    id: string;
    name: string;
    isDeleted?: boolean;
}

interface DeleteMenuOption {
    label: string;
    value: string;
    color?: string;
    onClick: () => void;
}

/**
 * Shared controller for the Soft Delete / Permanently Delete / Restore user
 * actions used across every "Users & Roles" listing (universal directory,
 * per-role pages, security activity) and the user detail page.
 *
 * `menuOptions(user)` returns the per-row `CustomMenu` options to append (empty
 * when the staff member lacks `UsersDelete`); `modals` renders the three
 * confirmation dialogs and must be placed once in the page tree. `canDelete`
 * lets callers hide standalone buttons.
 */
export const useUserDeleteActions = () => {
    const canDelete = useHasPermission('UsersDelete');
    const softDelete = useSoftDeleteUser();
    const restore = useRestoreUser();
    const permanentDelete = usePermanentDeleteUser();

    const [softTarget, setSoftTarget] = React.useState<DeletableUser | null>(null);
    const [restoreTarget, setRestoreTarget] = React.useState<DeletableUser | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<DeletableUser | null>(null);

    const menuOptions = (u: DeletableUser): DeleteMenuOption[] => {
        if (!canDelete) return [];
        if (u.isDeleted) {
            return [
                {
                    label: 'Restore account',
                    value: 'restore',
                    color: '#16A34A',
                    onClick: () => setRestoreTarget(u),
                },
                {
                    label: 'Permanently delete',
                    value: 'permanent-delete',
                    color: '#C53030',
                    onClick: () => setDeleteTarget(u),
                },
            ];
        }
        return [
            {
                label: 'Soft delete account',
                value: 'soft-delete',
                color: '#D97706',
                onClick: () => setSoftTarget(u),
            },
            {
                label: 'Permanently delete',
                value: 'permanent-delete',
                color: '#C53030',
                onClick: () => setDeleteTarget(u),
            },
        ];
    };

    const modals = (
        <>
            <ConfirmActionModal
                isOpen={softTarget !== null}
                onClose={() => setSoftTarget(null)}
                onConfirm={(reason) =>
                    softTarget &&
                    softDelete.mutate(
                        { userId: softTarget.id, reason },
                        { onSuccess: () => setSoftTarget(null) },
                    )
                }
                title={`Soft delete ${softTarget?.name ?? 'account'}`}
                message="The account will be hidden everywhere and the user can no longer sign in. You can restore it later from the Deleted view."
                reasonLabel="Deletion reason"
                placeholder="e.g. User requested account deletion."
                confirmText="Soft delete account"
                tone="warning"
                isLoading={softDelete.isPending}
            />

            <ConfirmActionModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={(reason) =>
                    deleteTarget &&
                    permanentDelete.mutate(
                        { userId: deleteTarget.id, reason },
                        { onSuccess: () => setDeleteTarget(null) },
                    )
                }
                title={`Permanently delete ${deleteTarget?.name ?? 'account'}`}
                message="This permanently removes the account and cannot be undone. Accounts with financial or content history cannot be permanently deleted — soft-delete them instead."
                reasonLabel="Deletion reason"
                placeholder="e.g. GDPR erasure request."
                confirmText="Permanently delete"
                tone="danger"
                isLoading={permanentDelete.isPending}
            />

            <ConfirmModal
                isOpen={restoreTarget !== null}
                onClose={() => setRestoreTarget(null)}
                onConfirm={() =>
                    restoreTarget &&
                    restore.mutate(restoreTarget.id, {
                        onSuccess: () => setRestoreTarget(null),
                    })
                }
                title="Restore account?"
                message={`${restoreTarget?.name ?? 'This user'} will be able to sign in again immediately.`}
                confirmText="Restore"
                confirmColor="blue"
                isLoading={restore.isPending}
            />
        </>
    );

    return { canDelete, menuOptions, modals };
};
