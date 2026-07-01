import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { clientBooksService } from '../../hooks/useClientBooks';
import { Card } from '../../components/ui/Card';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { ClientBook } from '../../types';

export const MyProjects = () => {
  const { user } = useAuthStore();
  const [books, setBooks] = useState<ClientBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.company_id) {
        setIsLoading(false);
        return;
      }
      const data = await clientBooksService.listByCompany(user.company_id);
      setBooks(data);
      setIsLoading(false);
    };
    load();
  }, [user?.company_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <p className="text-surface-500 dark:text-surface-300">Carregando seus projetos...</p>
      </div>
    );
  }

  if (!user?.company_id) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <BookOpen size={40} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500 dark:text-surface-300">
            Sua conta não está vinculada a uma empresa, então não há projetos disponíveis.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Meus Projetos</h1>
          <p className="text-surface-500 dark:text-surface-300 mt-1">
            Documentos, quadros e escopos criados pelo time Recrutei para a sua conta
          </p>
        </div>
      </div>

      <div className="container-app py-6">
        {books.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-300">
              Nenhum projeto disponível ainda. Aguarde o seu consultor Recrutei disponibilizar.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <Link key={book.id} to={`/projects/${book.id}`}>
                <Card className="p-5 h-full flex items-start justify-between gap-3 hover:border-primary-300 dark:hover:border-primary-700 transition-colors" hover>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-3xl leading-none">{book.coverEmoji ?? '📘'}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-surface-900 dark:text-surface-100 truncate">{book.title}</p>
                      {book.description && (
                        <p className="text-sm text-surface-500 dark:text-surface-300 line-clamp-2 mt-1">{book.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-surface-400 flex-shrink-0 mt-1" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
