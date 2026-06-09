import React from 'react';
import { AdminPageLayout } from '../../components/ui';
import { TicketsPanel } from '../../components/support/TicketsPanel';
import { PLATFORM_ROLES } from '../../config/adminRoles';

const meta = PLATFORM_ROLES.record_label;

/** Per-role support queue for tickets opened by record labels (CR1 separation). */
const RecordLabelSupportPage: React.FC = () => (
    <AdminPageLayout
        title={`${meta.plural} Support`}
        subtitle={`Resolve support tickets opened by ${meta.plural.toLowerCase()}`}
        breadcrumbs={[
            { label: 'Support & Governance' },
            { label: 'Support' },
            { label: meta.plural },
        ]}
    >
        <TicketsPanel role={meta.role} />
    </AdminPageLayout>
);

export default RecordLabelSupportPage;
