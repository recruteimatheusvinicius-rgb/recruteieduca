import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toast } from 'sonner';
import { BookOpen, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const checkRecoveryToken = async () => {
      if (!isSupabaseConfigured()) {
        setError('Sistema não configurado');
        return;
      }

      const token = searchParams.get('type');
      const code = searchParams.get('code');

      if (token !== 'recovery' || !code) {
        setError('Link inválido ou expirado');
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.warn('Erro ao trocar código por sessão:', error);
          setError('Link inválido ou expirado');
        }
      } catch (err) {
        console.warn('Não foi possível processar o link de recuperação:', err);
        setError('Link inválido ou expirado');
      }
    };

    checkRecoveryToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        setError(updateError.message);
        toast.error(updateError.message);
      } else {
        setSuccess(true);
        toast.success('Senha atualizada com sucesso!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Erro ao atualizar senha');
      toast.error(errorMessage || 'Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const heroPanel = (title: string, subtitle: string) => (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 dark:from-[#0b1330] dark:to-[#1b2a5c] flex-col relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-12 text-center">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
          <BookOpen size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 max-w-lg leading-tight">{title}</h1>
        <p className="text-lg text-white/70 max-w-md">{subtitle}</p>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary-500/20" />
    </div>
  );

  if (success) {
    return (
      <div className="flex min-h-screen bg-surface-50 dark:bg-surface-900">
        {heroPanel('Senha Atualizada!', 'Sua senha foi alterada com sucesso. Você será redirecionado para fazer login.')}
        <div className="w-full lg:w-1/2 bg-white dark:bg-[#111827] flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Tudo pronto!</h2>
            <p className="text-surface-600 dark:text-[#9CA3AF] mb-8">
              Sua senha foi alterada com sucesso. Você será redirecionado para fazer login em alguns segundos...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer"
            >
              Ir para Login Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-900">
      {heroPanel('Criar Nova Senha', 'Digite uma nova senha segura para acessar sua conta.')}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#111827] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Criar nova senha</h2>
            <p className="text-surface-600 dark:text-[#9CA3AF]">
              Escolha uma senha segura com pelo menos 8 caracteres.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-[#9CA3AF] mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-surface-200 dark:border-[#374151] bg-white dark:bg-[#1f2937] text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 dark:text-[#6B7280] dark:hover:text-white transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-[#9CA3AF] mb-1.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-[#6B7280]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-surface-200 dark:border-[#374151] bg-white dark:bg-[#1f2937] text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 dark:text-[#6B7280] dark:hover:text-white transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-surface-500 dark:text-[#6B7280] mt-1">
                Mínimo de 8 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-primary-500/50 disabled:cursor-not-allowed cursor-pointer text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
