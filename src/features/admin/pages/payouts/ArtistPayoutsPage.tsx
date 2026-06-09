import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';
import { PLATFORM_ROLES } from '../../config/adminRoles';

/** Dedicated payout-request queue for the Artists role (CR1 per-role separation). */
const ArtistPayoutsPage: React.FC = () => <RolePayoutsQueue meta={PLATFORM_ROLES.artist} />;

export default ArtistPayoutsPage;
