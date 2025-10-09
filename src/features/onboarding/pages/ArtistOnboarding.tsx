import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ArtistOnboarding: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the artist registration form
        navigate('/onboarding/artist/register', { replace: true });
    }, [navigate]);

    return null;
};

export default ArtistOnboarding;
