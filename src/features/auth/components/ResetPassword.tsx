import React, { useState, useEffect } from 'react';
import { useToast } from '@shared/hooks';
import { authService } from '@shared/services/auth';
import { NewPasswordForm } from './NewPasswordForm';
import { InitialResetForm } from './InitialResetForm';
import { EmailVerification } from './EmailVerification';
import { SentConfirmation } from './SentConfirmation';

export const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [creatingPassword, setCreatingPassword] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const { toast } = useToast();

    // Resend timer effect
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEmail(value);
        if (error) {
            setError('');
        }
    };

    const validateForm = (): boolean => {
        if (!email) {
            setError('Email or phone number is required');
            return false;
        }

        // Check if it's an email
        const isEmail = /\S+@\S+\.\S+/.test(email);
        // Check if it's a phone number (basic validation)
        const isPhone = /^[+]?[1-9][\d]{0,15}$/.test(email.replace(/[\s\-()]/g, ''));

        if (!isEmail && !isPhone) {
            setError('Please enter a valid email address or phone number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await authService.forgotPassword(email);
            setSent(true);
            setVerifying(true);
            setResendTimer(60); // 60 seconds timer
            toast.success('Verification code sent!', 'Check your email for the verification code.');
        } catch (error: unknown) {
            let errorMessage = 'Something went wrong';
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || 'Something went wrong';
            }
            setError(errorMessage);
            toast.error('Failed to send verification code', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSubmit = async () => {
        if (verificationCode.length !== 5) {
            setError('Please enter the complete verification code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Here you would typically verify the code with your backend
            // For now, we'll simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Verification successful!', 'You can now create a new password.');
            setVerifying(false);
            setCreatingPassword(true);
        } catch (error: unknown) {
            let errorMessage = 'Invalid verification code';
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || 'Invalid verification code';
            }
            setError(errorMessage);
            toast.error('Verification failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        setError('');

        try {
            await authService.forgotPassword(email);
            setResendTimer(60);
            toast.success('Code resent!', 'Check your email for the new verification code.');
        } catch (error: unknown) {
            let errorMessage = 'Failed to resend code';
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || 'Failed to resend code';
            }
            setError(errorMessage);
            toast.error('Resend failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToVerification = () => {
        setCreatingPassword(false);
        setVerifying(true);
    };

    const handleVerificationCodeChange = (code: string) => {
        setVerificationCode(code);
        if (error) {
            setError('');
        }
    };

    if (creatingPassword) {
        return (
            <NewPasswordForm
                email={email}
                verificationCode={verificationCode}
                onBack={handleBackToVerification}
            />
        );
    }

    if (verifying) {
        return (
            <EmailVerification
                email={email}
                verificationCode={verificationCode}
                error={error}
                loading={loading}
                resendTimer={resendTimer}
                onCodeChange={handleVerificationCodeChange}
                onSubmit={handleVerificationSubmit}
                onResend={handleResendCode}
            />
        );
    }

    if (sent && !verifying) {
        return (
            <SentConfirmation
                email={email}
                onTryAnother={() => {
                    setSent(false);
                    setVerifying(false);
                    setCreatingPassword(false);
                    setEmail('');
                    setVerificationCode('');
                }}
            />
        );
    }

    return (
        <InitialResetForm
            email={email}
            error={error}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    );
};
