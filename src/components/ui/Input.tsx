import type { ReactNode, InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = ({ label, error, icon, size = 'md', className = '', ...props }: InputProps) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-lg border border-surface-200 dark:border-surface-700
            bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
            placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${sizes[size]}
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

type SearchInputProps = Omit<InputProps, 'icon'>;

export const SearchInput = (props: SearchInputProps) => {
  return (
    <Input
      icon={<Search size={18} />}
      placeholder="Buscar..."
      {...props}
    />
  );
};