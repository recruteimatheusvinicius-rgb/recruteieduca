import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // onClose costuma ser recriado a cada render do pai; usar ref evita que o
  // efeito abaixo (e o autofocus) rode de novo a cada keystroke.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Esc fecha + body scroll lock + autofocus no primeiro input
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Autofocus no primeiro campo focável após a animação
    const focusTimer = window.setTimeout(() => {
      const el = contentRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      el?.focus();
    }, 80);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={contentRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative bg-surface-50 dark:bg-surface-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
          >
            <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700 sticky top-0 bg-surface-50 dark:bg-surface-800 z-10">
              <h2 id="modal-title" className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
