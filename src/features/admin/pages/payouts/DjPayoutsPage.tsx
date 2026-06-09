import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';
import { PLATFORM_ROLES } from '../../config/adminRoles';

/** Dedicated payout-request queue for the DJs role (CR1 per-role separation). */
const DjPayoutsPage: React.FC = () => <RolePayoutsQueue meta={PLATFORM_ROLES.dj} />;

export default DjPayoutsPage;
