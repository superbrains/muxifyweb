import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
            )}
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};
