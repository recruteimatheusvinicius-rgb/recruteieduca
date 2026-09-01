import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { progressService } from '../../hooks/useProgress';
import { checklistProgressService } from '../../hooks/useChecklistProgress';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Course, Lesson } from '../../types';
import { sanitizeHtml } from '../../lib/sanitize';
import { parseEmbed } from '../../lib/embed';
import { CourseVideoPlayer } from '../../components/video/CourseVideoPlayer';
import {
  Play, ChevronLeft, ChevronRight, CheckCircle, Clock,
  ChevronDown, ChevronUp, Menu, X, Circle, ArrowLeft, FileText,
  BookOpen, HelpCircle, Award, Download, Share2, RotateCcw,
  XCircle, AlertCircle, Lock
} from 'lucide-react';

export const LessonViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, initialized } = useDataStore();
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);

  let currentLesson: Lesson | null = null;
  let currentCourse: Course | null = null;
  
  for (const course of courses) {
    const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
    const lesson = allLessons.find((l) => l.id === id);
    if (lesson) {
      currentLesson = lesson;
      currentCourse = course;
      break;
    }
  }

  useEffect(() => {
    if (currentLesson?.type === 'quiz' && currentLesson.questions) {
      setExpandedModule(currentLesson.moduleId || null);
    }
  }, [currentLesson]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id || !currentCourse?.id) return;

      const completed = await progressService.getCompletedLessons(user.id, currentCourse.id);
      setCompletedLessons(completed);

      if (currentLesson?.id) {
        await progressService.updateLastLesson(user.id, currentCourse.id, currentLesson.id);
      }
    };

    if (user?.id && currentCourse?.id && currentLesson?.id) {
      loadProgress();
    }
  }, [user?.id, currentCourse?.id, currentLesson?.id]);

  if (!currentLesson || !currentCourse) {
    // Enquanto o catálogo carrega, mostra spinner em vez de "não encontrada"
    if (!initialized) {
      return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">Aula não encontrada</h2>
          <Link to="/home" className="text-primary-600 hover:underline cursor-pointer">Voltar para home</Link>
        </div>
      </div>
    );
  }

  const allLessons = currentCourse.modules?.flatMap((m) => m.lessons || []) || [];
  const currentIndex = allLessons.findIndex((l) => l.id === id);
  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  const courseModules = currentCourse.modules || [];
  const isLastLesson = currentIndex === allLessons.length - 1;
  const isCourseComplete = completedLessons.length === allLessons.length;
  const hasCertificate = currentCourse.certificateConfig?.enableCertificate;

  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const toggleLessonComplete = async (lessonId: string) => {
    const isCompleted = completedLessons.includes(lessonId);
    
    setCompletedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );

    if (user?.id && currentCourse?.id) {
      const willBeCompleted = !isCompleted;
      await progressService.saveLessonProgress(
        user.id,
        currentCourse.id,
        lessonId,
        willBeCompleted
      );

      // Camada de checklist de onboarding é desacoplada do progresso genérico
      // de aulas — sincroniza explicitamente aqui em vez de dentro de useProgress.ts.
      if (willBeCompleted) {
        await checklistProgressService.syncAcademyLessonCompletion(
          user.id,
          user.company_id,
          currentCourse.id,
          lessonId
        );
      }
    }
  };

  const getLessonProgress = () => {
    if (allLessons.length === 0) return 0;
    const completed = allLessons.filter((l) => completedLessons.includes(l.id)).length;
    return Math.round((completed / allLessons.length) * 100);
  };

  const handleQuizSubmit = (questions: { correctIndex: number }[]) => {
    if (!questions.length) return;

    let correct = 0;
    questions.forEach((q, index) => {
      if (quizAnswers[index] === q.correctIndex) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const renderLessonNavigation = () => (
    <div className="flex items-center justify-between w-full gap-3 flex-wrap sm:flex-nowrap">
      {prevLesson ? (
        <Link 
          to={`/lesson/${prevLesson.id}`}
          onClick={() => {
            setQuizAnswers({});
            setQuizSubmitted(false);
            setCurrentQuizQuestion(0);
          }}
          className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-all shadow-sm">
            <ChevronLeft size={18} className="text-surface-600 dark:text-surface-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-xs text-surface-500 dark:text-surface-300">Aula anterior</p>
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[120px] lg:max-w-[200px]">
              {prevLesson.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-3 opacity-40 cursor-not-allowed">
          <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
            <ChevronLeft size={18} className="text-surface-400 dark:text-surface-500" />
          </div>
        </div>
      )}
      
      {nextLesson ? (
        isLessonCompleted(currentLesson.id) ? (
          <Link 
            to={`/lesson/${nextLesson.id}`}
            onClick={() => {
              setQuizAnswers({});
              setQuizSubmitted(false);
              setCurrentQuizQuestion(0);
            }}
            className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity ml-auto"
          >
            <div className="hidden sm:block text-right min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-300">Próxima aula</p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate max-w-[120px] lg:max-w-[200px]">
                {nextLesson.title}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center group-hover:from-primary-600 group-hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25">
              <ChevronRight size={18} />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 group cursor-not-allowed opacity-40 ml-auto">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-surface-500 dark:text-surface-300">Próxima aula</p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate max-w-[120px] lg:max-w-[200px]">
                {nextLesson.title}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-400 dark:text-surface-500 flex items-center justify-center">
              <ChevronRight size={18} />
            </div>
          </div>
        )
      ) : isCourseComplete && hasCertificate ? (
        isLessonCompleted(currentLesson.id) ? (
          <Button 
            onClick={() => setShowCertificate(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 ml-auto"
          >
            <Award size={16} />
            <span className="font-medium">Ver Certificado</span>
            <ChevronRight size={16} />
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-500 dark:text-surface-300 ml-auto">
            <Clock size={14} />
            <span className="text-xs font-medium">Complete para certificado</span>
          </div>
        )
      ) : isLastLesson ? (
        isLessonCompleted(currentLesson.id) ? (
          <Link 
            to={`/course/${currentCourse.id}`}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer ml-auto"
          >
            <CheckCircle size={16} />
            <span className="font-medium">Finalizar Curso</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-500 dark:text-surface-300 ml-auto">
            <Clock size={14} />
            <span className="text-xs font-medium">Marque como concluída</span>
          </div>
        )
      ) : null}
    </div>
  );

  const renderVideoPlayer = () => {
    const embed = parseEmbed(currentLesson.videoUrl);

    if (!embed) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-6">
            <FileText size={40} className="mx-auto text-white/40 mb-3" />
            <p className="text-white/70 text-sm">Vídeo não disponível</p>
            <p className="text-white/40 text-xs mt-1">O instrutor ainda não anexou o vídeo desta aula.</p>
          </div>
        </div>
      );
    }

    // Player personalizado (YouTube IFrame API + controles próprios) — único elemento
    // de reprodução; vídeos hospedados fora do YouTube caem no <video>/<iframe> abaixo.
    if (embed.kind === 'youtube' && embed.videoId) {
      return (
        <CourseVideoPlayer
          key={embed.videoId}
          youtubeVideoId={embed.videoId}
          lessonId={currentLesson.id}
          courseId={currentCourse.id}
          userId={user?.id}
          allowSeekForward={currentLesson.allowSeekForward ?? true}
          onCompleted={() => {
            if (!isLessonCompleted(currentLesson.id)) {
              toggleLessonComplete(currentLesson.id);
            }
          }}
          fill
        />
      );
    }

    if (embed.kind === 'video') {
      return (
        <video
          key={embed.src}
          src={embed.src}
          controls
          controlsList="nodownload"
          className="w-full h-full"
        />
      );
    }

    return (
      <iframe
        key={embed.src}
        src={embed.src}
        title={currentLesson.title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  };

  const renderQuizContent = (
    questions: import('../../types').QuizQuestion[] = currentLesson.questions || [],
    passingGrade: number = 70
  ) => {
    if (questions.length === 0) {
      return (
        <div className="text-center py-12">
          <HelpCircle size={48} className="mx-auto text-surface-300 mb-4" />
          <p className="text-surface-500 dark:text-surface-300">Quiz não disponível</p>
        </div>
      );
    }

    const safeIndex = Math.min(Math.max(currentQuizQuestion, 0), questions.length - 1);
    const currentQuestion = questions[safeIndex];
    const isLastQuestion = safeIndex === questions.length - 1;

    if (!currentQuestion) {
      return (
        <div className="text-center py-12">
          <HelpCircle size={48} className="mx-auto text-surface-300 mb-4" />
          <p className="text-surface-500 dark:text-surface-300">Pergunta indisponível</p>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-surface-500 dark:text-surface-300">
              Questão {currentQuizQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm text-surface-500 dark:text-surface-300">
              {Math.round(((currentQuizQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full">
            <div 
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${((currentQuizQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = quizAnswers[currentQuizQuestion] === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showResult = quizSubmitted;
              
              let optionClass = "p-4 rounded-lg border-2 transition-all cursor-pointer ";
              if (showResult) {
                if (isCorrect) {
                  optionClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                } else if (isSelected && !isCorrect) {
                  optionClass += "border-red-500 bg-red-50 dark:bg-red-900/20";
                } else {
                  optionClass += "border-surface-200 dark:border-surface-700";
                }
              } else {
                optionClass += isSelected 
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                  : "border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700";
              }

              return (
                <button
                  key={index}
                  onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [currentQuizQuestion]: index })}
                  disabled={quizSubmitted}
                  className={`w-full text-left ${optionClass} ${quizSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}
                      ${showResult && isCorrect ? 'bg-emerald-500 text-white' : ''}
                      ${showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' : ''}
                    `}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-surface-900 dark:text-surface-100">{option}</span>
                    {showResult && isCorrect && (
                      <CheckCircle size={18} className="ml-auto text-emerald-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle size={18} className="ml-auto text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {quizSubmitted && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-primary-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Explicação</p>
                  <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
            <button
              onClick={() => setCurrentQuizQuestion(Math.max(0, currentQuizQuestion - 1))}
              disabled={currentQuizQuestion === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer
                ${currentQuizQuestion === 0 
                  ? 'text-surface-400 cursor-not-allowed' 
                  : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'}`}
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            {!quizSubmitted ? (
              isLastQuestion ? (
                <Button
                  onClick={() => handleQuizSubmit(questions)}
                  disabled={Object.keys(quizAnswers).length < questions.length}
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuizQuestion(currentQuizQuestion + 1)}
                  disabled={quizAnswers[currentQuizQuestion] === undefined}
                >
                  Próxima
                  <ChevronRight size={18} />
                </Button>
              )
            ) : (
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-lg font-medium ${quizScore >= passingGrade ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {quizScore >= passingGrade ? 'Aprovado' : 'Reprovado'} - {quizScore}%
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    setQuizScore(0);
                    setCurrentQuizQuestion(0);
                  }}
                >
                  <RotateCcw size={18} />
                  Refazer
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderReadingContent = () => (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <div className="prose dark:prose-invert max-w-none">
          {currentLesson.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentLesson.content) }} />
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-surface-300 mb-4" />
              <p className="text-surface-500 dark:text-surface-300">Material de leitura não disponível</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderGuideContent = () => {
    const embed = parseEmbed(currentLesson.embedCode || currentLesson.videoUrl);

    if (!embed) {
      return (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-surface-300 mb-4" />
          <p className="text-surface-500 dark:text-surface-300">Guia não disponível</p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
          {embed.kind === 'video' ? (
            <video
              key={embed.src}
              src={embed.src}
              controls
              controlsList="nodownload"
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <iframe
              key={embed.src}
              src={embed.src}
              title={currentLesson.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  };

  const renderAssessmentContent = () => {
    const cfg = currentLesson.assessmentConfig;
    const questions = cfg?.questions || [];
    const passingGrade = cfg?.passingGrade ?? 70;

    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <Award size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100">Avaliação Final</h3>
              <p className="text-sm text-surface-500 dark:text-surface-300">
                Nota mínima para aprovação: {passingGrade}%
              </p>
            </div>
          </div>
          <p className="text-surface-600 dark:text-surface-300">
            Complete esta avaliação para obter o certificado do curso. Você tem direito a {cfg?.maxAttempts ?? 3} tentativas.
          </p>
        </Card>
        {renderQuizContent(questions, passingGrade)}
      </div>
    );
  };

  const renderCertificate = () => {
    const cfg = currentCourse.certificateConfig;
    const customHtml = cfg?.customHtml?.trim();

    // Se o admin definiu HTML personalizado, substitui variáveis e renderiza num iframe
    // sandbox (assim @media print do template é honrado e o CSS interno não vaza pra app).
    if (customHtml) {
      const studentName = user?.name || 'Estudante';
      const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

      const filled = customHtml
        .replace(/\{\{aluno\}\}/g, sanitizeHtml(studentName))
        .replace(/\{\{curso\}\}/g, sanitizeHtml(currentCourse.title || ''))
        .replace(/\{\{instrutor\}\}/g, sanitizeHtml(currentCourse.instructor || ''))
        .replace(/\{\{data\}\}/g, today)
        .replace(/\{\{duracao\}\}/g, sanitizeHtml(currentCourse.duration || '—'));

      const printCustom = () => {
        const w = window.open('', '_blank', 'width=1100,height=850');
        if (!w) return;
        w.document.open();
        w.document.write(filled);
        w.document.close();
        w.addEventListener('load', () => {
          w.focus();
          w.print();
        }, { once: true });
      };

      return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col">
          <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => {
                setShowCertificate(false);
                navigate(`/course/${currentCourse.id}`);
              }}
              className="flex items-center gap-2 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Voltar para o curso</span>
            </button>
            <div className="flex gap-2">
              <Button onClick={printCustom}>
                <Download size={18} />
                Baixar PDF
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: `Certificado — ${currentCourse.title}`,
                        url: window.location.href,
                      });
                    } else {
                      await navigator.clipboard.writeText(window.location.href);
                    }
                  } catch { /* cancelado */ }
                }}
              >
                <Share2 size={18} />
                Compartilhar
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-8 flex justify-center">
            <iframe
              srcDoc={filled}
              title="Certificado personalizado"
              className="w-full max-w-5xl aspect-[1.414/1] bg-white rounded-xl shadow-lg border border-surface-200 dark:border-surface-700"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      );
    }

    // Template padrão (sem customHtml)
    return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="p-8 bg-gradient-to-br from-white to-surface-50 dark:from-surface-800 dark:to-surface-900 border-4 border-primary-200 dark:border-primary-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">Certificado de Conclusão</h1>
            <p className="text-surface-500 dark:text-surface-300">RecruteiEduca</p>
          </div>

          <div className="text-center py-8 border-y border-surface-200 dark:border-surface-700">
            <p className="text-surface-500 dark:text-surface-300 mb-2">Certificamos que</p>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">{user?.name || 'Estudante'}</h2>
            <p className="text-surface-500 dark:text-surface-300 mb-4">concluiu com sucesso o curso</p>
            <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-4">{currentCourse.title}</h3>
            <p className="text-surface-500 dark:text-surface-300">
              em {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={() => window.print()}>
              <Download size={18} />
              Imprimir / Salvar PDF
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                const shareData = {
                  title: `Certificado — ${currentCourse.title}`,
                  text: `Concluí o curso "${currentCourse.title}" na RecruteiEduca!`,
                  url: window.location.href,
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(shareData.url);
                  }
                } catch {
                  /* usuário cancelou */
                }
              }}
            >
              <Share2 size={18} />
              Compartilhar
            </Button>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setShowCertificate(false);
                navigate(`/course/${currentCourse.id}`);
              }}
              className="text-primary-600 hover:text-primary-700 cursor-pointer"
            >
              Voltar para o curso
            </button>
          </div>
        </Card>
      </div>
    </div>
    );
  };

  const renderContentArea = () => {
    switch (currentLesson.type) {
      case 'video':
        return renderVideoPlayer();
      case 'quiz':
        return renderQuizContent();
      case 'reading':
        return renderReadingContent();
      case 'guide':
        return renderGuideContent();
      case 'assessment':
        return renderAssessmentContent();
      default:
        return renderVideoPlayer();
    }
  };

  if (showCertificate) {
    return renderCertificate();
  }

  return (
    <div className="h-screen bg-surface-50 dark:bg-surface-900 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button 
              onClick={() => navigate(`/course/${currentCourse.id}`)}
              className="flex items-center gap-2 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-200 transition-colors cursor-pointer flex-shrink-0"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline text-sm font-medium">Voltar</span>
            </button>
            <div className="h-6 w-px bg-surface-300 dark:bg-surface-600 hidden sm:block" />
            <div className="hidden sm:block min-w-0 flex-1">
              <p className="text-xs text-surface-500 dark:text-surface-300 truncate max-w-[200px] lg:max-w-none">{currentCourse.title}</p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate max-w-[200px] lg:max-w-none">{currentLesson.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 text-sm text-surface-500 dark:text-surface-300 px-3">
              <Clock size={16} />
              <span>{currentIndex + 1}/{allLessons.length}</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 cursor-pointer flex-shrink-0"
              title={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Lesson Navigation Bar */}
        <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          {renderLessonNavigation()}
        </div>
      </div>

      {/* Main Layout - Flex container with sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar - Toggleable on large screens, à esquerda ("modo cinema") */}
        <div className={`
          w-80 shrink-0 overflow-y-auto border-r border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800
          ${isSidebarOpen ? 'hidden lg:block' : 'hidden'}
        `}>
          <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-surface-900 dark:text-surface-100">Conteúdo do Curso</h3>
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{getLessonProgress()}%</span>
            </div>
            <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${getLessonProgress()}%` }}
              />
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-300 mt-2">
              {completedLessons.length} de {allLessons.length} aulas concluídas
            </p>
          </div>

          <div className="p-3 space-y-2">
            {courseModules.map((module, moduleIndex) => (
              <div key={module.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm
                      ${expandedModule === module.id 
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' 
                        : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                      }
                    `}>
                      {moduleIndex + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                        {module.title}
                      </p>
                      <p className="text-xs text-surface-400 dark:text-surface-500">
                        {module.lessons?.length || 0} aulas
                      </p>
                    </div>
                  </div>
                  {expandedModule === module.id ? (
                    <ChevronUp size={18} className="text-surface-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-surface-400 flex-shrink-0" />
                  )}
                </button>
                
                {expandedModule === module.id && (
                  <div className="ml-3 pl-3 border-l-2 border-surface-100 dark:border-surface-700 space-y-1.5 mt-1.5">
                    {module.lessons?.map((lesson, lessonIdx) => {
                      const isCurrentLesson = lesson.id === id;
                      const isCompleted = isLessonCompleted(lesson.id);
                      const isLocked = !isCompleted && !isCurrentLesson && lessonIdx > 0;
                      
                      const getTypeIcon = () => {
                        switch (lesson.type) {
                          case 'video': return <Play size={11} />;
                          case 'quiz': return <HelpCircle size={11} />;
                          case 'reading': return <FileText size={11} />;
                          case 'guide': return <BookOpen size={11} />;
                          case 'assessment': return <Award size={11} />;
                          default: return <Play size={11} />;
                        }
                      };

                      const isPreviousLessonCompleted = lessonIdx === 0 || isLessonCompleted(module.lessons[lessonIdx - 1]?.id);
                      
                      if (isLocked && !isPreviousLessonCompleted) {
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg opacity-50 cursor-not-allowed"
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-surface-100 dark:bg-surface-700 text-surface-400 dark:text-surface-500">
                              <Lock size={12} />
                            </div>
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                              <span className="text-xs text-surface-300 dark:text-surface-600">
                                {getTypeIcon()}
                              </span>
                              <p className="text-sm text-surface-400 dark:text-surface-500 truncate">
                                {lesson.title}
                              </p>
                            </div>
                            <span className="text-xs text-surface-400 dark:text-surface-500 flex-shrink-0">{lesson.duration}</span>
                          </div>
                        );
                      }
                      
                      return (
                        <Link
                          key={lesson.id}
                          to={isCurrentLesson ? '#' : `/lesson/${lesson.id}`}
                          onClick={(e) => {
                            if (isCurrentLesson) {
                              e.preventDefault();
                              return;
                            }
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                            setCurrentQuizQuestion(0);
                            // Fecha a sidebar no mobile ao escolher uma aula
                            if (window.matchMedia('(max-width: 1024px)').matches) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`
                            flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer
                            ${isCurrentLesson 
                              ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-900/10 border-l-2 border-primary-500 shadow-sm' 
                              : isCompleted
                                ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                                : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'
                            }
                            ${isLocked ? 'pointer-events-none' : ''}
                          `}
                        >
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-xs
                            ${isCompleted 
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-sm' 
                              : isCurrentLesson 
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                                : 'bg-surface-100 dark:bg-surface-700 text-surface-400 dark:text-surface-500'
                            }
                          `}>
                            {isCompleted ? (
                              <CheckCircle size={12} />
                            ) : (
                              <span>{lessonIdx + 1}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex items-center gap-2">
                            <span className={`
                              text-xs
                              ${isCurrentLesson ? 'text-primary-600 dark:text-primary-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400 dark:text-surface-500'}
                            `}>
                              {getTypeIcon()}
                            </span>
                            <p className={`
                              text-sm truncate
                              ${isCurrentLesson ? 'text-primary-700 dark:text-primary-300 font-semibold' : isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-surface-600 dark:text-surface-300'}
                            `}>
                              {lesson.title}
                            </p>
                          </div>
                          <span className={`text-xs flex-shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-surface-400 dark:text-surface-500'}`}>{lesson.duration}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {currentLesson.type === 'video' ? (
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Player em modo cinema — preenche a altura disponível em fundo escuro */}
            <div className="flex-1 min-h-0 bg-[#0F1030] flex items-center justify-center">
              {renderVideoPlayer()}
            </div>

            {/* Painel inferior fixo com info da aula */}
            <div className="shrink-0 max-h-[260px] overflow-y-auto bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {currentLesson.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-1 text-sm text-surface-500 dark:text-surface-300">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {currentLesson.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleLessonComplete(currentLesson.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex-shrink-0 ${
                    isLessonCompleted(currentLesson.id)
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  {isLessonCompleted(currentLesson.id) ? (
                    <>
                      <CheckCircle size={18} />
                      Concluída
                    </>
                  ) : (
                    <>
                      <Circle size={18} />
                      Marcar como concluída
                    </>
                  )}
                </button>
              </div>

              {(currentLesson.videoText || currentLesson.description) && (
                <div className="prose max-w-none dark:prose-invert text-surface-700 dark:text-surface-200">
                  {currentLesson.videoText ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentLesson.videoText) }} />
                  ) : (
                    <p className="text-surface-600 dark:text-surface-300 leading-relaxed">
                      {currentLesson.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 overflow-y-auto py-4">
            <div className="max-w-5xl mx-auto">
              {renderContentArea()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
