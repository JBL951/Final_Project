import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: LucideIcon;
  rows?: number;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon: Icon,
  rows = 3,
  className = '',
}) => {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  
  const errorClasses = error ? 'border-error-500 focus:ring-error-500' : '';

  const inputElement = type === 'textarea' ? (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      rows={rows}
      className={`${baseClasses} ${errorClasses} ${className}`}
    />
  ) : (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className={`${baseClasses} ${errorClasses} ${Icon ? 'pl-10' : ''} ${className}`}
    />
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && type !== 'textarea' && (
          <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        )}
        {inputElement}
      </div>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};

export default Input;