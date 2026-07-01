import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, FileText, Kanban, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { clientBooksService } from '../hooks/useClientBooks';
import { useConfirm } from '../hooks/useConfirm';
import { TipTapEditor } from '../components/TipTapEditor';
import { KanbanBoard } from '../components/KanbanBoard';
import { sanitizeHtml } from '../lib/sanitize';
import type { BookPage, BookPageType, ClientBook, DocContent, KanbanContent } from '../types';
import { useDebounce } from '../hooks/useDebounce';

export const BookEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const confirm = useConfirm();

  const [book, setBook] = useState<ClientBook | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<BookPage>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const debouncedPending = useDebounce(pendingChanges, 800);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const [b, p] = await Promise.all([clientBooksService.getBook(id), clientBooksService.listPages(id)]);
    setBook(b);
    setPages(p);
    setSelectedPageId((prev) => prev ?? p[0]?.id ?? null);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-save de mudanças por página (debounced)
  useEffect(() => {
    const entries = Object.entries(debouncedPending);
    if (entries.length === 0) return;

    let cancelled = false;
    (async () => {
      setIsSaving(true);
      for (const [pageId, patch] of entries) {
        await clientBooksService.updatePage(pageId, { ...patch, updatedBy: user?.id });
      }
      if (cancelled) return;
      setPendingChanges({});
      setIsSaving(false);
    })();
    return () => { cancelled = true; };
  }, [debouncedPending, user?.id]);

  const selectedPage = useMemo(() => pages.find((p) => p.id === selectedPageId) ?? null, [pages, selectedPageId]);

  const patchPage = (pageId: string, patch: Partial<BookPage>) => {
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, ...patch } : p)));
    setPendingChanges((prev) => ({ ...prev, [pageId]: { ...prev[pageId], ...patch } }));
  };

  const handleAddPage = async (pageType: BookPageType) => {
    if (!id) return;
    const page = await clientBooksService.createPage(id, pageType, pages.length, pageType === 'kanban' ? 'Novo quadro' : 'Nova página');
    if (page) {
      setPages((prev) => [...prev, page]);
      setSelectedPageId(page.id);
      toast.success('Página criada.');
    } else {
      toast.error('Não foi possível criar a página.');
    }
  };

  const handleDeletePage = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    confirm({
      title: 'Excluir página',
      message: `Excluir "${page.title}"? Não pode ser desfeito.`,
      confirmText: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await clientBooksService.deletePage(pageId);
        if (ok) {
          setPages((prev) => prev.filter((p) => p.id !== pageId));
          if (selectedPageId === pageId) {
            setSelectedPageId(pages.find((p) => p.id !== pageId)?.id ?? null);
          }
          toast.success('Página excluída.');
        } else {
          toast.error('Falha ao excluir.');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Carregando...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Book não encontrado.</p>
      </div>
    );
  }

  const backTo = isAdmin ? '/admin/client-books' : '/projects';

  return (
    <div className="h-screen bg-surface-50 dark:bg-surface-900 flex flex-col overflow-hidden">
      {/* Header do book */}
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(backTo)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <div className="text-2xl">{book.coverEmoji ?? '📘'}</div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100 truncate">{book.title}</h1>
              {book.description && <p className="text-xs text-surface-500 dark:text-surface-300 truncate">{book.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-300">
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Salvando...
              </>
            ) : Object.keys(pendingChanges).length > 0 ? (
              <>
                <Save size={14} /> Alterações pendentes
              </>
            ) : (
              <>
                <Save size={14} /> Tudo salvo
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar de páginas */}
        <aside className="w-64 border-r border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 overflow-y-auto flex flex-col">
          <div className="p-3 space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${
                  selectedPageId === page.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
                }`}
              >
                {page.pageType === 'kanban' ? <Kanban size={14} /> : <FileText size={14} />}
                <span className="text-sm truncate flex-1">{page.title || 'Sem título'}</span>
              </button>
            ))}
            {pages.length === 0 && (
              <p className="text-xs text-surface-400 dark:text-surface-500 text-center py-6">Sem páginas ainda</p>
            )}
          </div>
          {isAdmin && (
            <div className="p-3 border-t border-surface-200 dark:border-surface-700 space-y-2">
              <button
                onClick={() => handleAddPage('doc')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer"
              >
                <Plus size={14} /> Nova página (doc)
              </button>
              <button
                onClick={() => handleAddPage('kanban')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer"
              >
                <Plus size={14} /> Novo quadro (kanban)
              </button>
            </div>
          )}
        </aside>

        {/* Área principal */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {!selectedPage ? (
            <div className="h-full flex items-center justify-center text-surface-400">
              Selecione uma página à esquerda
            </div>
          ) : (
            <div className="max-w-5xl mx-auto py-8 px-6">
              <div className="flex items-center justify-between mb-6">
                {isAdmin ? (
                  <input
                    value={selectedPage.title}
                    onChange={(e) => patchPage(selectedPage.id, { title: e.target.value })}
                    className="text-3xl font-bold bg-transparent border-none focus:outline-none text-surface-900 dark:text-surface-100 w-full"
                    placeholder="Título da página"
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-100">{selectedPage.title}</h2>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDeletePage(selectedPage.id)}
                    className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-red-500 cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {selectedPage.pageType === 'doc' ? (
                isAdmin ? (
                  <TipTapEditor
                    content={(selectedPage.content as DocContent)?.html ?? ''}
                    onChange={(html) => patchPage(selectedPage.id, { content: { html } })}
                  />
                ) : (
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml((selectedPage.content as DocContent)?.html ?? '') }}
                  />
                )
              ) : (
                <KanbanBoard
                  value={(selectedPage.content as KanbanContent) ?? { columns: [] }}
                  onChange={(kanban) => patchPage(selectedPage.id, { content: kanban })}
                  readOnly={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper: página do admin (list books de todas empresas)
// e página do cliente (list books da sua empresa). Ambas embutem <BookList/>
// através de dedicated files pra evitar deps circulares. Ver MyProjects.tsx e
// ClientBooksManagement.tsx.
export const _BookEditorFallback = () => (
  <Link to="/">Voltar</Link>
);
