import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { checklistProgressService } from '../../hooks/useChecklistProgress';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ListChecks, Video, Phone, Flag, Award, Lock, CheckCircle, Clock } from 'lucide-react';
import type { ChecklistItemType, ChecklistItemView, OnboardingTrack } from '../../types';

const ITEM_TYPE_META: Record<ChecklistItemType, { label: string; icon: typeof Video }> = {
  academy_lesson: { label: 'Aula da Academy', icon: Video },
  call: { label: 'Call com o time Recrutei', icon: Phone },
  manual_milestone: { label: 'Marco de implantação', icon: Flag },
  certificate: { label: 'Certificação', icon: Award },
};

const TRACK_LABELS: Record<OnboardingTrack, string> = {
  self_service: 'Self-service',
  guided_growth: 'Guided Growth',
  enterprise_deploy: 'Enterprise Deploy',
  rescue_recover: 'Rescue/Recover',
};

export const OnboardingChecklist = () => {
  const { user } = useAuthStore();
  const [track, setTrack] = useState<OnboardingTrack | undefined>();
  const [items, setItems] = useState<ChecklistItemView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.company_id || !isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      const { data: company } = await supabase
        .from('companies')
        .select('onboarding_track')
        .eq('id', user.company_id)
        .single();

      const companyTrack = (company?.onboarding_track as OnboardingTrack | null) ?? undefined;
      setTrack(companyTrack);

      const checklist = await checklistProgressService.getCompanyChecklist(user.company_id, companyTrack, user.id);
      setItems(checklist);
      setIsLoading(false);
    };

    load();
  }, [user?.company_id, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Carregando seu onboarding...</p>
      </div>
    );
  }

  if (!user?.company_id) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center rounded-2xl border-surface-100 dark:border-surface-700">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ListChecks size={28} className="text-violet-500 dark:text-violet-300" />
          </div>
          <p className="text-surface-500 dark:text-surface-400">
            Sua conta não está vinculada a uma empresa, então não há um checklist de onboarding disponível.
          </p>
        </Card>
      </div>
    );
  }

  if (!track || items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center rounded-2xl border-surface-100 dark:border-surface-700">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ListChecks size={28} className="text-violet-500 dark:text-violet-300" />
          </div>
          <p className="text-surface-500 dark:text-surface-400">
            Ainda não há um checklist de implantação configurado para sua conta. Fale com o seu consultor Recrutei.
          </p>
        </Card>
      </div>
    );
  }

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Meu Onboarding</h1>
          <p className="text-surface-500 dark:text-surface-300 mt-1">
            Track <strong>{TRACK_LABELS[track]}</strong> — acompanhe as etapas de implantação da sua conta
          </p>
        </div>
      </div>

      <div className="container-app py-6">
        <Card className="p-6 max-w-2xl mx-auto rounded-2xl border-surface-100 dark:border-surface-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-surface-500 dark:text-surface-400">Progresso geral</span>
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const Icon = ITEM_TYPE_META[item.itemType].icon;
              const isDone = item.status === 'completed';
              const isLocked = item.isLocked;

              const content = (
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    isLocked
                      ? 'border-surface-100 dark:border-surface-700 opacity-50'
                      : isDone
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                        : 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isLocked
                          ? 'border-2 border-surface-200 dark:border-surface-600 text-surface-400'
                          : 'bg-primary-500 text-white'
                    }`}
                  >
                    {isLocked ? <Lock size={16} /> : isDone ? <CheckCircle size={16} /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-surface-400 flex-shrink-0" />
                      <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{item.title}</p>
                    </div>
                    {item.description && (
                      <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{item.description}</p>
                    )}
                  </div>

                  <Badge variant={isDone ? 'success' : isLocked ? 'secondary' : 'warning'} className="rounded-full">
                    {isDone ? 'Concluído' : isLocked ? 'Bloqueado' : 'Pendente'}
                  </Badge>
                </div>
              );

              if (item.itemType === 'academy_lesson' && item.lessonId && !isLocked) {
                return (
                  <Link key={item.id} to={`/lesson/${item.lessonId}`} className="block cursor-pointer hover:opacity-90">
                    {content}
                  </Link>
                );
              }
              if (item.itemType === 'academy_lesson' && item.courseId && !isLocked && !item.lessonId) {
                return (
                  <Link key={item.id} to={`/course/${item.courseId}`} className="block cursor-pointer hover:opacity-90">
                    {content}
                  </Link>
                );
              }

              return <div key={item.id}>{content}</div>;
            })}
          </div>

          {items.some((i) => i.itemType === 'call' && i.status !== 'completed' && !i.isLocked) && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start gap-3">
              <Clock size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Etapas de call são confirmadas pelo seu consultor Recrutei após a reunião acontecer.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
