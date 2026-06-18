import React from 'react';
import { DisputesPageContent } from '../components/DisputesPageContent';
import { ARTIST_DISPUTE_CONFIG } from '../config/roleConfig';

/** Self-service disputes for artists / DJs / creators / podcasters. */
const ArtistDisputesPage: React.FC = () => <DisputesPageContent config={ARTIST_DISPUTE_CONFIG} />;

export default ArtistDisputesPage;
