import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { progressService } from '../../hooks/useProgress';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Play, User, BookOpen, Clock, Star, CheckCircle, ArrowLeft, Share2, Heart, ChevronDown } from 'lucide-react';
import { sanitizeHtml } from '../../lib/sanitize';

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, initialized } = useDataStore();
  const { user } = useAuthStore();
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = id ? favorites.includes(id) : false;
  const course = courses.find(c => c.id === id);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    // Só trata como "removido" depois que o catálogo terminou de carregar,
    // senão redirecionaria durante o load inicial (acesso direto / refresh).
    if (initialized && !course && id) {
      toast.error('Este curso foi removido ou está indisponível');
      const timer = setTimeout(() => {
        navigate('/home', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [initialized, course, id, navigate]);

  useEffect(() => {
    if (!user?.id || !course?.id) return;

    let cancelled = false;
    setIsLoadingProgress(true);

    const loadProgress = async () => {
      try {
        const [enrollment, completed] = await Promise.all([
          progressService.getEnrollment(user.id, course.id),
          progressService.getCompletedLessons(user.id, course.id),
        ]);
        if (cancelled) return;
        setProgress(enrollment?.progress ?? 0);
        setCompletedLessonIds(completed);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        if (!cancelled) setIsLoadingProgress(false);
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [user?.id, course?.id]);

  if (!course) {
    // Enquanto o catálogo carrega, mostra spinner em vez de "não encontrado"
    if (!initialized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">Curso não encontrado</h2>
          <Link to="/" className="text-primary-600 hover:underline">Voltar para home</Link>
        </div>
      </div>
    );
  }

  const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
  const completedCount = completedLessonIds.length;
  const isEnrolled = progress > 0 || completedCount > 0;

  const handleContinue = async () => {
    if (!user?.id || !course?.id || allLessons.length === 0) return;

    let targetLessonId: string | null = null;

    if (progress > 0 && progress < 100) {
      targetLessonId = await progressService.getNextIncompleteLesson(
        user.id,
        course.id,
        allLessons
      );
    }

    if (!targetLessonId) {
      targetLessonId = allLessons[0].id;
      if (progress === 0) {
        await progressService.enrollInCourse(user.id, course.id, targetLessonId);
      }
    }

    navigate(`/lesson/${targetLessonId}`);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-500 via-violet-600 to-violet-500 text-white">
        <div className="container-app py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-primary-700">
                  {course.category}
                </span>
                {course.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={16} className="text-amber-300 fill-amber-300" />
                    <span className="font-medium text-white">{course.rating.toFixed(1)}</span>
                    <span className="text-white/70">({course.enrolled || 0} alunos)</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>

              <div className="prose prose-invert max-w-2xl mb-6">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.description) }} className="text-white/80" />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>{allLessons.length} aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{course.duration}</span>
                </div>
              </div>

              {isEnrolled && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden flex-1 max-w-md">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-400' : 'bg-white'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{progress}%</span>
                  </div>
                  <p className="text-xs text-white/70">
                    {completedCount} de {allLessons.length} aulas concluídas
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleContinue} disabled={isLoadingProgress} className="!bg-white !text-primary-600 hover:!bg-primary-50">
                  <Play size={18} className="mr-2" />
                  {progress === 100 ? 'Revisar Curso' : progress > 0 ? 'Continuar' : 'Iniciar Curso'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => id && toggleFavorite(id)}
                  className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                >
                  <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button variant="secondary" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                  <Share2 size={18} />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-surface-100 dark:border-surface-700">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Grade Curricular
              </h2>
              <div className="space-y-5">
                {course.modules?.map((module) => (
                  <div key={module.id}>
                    <h3 className="font-semibold text-surface-400 dark:text-surface-400 uppercase tracking-wide mb-2 text-xs">
                      {module.title}
                    </h3>
                    <div className="space-y-2">
                      {module.lessons?.map((lesson, index) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isCurrent = expandedLesson === lesson.id;
                        return (
                        <div
                          key={lesson.id}
                          className={`rounded-lg border overflow-hidden transition-colors ${
                            isCurrent
                              ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10'
                              : 'border-surface-100 dark:border-surface-700'
                          }`}
                        >
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left"
                          >
                            <div className={`
                              w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                              ${isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                  : 'border-2 border-surface-200 dark:border-surface-600 text-surface-400'
                              }
                            `}>
                              {isCompleted ? (
                                <CheckCircle size={18} />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-surface-900 dark:text-surface-100'}`}>
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-surface-500 dark:text-surface-400">
                                {lesson.duration}
                              </p>
                            </div>

                            <ChevronDown
                              size={20}
                              className={`text-surface-400 transition-transform ${expandedLesson === lesson.id ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {expandedLesson === lesson.id && (
                            <div className="px-4 pb-4 pt-0 border-t border-surface-100 dark:border-surface-700">
                              <p className="text-sm text-surface-500 dark:text-surface-400 mt-3 line-clamp-3">
                                {lesson.content?.substring(0, 200) || 'Conteúdo da aula...'}...
                              </p>
                              <Link to={`/lesson/${lesson.id}`} className="inline-block mt-3">
                                <Button variant="secondary" size="sm">
                                  <Play size={14} />
                                  Assistir Aula
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-2xl border-surface-100 dark:border-surface-700">
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
                O que você vai aprender
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-3 text-surface-600 dark:text-surface-300">
                  <CheckCircle size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>Fundamentos e conceitos essenciais</span>
                </li>
                <li className="flex items-start gap-3 text-surface-600 dark:text-surface-300">
                  <CheckCircle size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>Projetos práticos para portfólio</span>
                </li>
                <li className="flex items-start gap-3 text-surface-600 dark:text-surface-300">
                  <CheckCircle size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>Certificado de conclusão</span>
                </li>
                <li className="flex items-start gap-3 text-surface-600 dark:text-surface-300">
                  <CheckCircle size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>Acesso vitalício ao conteúdo</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-surface-100 dark:border-surface-700">
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Inclui
              </h3>
              <ul className="space-y-3 text-sm text-surface-500 dark:text-surface-400">
                <li className="flex items-center gap-3">
                  <BookOpen size={18} className="text-primary-500" />
                  <span>{allLessons.length} aulas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={18} className="text-primary-500" />
                  <span>{course.duration} de conteúdo</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-primary-500" />
                  <span>Certificado de conclusão</span>
                </li>
                <li className="flex items-center gap-3">
                  <Play size={18} className="text-primary-500" />
                  <span>Acesso vitalício</span>
                </li>
              </ul>
            </Card>

            {(course.instructorPhoto || course.instructorBio) && (
              <Card className="rounded-2xl border-surface-100 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  Instrutor
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  {course.instructorPhoto ? (
                    <img
                      src={course.instructorPhoto}
                      alt={course.instructor}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Esconde a <img> quebrada e mostra o fallback ao lado
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        e.currentTarget.style.display = 'none';
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center"
                    style={{ display: course.instructorPhoto ? 'none' : 'flex' }}
                  >
                    <User size={20} className="text-violet-600 dark:text-violet-300" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-surface-100">{course.instructor}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Especialista</p>
                  </div>
                </div>
                {course.instructorBio && (
                  <div className="prose dark:prose-invert text-sm">
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.instructorBio) }} />
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};