import { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, HelpCircle, BookOpen, Video, ChevronRight, MessageCircle } from 'lucide-react';

export const HelpCenter = () => {
  const { helpArticles } = useDataStore();
  const [search, setSearch] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Recrutei', icon: BookOpen, count: helpArticles.filter(a => a.category === 'Recrutei').length || 5 },
    { name: 'RecruteiEduca', icon: BookOpen, count: helpArticles.filter(a => a.category === 'RecruteiEduca').length || 8 },
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
     article.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const popularQuestions = [
    'Como acessar meu certificado?',
    'Como acompanhar meu progresso?',
    'Como baixar materiais complementares?',
    'Como entrar em contato com o suporte?',
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
        <div className="container-app">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
              <HelpCircle size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Central de Ajuda</h1>
            <p className="text-primary-100 text-lg mb-8">Encontre respostas para suas dúvidas ou entre em contato conosco</p>
            
            <div className="relative max-w-xl mx-auto">
              <Input
                icon={<Search size={20} />}
                placeholder="Buscar artigos, perguntas frequentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!bg-white/90 !border-0 !text-surface-900 placeholder:text-surface-500 !py-3"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category.name)}
              className={`flex items-center gap-4 p-4 bg-white dark:bg-surface-800 rounded-xl border hover:shadow-card transition-all text-left ${
                selectedCategory === category.name
                  ? 'border-primary-500 dark:border-primary-400'
                  : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <category.icon size={24} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-surface-900 dark:text-surface-100">{category.name}</p>
                <p className="text-sm text-surface-500 dark:text-surface-300">{category.count} artigos</p>
              </div>
              <ChevronRight size={20} className="text-surface-400" />
            </button>
          ))}
        </div>

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
                    className="cursor-pointer"
                    onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info">{article.category}</Badge>
                        </div>
                        <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100">
                          {article.title}
                        </h3>
                        {expandedArticle === article.id && (
                          <p className="text-surface-600 dark:text-surface-300 mt-3 line-clamp-3">
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
                      <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
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
                  <Search size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
                  <p className="text-surface-600 dark:text-surface-300">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-6">
                Perguntas Frequentes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card transition-all text-left"
                  >
                    <Search size={18} className="text-primary-500 flex-shrink-0" />
                    <span className="text-surface-700 dark:text-surface-300">{question}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-6">
                Todos os Artigos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpArticles.map(article => (
                  <Card key={article.id} hover className="cursor-pointer">
                    <Badge variant="info" className="mb-3">{article.category}</Badge>
                    <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-surface-300 line-clamp-2 mb-4">
                      {article.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
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
            </div>
          </>
        )}

        <div className="mt-16 bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-700 rounded-2xl p-8 text-center">
          <MessageCircle size={48} className="mx-auto text-primary-500 mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Ainda precisa de ajuda?
          </h3>
          <p className="text-surface-600 dark:text-surface-300 mb-6">
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