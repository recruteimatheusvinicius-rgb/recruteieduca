import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', padding = 'md', hover = false, onClick }: CardProps) => {
  const paddingSizes = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const cardVariants = {
    rest: { 
      y: 0,
      boxShadow: '0 0 0 0 transparent',
    },
    hover: { 
      y: -2,
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      transition: {
        duration: 0.2,
        ease: 'easeOut' as const,
      },
    },
  };

  if (hover || onClick) {
    return (
      <motion.div
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        onClick={onClick}
        className={`
          bg-white dark:bg-surface-800 
          rounded-xl border border-surface-200 dark:border-surface-700
          cursor-pointer
          ${paddingSizes[padding]}
          ${className}
        `}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`
      bg-white dark:bg-surface-800 
      rounded-xl border border-surface-200 dark:border-surface-700
      ${paddingSizes[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
};