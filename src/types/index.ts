export type CourseLevel = 'iniciante' | 'intermediario' | 'avancado';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorPhoto?: string;
  instructorBio?: string;
  duration: string;
  level: CourseLevel;
  restrictedPlans: string[];
  modules: Module[];
  certificateConfig: CertificateConfig;
  thumbnail?: string;
  rating?: number;
  enrolled?: number;
  status: CourseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export type LessonType = 'video' | 'quiz' | 'reading' | 'guide' | 'assessment';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  order: number;
  moduleId?: string;
  duration?: string;
  videoUrl?: string;
  videoText?: string;
  questions?: QuizQuestion[];
  content?: string;
  embedCode?: string;
  assessmentConfig?: AssessmentConfig;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface AssessmentConfig {
  passingGrade: number;
  maxAttempts?: number;
  showResults: boolean;
  questions?: QuizQuestion[];
}

export interface CertificateConfig {
  enableCertificate: boolean;
  requireCompletion: boolean;
  requirePassingGrade: boolean;
  passingGrade?: number;
  /**
   * HTML completo do certificado personalizado. Quando preenchido,
   * substitui o template padrão. Variáveis suportadas:
   *   {{aluno}}, {{curso}}, {{instrutor}}, {{data}}, {{duracao}}
   */
  customHtml?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  phone?: string;
  createdAt?: string;
  status?: 'active' | 'inactive';
  company_id?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  videoUrl?: string;
}

export interface Plan {
  id: string;
  name: string;
  features: string[];
  courseRestrictions: string[];
  formationRestrictions: string[];
  isPopular?: boolean;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  courseCount: number;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  courses: string[];
  duration: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  restrictedPlans?: string[];
  thumbnail?: string;
  certificateConfig?: CertificateConfig;
}

export type CompanyStatus = 'active' | 'inactive' | 'deleted';
export type OnboardingTrack = 'self_service' | 'guided_growth' | 'enterprise_deploy' | 'rescue_recover';

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt?: string;
  onboardingTrack?: OnboardingTrack;
  onboardingTrackAssignedAt?: string;
}

// ============================================
// Checklist de Onboarding
// ============================================

export type ChecklistItemType = 'academy_lesson' | 'call' | 'manual_milestone' | 'certificate';
export type ChecklistItemScope = 'company' | 'user';
export type ChecklistItemStatus = 'pending' | 'in_progress' | 'completed';

export interface ChecklistTemplate {
  id: string;
  track: OnboardingTrack;
  name: string;
  description?: string;
  isActive: boolean;
  items: ChecklistTemplateItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistTemplateItem {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  itemType: ChecklistItemType;
  order: number;
  blocksNext: boolean;
  scope: ChecklistItemScope;
  courseId?: string;
  lessonId?: string;
  productEventKey?: string;
}

export interface ChecklistItemProgress {
  id: string;
  companyId: string;
  templateItemId: string;
  userId?: string;
  status: ChecklistItemStatus;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

// ============================================
// Client Books (projetos/documentos por empresa, estilo Notion)
// ============================================

export type ClientBookStatus = 'active' | 'archived';
export type BookPageType = 'doc' | 'kanban';

export interface ClientBook {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  coverEmoji?: string;
  status: ClientBookStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanContent {
  columns: KanbanColumn[];
}

export interface DocContent {
  html: string;
}

export type BookPageContent = KanbanContent | DocContent | Record<string, never>;

export interface BookPage {
  id: string;
  bookId: string;
  title: string;
  icon?: string;
  pageType: BookPageType;
  content: BookPageContent;
  order: number;
  updatedBy?: string;
  updatedAt?: string;
}

// Item de template combinado com o progresso real, pronto para a UI
export interface ChecklistItemView extends ChecklistTemplateItem {
  status: ChecklistItemStatus;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  isLocked: boolean;
}

// Declaração global para Tawk.to
declare global {
  interface Window {
    Tawk_API?: {
      toggle: () => void;
      open: () => void;
      close: () => void;
    };
  }
}