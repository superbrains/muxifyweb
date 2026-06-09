import React from 'react';
import { FiLock } from 'react-icons/fi';
import { AdminEmptyState } from '../../components/ui';

/** Shared "no permission" surface for the view-gated Support & Governance pages. */
export const NoAccess: React.FC<{ description?: string }> = ({
    description = 'You do not hold the permission required to view this area.',
}) => (
    <AdminEmptyState
        icon={FiLock}
        title="You do not have access"
        description={description}
    />
);
