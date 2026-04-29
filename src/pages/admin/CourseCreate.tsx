import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TipTapEditor } from '../../components/TipTapEditor';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, Plus, Trash2, GripVertical, Play, 
  HelpCircle, FileText, Target, Award, Save, X, Check,
  ListChecks, BookOpen, CheckCircle, Image, User
} from 'lucide-react';
import type { Course, CourseLevel, CourseStatus, Module, Lesson, LessonType, QuizQuestion, CertificateConfig, AssessmentConfig } from '../../types';

const createEmptyModule = (order: number): Module => ({
  id: `module-${Date.now()}-${order}`,
  title: '',
  description: '',
  order,
  lessons: [],
});

const createEmptyLesson = (order: number, type: LessonType): Lesson => ({
  id: `lesson-${Date.now()}-${order}`,
  title: '',
  type,
  order,
  duration: '5min',
  videoUrl: '',
  videoText: '',
  questions: type === 'quiz' ? [] : undefined,
  content: type === 'reading' ? '' : undefined,
  embedCode: type === 'guide' ? '' : undefined,
  assessmentConfig: type === 'assessment' ? { passingGrade: 70, maxAttempts: 3, showResults: true } : undefined,
});

const createEmptyQuizQuestion = (): QuizQuestion => ({
  id: `q-${Date.now()}`,
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
});

const createEmptyCertificateConfig = (): CertificateConfig => ({
  enableCertificate: true,
  requireCompletion: true,
  requirePassingGrade: false,
  passingGrade: 70,
});

const lessonTypeIcons: Record<LessonType, { icon: typeof Play; label: string; color: string }> = {
  video: { icon: Play, label: 'Vídeo', color: '#ef4444' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: '#f59e0b' },
  reading: { icon: FileText, label: 'Leitura', color: '#3b82f6' },
  guide: { icon: Target, label: 'Guia', color: '#8b5cf6' },
  assessment: { icon: Award, label: 'Avaliação', color: '#10b981' },
};

