import React from 'react';
import { AdminPageLayout } from '@shared/console';
import { RolesTab } from '../../components/management/RolesTab';

/**
 * Roles & Permissions — create, edit and delete custom admin roles and the
 * permission set (plus role-scope) each one bundles. Split out of the legacy
 * tabbed Admin Management page into its own route.
 */
const RolesPermissionsPage: React.FC = () => (
    <AdminPageLayout
        title="Roles & Permissions"
        subtitle="Bundle permissions into roles and scope which platform roles each operates on"
        breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Roles & Permissions' }]}
    >
        <RolesTab />
    </AdminPageLayout>
);

export default RolesPermissionsPage;
