import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationPanel } from './NotificationPanel';
import { Logo } from './Logo';
import type { LucideIcon } from 'lucide-react';
import {
  Moon, Sun, Bell, User, LogOut, LayoutDashboard, Menu, X, ChevronDown,
  BookOpen, Home, HelpCircle, MessageCircle, Building, GraduationCap,
  Users, Tag, DollarSign, Shield, Eye,
} from 'lucide-react';

interface NavLink {
  path: string;
  label: string;
  icon: LucideIcon;
}

const contentLinks: NavLink[] = [
  { path: '/admin/courses', label: 'Cursos', icon: BookOpen },
  { path: '/admin/formations', label: 'Formações', icon: GraduationCap },
  { path: '/admin/categories', label: 'Categorias', icon: Tag },
  { path: '/admin/plans', label: 'Planos', icon: DollarSign },
];

const peopleLinks: NavLink[] = [
  { path: '/admin/users', label: 'Usuários', icon: Users },
  { path: '/admin/companies', label: 'Empresas', icon: Building },
];

const studentViewLinks: NavLink[] = [
  { path: '/home', label: 'Início', icon: Home },
  { path: '/my-courses', label: 'Meus Cursos', icon: BookOpen },
  { path: '/help', label: 'Ajuda', icon: HelpCircle },
];

function NavItem({ path, label, icon: Icon, active, onClick }: NavLink & { active: boolean; onClick?: () => void }) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active ? 'bg-primary-600 text-white' : 'text-surface-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={17} className="flex-shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { unreadCount, togglePanel, isOpen, closePanel } = useNotificationStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false);
      if (viewMenuRef.current && !viewMenuRef.current.contains(target)) setIsViewMenuOpen(false);
      if (isOpen && notifRef.current && !notifRef.current.contains(target)) closePanel();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closePanel]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-surface-950 px-3 py-5 gap-6 overflow-y-auto">
      <Link to="/admin" onClick={onNavigate} className="flex items-center px-2 flex-shrink-0">
        <Logo size={30} theme="onDark" />
      </Link>

      <nav className="flex flex-col gap-1 flex-shrink-0">
        <NavItem path="/admin" label="Dashboard" icon={LayoutDashboard} active={isActive('/admin')} onClick={onNavigate} />
      </nav>

      <div className="flex-shrink-0">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-surface-500">Conteúdo</p>
        <nav className="flex flex-col gap-1">
          {contentLinks.map((l) => (
            <NavItem key={l.path} {...l} active={isActive(l.path)} onClick={onNavigate} />
          ))}
        </nav>
      </div>

      <div className="flex-shrink-0">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-surface-500">Pessoas</p>
        <nav className="flex flex-col gap-1">
          {peopleLinks.map((l) => (
            <NavItem key={l.path} {...l} active={isActive(l.path)} onClick={onNavigate} />
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="relative" ref={viewMenuRef}>
            <button
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              title="Ver como aluno"
              className="p-2 rounded-lg text-surface-400 hover:bg-white/5 hover:text-white cursor-pointer"
            >
              <Eye size={17} />
            </button>
            {isViewMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-50">
                {studentViewLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => { setIsViewMenuOpen(false); onNavigate?.(); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => window.Tawk_API?.toggle()}
            title="Fale conosco"
            className="p-2 rounded-lg text-surface-400 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <MessageCircle size={17} />
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            className="p-2 rounded-lg text-surface-400 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={togglePanel}
              title="Notificações"
              className="p-2 rounded-lg text-surface-400 hover:bg-white/5 hover:text-white cursor-pointer relative"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isOpen && (
              <div className="absolute left-0 bottom-full mb-2">
                <NotificationPanel />
              </div>
            )}
          </div>
        </div>

        <div className="relative pt-3 border-t border-white/10" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 w-full px-1 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <Shield size={15} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-surface-400">Administrador</p>
            </div>
            <ChevronDown size={14} className="text-surface-500 flex-shrink-0" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-50">
              <Link
                to="/profile"
                onClick={() => { setIsUserMenuOpen(false); onNavigate?.(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer"
              >
                <User size={16} />
                Meu Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-surface-950 flex-shrink-0">
        <Link to="/admin" className="flex items-center">
          <Logo size={28} theme="onDark" />
        </Link>
        <button onClick={() => setIsMobileOpen(true)} aria-label="Abrir menu" className="p-2 text-white cursor-pointer">
          <Menu size={22} />
        </button>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full relative">
            <SidebarContent onNavigate={() => setIsMobileOpen(false)} />
            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Fechar menu"
              className="absolute top-4 right-[-44px] p-2 text-white cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>
          <button
            aria-label="Fechar menu"
            onClick={() => setIsMobileOpen(false)}
            className="flex-1 bg-black/40 cursor-pointer"
          />
        </div>
      )}
    </>
  );
};
