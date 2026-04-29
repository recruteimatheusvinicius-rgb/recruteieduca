import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TipTapEditor } from '../../components/TipTapEditor';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Clock, BookOpen, Save, CheckCircle, Search } from 'lucide-react';
import type { Formation, CertificateConfig } from '../../types';

const steps = [
  { num: 1, label: 'Informações Gerais', icon: BookOpen },
  { num: 2, label: 'Selecionar Cursos', icon: BookOpen },
  { num: 3, label: 'Certificado', icon: BookOpen },
  { num: 4, label: 'Revisão', icon: CheckCircle },
];

const createEmptyCertificateConfig = (): CertificateConfig => ({
  enableCertificate: true,
  requireCompletion: true,
  requirePassingGrade: false,
  passingGrade: 70,
});

export const FormationCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formations, courses, levels, addFormation, updateFormation } = useDataStore();
  
  const existingFormation = id ? formations.find(f => f.id === id) : null;
  const isEditing = !!existingFormation;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  const [formData, setFormData] = useState<Formation & { certificateConfig: CertificateConfig }>(() => {
    if (existingFormation) return { ...existingFormation, certificateConfig: existingFormation.certificateConfig || createEmptyCertificateConfig() };
    return {
      id: `formation-${Date.now()}`,
      title: '',
      description: '',
      duration: '',
      level: 'iniciante',
      courses: [],
      certificateConfig: createEmptyCertificateConfig(),
    };
  });

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('O título da formação é obrigatório');
      return;
    }
    if (formData.courses.length === 0) {
      toast.error('Selecione pelo menos um curso para a formação');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (isEditing) {
        updateFormation(formData.id, formData);
        toast.success('Formação atualizada com sucesso!');
      } else {
        addFormation(formData);
        toast.success('Formação criada com sucesso!');
      }
      navigate('/admin/formations');
    } catch {
      toast.error('Erro ao salvar formação');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      iniciante: 'success',
      intermediario: 'warning',
      avancado: 'error',
    };
    const labels: Record<string, string> = {
      iniciante: 'Iniciante',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    };
    return <Badge variant={variants[level]}>{labels[level]}</Badge>;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Título da Formação *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400"
            placeholder="Ex: Desenvolvedor Full Stack"
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
            Duração *
          </label>
          <div className="relative">
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ex: 40h"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Nível
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value as 'iniciante' | 'intermediario' | 'avancado' })}
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === 'iniciante' ? 'Iniciante' : level === 'intermediario' ? 'Intermediário' : 'Avançado'}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
          Selecione os Cursos
        </h3>
        <span className="text-sm text-surface-500 dark:text-surface-300">
          {formData.courses.length} curso(s) selecionado(s)
        </span>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          value={courseSearch}
          onChange={(e) => setCourseSearch(e.target.value)}
          placeholder="Buscar curso por nome..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((course) => (
          <Card 
            key={course.id}
            className={`cursor-pointer transition-all ${
              formData.courses.includes(course.id)
                ? 'ring-2 ring-primary-500 border-primary-500'
                : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
            onClick={() => toggleCourse(course.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`
                w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5
                ${formData.courses.includes(course.id)
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-400'
                }
              `}>
                {formData.courses.includes(course.id) && <CheckCircle size={16} />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-surface-900 dark:text-surface-100">
                  {course.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-surface-500 dark:text-surface-300">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} aulas
                  </span>
                </div>
                <div className="mt-2">
                  <Badge variant="primary">{course.category}</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <p className="text-surface-500 dark:text-surface-300">Nenhum curso encontrado</p>
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
          <p className="text-surface-500 dark:text-surface-300">Nenhum curso cadastrado</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/admin/courses/create')}>
            Criar Curso
          </Button>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Configurações do Certificado
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.certificateConfig?.enableCertificate || false}
              onChange={(e) => setFormData({
                ...formData,
                certificateConfig: { ...formData.certificateConfig!, enableCertificate: e.target.checked }
              })}
              className="w-5 h-5 rounded text-primary-600"
            />
            <span className="text-surface-900 dark:text-surface-100">Emitir certificado de conclusão</span>
          </label>

          {formData.certificateConfig?.enableCertificate && (
            <>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.certificateConfig?.requireCompletion || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificateConfig: { ...formData.certificateConfig!, requireCompletion: e.target.checked }
                  })}
                  className="w-5 h-5 rounded text-primary-600"
                />
                <span className="text-surface-900 dark:text-surface-100">Exigir conclusão de todos os cursos</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.certificateConfig?.requirePassingGrade || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificateConfig: { ...formData.certificateConfig!, requirePassingGrade: e.target.checked }
                  })}
                  className="w-5 h-5 rounded text-primary-600"
                />
                <span className="text-surface-900 dark:text-surface-100">Exigir nota mínima</span>
              </label>

              {formData.certificateConfig?.requirePassingGrade && (
                <div className="ml-8">
                  <label className="block text-sm text-surface-700 dark:text-surface-300 mb-1">
                    Nota mínima (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.certificateConfig?.passingGrade || 70}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificateConfig: { ...formData.certificateConfig!, passingGrade: parseInt(e.target.value) }
                    })}
                    className="w-32 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedCourses = courses.filter(c => formData.courses.includes(c.id));
    
    return (
      <div className="space-y-6">
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Resumo da Formação
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-surface-500 dark:text-surface-300">Título</label>
              <p className="font-medium text-surface-900 dark:text-surface-100">{formData.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-surface-500 dark:text-surface-300">Duração</label>
                <p className="font-medium text-surface-900 dark:text-surface-100">{formData.duration}</p>
              </div>
              <div>
                <label className="text-sm text-surface-500 dark:text-surface-300">Nível</label>
                <div className="mt-1">{getLevelBadge(formData.level)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm text-surface-500 dark:text-surface-300">Cursos ({selectedCourses.length})</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCourses.map(course => (
                  <Badge key={course.id} variant="primary">{course.title}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedCourses.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-amber-700 dark:text-amber-400 text-sm">
              Atenção: Nenhum curso foi selecionado. Selecione cursos na etapa anterior.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/admin/formations')}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <ArrowLeft size={20} className="text-surface-600 dark:text-surface-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {isEditing ? 'Editar Formação' : 'Nova Formação'}
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Preencha as informações para {isEditing ? 'atualizar' : 'criar'} uma formação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${currentStep === step.num
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-surface-500 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
                    }
                  `}
                >
                  <step.icon size={18} />
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-surface-200 dark:bg-surface-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
          <Button 
            variant="secondary" 
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={18} className="mr-2" />
            Anterior
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/admin/formations')}>
              Cancelar
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isLoading}>
                <Save size={18} className="mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Formação'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};