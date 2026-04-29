import { useState, useEffect } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Search, Plus, Edit, Trash2, Mail, User as UserIcon, Shield, Calendar, GraduationCap, Send
} from 'lucide-react';
import type { User, Company } from '../../types';

export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useDataStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    company_id: '',
    role: 'student' as 'student' | 'admin',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'admin',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    if (!isSupabaseConfigured()) {
      setCompanies([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
      
      const names: Record<string, string> = {};
      data?.forEach(c => { names[c.id] = c.name; });
      setCompanyNames(names);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    { label: 'Total de Usuários', value: users.length, icon: UserIcon },
    { label: 'Estudantes', value: users.filter(u => u.role === 'student').length, icon: GraduationCap },
    { label: 'Administradores', value: users.filter(u => u.role === 'admin').length, icon: Shield },
    { label: 'Ativos', value: users.filter(u => u.status === 'active').length, icon: Calendar },
  ];

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'student', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteFormData.email?.trim()) {
      toast.error('O e-mail do usuário é obrigatório');
      return;
    }
    if (!inviteFormData.company_id) {
      toast.error('A empresa é obrigatória');
      return;
    }

    try {
      const selectedCompany = companies.find(c => c.id === inviteFormData.company_id);
      
      // Generate invitation token
      const token = btoa(JSON.stringify({
        email: inviteFormData.email,
        company_id: inviteFormData.company_id,
        company_name: selectedCompany?.name || '',
        role: inviteFormData.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      }));

      // Create invitation URL
      const inviteUrl = `${window.location.origin}/invite/${token}`;

      // Send invitation email via Supabase function
      const { error } = await supabase.functions.invoke('send_invite', {
        body: {
          email: inviteFormData.email,
          company: selectedCompany?.name || '',
          role: inviteFormData.role,
          inviteUrl,
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Convite enviado com sucesso!', {
        description: `Um e-mail foi enviado para ${inviteFormData.email}`,
        duration: 5000,
      });

      setIsInviteModalOpen(false);
      setInviteFormData({ email: '', company_id: '', role: 'student' });
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Erro ao enviar convite. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('O nome do usuário é obrigatório');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('O e-mail do usuário é obrigatório');
      return;
    }

    try {
      if (editingUser) {
        updateUser(editingUser.id, formData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        addUser({
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        });
        toast.success('Usuário criado com sucesso!');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    toast.warning(`Tem certeza que deseja excluir o usuário "${user?.name}"?`, {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteUser(id);
          toast.success('Usuário excluído com sucesso!');
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Gerenciamento de Usuários
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Gerencie todos os usuários da plataforma
              </p>
            </div>
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <Plus size={18} />
              Convidar Usuário
            </Button>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <stat.icon size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-300">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100"
                >
                  <option value="all">Todos os papéis</option>
                  <option value="student">Estudante</option>
                  <option value="admin">Administrador</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Usuário</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Empresa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Papel</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Criado em</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{user.name}</p>
                          <p className="text-sm text-surface-500 dark:text-surface-300">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-surface-900 dark:text-surface-100">
                        {user.company_id ? companyNames[user.company_id] || user.company_id : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'admin' ? 'warning' : 'primary'}>
                        {user.role === 'admin' ? 'Admin' : 'Estudante'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-300">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => window.location.href = `mailto:${user.email}`}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer" 
                          title="Enviar e-mail"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={() => openModal(user)}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer" 
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-red-500 cursor-pointer" 
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-300">Nenhum usuário encontrado</p>
            </div>
          )}
        </Card>
      </div>

      {isInviteModalOpen && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Convidar Novo Usuário"
        >
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                placeholder="usuario@empresa.com"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Empresa
              </label>
              <select
                value={inviteFormData.company_id}
                onChange={(e) => setInviteFormData({ ...inviteFormData, company_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Papel
              </label>
              <select
                value={inviteFormData.role}
                onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value as 'student' | 'admin' })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
              >
                <option value="student">Estudante</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Como funciona o convite?
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Um link de convite será gerado e enviado por e-mail. O usuário poderá clicar no link para definir sua senha e nome, criando assim sua conta.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Send size={18} className="mr-2" />
                Enviar Convite
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Papel
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                >
                  <option value="student">Estudante</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {editingUser ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};