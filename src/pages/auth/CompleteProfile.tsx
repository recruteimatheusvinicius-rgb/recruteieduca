import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { BookOpen, User, ArrowRight, AlertCircle } from 'lucide-react';

export const CompleteProfile = () => {
  const navigate = useNavigate();
  const { completeProfile, isLoading, error, clearError, user } = useAuthStore();
  const [name, setName] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!name.trim()) {
      toast.error('Por favor, insira seu nome completo');
      return;
    }

    const success = await completeProfile(name);
    
    if (success) {
      toast.success('Perfil completado com sucesso!');
      navigate('/home');
    }
  };

  // Verify OAuth user on component mount
  useEffect(() => {
    const verifyUser = async () => {
      // First check if auth is already initialized and has user data
      const currentUser = useAuthStore.getState().user;
      const currentNeedsProfile = useAuthStore.getState().needsProfileComplete;
      
      if (currentUser) {
        if (!currentNeedsProfile && currentUser.name && currentUser.name.trim()) {
          navigate('/home', { replace: true });
          setIsVerifying(false);
          return;
        }
        if (currentUser.name) {
          setName(currentUser.name);
        }
        setIsVerifying(false);
        return;
      }

      // If no user in store, try to verify with OAuth
      try {
        const result = await useAuthStore.getState().verifyOAuthUser();
        
        if (result.user && result.user.name && result.user.name.trim()) {
          navigate('/home', { replace: true });
          return;
        }
        
        if (result.user && result.user.name) {
          setName(result.user.name);
        }
      } catch (err) {
        console.error('Error verifying OAuth user:', err);
      } finally {
        setIsVerifying(false);
      }
    };

    // Small delay to allow session to be established, but not too long
    const timer = setTimeout(() => {
      verifyUser();
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937]">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-[#9CA3AF]">Verificando sua conta...</p>
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
            Complete seu perfil
          </h1>
          <p className="text-lg text-[#9CA3AF] max-w-md">
            Bem-vindo ao RecruteiEduca! Precisamos apenas de algumas informações para continuar.
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary-500/20" />
      </div>

      {/* Painel Direito */}
      <div className="w-full lg:w-1/2 bg-[#111827] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Quase lá!</h2>
            <p className="text-[#9CA3AF]">
              Olá! Para continuar, nos informe seu nome completo.
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
                Nome Completo
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#374151] bg-[#1f2937] text-white placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !name.trim()}
              className="w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Continuar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              Você está logado como: <span className="text-white">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};