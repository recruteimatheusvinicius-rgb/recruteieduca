import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, GraduationCap, Clock, BookOpen } from 'lucide-react';

export const FormationManagement = () => {
  const navigate = useNavigate();
  const { formations, deleteFormation } = useDataStore();

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      iniciante: 'success',
      intermediario: 'warning',
      avancado: 'error',
    };
    const labels: Record<string, string> = {
      iniciante: 'Iniciante',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    };
    return <Badge variant={variants[level]}>{labels[level]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Formações
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Gerencie as formações e trilhas de cursos
              </p>
            </div>
            <Button onClick={() => navigate('/admin/formations/create')}>
              <Plus size={18} />
              Nova Formação
            </Button>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <Card key={formation.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                      {formation.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getLevelBadge(formation.level)}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-surface-500 dark:text-surface-300 mb-4 line-clamp-2">
                  {formation.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-300 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {formation.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={16} />
                    {formation.courses.length} cursos
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/admin/formations/${formation.id}`)}>
                    <Edit2 size={16} />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                    onClick={() => {
                      toast.warning(`Tem certeza que deseja excluir a formação "${formation.title}"?`, {
                        action: {
                          label: 'Excluir',
                          onClick: () => {
                            deleteFormation(formation.id);
                            toast.success('Formação excluída com sucesso!');
                          },
                        },
                        duration: 5000,
                      });
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {formations.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-surface-500 dark:text-surface-300">Nenhuma formação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};