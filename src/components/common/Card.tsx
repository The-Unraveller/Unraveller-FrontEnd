import * as React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick,
  id,
}) => {
  const base: Record<string, string> = {
    default:  'ur-card',
    glass:    'glass-card',
    gradient: 'gradient-card',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`${base[variant]} ${hover ? 'ur-card-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
