import React from 'react';
import { DisputesPageContent } from '../components/DisputesPageContent';
import { LABEL_DISPUTE_CONFIG } from '../config/roleConfig';

/** Self-service disputes for record labels. */
const LabelDisputesPage: React.FC = () => <DisputesPageContent config={LABEL_DISPUTE_CONFIG} />;

export default LabelDisputesPage;
