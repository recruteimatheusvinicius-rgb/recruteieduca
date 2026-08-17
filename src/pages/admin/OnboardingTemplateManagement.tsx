import { useEffect, useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { checklistTemplateService } from '../../hooks/useChecklistTemplates';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useConfirm } from '../../hooks/useConfirm';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, ListChecks, Video, Phone, Flag, Award, Lock, Unlock } from 'lucide-react';
import type { ChecklistTemplate, ChecklistTemplateItem, ChecklistItemType, ChecklistItemScope, OnboardingTrack } from '../../types';

const TRACKS: { value: OnboardingTrack; label: string; description: string }[] = [
  { value: 'self_service', label: 'Self-service', description: 'Onboarding 100% async, sem calls' },
  { value: 'guided_growth', label: 'Guided Growth', description: 'Academy + 2-3 calls curtas' },
  { value: 'enterprise_deploy', label: 'Enterprise Deploy', description: 'Implantação acompanhada, várias calls' },
  { value: 'rescue_recover', label: 'Rescue/Recover', description: 'Trilha de remediação ad-hoc' },
];

const ITEM_TYPE_META: Record<ChecklistItemType, { label: string; icon: typeof Video }> = {
  academy_lesson: { label: 'Aula da Academy', icon: Video },
  call: { label: 'Call', icon: Phone },
  manual_milestone: { label: 'Milestone manual', icon: Flag },
  certificate: { label: 'Certificação', icon: Award },
};

const createEmptyItem = (templateId: string, order: number): Omit<ChecklistTemplateItem, 'id'> => ({
  templateId,
  title: '',
  description: '',
  itemType: 'manual_milestone',
  order,
  blocksNext: true,
  scope: 'company',
  courseId: undefined,
  lessonId: undefined,
});

