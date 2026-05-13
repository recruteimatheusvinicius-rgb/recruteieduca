import { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import type { Plan } from '../../types';

export const PlanManagement = () => {
  const { plans, addPlan, updatePlan, deletePlan, courses } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    courseRestrictions: [] as string[],
    color: '#16a34a',
    isPopular: false,
  });

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        courseRestrictions: plan.courseRestrictions || [],
        color: plan.color || '#16a34a',
        isPopular: plan.isPopular || false,
      });
    } else {
      setEditingPlan(null);
      setFormData({ 
        name: '', 
        courseRestrictions: [], 
        color: '#16a34a',
        isPopular: false 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('O nome do plano é obrigatório');
      return;
    }

    try {
      if (editingPlan) {
        updatePlan(editingPlan.id, {
          name: formData.name,
          features: [],
          courseRestrictions: formData.courseRestrictions,
          formationRestrictions: [],
          color: formData.color,
          isPopular: formData.isPopular,
        });
        toast.success('Plano atualizado com sucesso!');
      } else {
        addPlan({
          id: Date.now().toString(),
          name: formData.name,
          features: [],
          courseRestrictions: formData.courseRestrictions,
          formationRestrictions: [],
          color: formData.color,
          isPopular: formData.isPopular,
        });
        toast.success('Plano criado com sucesso!');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Erro ao salvar plano');
    }
  };

  const handleDelete = (id: string) => {
    const plan = plans.find(p => p.id === id);
    toast.warning(`Tem certeza que deseja excluir o plano "${plan?.name}"?`, {
      action: {
        label: 'Excluir',
        onClick: () => {
          deletePlan(id);
          toast.success('Plano excluído com sucesso!');
        },
      },
      duration: 5000,
    });
  };

  const toggleCourseRestriction = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courseRestrictions: prev.courseRestrictions.includes(courseId)
        ? prev.courseRestrictions.filter(id => id !== courseId)
        : [...prev.courseRestrictions, courseId],
    }));
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Planos
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Gerencie planos para restringir acesso a cursos
              </p>
            </div>
            <Button onClick={() => openModal()}>
              <Plus size={18} />
              Novo Plano
            </Button>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className="relative overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: plan.color || '#16a34a' }}
                  />
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-4 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                  <p className="text-xs text-surface-500 dark:text-surface-300 mb-1">
                    Cursos restritos:
                  </p>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {plan.courseRestrictions?.length === 0 || !plan.courseRestrictions
                      ? 'Acesso a todos os cursos' 
                      : `${plan.courseRestrictions.length} curso(s) restrito(s)`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openModal(plan)}>
                    <Edit2 size={16} />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-surface-500 dark:text-surface-300">Nenhum plano encontrado</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Nome do Plano
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                placeholder="Ex: Premium, Empresarial..."
                required
              />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Cor do Plano
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-surface-500 dark:text-surface-300">
                    Cor exibida nos cards e badges
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Cursos Restritos (deixe vazio para acesso livre)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.courseRestrictions.includes(course.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.courseRestrictions.includes(course.id)}
                        onChange={() => toggleCourseRestriction(course.id)}
                        className="w-4 h-4 rounded text-primary-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{course.title}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-300">{course.duration} • {course.category}</p>
                      </div>
                    </label>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-sm text-surface-500 dark:text-surface-300">
                      Nenhum curso cadastrado
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <label htmlFor="isPopular" className="text-sm text-surface-700 dark:text-surface-300">
                  Marcar como plano popular/destaque
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingPlan ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};