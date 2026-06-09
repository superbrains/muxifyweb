import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';
import { PLATFORM_ROLES } from '../../config/adminRoles';

/** Dedicated payout-request queue for the Record Labels role (CR1 per-role separation). */
const RecordLabelPayoutsPage: React.FC = () => <RolePayoutsQueue meta={PLATFORM_ROLES.record_label} />;

export default RecordLabelPayoutsPage;
