import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn' as const,
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  // Skip animation for auth pages to prevent flashes
  const skipAnimation = location.pathname === '/login' || location.pathname.startsWith('/invite') || location.pathname === '/complete-profile' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  if (skipAnimation) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}