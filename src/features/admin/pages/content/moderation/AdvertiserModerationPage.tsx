import React from 'react';
import { AdminPageLayout } from '@shared/console';
import { ModerationPanel } from '../../../components/support/ModerationPanel';
import { PLATFORM_ROLES } from '../../../config/adminRoles';

const meta = PLATFORM_ROLES.ad_manager;

/** Per-role moderation queue for advertiser (ad_manager) content (CR1 separation). */
const AdvertiserModerationPage: React.FC = () => (
    <AdminPageLayout
        title={`${meta.plural} Moderation`}
        subtitle={`Review and act on flagged content owned by ${meta.plural.toLowerCase()}`}
        breadcrumbs={[{ label: 'Content' }, { label: 'Moderation' }, { label: meta.plural }]}
    >
        <ModerationPanel ownerRole={meta.role} />
    </AdminPageLayout>
);

export default AdvertiserModerationPage;
