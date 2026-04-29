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

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt?: string;
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