import { Toaster } from 'sonner';
import { useThemeStore } from '../../stores/themeStore';

export const ToastProvider = () => {
  const { theme } = useThemeStore();
  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
    />
  );
};
