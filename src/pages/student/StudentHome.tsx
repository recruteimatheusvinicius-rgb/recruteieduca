import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { CourseCard } from '../../components/ui/CourseCard';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Search, Sparkles, ListChecks, ChevronRight } from 'lucide-react';
import { stripHtml } from '../../lib/sanitize';
import { useDebounce } from '../../hooks/useDebounce';

export const StudentHome = () => {
  const { courses } = useDataStore();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(searchQuery, 200);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Sincroniza a busca com o parâmetro da URL (ex.: busca feita pela navbar)
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // Estudantes só enxergam cursos publicados (rascunhos/arquivados são internos)
  const publishedCourses = courses.filter(course => course.status === 'published');

  const categories = ['Todos', ...new Set(publishedCourses.map(c => c.category).filter(Boolean))];

  const filteredCourses = publishedCourses.filter(course => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return selectedCategory === 'Todos' || course.category === selectedCategory;
    const haystack = `${course.title} ${stripHtml(course.description)} ${course.instructor ?? ''}`.toLowerCase();
    const matchesSearch = haystack.includes(q);
    const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 text-white">
        <div className="container-app py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center animate-stagger">
            <div className="flex items-center justify-center gap-2 text-white/80 mb-3">
              <Sparkles size={18} />
              <span className="text-sm font-medium">Bem-vindo de volta!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">O que você vai aprender hoje?</h1>
            <p className="text-white/80 text-lg mb-8">Continue de onde parou ou explore novos cursos.</p>

            <div className="relative max-w-xl mx-auto">
              <Input
                icon={<Search size={20} />}
                placeholder="Buscar cursos, tópicos ou instrutores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="!bg-white !border-0 !text-surface-900 !rounded-xl placeholder:text-surface-400 !py-3 !shadow-card"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {user?.company_id && (
          <Link to="/onboarding" className="block mb-8">
            <Card className="p-5 flex items-center justify-between gap-4 rounded-2xl hover:shadow-hover transition-shadow" hover>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <ListChecks size={22} className="text-violet-600 dark:text-violet-300" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-surface-100">Meu Onboarding</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Acompanhe as etapas de implantação da sua conta</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-surface-400 flex-shrink-0" />
            </Card>
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-hover'
                    : 'bg-white dark:bg-surface-800 text-surface-500 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 border border-surface-100 dark:border-surface-700'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-stagger">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={0}
                showProgress={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-violet-500 dark:text-violet-300" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-surface-500 dark:text-surface-400">
              Tente buscar por outro termo ou categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};