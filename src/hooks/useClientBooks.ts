import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  BookPage,
  BookPageContent,
  BookPageType,
  ClientBook,
  ClientBookStatus,
  DocContent,
  KanbanContent,
} from '../types';

interface BookRow {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  cover_emoji: string | null;
  status: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PageRow {
  id: string;
  book_id: string;
  title: string;
  icon: string | null;
  page_type: string;
  content: unknown;
  order: number;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const fromDbBook = (row: BookRow): ClientBook => ({
  id: row.id,
  companyId: row.company_id,
  title: row.title,
  description: row.description ?? undefined,
  coverEmoji: row.cover_emoji ?? undefined,
  status: (row.status as ClientBookStatus) ?? 'active',
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

const fromDbPage = (row: PageRow): BookPage => ({
  id: row.id,
  bookId: row.book_id,
  title: row.title,
  icon: row.icon ?? undefined,
  pageType: (row.page_type as BookPageType) ?? 'doc',
  content: (row.content as BookPageContent) ?? {},
  order: row.order,
  updatedBy: row.updated_by ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

export const emptyDocContent = (): DocContent => ({ html: '' });
export const emptyKanbanContent = (): KanbanContent => ({
  columns: [
    { id: crypto.randomUUID(), title: 'A fazer', cards: [] },
    { id: crypto.randomUUID(), title: 'Em andamento', cards: [] },
    { id: crypto.randomUUID(), title: 'Concluído', cards: [] },
  ],
});

export const clientBooksService = {
  async listByCompany(companyId: string): Promise<ClientBook[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('client_books')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('listByCompany error', error);
      return [];
    }
    return ((data ?? []) as BookRow[]).map(fromDbBook);
  },

  async listAll(): Promise<ClientBook[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('client_books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('listAll error', error);
      return [];
    }
    return ((data ?? []) as BookRow[]).map(fromDbBook);
  },

  async getBook(id: string): Promise<ClientBook | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('client_books').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return fromDbBook(data as BookRow);
  },

  async createBook(book: Omit<ClientBook, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientBook | null> {
    if (!isSupabaseConfigured()) return null;
    const id = crypto.randomUUID();
    const { error } = await supabase.from('client_books').insert({
      id,
      company_id: book.companyId,
      title: book.title,
      description: book.description ?? null,
      cover_emoji: book.coverEmoji ?? '📘',
      status: book.status ?? 'active',
      created_by: book.createdBy ?? null,
    });
    if (error) {
      console.error('createBook error', error);
      return null;
    }
    return { ...book, id };
  },

  async updateBook(id: string, updates: Partial<Omit<ClientBook, 'id' | 'companyId'>>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.coverEmoji !== undefined) row.cover_emoji = updates.coverEmoji;
    if (updates.status !== undefined) row.status = updates.status;
    const { error } = await supabase.from('client_books').update(row).eq('id', id);
    if (error) console.error('updateBook error', error);
    return !error;
  },

  async deleteBook(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.from('client_books').delete().eq('id', id);
    if (error) console.error('deleteBook error', error);
    return !error;
  },

  async listPages(bookId: string): Promise<BookPage[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('book_pages')
      .select('*')
      .eq('book_id', bookId)
      .order('order', { ascending: true });
    if (error) {
      console.error('listPages error', error);
      return [];
    }
    return ((data ?? []) as PageRow[]).map(fromDbPage);
  },

  async createPage(bookId: string, pageType: BookPageType, order: number, title = 'Página sem título'): Promise<BookPage | null> {
    if (!isSupabaseConfigured()) return null;
    const id = crypto.randomUUID();
    const content = pageType === 'kanban' ? emptyKanbanContent() : emptyDocContent();
    const { error } = await supabase.from('book_pages').insert({
      id,
      book_id: bookId,
      title,
      page_type: pageType,
      content,
      order,
    });
    if (error) {
      console.error('createPage error', error);
      return null;
    }
    return {
      id,
      bookId,
      title,
      pageType,
      content,
      order,
    };
  },

  async updatePage(id: string, updates: Partial<Omit<BookPage, 'id' | 'bookId' | 'pageType'>>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.icon !== undefined) row.icon = updates.icon;
    if (updates.content !== undefined) row.content = updates.content;
    if (updates.order !== undefined) row.order = updates.order;
    if (updates.updatedBy !== undefined) row.updated_by = updates.updatedBy;
    const { error } = await supabase.from('book_pages').update(row).eq('id', id);
    if (error) console.error('updatePage error', error);
    return !error;
  },

  async deletePage(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.from('book_pages').delete().eq('id', id);
    if (error) console.error('deletePage error', error);
    return !error;
  },
};
