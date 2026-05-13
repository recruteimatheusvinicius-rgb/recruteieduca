import { Toaster } from 'sonner';

export const ToastProvider = () => (
  <Toaster 
    position="top-right" 
    richColors 
    toastOptions={{
      style: {
        background: 'var(--surface-800)',
        color: 'var(--surface-100)',
        border: '1px solid var(--surface-700)',
      },
    }}
  />
);