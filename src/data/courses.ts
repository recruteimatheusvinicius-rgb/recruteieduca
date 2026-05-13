import type { Course, Module, Lesson } from '../types';

const createLesson = (id: string, title: string, type: Lesson['type'], duration: string): Lesson => ({
  id,
  title,
  type,
  order: parseInt(id.split('-')[1]) || 1,
  duration,
  videoUrl: type === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined,
  videoText: type === 'video' ? 'Notas da aula...' : undefined,
  content: type === 'reading' ? '<p>Conteúdo da leitura...</p>' : undefined,
  embedCode: type === 'guide' ? '<iframe src="https://example.com/slide"></iframe>' : undefined,
  questions: type === 'quiz' ? [{ id: 'q1', question: 'Pergunta 1?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }] : undefined,
  assessmentConfig: type === 'assessment' ? { passingGrade: 70, maxAttempts: 3, showResults: true } : undefined,
});

const createModule = (id: string, title: string, lessons: Lesson[]): Module => ({
  id,
  title,
  description: `Módulo ${title}`,
  order: parseInt(id.replace('m', '')),
  lessons,
});

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introdução ao React',
    description: 'Aprenda os fundamentos do React para construir interfaces modernas.',
    category: 'Programação',
    instructor: 'João Silva',
    duration: '8h 30min',
    level: 'iniciante',
    restrictedPlans: [],
    modules: [
      createModule('m1', 'Fundamentos', [
        createLesson('1-1', 'O que é React?', 'video', '15min'),
        createLesson('1-2', 'Componentes', 'reading', '10min'),
        createLesson('1-3', 'Quiz: Conhecendo React', 'quiz', '5min'),
      ]),
      createModule('m2', 'Estado e Props', [
        createLesson('2-1', 'useState', 'video', '20min'),
        createLesson('2-2', 'useProps', 'video', '15min'),
        createLesson('2-3', 'Avaliação Final', 'assessment', '10min'),
      ]),
    ],
    certificateConfig: {
      enableCertificate: true,
      requireCompletion: true,
      requirePassingGrade: true,
      passingGrade: 70,
    },
    thumbnail: '/course1.jpg',
    rating: 4.8,
    enrolled: 1250,
    status: 'published',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'TypeScript Avançado',
    description: 'Domine TypeScript com conceitos avançados.',
    category: 'Programação',
    instructor: 'Maria Santos',
    duration: '12h',
    level: 'avancado',
    restrictedPlans: [],
    modules: [
      createModule('m1', 'Tipos Avançados', [
        createLesson('1-1', 'Generics', 'video', '25min'),
        createLesson('1-2', 'Type Guards', 'reading', '15min'),
      ]),
    ],
    certificateConfig: {
      enableCertificate: true,
      requireCompletion: false,
      requirePassingGrade: true,
      passingGrade: 80,
    },
    thumbnail: '/course2.jpg',
    rating: 4.9,
    enrolled: 890,
    status: 'published',
  },
];