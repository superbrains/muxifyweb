import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';
import { PLATFORM_ROLES } from '../../config/adminRoles';

/** Dedicated payout-request queue for the Content Creators role (CR1 per-role separation). */
const CreatorPayoutsPage: React.FC = () => <RolePayoutsQueue meta={PLATFORM_ROLES.creator} />;

export default CreatorPayoutsPage;
