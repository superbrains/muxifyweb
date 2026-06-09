import React from 'react';
import { AdminPageLayout } from '../../components/ui';
import { AdminsTab } from '../../components/management/AdminsTab';

/**
 * Admin Team — every staff account with console access, plus the invite/revoke
 * flow and pending invitations. Split out of the legacy tabbed Admin Management
 * page into its own route.
 */
const AdminTeamPage: React.FC = () => (
    <AdminPageLayout
        title="Admin Team"
        subtitle="Invite staff, review pending invitations and manage console access"
        breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Admin Team' }]}
    >
        <AdminsTab />
    </AdminPageLayout>
);

export default AdminTeamPage;
