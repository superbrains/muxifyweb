import React from 'react';
import { OnboardingShell } from '../components/OnboardingShell';
import { ReusableImageUpload } from '../components/ReusableImageUpload';

export const LabelLogo: React.FC = () => {
    return (
        <OnboardingShell currentStep={5} totalSteps={6}>
            <ReusableImageUpload
                title="Label Logo"
                subtitle="This appears on your roster, releases, and payout statements."
                nextRoute="/onboarding/company/identity-verification"
                uploadType="logo"
            />
        </OnboardingShell>
    );
};

export default LabelLogo;
