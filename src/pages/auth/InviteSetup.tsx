import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Building, Mail, Lock, User, CheckCircle } from 'lucide-react';

interface InviteData {
  email: string;
  company_id: string;
  company_name: string;
  role: 'student' | 'admin';
  expiresAt: string;
}

export const InviteSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  const validateToken = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token));
      const expiresAt = new Date(decoded.expiresAt);
      
      if (new Date() > expiresAt) {
        toast.error('Este convite expirou. Solicite um novo convite.');
        setIsLoading(false);
        return;
      }

      setInviteData(decoded);
      setIsValid(true);
    } catch (error) {
      console.error('Invalid token:', error);
      toast.error('Link de convite inválido.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }
    if (!formData.password) {
      toast.error('A senha é obrigatória');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: inviteData!.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            name: formData.name.trim(),
            email: inviteData!.email,
            role: inviteData!.role,
            status: 'active',
            company_id: inviteData!.company_id,
          }]);

          toast.success('Conta criada com sucesso!');
          navigate('/login');
        }
      } else {
        toast.error('Supabase não configurado');
      }
    } catch (unknownError) {
      const errorMessage = unknownError instanceof Error ? unknownError.message : String(unknownError);
      console.error('Error creating user:', unknownError);
      toast.error(errorMessage || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-300">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (!isValid || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">
            Convite Inválido
          </h1>
          <p className="text-surface-600 dark:text-surface-300 mb-6">
            Este link de convite é inválido ou expirou.
          </p>
          <Button onClick={() => navigate('/login')}>
            Voltar para Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Complete seu Cadastro
          </h1>
          <p className="text-surface-600 dark:text-surface-300 mt-2">
            Você foi convidado para a plataforma RecruteiEduca
          </p>
        </div>

        <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <Building size={20} className="text-surface-400" />
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Empresa</p>
              <p className="font-medium text-surface-900 dark:text-surface-100">
                {inviteData.company_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Mail size={20} className="text-surface-400" />
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">E-mail</p>
              <p className="font-medium text-surface-900 dark:text-surface-100">
                {inviteData.email}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Nome Completo
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>
      </Card>
    </div>
  );
};