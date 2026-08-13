import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { User, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

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
    let mounted = true;

    const verifyUser = async () => {
      try {
        // First check if auth is already initialized and has user data
        const currentUser = useAuthStore.getState().user;
        const currentNeedsProfile = useAuthStore.getState().needsProfileComplete;
        
        if (!mounted) return;

        if (currentUser) {
          if (!currentNeedsProfile && currentUser.name && currentUser.name.trim()) {
            navigate('/home', { replace: true });
            return;
          }
          if (currentUser.name) {
            setName(currentUser.name);
          }
          return;
        }

        // If no user in store, try to verify with OAuth
        const result = await useAuthStore.getState().verifyOAuthUser();
        
        if (!mounted) return;

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
        if (mounted) {
          setIsVerifying(false);
        }
      }
    };

    // Small delay to allow session to be established, but not too long
    const timer = setTimeout(() => {
      verifyUser();
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse mb-4 mx-auto"></div>
          <p className="text-white/80">Verificando sua conta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 p-4 sm:p-8">
      <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-hover p-8 sm:p-10">
        <Link to="/" className="flex justify-center mb-6">
          <Logo size={44} />
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Quase lá!</h2>
          <p className="text-surface-500 dark:text-surface-400">
            Olá! Para continuar, nos informe seu nome completo.
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
              Nome Completo
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full py-3.5 px-6 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Você está logado como: <span className="text-surface-900 dark:text-white font-medium">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};