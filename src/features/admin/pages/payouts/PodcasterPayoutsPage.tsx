import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';
import { PLATFORM_ROLES } from '../../config/adminRoles';

/** Dedicated payout-request queue for the Podcasters role (CR1 per-role separation). */
const PodcasterPayoutsPage: React.FC = () => <RolePayoutsQueue meta={PLATFORM_ROLES.podcaster} />;

export default PodcasterPayoutsPage;
