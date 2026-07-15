import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
      <div className="container-app py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/">
            <Logo size={32} />
          </Link>

          <div className="flex items-center gap-6 text-sm text-surface-500 dark:text-surface-300">
            <Link to="/help" className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors cursor-pointer">
              Ajuda
            </Link>
            <a href="#" className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors cursor-pointer">
              Termos
            </a>
            <a href="#" className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors cursor-pointer">
              Privacidade
            </a>
          </div>

          <p className="text-sm text-surface-400 dark:text-surface-300">
            © {new Date().getFullYear()} RecruteiEduca
          </p>
        </div>
      </div>
    </footer>
  );
};
