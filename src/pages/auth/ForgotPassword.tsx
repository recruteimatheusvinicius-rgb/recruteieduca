import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toast } from 'sonner';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validar email
      if (!email.trim() || !email.includes('@')) {
        setError('Por favor, insira um email válido');
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setError('Sistema de recuperação de senha não configurado');
        setIsLoading(false);
        return;
      }

      // Usar Supabase Auth para recuperação de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        // Não revelar se email existe ou não (segurança)
        setSubmitted(true);
        toast.success('Se o email existe na plataforma, receberá instruções de recuperação');
      } else {
        setSubmitted(true);
        toast.success('Se o email existe na plataforma, receberá instruções de recuperação');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Erro ao processar solicitação');
      toast.error(errorMessage || 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-hover p-8 sm:p-10">
          <Link to="/" className="flex justify-center mb-6">
            <Logo size={44} />
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Verifique seu email!</h2>
            <p className="text-surface-500 dark:text-surface-400">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 rounded-lg p-4 mb-8">
            <p className="text-sm text-surface-600 dark:text-surface-300">
              Se não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente com outro email.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 p-4 sm:p-8">
      <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-hover p-8 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-8 transition-colors cursor-pointer">
          <ArrowLeft size={18} />
          Voltar para login
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Esqueceu sua senha?</h2>
          <p className="text-surface-500 dark:text-surface-400">
            Sem problemas! Digite seu email para receber um link de recuperação.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-primary-500/50 disabled:cursor-not-allowed cursor-pointer text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperação'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
