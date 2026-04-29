import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import type { User as UserType } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { 
  User, Lock, Bell, Shield, Palette, Trash2,
  ChevronRight, Camera, Moon, Sun, Save
} from 'lucide-react';

export const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('Por favor, insira seu nome');
      return;
    }

    setIsSaving(true);
    try {
      if (isSupabaseConfigured() && user) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: formData.name.trim(),
            email: user.email,
            phone: formData.phone.trim() || null,
          });

        if (upsertError) {
          toast.error('Erro ao salvar: ' + upsertError.message);
          return;
        }

        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (updatedProfile) {
          useAuthStore.setState({ user: updatedProfile });
        }
        
        toast.success('Perfil atualizado com sucesso!');
      } else if (user) {
        const localUser: UserType = {
          ...user,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
        };
        useAuthStore.setState({ user: localUser });
        toast.success('Perfil atualizado localmente!');
      } else {
        toast.error('Usuário não encontrado.');
      }
    } catch {
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    
    try {
      if (isSupabaseConfigured() && user) {
        const { error: deleteError } = await supabase.functions.invoke('delete_user', {
          body: JSON.stringify({ user_id: user.id }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (deleteError) {
          console.error('Delete user function error:', deleteError);
          toast.error('Erro ao excluir conta. Tente novamente.');
          setIsDeleting(false);
          return;
        }
      }
      
      await logout();
      toast.success('Conta excluída com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Erro ao excluir conta');
    } finally {
      setIsDeleting(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'account', label: 'Conta', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'privacy', label: 'Privacidade', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-2 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 mb-4"
          >
            <ChevronRight size={16} className="rotate-180" />
            Voltar ao perfil
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Configurações
          </h1>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer
                    ${activeSection === section.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
                    }
                  `}
                >
                  <section.icon size={20} />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'profile' && (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                    Informações do Perfil
                  </h2>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <User size={36} className="text-surface-400" />
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Camera size={14} className="text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-surface-900 dark:text-surface-100">Foto de perfil</h3>
                      <p className="text-sm text-surface-500 dark:text-surface-300">JPG, PNG ou GIF. Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-700 text-surface-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <Save size={18} />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                    Biografia
                  </h2>
                  <textarea
                    rows={4}
                    placeholder="Conte um pouco sobre você..."
                    className="w-full px-4 py-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                  />
                  <p className="text-sm text-surface-500 dark:text-surface-300 mt-2">Máximo de 500 caracteres</p>
                </Card>
              </>
            )}

            {activeSection === 'account' && (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                    Segurança da Conta
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-100 dark:bg-surface-600 rounded-lg flex items-center justify-center">
                          <Lock size={20} className="text-surface-500" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">Senha</p>
                          <p className="text-sm text-surface-500 dark:text-surface-300">Última alteração: nunca</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">Alterar</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-100 dark:bg-surface-600 rounded-lg flex items-center justify-center">
                          <Shield size={20} className="text-surface-500" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">Autenticação em duas etapas</p>
                          <p className="text-sm text-surface-500 dark:text-surface-300">Adicione uma camada extra de segurança</p>
                        </div>
                      </div>
<label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={twoFactorAuth}
                            onChange={(e) => setTwoFactorAuth(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-surface-200 dark:bg-surface-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 cursor-pointer"></div>
                        </label>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                    Danger Zone
                  </h2>
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/30 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-100">Excluir conta</p>
                      <p className="text-sm text-surface-500 dark:text-surface-300">Esta ação é irreversível</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/30 cursor-pointer"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          Excluir
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {activeSection === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                  Preferências de Notificações
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-4">Notificações por e-mail</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Novas aulas disponíveis', desc: 'Receba um e-mail quando novas aulas forem publicadas' },
                        { label: 'Certificados disponíveis', desc: 'Receba um e-mail quando completar um curso' },
                        { label: 'Promoções e ofertas', desc: 'Receba ofertas especiais e descontos' },
                        { label: 'Resumo semanal', desc: 'Receba um resumo das suas atividades semanais' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-surface-900 dark:text-surface-100">{item.label}</p>
                            <p className="text-sm text-surface-500 dark:text-surface-300">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              defaultChecked={i < 2}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-surface-200 dark:bg-surface-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 cursor-pointer"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
                  <Button>Salvar Preferências</Button>
                </div>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                  Aparência
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-4">Tema</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'light', label: 'Claro', icon: Sun },
                        { id: 'dark', label: 'Escuro', icon: Moon },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => theme !== option.id && toggleTheme()}
                          className={`
                            p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer
                            ${theme === option.id 
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                              : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                            }
                          `}
                        >
                          <option.icon size={24} className={theme === option.id ? 'text-primary-600' : 'text-surface-500'} />
                          <span className={`text-sm font-medium ${theme === option.id ? 'text-primary-600' : 'text-surface-600 dark:text-surface-300'}`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-4">Idioma</h3>
                    <select className="w-full md:w-64 px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'privacy' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                  Privacidade e Dados
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-100">Visibilidade do perfil</p>
                      <p className="text-sm text-surface-500 dark:text-surface-300">Controle quem pode ver seu perfil</p>
                    </div>
                    <select className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm">
                      <option>Público</option>
                      <option>Apenas eu</option>
                      <option>Apenas administradores</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-100">Exportar dados</p>
                      <p className="text-sm text-surface-500 dark:text-surface-300">Baixe todos os seus dados</p>
                    </div>
                    <Button variant="secondary" size="sm">Exportar</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação é IRREVERSÍVEL e todos os seus dados serão perdidos permanentemente."
        confirmText="Excluir Conta"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};