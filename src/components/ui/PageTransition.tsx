import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Transição suave entre rotas via CSS keyframe (page-enter):
 * - Sem opacity 0 (não há blank/flash)
 * - 0.92 → 1 + 4px → 0 em 180ms
 * - Sem `exit` nem `mode="wait"` — a página antiga é trocada na hora
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  const skipAnimation =
    location.pathname === '/login' ||
    location.pathname.startsWith('/invite') ||
    location.pathname === '/complete-profile' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  if (skipAnimation) return <>{children}</>;

  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}
