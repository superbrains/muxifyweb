import React from 'react';
import { AdminPageLayout } from '../../components/ui';
import { TicketsPanel } from '../../components/support/TicketsPanel';
import { PLATFORM_ROLES } from '../../config/adminRoles';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { NoAccess } from './NoAccess';

const meta = PLATFORM_ROLES.ad_manager;

/** Advertiser support — REUSES the per-role support queue scoped to ad_manager tickets. */
const AdvertiserSupportPage: React.FC = () => {
    const canView = useHasPermission('SupportView');
    return (
        <AdminPageLayout
            title="Advertiser Support"
            subtitle={`Resolve support tickets opened by ${meta.plural.toLowerCase()}`}
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Support' }]}
        >
            {!canView ? <NoAccess /> : <TicketsPanel role={meta.role} />}
        </AdminPageLayout>
    );
};

export default AdvertiserSupportPage;
