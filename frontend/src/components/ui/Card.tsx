import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const baseClasses = 'bg-white rounded-lg shadow-md border border-gray-200';
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300 transition-all duration-200' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;