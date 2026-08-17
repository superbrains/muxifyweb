import React from 'react';
import { FiMusic } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    ConfirmActionModal,
    DataTable,
    FilterBar,
    KpiStrip,
} from '@shared/console';
import { ConfirmModal } from '@shared/components';
import { PLATFORM_ROLES } from '../../config/adminRoles';
import { ROLE_STATUS_OPTIONS, ROLE_VERIFICATION_OPTIONS, useRoleUsers } from './useRoleUsers';
import type { UserQuery } from '../../types';

const meta = PLATFORM_ROLES.dj;

/** Dedicated management page for the DJs role (CR1 per-role separation). */
const DjsPage: React.FC = () => {
    const c = useRoleUsers('dj');

    return (
        <AdminPageLayout
            title={`${meta.plural} Management`}
            subtitle="Browse, verify and manage every DJ on the platform"
            breadcrumbs={[{ label: 'Users & Roles' }, { label: meta.plural }]}
        >
            <KpiStrip items={c.kpiItems} columns={{ base: 2, md: 3, xl: 5 }} />

            <FilterBar
                search={{
                    value: c.query.search ?? '',
                    onChange: (v) => c.setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                    placeholder: 'Search by name or email',
                }}
                filters={[
                    {
                        key: 'status',
                        value: (c.query.status ?? 'All') as string,
                        onChange: (v) => c.setQuery((q) => ({ ...q, status: v as UserQuery['status'], page: 1 })),
                        options: ROLE_STATUS_OPTIONS,
                    },
                    {
                        key: 'verification',
                        value: (c.query.verification ?? 'All') as string,
                        onChange: (v) => c.setQuery((q) => ({ ...q, verification: v as UserQuery['verification'], page: 1 })),
                        options: ROLE_VERIFICATION_OPTIONS,
                        width: '160px',
                    },
                ]}
            />

            {c.error ? (
                <AdminError error={c.error} message={`Could not load ${meta.plural.toLowerCase()}.`} />
            ) : (
                <DataTable
                    columns={c.columns}
                    rows={c.data?.items ?? []}
                    rowKey={(u) => u.id}
                    onRowClick={(u) => c.navigate(`/admin/users/${u.id}`)}
                    loading={c.isLoading && !c.data}
                    emptyIcon={FiMusic}
                    emptyTitle={`No ${meta.plural.toLowerCase()} found`}
                    emptyDescription="Nothing matches the current filters."
                    pagination={
                        c.data
                            ? {
                                  page: c.data.page,
                                  pageSize: c.data.pageSize,
                                  total: c.data.total,
                                  onPageChange: (page) => c.setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            <ConfirmActionModal
                isOpen={c.suspendTarget !== null}
                onClose={() => c.setSuspendTarget(null)}
                onConfirm={(reason) =>
                    c.suspendTarget &&
                    c.suspend.mutate(
                        { userId: c.suspendTarget.id, reason },
                        { onSuccess: () => c.setSuspendTarget(null) },
                    )
                }
                title={`Suspend ${c.suspendTarget?.name ?? 'account'}`}
                message="The user will be signed out and blocked from signing in until reactivated."
                reasonLabel="Suspension reason"
                placeholder="e.g. Repeated violations of the content policy after warnings."
                confirmText="Suspend account"
                tone="danger"
                isLoading={c.suspend.isPending}
            />

            <ConfirmModal
                isOpen={c.activateTarget !== null}
                onClose={() => c.setActivateTarget(null)}
                onConfirm={() =>
                    c.activateTarget &&
                    c.activate.mutate(c.activateTarget.id, { onSuccess: () => c.setActivateTarget(null) })
                }
                title="Reactivate account?"
                message={`${c.activateTarget?.name ?? 'This user'} will be able to sign in again immediately.`}
                confirmText="Reactivate"
                confirmColor="blue"
                isLoading={c.activate.isPending}
            />

            {c.deleteActions.modals}
        </AdminPageLayout>
    );
};

export default DjsPage;
