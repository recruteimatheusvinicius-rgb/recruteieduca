import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { checklistProgressService } from '../../hooks/useChecklistProgress';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { ArrowLeft, Video, Phone, Flag, Award, CheckCircle, Circle, Users } from 'lucide-react';
import type { Company, ChecklistItemType, ChecklistTemplateItem, OnboardingTrack } from '../../types';

const ITEM_TYPE_META: Record<ChecklistItemType, { label: string; icon: typeof Video }> = {
  academy_lesson: { label: 'Aula da Academy', icon: Video },
  call: { label: 'Call', icon: Phone },
  manual_milestone: { label: 'Milestone manual', icon: Flag },
  certificate: { label: 'Certificação', icon: Award },
};

const TRACK_LABELS: Record<OnboardingTrack, string> = {
  self_service: 'Self-service',
  guided_growth: 'Guided Growth',
  enterprise_deploy: 'Enterprise Deploy',
  rescue_recover: 'Rescue/Recover',
};

type AdminItem = ChecklistTemplateItem & {
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  usersCompletedCount: number;
  usersTotalCount: number;
};

export const CompanyChecklistProgress = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    if (!id || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const { data: companyRow } = await supabase.from('companies').select('*').eq('id', id).single();
    if (companyRow) {
      setCompany({
        id: companyRow.id,
        name: companyRow.name,
        status: companyRow.status,
        createdAt: companyRow.created_at ?? undefined,
        onboardingTrack: companyRow.onboarding_track ?? undefined,
        onboardingTrackAssignedAt: companyRow.onboarding_track_assigned_at ?? undefined,
      });

      const data = await checklistProgressService.getCompanyChecklistAdmin(id, companyRow.onboarding_track ?? undefined);
      setItems(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggle = async (item: AdminItem) => {
    if (!id || !user) return;

    const ok =
      item.status === 'completed'
        ? await checklistProgressService.markItemPending(id, item.id, 'company', '')
        : await checklistProgressService.markItemCompleted(id, item.id, 'company', '', user.id);

    if (ok) {
      toast.success(item.status === 'completed' ? 'Etapa marcada como pendente.' : 'Etapa marcada como concluída.');
      load();
    } else {
      toast.error('Não foi possível atualizar a etapa.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Carregando...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Empresa não encontrada.</p>
      </div>
    );
  }

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700">
        <div className="container-app py-6">
          <Link to="/admin/companies" className="flex items-center gap-2 text-surface-500 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 mb-3 cursor-pointer w-fit">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar para empresas</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">{company.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {company.onboardingTrack ? (
              <Badge variant="primary">{TRACK_LABELS[company.onboardingTrack]}</Badge>
            ) : (
              <Badge variant="secondary">Sem track de onboarding</Badge>
            )}
            {items.length > 0 && <span className="text-sm text-surface-500 dark:text-surface-300">{progressPct}% concluído</span>}
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        {!company.onboardingTrack ? (
          <Card className="!rounded-2xl !border-surface-100 shadow-card p-8 text-center">
            <p className="text-surface-500 dark:text-surface-300">
              Esta empresa ainda não tem uma track de onboarding atribuída. Defina uma track em{' '}
              <Link to="/admin/companies" className="text-primary-600 hover:underline">Gerenciamento de Empresas</Link>.
            </p>
          </Card>
        ) : items.length === 0 ? (
          <Card className="!rounded-2xl !border-surface-100 shadow-card p-8 text-center">
            <p className="text-surface-500 dark:text-surface-300">
              Não há checklist configurado para a track <strong>{TRACK_LABELS[company.onboardingTrack]}</strong> ainda. Configure em{' '}
              <Link to="/admin/onboarding-templates" className="text-primary-600 hover:underline">Checklists de Onboarding</Link>.
            </p>
          </Card>
        ) : (
          <Card className="!rounded-2xl !border-surface-100 shadow-card p-6">
            <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-600 to-primary-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const Icon = ITEM_TYPE_META[item.itemType].icon;
                const isUserScoped = item.scope === 'user';
                const isCompleted = item.status === 'completed';

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${
                      isCompleted
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/15'
                        : 'border-surface-100 dark:border-surface-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isCompleted ? (
                        <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-surface-300 dark:text-surface-600 flex-shrink-0" />
                      )}
                      <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-violet-600 dark:text-violet-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary">{ITEM_TYPE_META[item.itemType].label}</Badge>
                          {isUserScoped && (
                            <span className="flex items-center gap-1 text-xs text-surface-400">
                              <Users size={12} /> {item.usersCompletedCount}/{item.usersTotalCount} usuários
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isUserScoped ? (
                      <Badge variant={isCompleted ? 'success' : 'warning'}>
                        {isCompleted ? 'Concluído' : 'Em andamento'}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-xl"
                        variant={isCompleted ? 'secondary' : 'primary'}
                        onClick={() => handleToggle(item)}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle size={16} />
                            Concluído
                          </>
                        ) : (
                          <>
                            <Circle size={16} />
                            Marcar como concluído
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
