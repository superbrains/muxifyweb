import React from 'react';
import { FiLock } from 'react-icons/fi';
import { AdminEmptyState } from '../../components/ui';

/** Shared "no permission" surface for view-gated advertising pages. */
export const NoAccess: React.FC = () => (
    <AdminEmptyState
        icon={FiLock}
        title="You do not have access"
        description="This area requires the advertising view permission."
    />
);
