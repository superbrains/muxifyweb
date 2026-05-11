import React from 'react';
import { OnboardingShell } from '../components/OnboardingShell';
import { CompanyInformationForm } from '../components/CompanyInformationForm';

export const CompanyInformation: React.FC = () => {
    return (
        <OnboardingShell currentStep={3} totalSteps={6}>
            <CompanyInformationForm />
        </OnboardingShell>
    );
};

export default CompanyInformation;
