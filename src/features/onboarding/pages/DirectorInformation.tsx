import React from 'react';
import { OnboardingShell } from '../components/OnboardingShell';
import { DirectorInformationForm } from '../components/DirectorInformationForm';

export const DirectorInformation: React.FC = () => {
    return (
        <OnboardingShell currentStep={4} totalSteps={6}>
            <DirectorInformationForm />
        </OnboardingShell>
    );
};

export default DirectorInformation;
