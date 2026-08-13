import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

const setTawkVisitor = (name: string, email: string) => {
  const win = window as unknown as { Tawk_API?: { setVisitor?: (v: { name: string; email: string }) => void } };
  if (win.Tawk_API?.setVisitor) {
    win.Tawk_API.setVisitor({ name, email });
  }
};

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user?.name && user.name.trim()) {
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else {
        navigate('/complete-profile', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (result.needsProfile) {
        navigate('/complete-profile');
      } else {
        const user = useAuthStore.getState().user;
        toast.success('Login realizado com sucesso!');
        if (user) {
          setTawkVisitor(user.name, user.email);
        }
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 p-4 sm:p-8">
      <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-hover p-8 sm:p-10">
        <Link to="/" className="flex justify-center mb-6">
          <Logo size={44} />
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Entrar</h2>
          <p className="text-surface-500 dark:text-surface-400">
            Entre na sua conta para continuar aprendendo
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">
                Senha
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer">
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
              Lembrar-me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                Entrar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
          Entre em contato com o administrador para obter acesso ao sistema{' '}
          <button
            type="button"
            onClick={() => {
              if (window.Tawk_API?.toggle) {
                window.Tawk_API.toggle();
              } else {
                alert('Chat não está disponível no momento. Tente novamente em alguns segundos.');
              }
            }}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer"
          >
            clicando aqui
          </button>
          .
        </p>
      </div>
    </div>
  );
};