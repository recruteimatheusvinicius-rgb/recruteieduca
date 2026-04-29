import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface ListItemProps {
  children: ReactNode;
  index?: number;
}

const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  }),
};

export function ListItem({ children, index = 0 }: ListItemProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={listItemVariants}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}