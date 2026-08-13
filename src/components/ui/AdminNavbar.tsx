import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationPanel } from './NotificationPanel';
import { Logo } from './Logo';
import { Moon, Sun, Bell, User, LogOut, Settings, Menu, X, ChevronDown, BookOpen, Home, HelpCircle, MessageCircle, Building, ListChecks } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const AdminNavbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { unreadCount, togglePanel, isOpen, closePanel } = useNotificationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { path: '/admin', label: 'Dashboard', icon: Settings },
    { path: '/admin/manage', label: 'Gerenciar', icon: Settings },
    { path: '/admin/companies', label: 'Empresas', icon: Building },
    { path: '/admin/onboarding-templates', label: 'Checklists', icon: ListChecks },
    { path: '/home', label: 'Início', icon: Home },
    { path: '/my-courses', label: 'Meus Cursos', icon: BookOpen },
    { path: '/help', label: 'Ajuda', icon: HelpCircle },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (isOpen && notifRef.current && !notifRef.current.contains(target)) {
        closePanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closePanel]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleGoToProfile = () => {
    navigate('/profile');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="flex items-center group">
              <Logo size={36} className="group-hover:scale-105 transition-transform" />
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold
                    whitespace-nowrap border transition-colors
                    ${isActive(link.path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
                      : 'text-surface-500 dark:text-surface-300 bg-transparent border-transparent hover:bg-surface-50 dark:hover:bg-surface-800/60 hover:text-surface-900 dark:hover:text-surface-100'
                    }
                  `}
                >
                  <link.icon size={17} className="flex-shrink-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.Tawk_API?.toggle()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 cursor-pointer"
            >
              <MessageCircle size={18} />
              <span className="hidden xl:inline">Fale Conosco</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              className="p-2 rounded-xl text-surface-500 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={togglePanel}
                aria-label="Notificações"
                className="p-2 rounded-xl text-surface-500 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 relative cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {isOpen && (
                <NotificationPanel />
              )}
            </div>

            <div className="hidden md:flex items-center gap-2" ref={userMenuRef}>
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 dark:bg-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-violet-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User size={16} className="text-violet-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{user?.name}</span>
                  <ChevronDown size={16} className="text-surface-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-hover border border-surface-100 dark:border-surface-700 py-1.5 z-50">
                    <button
                      onClick={handleGoToProfile}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-surface-500 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer"
                    >
                      <User size={16} />
                      Meu Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="md:hidden p-2 rounded-xl text-surface-500 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
          <div className="container-app py-4 space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  ${isActive(link.path)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-500 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                  }
                `}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-surface-100 dark:border-surface-800">
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-surface-500 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-xl"
              >
                <User size={20} />
                <span className="text-sm font-semibold">Meu Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
              >
                <LogOut size={20} />
                <span className="text-sm font-semibold">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};