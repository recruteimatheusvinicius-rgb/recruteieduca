import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Search, BookOpen, Clock, CheckCircle, Star,
  Heart, TrendingUp
} from 'lucide-react';

export const MyCourses = () => {
  const { courses } = useDataStore();
  const { user } = useAuthStore();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

  const parseDurationMinutes = (duration: string | undefined) => {
    if (!duration) return 0;
    const hourMatch = duration.match(/(\d+)\s*h/);
    const minuteMatch = duration.match(/(\d+)\s*min/);
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return hours * 60 + minutes;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes <= 0) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!user || !isSupabaseConfigured()) {
        setStatsLoaded(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_enrollments')
          .select('course_id, progress')
          .eq('user_id', user.id);

        if (!error && data) {
          const enrollmentMap: Record<string, number> = {};
          const enrollmentRows = data as Array<{ course_id: string | null; progress: number | null }>;
          enrollmentRows.forEach((item) => {
            if (item.course_id) {
              enrollmentMap[item.course_id] = item.progress ?? 0;
            }
          });
          setEnrollments(enrollmentMap);
        }
      } catch (error) {
        console.error('Falha ao carregar inscrições:', error);
      } finally {
        setStatsLoaded(true);
      }
    };

    loadEnrollments();
  }, [user]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const enrolledCourses = useMemo(() => {
    return filteredCourses.filter((course) => enrollments[course.id] !== undefined);
  }, [filteredCourses, enrollments]);

  const ongoingCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
      const progress = enrollments[course.id] ?? 0;
      return progress > 0 && progress < 100;
    });
  }, [enrolledCourses, enrollments]);

  const completedCourses = useMemo(() => {
    return enrolledCourses.filter((course) => (enrollments[course.id] ?? 0) >= 100);
  }, [enrolledCourses, enrollments]);

  // Favoritos aparecem mesmo sem inscrição (o aluno pode favoritar para depois)
  const favoriteCourses = useMemo(() => {
    return filteredCourses.filter((course) => favorites.includes(course.id));
  }, [filteredCourses, favorites]);

  const displayCourses = activeTab === 'all'
    ? enrolledCourses
    : activeTab === 'ongoing'
      ? ongoingCourses
      : activeTab === 'completed'
        ? completedCourses
        : favoriteCourses;

  const totalMinutes = enrolledCourses.reduce(
    (sum, course) => sum + parseDurationMinutes(course.duration),
    0
  );

  const stats = [
    { icon: BookOpen, label: 'Cursos Inscritos', value: enrolledCourses.length },
    { icon: Clock, label: 'Horas de Estudo', value: formatMinutes(totalMinutes) },
    { icon: TrendingUp, label: 'Concluídos', value: completedCourses.length },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 text-white">
        <div className="container-app py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-white/80 mb-3">
              <BookOpen size={18} />
              <span className="text-sm font-medium">Área do Estudante</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Meus Cursos</h1>
            <p className="text-white/80 text-lg mb-6">Acompanhe seu progresso e continue aprendendo.</p>

            <div className="relative max-w-md mx-auto">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar nos meus cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-0 text-surface-900 placeholder:text-surface-400 shadow-card focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-2">
                  <stat.icon size={20} className="text-white" />
                </div>
                {statsLoaded ? (
                  <p className="text-2xl font-bold">{stat.value}</p>
                ) : (
                  <div className="h-8 w-16 bg-white/20 rounded-md animate-pulse mb-1" />
                )}
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4 mb-8">
          <div className="inline-flex gap-1 justify-center flex-wrap bg-surface-100 dark:bg-surface-800 rounded-xl p-1.5 mx-auto">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'ongoing', label: 'Em Andamento' },
              { key: 'completed', label: 'Concluídos' },
              { key: 'favorites', label: 'Favoritos' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'all' | 'ongoing' | 'completed' | 'favorites')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-card'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {displayCourses.length > 0 ? (
          <div className="space-y-4">
            {displayCourses.map((course) => {
              const progress = enrollments[course.id] ?? 0;
              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="block"
                >
                  <Card hover className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border-surface-100 dark:border-surface-700">
                    <div className="w-full md:w-64 h-40 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-surface-700 dark:to-surface-800 rounded-xl flex-shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={40} className="text-violet-500 dark:text-violet-300" />
                      </div>
                      {progress === 100 && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Badge variant="primary" className="mb-2 rounded-full">{course.category}</Badge>
                          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-surface-500 dark:text-surface-400">
                            {course.instructor}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(course.id);
                          }}
                          aria-label={favorites.includes(course.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          title={favorites.includes(course.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                        >
                          <Heart
                            size={20}
                            className={favorites.includes(course.id) ? 'fill-red-500 text-red-500' : 'text-surface-400'}
                          />
                        </button>
                      </div>

                      <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-surface-500 dark:text-surface-400 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={16} />
                          {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} aulas
                        </span>
                        {course.rating && (
                          <span className="flex items-center gap-1.5">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-surface-500 dark:text-surface-400">Progresso</span>
                            <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                              {progress}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-violet-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <Button size="sm">
                          {progress === 100 ? 'Revisar' : progress > 0 ? 'Continuar' : 'Iniciar'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-violet-500 dark:text-violet-300" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              {activeTab === 'ongoing' 
                ? 'Você não tem cursos em andamento.'
                : activeTab === 'completed' 
                  ? 'Você ainda não concluiu nenhum curso.'
                  : activeTab === 'favorites'
                    ? 'Você não tem cursos favoritos.'
                    : 'Comece a aprender agora!'
              }
            </p>
            <Link to="/">
              <Button>Explorar Cursos</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};