import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  ChecklistItemScope,
  ChecklistItemStatus,
  ChecklistItemView,
  ChecklistTemplateItem,
  OnboardingTrack,
} from '../types';

// ---- Mapping helpers ----
// Schema do banco usa snake_case; os tipos usam camelCase (mesmo padrão de dataStore.ts).

interface TemplateItemRow {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  item_type: string;
  order: number;
  blocks_next: boolean;
  scope: string;
  course_id: string | null;
  lesson_id: string | null;
  product_event_key: string | null;
}

const fromDbTemplateItem = (row: TemplateItemRow): ChecklistTemplateItem => ({
  id: row.id,
  templateId: row.template_id,
  title: row.title,
  description: row.description ?? undefined,
  itemType: row.item_type as ChecklistTemplateItem['itemType'],
  order: row.order,
  blocksNext: row.blocks_next,
  scope: row.scope as ChecklistItemScope,
  courseId: row.course_id ?? undefined,
  lessonId: row.lesson_id ?? undefined,
  productEventKey: row.product_event_key ?? undefined,
});

interface ItemProgressRow {
  id: string;
  company_id: string;
  template_item_id: string;
  user_id: string | null;
  status: string;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
}

async function getActiveTemplateId(track: OnboardingTrack): Promise<string | null> {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('id')
    .eq('track', track)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}

