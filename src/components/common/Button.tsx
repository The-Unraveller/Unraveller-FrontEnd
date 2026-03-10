import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 font-bold uppercase transition-all flex items-center justify-center gap-2 tracking-widest text-xs';
  const variants = {
    primary: 'bg-spy-green text-black hover:bg-white',
    outline: 'border border-spy-green text-spy-green hover:bg-spy-green hover:text-black',
    danger: 'border border-spy-red text-spy-red hover:bg-spy-red hover:text-black',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