export const CourseCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courses, categories, plans, levels, addCourse, updateCourse } = useDataStore();
  
  const existingCourse = id ? courses.find(c => c.id === id) : null;
  const isEditing = !!existingCourse;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Course>(() => {
    if (existingCourse) return existingCourse;
    return {
      id: `course-${Date.now()}`,
      title: '',
      description: '',
      category: '',
      instructor: '',
      instructorPhoto: '',
      instructorBio: '',
      duration: '',
      level: 'iniciante',
      rating: 0,
      restrictedPlans: [],
      modules: [],
      certificateConfig: createEmptyCertificateConfig(),
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  });

  const steps = [
    { num: 1, label: 'Informações Gerais', icon: BookOpen },
    { num: 2, label: 'Módulos e Aulas', icon: ListChecks },
    { num: 3, label: 'Certificado', icon: Award },
  ];

  useEffect(() => {
    if (id && existingCourse && existingCourse.id !== formData.id) {
      setFormData(existingCourse);
    }
  }, [id, existingCourse, formData.id]);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('O título do curso é obrigatório');
      return;
    }
    if (!formData.category?.trim()) {
      toast.error('A categoria do curso é obrigatória');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const totalDuration = formData.modules.reduce((acc, mod) => {
        const modDuration = mod.lessons.reduce((a, lesson) => {
          const mins = parseInt(lesson.duration || '0') || 0;
          return a + mins;
        }, 0);
        return acc + modDuration;
      }, 0);
      
      const courseToSave: Course = {
        ...formData,
        duration: totalDuration > 0 ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}min` : formData.duration,
        updatedAt: new Date().toISOString(),
      };

      const saved = isEditing
        ? await updateCourse(id!, courseToSave)
        : await addCourse(courseToSave);

      if (!saved) {
        toast.error('Não foi possível salvar o curso. Verifique a conexão e tente novamente.');
        return;
      }

      toast.success(isEditing ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
      navigate('/admin/courses');
    } catch (error) {
      console.error('handleSave error:', error);
      toast.error('Erro ao salvar curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    const newModule = createEmptyModule(formData.modules.length + 1);
    setFormData({ ...formData, modules: [...formData.modules, newModule] });
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => m.id === moduleId ? { ...m, ...updates } : m),
    });
  };

  const removeModule = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter(m => m.id !== moduleId),
    });
  };

  const addLesson = (moduleId: string, type: LessonType) => {
    const module = formData.modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const newLesson = createEmptyLesson(module.lessons.length + 1, type);
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      ),
    });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) }
          : m
      ),
    });
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ),
    });
  };

  const addQuizQuestion = (moduleId: string, lessonId: string) => {
    const newQuestion = createEmptyQuizQuestion();
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              lessons: m.lessons.map(l => 
                l.id === lessonId 
                  ? { ...l, questions: [...(l.questions || []), newQuestion] }
                  : l
              ) 
            }
          : m
      ),
    });
  };

  const updateQuizQuestion = (moduleId: string, lessonId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              lessons: m.lessons.map(l => 
                l.id === lessonId 
                  ? { ...l, questions: l.questions?.map(q => q.id === questionId ? { ...q, ...updates } : q) }
                  : l
              ) 
            }
          : m
      ),
    });
  };

  const removeQuizQuestion = (moduleId: string, lessonId: string, questionId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              lessons: m.lessons.map(l => 
                l.id === lessonId 
                  ? { ...l, questions: l.questions?.filter(q => q.id !== questionId) }
                  : l
              ) 
            }
          : m
      ),
    });
  };

  const togglePlanRestriction = (planId: string) => {
    setFormData({
      ...formData,
      restrictedPlans: formData.restrictedPlans.includes(planId)
        ? formData.restrictedPlans.filter(p => p !== planId)
        : [...formData.restrictedPlans, planId],
    });
  };

  const addAssessmentQuestion = (moduleId: string, lessonId: string) => {
    const newQuestion = createEmptyQuizQuestion();
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              lessons: m.lessons.map(l => 
                l.id === lessonId 
                  ? { 
                      ...l, 
                      assessmentConfig: {
                        ...l.assessmentConfig!,
                        questions: [...(l.assessmentConfig?.questions || []), newQuestion],
                      }
                    }
                  : l
              ) 
            }
          : m
      ),
    });
  };

  const updateAssessmentQuestion = (moduleId: string, lessonId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              lessons: m.lessons.map(l => 
                l.id === lessonId 
                  ? { 
                      ...l, 
                      assessmentConfig: {
                        ...l.assessmentConfig!,
                        questions: l.assessmentConfig?.questions?.map(q => q.id === questionId ? { ...q, ...updates } : q)
                      }
                    }
                  : l
              ) 
            }
          : m
      ),
    });
  };

  const removeAssessmentQuestion = (moduleId: string, lessonId: string, questionId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              lessons: m.lessons.map(l => 
                l.id === lessonId 
                  ? { 
                      ...l, 
                      assessmentConfig: {
                        ...l.assessmentConfig!,
                        questions: l.assessmentConfig?.questions?.filter(q => q.id !== questionId)
                      }
                    }
                  : l
              ) 
            }
          : m
      ),
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Título do Curso *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
            placeholder="Ex: Introdução ao React"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Descrição *
          </label>
<TipTapEditor
              content={formData.description}
              onChange={(html) => setFormData({ ...formData, description: html })}
            />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Categoria *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            Instrutor
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
              <div className="relative">
                {formData.instructorPhoto ? (
                  <img 
                    src={formData.instructorPhoto} 
                    alt={formData.instructor}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <User size={24} className="text-primary-600 dark:text-primary-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                  placeholder="Nome do instrutor"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-surface-500 dark:text-surface-300 mb-1">
                URL da Foto
              </label>
              <div className="relative">
                <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={formData.instructorPhoto || ''}
                  onChange={(e) => setFormData({ ...formData, instructorPhoto: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-surface-500 dark:text-surface-300 mb-1">
              Biografia do Instrutor
            </label>
            <TipTapEditor
              content={formData.instructorBio || ''}
              onChange={(html) => setFormData({ ...formData, instructorBio: html })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Nível
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value as CourseLevel })}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === 'iniciante' ? 'Iniciante' : level === 'intermediario' ? 'Intermediário' : 'Avançado'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as CourseStatus })}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Restringir por Plano (deixe vazio para todos terem acesso)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map(plan => (
            <label
              key={plan.id}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                formData.restrictedPlans.includes(plan.id)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.restrictedPlans.includes(plan.id)}
                onChange={() => togglePlanRestriction(plan.id)}
                className="w-4 h-4 rounded text-primary-600"
              />
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">{plan.name}</p>
                <p className="text-xs text-surface-500 dark:text-surface-300">
                  {plan.features.length} funcionalidades
                </p>
              </div>
            </label>
          ))}
          {plans.length === 0 && (
            <p className="text-sm text-surface-500 dark:text-surface-300 col-span-3">
              Nenhum plano cadastrado. Cadastre planos em /admin/plans
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Módulos e Aulas
        </h3>
        <Button variant="secondary" onClick={addModule}>
          <Plus size={18} />
          Adicionar Módulo
        </Button>
      </div>

      {formData.modules.length === 0 && (
        <div className="text-center py-12 bg-surface-50 dark:bg-surface-800 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700">
          <ListChecks size={40} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <p className="text-surface-500 dark:text-surface-300 mb-4">
            Nenhum módulo criado ainda
          </p>
          <Button variant="secondary" onClick={addModule}>
            <Plus size={18} />
            Adicionar Primeiro Módulo
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {formData.modules.map((module, moduleIndex) => (
          <Card key={module.id} className="overflow-hidden">
            <div className="bg-surface-50 dark:bg-surface-800 p-4 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="text-surface-400 cursor-grab" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(module.id, { title: e.target.value })}
                    className="w-full bg-transparent border-none text-surface-900 dark:text-surface-100 font-medium focus:outline-none focus:ring-0"
                    placeholder={`Módulo ${moduleIndex + 1}`}
                  />
                  <div className="mt-2 w-full">
                    <TipTapEditor
                      content={module.description || ''}
                      onChange={(html) => updateModule(module.id, { description: html })}
                    />
                  </div>
                </div>
                <span className="text-sm text-surface-500 dark:text-surface-300">
                  {module.lessons.length} aulas
                </span>
                <button
                  onClick={() => removeModule(module.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {module.lessons.map((lesson, lessonIndex) => {
                const typeInfo = lessonTypeIcons[lesson.type];
                const TypeIcon = typeInfo.icon;

                return (
                  <div key={lesson.id} className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                      >
                        <TypeIcon size={16} />
                      </div>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                        className="flex-1 bg-transparent border-none text-surface-900 dark:text-surface-100 font-medium focus:outline-none focus:ring-0"
                        placeholder={`Aula ${lessonIndex + 1}`}
                      />
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={(e) => updateLesson(module.id, lesson.id, { duration: e.target.value })}
                        className="w-20 bg-transparent border-none text-sm text-surface-500 dark:text-surface-300 text-center focus:outline-none focus:ring-0"
                        placeholder="5min"
                      />
                      <button
                        onClick={() => removeLesson(module.id, lesson.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {lesson.type === 'video' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                              Link do YouTube
                            </label>
                            <input
                              type="text"
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                              Texto Complementar
                            </label>
                            <TipTapEditor
                              content={lesson.videoText || ''}
                              onChange={(html) => updateLesson(module.id, lesson.id, { videoText: html })}
                            />
                          </div>
                        </>
                      )}

                      {lesson.type === 'quiz' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                              Questões do Quiz
                            </label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => addQuizQuestion(module.id, lesson.id)}
                            >
                              <Plus size={16} />
                              Adicionar Questão
                            </Button>
                          </div>
                          {(lesson.questions || []).map((q, qIndex) => (
                            <div key={q.id} className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                                  Questão {qIndex + 1}
                                </span>
                                <button
                                  onClick={() => removeQuizQuestion(module.id, lesson.id, q.id)}
                                  className="ml-auto p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuizQuestion(module.id, lesson.id, q.id, { question: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                                placeholder="Digite a pergunta..."
                              />
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`q-${q.id}-correct`}
                                      checked={q.correctIndex === optIndex}
                                      onChange={() => updateQuizQuestion(module.id, lesson.id, q.id, { correctIndex: optIndex })}
                                      className="w-4 h-4 text-primary-600"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOptions = [...q.options];
                                        newOptions[optIndex] = e.target.value;
                                        updateQuizQuestion(module.id, lesson.id, q.id, { options: newOptions });
                                      }}
                                      className="flex-1 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm"
                                      placeholder={`Opção ${optIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={q.explanation}
                                onChange={(e) => updateQuizQuestion(module.id, lesson.id, q.id, { explanation: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm"
                                placeholder="Explicação da resposta (opcional)"
                              />
                            </div>
                          ))}
                          {(lesson.questions || []).length === 0 && (
                            <p className="text-sm text-surface-500 dark:text-surface-300 text-center py-4">
                              Adicione questões ao quiz
                            </p>
                          )}
                        </div>
                      )}

                      {lesson.type === 'reading' && (
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Conteúdo da Aula
                          </label>
                          <TipTapEditor
                            content={lesson.content || ''}
                            onChange={(html) => updateLesson(module.id, lesson.id, { content: html })}
                          />
                        </div>
                      )}

                      {lesson.type === 'guide' && (
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Código Embed ( slides, interactivos, etc)
                          </label>
                          <textarea
                            rows={4}
                            value={lesson.embedCode}
                            onChange={(e) => updateLesson(module.id, lesson.id, { embedCode: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-mono text-sm resize-none"
                            placeholder="<iframe src='https://...'></iframe>"
                          />
                        </div>
                      )}

                      {lesson.type === 'assessment' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                                Nota de Corte (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={lesson.assessmentConfig?.passingGrade || 70}
                                onChange={(e) => updateLesson(module.id, lesson.id, { 
                                  assessmentConfig: { 
                                    ...lesson.assessmentConfig!, 
                                    passingGrade: parseInt(e.target.value) 
                                  } as AssessmentConfig 
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                                Tentativas Máx
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={lesson.assessmentConfig?.maxAttempts || 3}
                                onChange={(e) => updateLesson(module.id, lesson.id, { 
                                  assessmentConfig: { 
                                    ...lesson.assessmentConfig!, 
                                    maxAttempts: parseInt(e.target.value) 
                                  } as AssessmentConfig 
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                              />
                            </div>
                          </div>
                          
                          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                                Questões da Avaliação
                              </label>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => addAssessmentQuestion(module.id, lesson.id)}
                              >
                                <Plus size={16} />
                                Adicionar Questão
                              </Button>
                            </div>
                            {(lesson.assessmentConfig?.questions || []).map((q, qIndex) => (
                              <div key={q.id} className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg space-y-3 mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                                    Questão {qIndex + 1}
                                  </span>
                                  <button
                                    onClick={() => removeAssessmentQuestion(module.id, lesson.id, q.id)}
                                    className="ml-auto p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={q.question}
                                  onChange={(e) => updateAssessmentQuestion(module.id, lesson.id, q.id, { question: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                                  placeholder="Digite a pergunta..."
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`assess-${q.id}-correct`}
                                        checked={q.correctIndex === optIndex}
                                        onChange={() => updateAssessmentQuestion(module.id, lesson.id, q.id, { correctIndex: optIndex })}
                                        className="w-4 h-4 text-primary-600"
                                      />
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const newOptions = [...q.options];
                                          newOptions[optIndex] = e.target.value;
                                          updateAssessmentQuestion(module.id, lesson.id, q.id, { options: newOptions });
                                        }}
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm"
                                        placeholder={`Opção ${optIndex + 1}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  value={q.explanation || ''}
                                  onChange={(e) => updateAssessmentQuestion(module.id, lesson.id, q.id, { explanation: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm"
                                  placeholder="Explicação da resposta (opcional)"
                                />
                              </div>
                            ))}
                            {(lesson.assessmentConfig?.questions || []).length === 0 && (
                              <p className="text-sm text-surface-500 dark:text-surface-300 text-center py-4">
                                Adicione questões para a avaliação
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {module.lessons.length === 0 && (
              <div className="p-4 border-t border-surface-200 dark:border-surface-700">
                <p className="text-sm text-surface-500 dark:text-surface-300 mb-3">
                  Adicione aulas a este módulo
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(lessonTypeIcons) as LessonType[]).map(type => {
                    const info = lessonTypeIcons[type];
                    const TypeIcon = info.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => addLesson(module.id, type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                        style={{ color: info.color }}
                      >
                        <TypeIcon size={16} />
                        <span className="text-sm">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {module.lessons.length > 0 && (
              <div className="p-4 border-t border-surface-200 dark:border-surface-700">
                <p className="text-sm text-surface-500 dark:text-surface-300 mb-3">
                  Adicionar mais aulas
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(lessonTypeIcons) as LessonType[]).map(type => {
                    const info = lessonTypeIcons[type];
                    const TypeIcon = info.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => addLesson(module.id, type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                        style={{ color: info.color }}
                      >
                        <TypeIcon size={16} />
                        <span className="text-sm">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
        <Award size={24} className="text-primary-600 dark:text-primary-400" />
        <div>
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">
            Configuração de Certificado
          </h3>
          <p className="text-sm text-surface-600 dark:text-surface-300">
            Defina os requisitos para o aluno receber o certificado
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700">
        <input
          type="checkbox"
          id="enableCert"
          checked={formData.certificateConfig.enableCertificate}
          onChange={(e) => setFormData({
            ...formData,
            certificateConfig: { ...formData.certificateConfig, enableCertificate: e.target.checked },
          })}
          className="w-5 h-5 rounded text-primary-600"
        />
        <label htmlFor="enableCert" className="flex-1 cursor-pointer">
          <span className="font-medium text-surface-900 dark:text-surface-100">
            Habilitar certificado para este curso
          </span>
        </label>
      </div>

      {formData.certificateConfig.enableCertificate && (
        <div className="space-y-4 pl-4">
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <input
              type="checkbox"
              id="requireCompletion"
              checked={formData.certificateConfig.requireCompletion}
              onChange={(e) => setFormData({
                ...formData,
                certificateConfig: { ...formData.certificateConfig, requireCompletion: e.target.checked },
              })}
              className="w-4 h-4 rounded text-primary-600"
            />
            <label htmlFor="requireCompletion" className="flex-1 cursor-pointer">
              <span className="text-surface-900 dark:text-surface-100">
                Exigir 100% de conclusão das aulas
              </span>
            </label>
            {formData.certificateConfig.requireCompletion && (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <input
              type="checkbox"
              id="requirePassingGrade"
              checked={formData.certificateConfig.requirePassingGrade}
              onChange={(e) => setFormData({
                ...formData,
                certificateConfig: { ...formData.certificateConfig, requirePassingGrade: e.target.checked },
              })}
              className="w-4 h-4 rounded text-primary-600"
            />
            <label htmlFor="requirePassingGrade" className="flex-1 cursor-pointer">
              <span className="text-surface-900 dark:text-surface-100">
                Exigir nota mínima na avaliação
              </span>
            </label>
          </div>

          {formData.certificateConfig.requirePassingGrade && (
            <div className="pl-9">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Nota mínima (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.certificateConfig.passingGrade || 70}
                onChange={(e) => setFormData({
                  ...formData,
                  certificateConfig: { ...formData.certificateConfig, passingGrade: parseInt(e.target.value) },
                })}
                className="w-32 px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
              />
              <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">
                O aluno precisa atingir esta nota na avaliação para receber o certificado
              </p>
            </div>
          )}
        </div>
      )}

      <Card className="p-6 bg-surface-50 dark:bg-surface-800">
        <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Resumo da Configuração
        </h4>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-surface-600 dark:text-surface-300">Certificado:</span>
            <span className="font-medium text-surface-900 dark:text-surface-100">
              {formData.certificateConfig.enableCertificate ? 'Habilitado' : 'Desabilitado'}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle size={16} className={formData.certificateConfig.requireCompletion ? 'text-green-500' : 'text-surface-300'} />
            <span className="text-surface-600 dark:text-surface-300">Conclusão 100%:</span>
            <span className="font-medium text-surface-900 dark:text-surface-100">
              {formData.certificateConfig.requireCompletion ? 'Exigida' : 'Não exigida'}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle size={16} className={formData.certificateConfig.requirePassingGrade ? 'text-green-500' : 'text-surface-300'} />
            <span className="text-surface-600 dark:text-surface-300">Nota de corte:</span>
            <span className="font-medium text-surface-900 dark:text-surface-100">
              {formData.certificateConfig.requirePassingGrade 
                ? `${formData.certificateConfig.passingGrade}%` 
                : 'Não exigida'}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/courses')}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                  {isEditing ? 'Editar Curso' : 'Criar Novo Curso'}
                </h1>
                <p className="text-sm text-surface-500 dark:text-surface-300">
                  Etapa {currentStep} de 3
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save size={18} />
              {isLoading ? 'Salvando...' : 'Salvar Curso'}
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.num
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : currentStep > step.num
                      ? 'text-green-600'
                      : 'text-surface-500 dark:text-surface-300'
                  }`}
                >
                  {currentStep > step.num ? <Check size={18} /> : <step.icon size={18} />}
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-surface-200 dark:bg-surface-700 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
          <Button variant="secondary" onClick={handlePrev} disabled={currentStep === 1}>
            <ArrowLeft size={18} />
            Anterior
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Próximo
              <ArrowRight size={18} />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};