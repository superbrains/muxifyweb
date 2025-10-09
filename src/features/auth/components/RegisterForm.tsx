import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@shared/components';
import { useAuth } from '@app/hooks/useAuth';
import { useToast } from '@shared/hooks';
import { authService } from '@shared/services/auth';
import type { RegisterData } from '@shared/services/auth';

export const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        email: '',
        password: '',
        name: '',
        role: 'artist',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});

    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await authService.register(formData);
            const { user, token } = response.data;

            localStorage.setItem('auth_token', token);
            login(user);

            toast.success('Welcome to Muxify!', 'Your account has been created successfully.');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error('Registration failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Input
                    label="Full name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    leftIcon="👤"
                />
            </div>

            <div>
                <Input
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email"
                    leftIcon="📧"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account type
                </label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="artist">Artist</option>
                    <option value="dj">DJ</option>
                    <option value="creator">Creator</option>
                    <option value="record_label">Record Label</option>
                </select>
            </div>

            <div>
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Create a password"
                    leftIcon="🔒"
                />
            </div>

            <div>
                <Input
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                    leftIcon="🔒"
                />
            </div>

            <div>
                <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                >
                    Create account
                </Button>
            </div>

            <div className="text-center">
                <span className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </a>
                </span>
            </div>
        </form>
    );
};
