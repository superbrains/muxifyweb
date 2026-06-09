import React from 'react';
import { AdminPageLayout } from '../../../components/ui';
import { ModerationPanel } from '../../../components/support/ModerationPanel';
import { PLATFORM_ROLES } from '../../../config/adminRoles';

const meta = PLATFORM_ROLES.creator;

/** Per-role moderation queue for content-creator-owned content (CR1 separation). */
const CreatorModerationPage: React.FC = () => (
    <AdminPageLayout
        title={`${meta.plural} Moderation`}
        subtitle={`Review and act on flagged content owned by ${meta.plural.toLowerCase()}`}
        breadcrumbs={[{ label: 'Content' }, { label: 'Moderation' }, { label: meta.plural }]}
    >
        <ModerationPanel ownerRole={meta.role} />
    </AdminPageLayout>
);

export default CreatorModerationPage;
