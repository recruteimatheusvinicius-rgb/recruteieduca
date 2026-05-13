import { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { CourseCard } from '../../components/ui/CourseCard';
import { Input } from '../../components/ui/Input';
import { Search, Sparkles } from 'lucide-react';

export const StudentHome = () => {
  const { courses } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...new Set(courses.map(c => c.category))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container-app py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center animate-stagger">
            <div className="flex items-center justify-center gap-2 text-primary-200 mb-3">
              <Sparkles size={18} />
              <span className="text-sm font-medium">Bem-vindo de volta!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">O que você vai aprender hoje?</h1>
            <p className="text-primary-100 text-lg mb-8">Continue de onde parou ou explore novos cursos.</p>
            
            <div className="relative max-w-xl mx-auto">
              <Input
                icon={<Search size={20} />}
                placeholder="Buscar cursos, tópicos ou instrutores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="!bg-white/90 !border-0 !text-surface-900 placeholder:text-surface-500 !py-3"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 justify-center flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700'
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
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-surface-500 dark:text-surface-300">
              Tente buscar por outro termo ou categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};