export const OnboardingTemplateManagement = () => {
  const { courses } = useDataStore();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTrack, setExpandedTrack] = useState<OnboardingTrack | null>(null);
  const [editingItem, setEditingItem] = useState<{ templateId: string; item: ChecklistTemplateItem | Omit<ChecklistTemplateItem, 'id'> } | null>(null);

  const confirm = useConfirm();

  const loadTemplates = async () => {
    setIsLoading(true);
    const data = await checklistTemplateService.listTemplates();
    setTemplates(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const templateForTrack = (track: OnboardingTrack) => templates.find((t) => t.track === track);

  const handleCreateTemplate = async (track: OnboardingTrack, name: string) => {
    const created = await checklistTemplateService.createTemplate(track, name);
    if (created) {
      toast.success('Checklist criado para a track.');
      await loadTemplates();
    } else {
      toast.error('Não foi possível criar o checklist.');
    }
  };

  const handleDeleteTemplate = (template: ChecklistTemplate) => {
    confirm({
      title: 'Excluir checklist',
      message: `Excluir o checklist "${template.name}"? Todas as etapas e progresso ligados a ele serão perdidos.`,
      confirmText: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await checklistTemplateService.deleteTemplate(template.id);
        if (ok) {
          toast.success('Checklist excluído.');
          await loadTemplates();
        } else {
          toast.error('Não foi possível excluir o checklist.');
        }
      },
    });
  };

  const handleDeleteItem = (itemId: string) => {
    confirm({
      title: 'Excluir etapa',
      message: 'Excluir esta etapa do checklist? Clientes que já completaram perdem esse histórico.',
      confirmText: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await checklistTemplateService.deleteTemplateItem(itemId);
        if (ok) {
          toast.success('Etapa excluída.');
          await loadTemplates();
        } else {
          toast.error('Não foi possível excluir a etapa.');
        }
      },
    });
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;
    const { item } = editingItem;

    if (!item.title.trim()) {
      toast.error('Dê um título para a etapa.');
      return;
    }

    if ('id' in item) {
      const ok = await checklistTemplateService.updateTemplateItem(item.id, item);
      if (ok) {
        toast.success('Etapa atualizada.');
        setEditingItem(null);
        await loadTemplates();
      } else {
        toast.error('Não foi possível atualizar a etapa.');
      }
    } else {
      const created = await checklistTemplateService.addTemplateItem(item);
      if (created) {
        toast.success('Etapa adicionada.');
        setEditingItem(null);
        await loadTemplates();
      } else {
        toast.error('Não foi possível adicionar a etapa.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Carregando checklists...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="px-6 md:px-10 py-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Checklists de Onboarding</h1>
          <p className="text-surface-500 dark:text-surface-300 mt-1">
            Defina as etapas de implantação para cada track de cliente
          </p>
        </div>
      </div>

      <div className="px-6 md:px-10 py-6 space-y-4">
        {TRACKS.map((track) => {
          const template = templateForTrack(track.value);
          const isExpanded = expandedTrack === track.value;

          return (
            <Card key={track.value} className="overflow-hidden" padding="none">
              <button
                onClick={() => setExpandedTrack(isExpanded ? null : track.value)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-700/50"
              >
                <div className="flex items-center gap-3">
                  <ListChecks size={20} className="text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-surface-100">{track.label}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-300">{track.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {template ? (
                    <Badge variant="success">{template.items.length} etapas</Badge>
                  ) : (
                    <Badge variant="secondary">Sem checklist</Badge>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 border-t border-surface-200 dark:border-surface-700">
                  {!template ? (
                    <Button onClick={() => handleCreateTemplate(track.value, `Checklist — ${track.label}`)}>
                      <Plus size={18} />
                      Criar checklist para esta track
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() =>
                            setEditingItem({
                              templateId: template.id,
                              item: createEmptyItem(template.id, template.items.length),
                            })
                          }
                        >
                          <Plus size={16} />
                          Nova etapa
                        </Button>
                      </div>

                      {template.items.length === 0 && (
                        <p className="text-sm text-surface-500 dark:text-surface-300 text-center py-6">
                          Nenhuma etapa cadastrada ainda.
                        </p>
                      )}

                      {template.items
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((item) => {
                          const Icon = ITEM_TYPE_META[item.itemType].icon;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                  <Icon size={16} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                                    {item.order + 1}. {item.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="secondary">{ITEM_TYPE_META[item.itemType].label}</Badge>
                                    <Badge variant="info">{item.scope === 'company' ? 'Empresa' : 'Por usuário'}</Badge>
                                    {item.blocksNext ? (
                                      <span className="flex items-center gap-1 text-xs text-surface-400">
                                        <Lock size={12} /> bloqueia próxima
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-xs text-surface-400">
                                        <Unlock size={12} /> não bloqueia
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => setEditingItem({ templateId: template.id, item })}
                                  className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-red-500 cursor-pointer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-sm text-red-500 hover:underline cursor-pointer"
                        >
                          Excluir checklist desta track
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={editingItem && 'id' in editingItem.item ? 'Editar etapa' : 'Nova etapa'}
      >
        {editingItem && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Título</label>
              <input
                type="text"
                value={editingItem.item.title}
                onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, title: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                placeholder="Ex: Configurar pipeline de vagas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Descrição</label>
              <textarea
                rows={2}
                value={editingItem.item.description ?? ''}
                onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, description: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tipo</label>
                <select
                  value={editingItem.item.itemType}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, itemType: e.target.value as ChecklistItemType },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                >
                  {Object.entries(ITEM_TYPE_META).map(([value, meta]) => (
                    <option key={value} value={value}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Quem completa</label>
                <select
                  value={editingItem.item.scope}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, scope: e.target.value as ChecklistItemScope },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                >
                  <option value="company">Qualquer usuário da empresa</option>
                  <option value="user">Cada usuário individualmente</option>
                </select>
              </div>
            </div>

            {editingItem.item.itemType === 'academy_lesson' && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Curso vinculado</label>
                <select
                  value={editingItem.item.courseId ?? ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, courseId: e.target.value || undefined, lessonId: undefined },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 mb-2"
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {editingItem.item.courseId && (
                  <select
                    value={editingItem.item.lessonId ?? ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, item: { ...editingItem.item, lessonId: e.target.value || undefined } })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                  >
                    <option value="">Curso inteiro (qualquer aula concluída)</option>
                    {courses
                      .find((c) => c.id === editingItem.item.courseId)
                      ?.modules?.flatMap((m) => m.lessons || [])
                      .map((l) => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                  </select>
                )}
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingItem.item.blocksNext}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, item: { ...editingItem.item, blocksNext: e.target.checked } })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Esta etapa precisa estar concluída para liberar a próxima
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button onClick={handleSaveItem}>Salvar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
