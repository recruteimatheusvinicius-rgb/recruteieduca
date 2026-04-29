import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { progressService } from '../../hooks/useProgress';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Play, User, BookOpen, Clock, Star, CheckCircle, ArrowLeft, Share2, Heart, ChevronDown } from 'lucide-react';

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses } = useDataStore();
  const { user } = useAuthStore();
  const course = courses.find(c => c.id === id);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    if (!course && id) {
      toast.error('Este curso foi removido ou está indisponível');
      const timer = setTimeout(() => {
        navigate('/home', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [course, id, navigate]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id || !course?.id) {
        return;
      }

      setIsLoadingProgress(true);
      try {
        const enrollment = await progressService.getEnrollment(user.id, course.id);
        if (enrollment) {
          setProgress(enrollment.progress);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadProgress();
  }, [user?.id, course?.id]);

  if (!course) {
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
  const completedLessons = Math.round((progress / 100) * allLessons.length);
  const isEnrolled = progress > 0;

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

  const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    'Programação': 'primary',
    'Design': 'info',
    'Marketing': 'warning',
    'Negócios': 'success',
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-b from-surface-100 to-surface-50 dark:from-surface-800 dark:to-surface-900 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={categoryColors[course.category] || 'primary'}>
                  {course.category}
                </Badge>
                {course.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium text-surface-900 dark:text-surface-100">{course.rating.toFixed(1)}</span>
                    <span className="text-surface-500 dark:text-surface-300">({course.enrolled || 0} alunos)</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
                {course.title}
              </h1>
              
              <div className="prose dark:prose-invert max-w-2xl mb-6">
                <div dangerouslySetInnerHTML={{ __html: course.description }} className="dark:text-surface-200" />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-surface-600 dark:text-surface-300 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600 dark:text-primary-400" />
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
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden flex-1 max-w-md">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{progress}%</span>
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-300">
                    {completedLessons} de {allLessons.length} aulas concluídas
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleContinue} disabled={isLoadingProgress}>
                  <Play size={18} className="mr-2" />
                  {progress === 100 ? 'Revisar Curso' : progress > 0 ? 'Continuar' : 'Iniciar Curso'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button variant="secondary">
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
            <Card>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Grade Curricular
              </h2>
              <div className="space-y-4">
                {course.modules?.map((module) => (
                  <div key={module.id}>
                    <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-2 text-sm">
                      {module.title}
                    </h3>
                    <div className="space-y-2">
                      {module.lessons?.map((lesson, index) => (
                        <div 
                          key={lesson.id}
                          className="rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left"
                          >
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                              ${index < completedLessons 
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                                : 'bg-surface-100 dark:bg-surface-700 text-surface-400'
                              }
                            `}>
                              {index < completedLessons ? (
                                <CheckCircle size={20} />
                              ) : (
                                <span className="font-medium">{index + 1}</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-surface-900 dark:text-surface-100">
                                {lesson.title}
                              </h3>
<p className="text-sm text-surface-500 dark:text-surface-300">
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
                              <p className="text-sm text-surface-600 dark:text-surface-300 mt-3 line-clamp-3">
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
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
            <Card>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Inclui
              </h3>
              <ul className="space-y-3 text-sm text-surface-600 dark:text-surface-300">
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
              <Card>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  Instrutor
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  {course.instructorPhoto ? (
                    <img 
                      src={course.instructorPhoto} 
                      alt={course.instructor}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <User size={20} className="text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-surface-900 dark:text-surface-100">{course.instructor}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-300">Especialista</p>
                  </div>
                </div>
                {course.instructorBio && (
                  <div className="prose dark:prose-invert text-sm">
                    <div dangerouslySetInnerHTML={{ __html: course.instructorBio }} />
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