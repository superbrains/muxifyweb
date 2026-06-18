import React from 'react';
import { DisputesPageContent } from '../components/DisputesPageContent';
import { AD_MANAGER_DISPUTE_CONFIG } from '../config/roleConfig';

/** Self-service disputes for ad managers. */
const AdManagerDisputesPage: React.FC = () => <DisputesPageContent config={AD_MANAGER_DISPUTE_CONFIG} />;

export default AdManagerDisputesPage;
