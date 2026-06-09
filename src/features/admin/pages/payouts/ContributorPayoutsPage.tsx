import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';
import { PLATFORM_ROLES } from '../../config/adminRoles';

/** Dedicated payout-request queue for the Contributors role (CR1 per-role separation). */
const ContributorPayoutsPage: React.FC = () => <RolePayoutsQueue meta={PLATFORM_ROLES.contributor} />;

export default ContributorPayoutsPage;
