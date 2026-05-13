import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toast } from 'sonner';
import { BookOpen, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

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
      <div className="flex min-h-screen">
        {/* Painel Esquerdo */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f1f14] to-[#1a2e1a] flex-col relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-12 text-center">
            <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
              <BookOpen size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 max-w-lg leading-tight">
              Recupere seu acesso
            </h1>
            <p className="text-lg text-[#9CA3AF] max-w-md">
              Estamos aqui para ajudar. Verifique seu email para as instruções.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary-500/20" />
        </div>

        {/* Painel Direito */}
        <div className="w-full lg:w-1/2 bg-[#111827] flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-primary-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifique seu email!</h2>
              <p className="text-[#9CA3AF]">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 mb-8">
              <p className="text-sm text-[#9CA3AF]">
                Se não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente com outro email.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel Esquerdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f1f14] to-[#1a2e1a] flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-12 text-center">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
            <BookOpen size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 max-w-lg leading-tight">
            Recuperar Senha
          </h1>
          <p className="text-lg text-[#9CA3AF] max-w-md">
            Digite seu email e enviaremos um link para recuperar sua senha.
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary-500/20" />
      </div>

      {/* Painel Direito */}
      <div className="w-full lg:w-1/2 bg-[#111827] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/login" className="flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-8 transition-colors">
            <ArrowLeft size={18} />
            Voltar para login
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Esqueceu sua senha?</h2>
            <p className="text-[#9CA3AF]">
              Sem problemas! Digite seu email para receber um link de recuperação.
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#374151] bg-[#1f2937] text-white placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
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
    </div>
  );
};
