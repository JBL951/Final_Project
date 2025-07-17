import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray', 
  size = 'md', 
  className = '' 
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-error-100 text-error-800 border-error-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;