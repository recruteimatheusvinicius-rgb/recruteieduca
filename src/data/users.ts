import type { User, Plan, Category, Formation } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@aluno.com',
    role: 'student',
    avatar: undefined,
    phone: '(11) 99999-9999',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@aluno.com',
    role: 'student',
    avatar: undefined,
    phone: '(11) 88888-8888',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    name: 'Admin Principal',
    email: 'admin@recruteieduca.com',
    role: 'admin',
    avatar: undefined,
    phone: '(11) 77777-7777',
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Pedro Admin',
    email: 'pedro@recruteieduca.com',
    role: 'admin',
    avatar: undefined,
    phone: '(11) 66666-6666',
    createdAt: '2024-01-10'
  }
];

export const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Gratuito',
    features: [
      'Acesso a cursos gratuitos',
      'Certificados básicos',
      'Suporte por email'
    ],
    courseRestrictions: [],  // vazio = acesso total
    formationRestrictions: []
  },
  {
    id: '2',
    name: 'Premium',
    features: [
      'Acesso a todos os cursos',
      'Certificados verificados',
      'Suporte prioritário',
      'Downloads offline',
      'Formações exclusivas'
    ],
    courseRestrictions: [],
    formationRestrictions: [],
    isPopular: true,
    color: '#16a34a'
  },
  {
    id: '3',
    name: 'Enterprise',
    features: [
      'Tudo do Premium',
      'Acesso antecipado a novos cursos',
      'Mentoria mensal',
      'Formações customizadas',
      'Suporte dedicado'
    ],
    courseRestrictions: [],
    formationRestrictions: [],
    color: '#8b5cf6'
  }
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Programação',
    description: 'Cursos de desenvolvimento de software',
    color: '#16a34a',
    courseCount: 15
  },
  {
    id: '2',
    name: 'Design',
    description: 'Cursos de design gráfico e UI/UX',
    color: '#3b82f6',
    courseCount: 8
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Cursos de marketing digital',
    color: '#f59e0b',
    courseCount: 6
  },
  {
    id: '4',
    name: 'Negócios',
    description: 'Cursos de gestão e empreendedorismo',
    color: '#8b5cf6',
    courseCount: 5
  },
  {
    id: '5',
    name: 'Idiomas',
    description: 'Cursos de idiomas estrangeiros',
    color: '#ec4899',
    courseCount: 4
  }
];

export const mockFormations: Formation[] = [
  {
    id: '1',
    title: 'Desenvolvedor Full Stack',
    description: 'Trilha completa para se tornar um desenvolvedor Full Stack',
    courses: ['1', '2', '3'],
    duration: '120h',
    level: 'intermediario'
  },
  {
    id: '2',
    title: 'Designer UI/UX',
    description: 'Aprenda a criar interfaces modernas e experiencias do usuário',
    courses: ['4', '5'],
    duration: '80h',
    level: 'iniciante'
  },
  {
    id: '3',
    title: 'Marketing Digital',
    description: 'Domine as estratégias de marketing digital',
    courses: ['6', '7'],
    duration: '60h',
    level: 'iniciante'
  }
];