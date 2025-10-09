import React from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    text,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`} />
            {text && (
                <p className="mt-2 text-sm text-gray-600">{text}</p>
            )}
        </div>
    );
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`} />
    );
};
