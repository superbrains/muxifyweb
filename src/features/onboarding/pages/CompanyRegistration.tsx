import React from 'react';
import { OnboardingShell } from '../components/OnboardingShell';
import { CompanyRegistrationForm } from '../components/CompanyRegistrationForm';

export const CompanyRegistration: React.FC = () => {
    return (
        <OnboardingShell currentStep={1} totalSteps={6}>
            <CompanyRegistrationForm />
        </OnboardingShell>
    );
};

export default CompanyRegistration;
