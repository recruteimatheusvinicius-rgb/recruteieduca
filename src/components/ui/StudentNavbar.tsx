import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationPanel } from './NotificationPanel';
import { Moon, Sun, Search, Menu, X, BookOpen, Home, HelpCircle, Bell, User, LogOut, ChevronDown, MessageCircle } from 'lucide-react';

export const StudentNavbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { unreadCount, togglePanel, isOpen } = useNotificationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/home', label: 'Início', icon: Home },
    { path: '/my-courses', label: 'Meus Cursos', icon: BookOpen },
    { path: '/help', label: 'Ajuda', icon: HelpCircle },
    { path: '/contact', label: 'Fale Conosco!', icon: MessageCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-surface-900 dark:text-surface-100">
                Recrutei<span className="text-primary-600">Educa</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path === '/contact' ? '#' : link.path}
                  onClick={(e) => {
                    if (link.path === '/contact') {
                      e.preventDefault();
                      window.Tawk_API?.toggle();
                    }
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    cursor-pointer
                    ${isActive(link.path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                    }
                  `}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
            >
              <Search size={20} />
            </button>

            <div className="hidden md:flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 w-64">
              <Search size={16} className="text-surface-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                className="bg-transparent border-none outline-none text-sm text-surface-700 dark:text-surface-300 placeholder:text-surface-400 w-full ml-2 cursor-text"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative">
              <button 
                onClick={togglePanel}
                className="p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer relative"
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

            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <ChevronDown size={16} className="text-surface-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 py-2">
                  <div className="px-4 py-2 border-b border-surface-200 dark:border-surface-700">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-surface-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link 
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
                  >
                    <User size={18} />
                    <span className="text-sm">Meu Perfil</span>
                  </Link>
                  <Link 
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span className="text-sm">Configurações</span>
                  </Link>
                  <div className="mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <LogOut size={18} />
                      <span className="text-sm">Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <input
              type="text"
              placeholder="Buscar cursos..."
              className="w-full px-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 border-none outline-none text-surface-700 dark:text-surface-300 placeholder:text-surface-400 cursor-text"
              autoFocus
            />
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
          <div className="container-app py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path === '/contact' ? '#' : link.path}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (link.path === '/contact') {
                    window.Tawk_API?.toggle();
                  }
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  cursor-pointer
                  ${isActive(link.path)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }
                `}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
              <Link 
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg cursor-pointer"
              >
                <User size={20} />
                <span className="text-sm font-medium">Meu Perfil</span>
              </Link>
              <Link 
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg cursor-pointer"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Configurações</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};