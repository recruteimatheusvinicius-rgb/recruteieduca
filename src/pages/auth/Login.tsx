import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

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
    <div className="flex min-h-screen">
      {/* Painel Esquerdo - Branding/Hero (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f1f14] to-[#1a2e1a] flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-12 text-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <BookOpen size={32} className="text-white" />
            </div>
            <span className="font-heading font-bold text-3xl text-white">
              Recrutei<span className="text-primary-400">Educa</span>
            </span>
          </Link>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white mb-4 max-w-lg leading-tight">
            Aprenda no seu ritmo, evolua na sua carreira
          </h1>
          
        </div>

        {/* Border de separação */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary-500/20" />
      </div>

      {/* Painel Direito - Formulário */}
      <div className="w-full lg:w-1/2 bg-[#111827] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo - Mobile only */}
          <Link to="/" className="flex items-center gap-2 lg:hidden mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-white">
              Recrutei<span className="text-primary-400">Educa</span>
            </span>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Entrar</h2>
            <p className="text-[#9CA3AF]">
              Entre na sua conta para continuar aprendendo
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#374151] bg-[#1f2937] text-white placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#9CA3AF]">
                  Senha
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-[#374151] bg-[#1f2937] text-white placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white cursor-pointer"
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
                className="w-4 h-4 rounded border-[#374151] bg-[#1f2937] text-primary-500 focus:ring-primary-500/25 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="text-sm text-[#9CA3AF] cursor-pointer">
                Lembrar-me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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

          <p className="mt-8 text-center text-[#9CA3AF]">
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
              className="text-primary-500 hover:text-primary-400 underline cursor-pointer"
            >
              clicando aqui
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};