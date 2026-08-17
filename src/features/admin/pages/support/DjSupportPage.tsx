import React from 'react';
import { AdminPageLayout } from '@shared/console';
import { TicketsPanel } from '../../components/support/TicketsPanel';
import { PLATFORM_ROLES } from '../../config/adminRoles';

const meta = PLATFORM_ROLES.dj;

/** Per-role support queue for tickets opened by DJs (CR1 separation). */
const DjSupportPage: React.FC = () => (
    <AdminPageLayout
        title={`${meta.plural} Support`}
        subtitle={`Resolve support tickets opened by ${meta.plural}`}
        breadcrumbs={[
            { label: 'Support & Governance' },
            { label: 'Support' },
            { label: meta.plural },
        ]}
    >
        <TicketsPanel role={meta.role} />
    </AdminPageLayout>
);

export default DjSupportPage;
