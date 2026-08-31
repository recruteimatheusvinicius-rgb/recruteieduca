import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/ui/Footer';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const navLinks = [
  { path: '/', label: 'Início' },
  { path: '/cursos', label: 'Cursos' },
  { path: '/conteudos', label: 'Conteúdos' },
  { path: '/criar-conta', label: 'Criar conta' },
];

export const MarketingLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { initialize } = useDataStore();
  const { isAuthenticated, user } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Quem já está logado não deveria ver o site institucional — manda direto pra área dele
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Transição entre abas: some com a página anterior, entra a nova com fade + leve subida.
  // Sem ScrollTrigger nem libs de smooth-scroll — o scroll da página continua o padrão do navegador.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => mm.revert();
  }, { dependencies: [location.pathname], scope: contentRef });

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800">
        <div className="container-app flex items-center justify-between h-16">
          <Link to="/">
            <Logo size={34} />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive(link.path)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link to="/login">
            <Button>
              Entrar
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </nav>

      <div ref={contentRef}>
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};
