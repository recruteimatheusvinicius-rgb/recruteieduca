import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}: ButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-hover active:scale-[0.98]',
    secondary: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 border border-surface-100 dark:border-surface-700 hover:bg-surface-200 dark:hover:bg-surface-700 active:scale-[0.98]',
    ghost: 'text-surface-500 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};