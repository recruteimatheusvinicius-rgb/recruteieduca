import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
      <div className="container-app py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-surface-900 dark:text-surface-100">
              Recrutei<span className="text-primary-600">Educa</span>
            </span>
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