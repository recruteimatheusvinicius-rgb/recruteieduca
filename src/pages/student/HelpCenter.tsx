import { useState, useMemo } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useDebounce } from '../../hooks/useDebounce';
import { stripHtml } from '../../lib/sanitize';
import { Search, HelpCircle, BookOpen, Video, ChevronRight, MessageCircle } from 'lucide-react';

export const HelpCenter = () => {
  const { helpArticles } = useDataStore();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorias e contagens derivadas dinamicamente dos artigos do banco
  const categories = useMemo(() => {
    const counts = helpArticles.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count, icon: BookOpen }));
  }, [helpArticles]);

  const filteredArticles = helpArticles.filter(article => {
    const q = debouncedSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      article.title.toLowerCase().includes(q) ||
      stripHtml(article.content).toLowerCase().includes(q);
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  // Top 4 títulos de artigos como "perguntas frequentes"; clicar busca pelo termo
  const popularQuestions = useMemo(
    () => helpArticles.slice(0, 4).map(a => a.title),
    [helpArticles]
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 text-white py-16">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-6">
              <HelpCircle size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Central de Ajuda</h1>
            <p className="text-white/80 text-lg mb-8">Encontre respostas para suas dúvidas ou entre em contato conosco</p>

            <div className="relative max-w-xl mx-auto">
              <Input
                icon={<Search size={20} />}
                placeholder="Buscar artigos, perguntas frequentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!bg-white !border-0 !text-surface-900 !rounded-xl placeholder:text-surface-400 !py-3 !shadow-card"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-12">
        {categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex items-center gap-4 p-4 bg-white dark:bg-surface-800 rounded-2xl border hover:shadow-card transition-all text-left cursor-pointer ${
                  selectedCategory === category.name
                    ? 'border-primary-500 dark:border-primary-400'
                    : 'border-surface-100 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
                  <category.icon size={24} className="text-violet-600 dark:text-violet-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900 dark:text-surface-100">{category.name}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    {category.count} {category.count === 1 ? 'artigo' : 'artigos'}
                  </p>
                </div>
                <ChevronRight size={20} className="text-surface-400" />
              </button>
            ))}
          </div>
        )}

        {search ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-6">
              Resultados para "{search}"
            </h2>
            <div className="space-y-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <Card
                    key={article.id}
                    className="cursor-pointer rounded-2xl border-surface-100 dark:border-surface-700"
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{article.category}</span>
                        </div>
                        <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100">
                          {article.title}
                        </h3>
                        {expandedArticle === article.id && (
                          <p className="text-surface-500 dark:text-surface-400 mt-3 line-clamp-3">
                            {article.content.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        size={20}
                        className={`text-surface-400 transition-transform ${expandedArticle === article.id ? 'rotate-90' : ''}`}
                      />
                    </div>
                    {article.videoUrl && expandedArticle === article.id && (
                      <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                        <Button variant="secondary" size="sm">
                          <Video size={16} className="mr-2" />
                          Assistir Vídeo
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-violet-500 dark:text-violet-300" />
                  </div>
                  <p className="text-surface-500 dark:text-surface-400">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {popularQuestions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-6">
                  Perguntas Frequentes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => setSearch(question)}
                      className="flex items-center gap-3 p-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-100 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card transition-all text-left cursor-pointer"
                    >
                      <Search size={18} className="text-primary-500 flex-shrink-0" />
                      <span className="text-surface-600 dark:text-surface-300">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-6">
                {selectedCategory ? `Artigos em ${selectedCategory}` : 'Todos os Artigos'}
              </h2>
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={24} className="text-violet-500 dark:text-violet-300" />
                  </div>
                  <p className="text-surface-500 dark:text-surface-400">
                    {helpArticles.length === 0
                      ? 'Ainda não há artigos disponíveis.'
                      : 'Nenhum artigo nesta categoria.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map(article => (
                    <Card
                      key={article.id}
                      hover
                      className="cursor-pointer rounded-2xl border-surface-100 dark:border-surface-700"
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    >
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{article.category}</span>
                      <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-2">
                        {article.title}
                      </h3>
                      <p className={`text-sm text-surface-500 dark:text-surface-400 mb-4 ${expandedArticle === article.id ? '' : 'line-clamp-2'}`}>
                        {stripHtml(article.content)}
                      </p>
                      {article.videoUrl && (
                        <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                          <Video size={16} />
                          <span>Com vídeo</span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-16 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-surface-800 dark:to-surface-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-white/70 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-violet-600 dark:text-violet-300" />
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Ainda precisa de ajuda?
          </h3>
          <p className="text-surface-500 dark:text-surface-300 mb-6">
            Nossa equipe está pronta para responder suas dúvidas
          </p>
          <Button onClick={() => window.Tawk_API?.toggle()}>
            Fale Conosco!
          </Button>
        </div>
      </div>
    </div>
  );
};