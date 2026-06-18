import React from 'react';
import { Box } from '@chakra-ui/react';
import { DisputesPageContent } from '@/features/disputes/components/DisputesPageContent';
import { CONTRIBUTOR_DISPUTE_CONFIG } from '@/features/disputes/config/roleConfig';

/**
 * Contributor self-service disputes. Now renders the shared dispute experience
 * (KPI strip + filter + table + detail drawer + raise dialog) so it matches the
 * artist / label / ad-manager dispute pages — using the contributor endpoint and
 * payment-only subjects. Wrapped in the same soft canvas the other contributor
 * pages use (the contributor area has no sidebar shell of its own).
 */
const ContributorDisputesPage: React.FC = () => (
    <Box bg="gray.50" minH="100vh" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
        <DisputesPageContent config={CONTRIBUTOR_DISPUTE_CONFIG} />
    </Box>
);

export default ContributorDisputesPage;
