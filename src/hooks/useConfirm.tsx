import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

type Variant = 'danger' | 'warning' | 'info';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  onConfirm: () => void | Promise<void>;
}

interface State extends ConfirmOptions {
  isOpen: boolean;
}

const ConfirmContext = createContext<((opts: ConfirmOptions) => void) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = useCallback((opts: ConfirmOptions) => {
    setState({ ...opts, isOpen: true });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={state.isOpen}
        onClose={close}
        onConfirm={async () => {
          await state.onConfirm();
          close();
        }}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used inside <ConfirmProvider>');
  }
  return ctx;
}
