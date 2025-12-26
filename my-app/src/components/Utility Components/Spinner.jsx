import React from 'react';
import './Spinner.css';

export const Spinner = ({ size = 'md', color = 'primary' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    const colorClasses = {
        primary: 'border-blue-500',
        secondary: 'border-gray-500',
        success: 'border-green-500',
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-transparent border-t-current rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export default Spinner;