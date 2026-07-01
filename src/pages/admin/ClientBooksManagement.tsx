import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, BookOpen, Trash2, Building, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { clientBooksService } from '../../hooks/useClientBooks';
import { useAuthStore } from '../../stores/authStore';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { ClientBook, Company } from '../../types';

export const ClientBooksManagement = () => {
  const { user } = useAuthStore();
  const confirm = useConfirm();
  const [books, setBooks] = useState<ClientBook[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ companyId: '', title: '', description: '', coverEmoji: '📘' });

  const load = async () => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    const [b, { data: c }] = await Promise.all([
      clientBooksService.listAll(),
      supabase.from('companies').select('*').order('name'),
    ]);
    setBooks(b);
    setCompanies(((c ?? []) as Array<{ id: string; name: string; status: Company['status']; created_at?: string }>).map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      createdAt: row.created_at,
    })));
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const companyNameById = (id: string) => companies.find((c) => c.id === id)?.name ?? id;

  const handleCreate = async () => {
    if (!form.companyId || !form.title.trim()) {
      toast.error('Selecione a empresa e informe o título.');
      return;
    }
    const created = await clientBooksService.createBook({
      companyId: form.companyId,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      coverEmoji: form.coverEmoji || '📘',
      status: 'active',
      createdBy: user?.id,
    });
    if (created) {
      toast.success('Book criado.');
      setIsModalOpen(false);
      setForm({ companyId: '', title: '', description: '', coverEmoji: '📘' });
      load();
    } else {
      toast.error('Falha ao criar o book.');
    }
  };

  const handleDelete = (book: ClientBook) => {
    confirm({
      title: 'Excluir book',
      message: `Excluir "${book.title}"? Todas as páginas e conteúdo serão perdidos.`,
      confirmText: 'Excluir',
      variant: 'danger',
      onConfirm: async () => {
        const ok = await clientBooksService.deleteBook(book.id);
        if (ok) {
          toast.success('Book excluído.');
          load();
        } else {
          toast.error('Falha ao excluir.');
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Books de Clientes</h1>
            <p className="text-surface-500 dark:text-surface-300 mt-1">
              Crie documentos e quadros por empresa — substitui o uso do Notion externo
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Novo book
          </Button>
        </div>
      </div>

      <div className="container-app py-6">
        {isLoading ? (
          <p className="text-surface-500 dark:text-surface-300 text-center py-12">Carregando...</p>
        ) : books.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-300">Nenhum book criado ainda.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <Card key={book.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-3xl leading-none">{book.coverEmoji ?? '📘'}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-surface-900 dark:text-surface-100 truncate">{book.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info">
                          <Building size={10} className="inline mr-1" />
                          {companyNameById(book.companyId)}
                        </Badge>
                      </div>
                      {book.description && (
                        <p className="text-sm text-surface-500 dark:text-surface-300 mt-2 line-clamp-2">{book.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-100 dark:border-surface-700">
                  <Link to={`/admin/client-books/${book.id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer">
                    <ExternalLink size={14} /> Abrir
                  </Link>
                  <button onClick={() => handleDelete(book)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-red-500 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo book">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Empresa</label>
            <select
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
            >
              <option value="">Selecione</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Ícone</label>
              <input
                value={form.coverEmoji}
                onChange={(e) => setForm({ ...form, coverEmoji: e.target.value })}
                maxLength={4}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-2xl text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Título</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                placeholder="Ex: Escopo de Implantação — Cliente X"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Descrição (opcional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
