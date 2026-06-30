import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ChecklistTemplate, ChecklistTemplateItem, OnboardingTrack } from '../types';

interface TemplateRow {
  id: string;
  track: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

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
  scope: row.scope as ChecklistTemplateItem['scope'],
  courseId: row.course_id ?? undefined,
  lessonId: row.lesson_id ?? undefined,
  productEventKey: row.product_event_key ?? undefined,
});

const fromDbTemplate = (row: TemplateRow, items: ChecklistTemplateItem[]): ChecklistTemplate => ({
  id: row.id,
  track: row.track as OnboardingTrack,
  name: row.name,
  description: row.description ?? undefined,
  isActive: row.is_active,
  items,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

export const checklistTemplateService = {
  async listTemplates(): Promise<ChecklistTemplate[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: templateRows, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('track', { ascending: true });

      if (error || !templateRows) return [];

      const { data: itemRows } = await supabase
        .from('checklist_template_items')
        .select('*')
        .order('order', { ascending: true });

      const itemsByTemplate = new Map<string, ChecklistTemplateItem[]>();
      for (const row of (itemRows as TemplateItemRow[] | null) ?? []) {
        const item = fromDbTemplateItem(row);
        const list = itemsByTemplate.get(item.templateId) ?? [];
        list.push(item);
        itemsByTemplate.set(item.templateId, list);
      }

      return (templateRows as TemplateRow[]).map((row) =>
        fromDbTemplate(row, itemsByTemplate.get(row.id) ?? []),
      );
    } catch (error) {
      console.error('Error listing checklist templates:', error);
      return [];
    }
  },

  async createTemplate(track: OnboardingTrack, name: string, description?: string): Promise<ChecklistTemplate | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from('checklist_templates').insert({
        id,
        track,
        name,
        description: description ?? null,
        is_active: true,
      });

      if (error) {
        console.error('Error creating checklist template:', error);
        return null;
      }
      return { id, track, name, description, isActive: true, items: [] };
    } catch (error) {
      console.error('Error creating checklist template:', error);
      return null;
    }
  },

  async updateTemplate(id: string, updates: Partial<Pick<ChecklistTemplate, 'name' | 'description' | 'isActive'>>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) row.name = updates.name;
      if (updates.description !== undefined) row.description = updates.description;
      if (updates.isActive !== undefined) row.is_active = updates.isActive;

      const { error } = await supabase.from('checklist_templates').update(row).eq('id', id);
      if (error) {
        console.error('Error updating checklist template:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating checklist template:', error);
      return false;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
      if (error) {
        console.error('Error deleting checklist template:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting checklist template:', error);
      return false;
    }
  },

  async addTemplateItem(item: Omit<ChecklistTemplateItem, 'id'>): Promise<ChecklistTemplateItem | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from('checklist_template_items').insert({
        id,
        template_id: item.templateId,
        title: item.title,
        description: item.description ?? null,
        item_type: item.itemType,
        order: item.order,
        blocks_next: item.blocksNext,
        scope: item.scope,
        course_id: item.courseId ?? null,
        lesson_id: item.lessonId ?? null,
        product_event_key: item.productEventKey ?? null,
      });

      if (error) {
        console.error('Error adding checklist template item:', error);
        return null;
      }
      return { ...item, id };
    } catch (error) {
      console.error('Error adding checklist template item:', error);
      return null;
    }
  },

  async updateTemplateItem(id: string, updates: Partial<Omit<ChecklistTemplateItem, 'id' | 'templateId'>>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) row.title = updates.title;
      if (updates.description !== undefined) row.description = updates.description;
      if (updates.itemType !== undefined) row.item_type = updates.itemType;
      if (updates.order !== undefined) row.order = updates.order;
      if (updates.blocksNext !== undefined) row.blocks_next = updates.blocksNext;
      if (updates.scope !== undefined) row.scope = updates.scope;
      if (updates.courseId !== undefined) row.course_id = updates.courseId;
      if (updates.lessonId !== undefined) row.lesson_id = updates.lessonId;
      if (updates.productEventKey !== undefined) row.product_event_key = updates.productEventKey;

      const { error } = await supabase.from('checklist_template_items').update(row).eq('id', id);
      if (error) {
        console.error('Error updating checklist template item:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating checklist template item:', error);
      return false;
    }
  },

  async deleteTemplateItem(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('checklist_template_items').delete().eq('id', id);
      if (error) {
        console.error('Error deleting checklist template item:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting checklist template item:', error);
      return false;
    }
  },
};
