import React from 'react';
import { OnboardingShell } from '../components/OnboardingShell';
import { IdentityVerificationPrompt } from '../components/IdentityVerificationPrompt';

export const CompanyIdentityVerification: React.FC = () => {
    return (
        <OnboardingShell currentStep={6} totalSteps={6}>
            <IdentityVerificationPrompt />
        </OnboardingShell>
    );
};

export default CompanyIdentityVerification;
