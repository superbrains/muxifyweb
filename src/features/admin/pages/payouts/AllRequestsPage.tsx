import React from 'react';
import { RolePayoutsQueue } from '../../components/finance/RolePayoutsQueue';

/**
 * Consolidated payout requests across every role. Renders the shared withdrawal
 * console in all-roles mode (role filter + cross-role KPIs); the per-role pages
 * render the same component locked to a single creator role.
 */
const AllRequestsPage: React.FC = () => <RolePayoutsQueue />;

export default AllRequestsPage;
