import React from 'react';
import { OnboardingShell } from '../components/OnboardingShell';
import { ReusableEmailVerification } from '../components/ReusableEmailVerification';

export const CompanyEmailVerification: React.FC = () => {
    return (
        <OnboardingShell currentStep={2} totalSteps={6}>
            <ReusableEmailVerification
                title="Verify Email Address"
                nextRoute="/onboarding/company/company-information"
            />
        </OnboardingShell>
    );
};

export default CompanyEmailVerification;
