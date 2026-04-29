import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Search, Plus, Trash2, Building, Users, Calendar
} from 'lucide-react';
import type { Company } from '../../types';

export const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [usersCount, setUsersCount] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    
    if (!isSupabaseConfigured()) {
      setCompanies([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanies(data || []);

      const counts: Record<string, number> = {};
      for (const company of data || []) {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('company_id', company.id);
        counts[company.id] = count || 0;
      }
      setUsersCount(counts);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total de Empresas', value: companies.length, icon: Building },
    { label: 'Empresas Ativas', value: companies.filter(c => c.status === 'active').length, icon: Calendar },
    { label: 'Total de Usuários', value: Object.values(usersCount).reduce((a, b) => a + b, 0), icon: Users },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('O nome da empresa é obrigatório');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('create_company', {
        body: { name: formData.name.trim() },
      });

      if (error) throw error;

      toast.success('Empresa criada com sucesso!');
      setIsModalOpen(false);
      setFormData({ name: '' });
      loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Erro ao criar empresa. Tente novamente.');
    }
  };

  const handleDelete = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    const userCount = usersCount[companyId] || 0;

    if (userCount > 0) {
      toast.warning(
        `ATENÇÃO: A empresa "${company?.name}" tem ${userCount} usuário(s) vinculado(s). Ao excluir a empresa, todos os usuários também serão excluídos automaticamente.`,
        {
          action: {
            label: 'Excluir',
            onClick: () => confirmDelete(companyId),
          },
          duration: 8000,
        }
      );
    } else {
      confirmDelete(companyId);
    }
  };

  const confirmDelete = async (companyId: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete_company', {
        body: { company_id: companyId },
      });

      if (error) throw error;

      toast.success('Empresa excluída com sucesso!');
      loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Erro ao excluir empresa. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Gerenciamento de Empresas
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Gerencie as empresas cadastradas na plataforma
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Nova Empresa
            </Button>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar empresas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Empresa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Usuários</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Criada em</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">{company.name}</p>
                          <p className="text-sm text-surface-500 dark:text-surface-300">{company.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Users size={16} className="text-surface-400" />
                        <span className="text-surface-900 dark:text-surface-100">{usersCount[company.id] || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={company.status === 'active' ? 'success' : 'secondary'}>
                        {company.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-300">
                      {company.createdAt ? new Date(company.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleDelete(company.id)}
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

          {filteredCompanies.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-300">Nenhuma empresa encontrada</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-300">Carregando...</p>
            </div>
          )}
        </Card>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nova Empresa"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da empresa"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                  required
                />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Users size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Atenção
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Ao excluir uma empresa, todos os usuários vinculados a ela serão excluídos automaticamente. Use com cautela.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Plus size={18} className="mr-2" />
                Criar
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};