export const checklistProgressService = {
  /**
   * Monta o checklist completo de uma empresa: itens do template ativo da
   * track + progresso (company-scoped e do usuário atual) + lock sequencial.
   */
  async getCompanyChecklist(
    companyId: string,
    track: OnboardingTrack | undefined,
    userId: string,
  ): Promise<ChecklistItemView[]> {
    if (!isSupabaseConfigured() || !track) return [];

    try {
      const templateId = await getActiveTemplateId(track);
      if (!templateId) return [];

      const { data: itemRows, error: itemsError } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', templateId)
        .order('order', { ascending: true });

      if (itemsError || !itemRows) return [];

      const items = (itemRows as TemplateItemRow[]).map(fromDbTemplateItem);
      if (items.length === 0) return [];

      const { data: progressRows } = await supabase
        .from('checklist_item_progress')
        .select('*')
        .eq('company_id', companyId)
        .in('template_item_id', items.map((i) => i.id));

      const progressByItem = new Map<string, ItemProgressRow>();
      for (const row of (progressRows as ItemProgressRow[] | null) ?? []) {
        // progresso "da empresa" (user_id null) ou do próprio usuário logado
        if (row.user_id === null || row.user_id === userId) {
          progressByItem.set(row.template_item_id, row);
        }
      }

      let previousCompleted = true;
      return items.map((item) => {
        const progress = progressByItem.get(item.id);
        const status: ChecklistItemStatus = (progress?.status as ChecklistItemStatus) ?? 'pending';
        const isLocked = !previousCompleted;
        if (item.blocksNext) {
          previousCompleted = status === 'completed';
        }
        return {
          ...item,
          status,
          completedAt: progress?.completed_at ?? undefined,
          completedBy: progress?.completed_by ?? undefined,
          notes: progress?.notes ?? undefined,
          isLocked,
        };
      });
    } catch (error) {
      console.error('Error fetching company checklist:', error);
      return [];
    }
  },

  async markItemCompleted(
    companyId: string,
    templateItemId: string,
    scope: ChecklistItemScope,
    userId: string,
    completedBy?: string,
    notes?: string,
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        company_id: companyId,
        template_item_id: templateItemId,
        user_id: scope === 'user' ? userId : null,
        status: 'completed',
        completed_at: now,
        completed_by: completedBy ?? null,
        notes: notes ?? null,
        updated_at: now,
      };

      const onConflict =
        scope === 'user'
          ? 'company_id,template_item_id,user_id'
          : 'company_id,template_item_id';

      const { error } = await supabase
        .from('checklist_item_progress')
        .upsert(payload, { onConflict, ignoreDuplicates: false });

      if (error) {
        console.error('Error marking checklist item completed:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error marking checklist item completed:', error);
      return false;
    }
  },

  async markItemPending(
    companyId: string,
    templateItemId: string,
    scope: ChecklistItemScope,
    userId: string,
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        company_id: companyId,
        template_item_id: templateItemId,
        user_id: scope === 'user' ? userId : null,
        status: 'pending',
        completed_at: null,
        completed_by: null,
        updated_at: now,
      };

      const onConflict =
        scope === 'user'
          ? 'company_id,template_item_id,user_id'
          : 'company_id,template_item_id';

      const { error } = await supabase
        .from('checklist_item_progress')
        .upsert(payload, { onConflict, ignoreDuplicates: false });

      if (error) {
        console.error('Error marking checklist item pending:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error marking checklist item pending:', error);
      return false;
    }
  },

  /**
   * Chamado quando uma lição da Academy é concluída. Procura itens do tipo
   * `academy_lesson` no template ativo da empresa que referenciam essa
   * lição/curso e marca como concluído automaticamente. Resolve a track da
   * empresa internamente para não acoplar o chamador (LessonViewer) a esse
   * detalhe.
   */
  async syncAcademyLessonCompletion(
    userId: string,
    companyId: string | undefined,
    courseId: string,
    lessonId: string,
  ): Promise<void> {
    if (!isSupabaseConfigured() || !companyId) return;

    try {
      const { data: company } = await supabase
        .from('companies')
        .select('onboarding_track')
        .eq('id', companyId)
        .single();

      const track = (company?.onboarding_track as OnboardingTrack | null) ?? undefined;
      if (!track) return;

      const templateId = await getActiveTemplateId(track);
      if (!templateId) return;

      const { data: itemRows } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', templateId)
        .eq('item_type', 'academy_lesson')
        .or(`lesson_id.eq.${lessonId},and(lesson_id.is.null,course_id.eq.${courseId})`);

      const items = ((itemRows as TemplateItemRow[] | null) ?? []).map(fromDbTemplateItem);

      for (const item of items) {
        await this.markItemCompleted(companyId, item.id, item.scope, userId);
      }
    } catch (error) {
      console.error('Error syncing academy lesson completion to checklist:', error);
    }
  },

  getNextActionableItem(items: ChecklistItemView[]): ChecklistItemView | null {
    return items.find((item) => !item.isLocked && item.status !== 'completed') ?? null;
  },

  /**
   * Visão administrativa: itens do template ativo da track + progresso
   * agregado por empresa. Para itens `scope='user'`, retorna quantos
   * usuários da empresa já completaram, em vez do status de um único usuário.
   */
  async getCompanyChecklistAdmin(
    companyId: string,
    track: OnboardingTrack | undefined,
  ): Promise<Array<ChecklistTemplateItem & {
    status: ChecklistItemStatus;
    completedAt?: string;
    completedBy?: string;
    notes?: string;
    usersCompletedCount: number;
    usersTotalCount: number;
  }>> {
    if (!isSupabaseConfigured() || !track) return [];

    try {
      const templateId = await getActiveTemplateId(track);
      if (!templateId) return [];

      const { data: itemRows } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', templateId)
        .order('order', { ascending: true });

      const items = ((itemRows as TemplateItemRow[] | null) ?? []).map(fromDbTemplateItem);
      if (items.length === 0) return [];

      const [{ data: progressRows }, { count: usersTotalCount }] = await Promise.all([
        supabase
          .from('checklist_item_progress')
          .select('*')
          .eq('company_id', companyId)
          .in('template_item_id', items.map((i) => i.id)),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId),
      ]);

      const rows = (progressRows as ItemProgressRow[] | null) ?? [];

      return items.map((item) => {
        if (item.scope === 'user') {
          const userRows = rows.filter((r) => r.template_item_id === item.id && r.user_id !== null);
          const completedCount = userRows.filter((r) => r.status === 'completed').length;
          return {
            ...item,
            status: completedCount > 0 && completedCount === (usersTotalCount ?? 0) ? 'completed' : 'in_progress',
            usersCompletedCount: completedCount,
            usersTotalCount: usersTotalCount ?? 0,
          };
        }

        const companyRow = rows.find((r) => r.template_item_id === item.id && r.user_id === null);
        return {
          ...item,
          status: (companyRow?.status as ChecklistItemStatus) ?? 'pending',
          completedAt: companyRow?.completed_at ?? undefined,
          completedBy: companyRow?.completed_by ?? undefined,
          notes: companyRow?.notes ?? undefined,
          usersCompletedCount: 0,
          usersTotalCount: usersTotalCount ?? 0,
        };
      });
    } catch (error) {
      console.error('Error fetching admin checklist view:', error);
      return [];
    }
  },
};
