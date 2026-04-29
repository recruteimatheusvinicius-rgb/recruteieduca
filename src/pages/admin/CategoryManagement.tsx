import { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Tag, BookOpen } from 'lucide-react';
import type { Category } from '../../types';

export const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#16a34a',
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#16a34a' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    try {
      if (editingCategory) {
        updateCategory(editingCategory.id, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        addCategory({
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          color: formData.color,
          courseCount: 0,
        });
        toast.success('Categoria criada com sucesso!');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    toast.warning(`Tem certeza que deseja excluir a categoria "${category?.name}"?`, {
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteCategory(id);
          toast.success('Categoria excluída com sucesso!');
        },
      },
      duration: 5000,
    });
  };

  const colorOptions = [
    '#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Categorias
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Gerencie as categorias de cursos
              </p>
            </div>
            <Button onClick={() => openModal()}>
              <Plus size={18} />
              Nova Categoria
            </Button>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div 
                className="h-2" 
                style={{ backgroundColor: category.color }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                      {category.name}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">
                      {category.description}
                    </p>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-300 mb-4">
                  <BookOpen size={16} />
                  <span>{category.courseCount} cursos</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openModal(category)}>
                    <Edit2 size={16} />
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-surface-500 dark:text-surface-300">Nenhuma categoria encontrada</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Nome da Categoria
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
                Descrição
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 resize-none"
                required
              />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Cor
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  };
