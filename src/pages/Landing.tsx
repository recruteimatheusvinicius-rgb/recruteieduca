import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useThemeStore } from '../stores/themeStore';
import { CourseCard } from '../components/ui/CourseCard';
import { Button } from '../components/ui/Button';
import type { Course } from '../types';
import {
  BookOpen, ArrowRight, Moon, Sun, Award, ListChecks, Zap, Sparkles, Play, Users,
} from 'lucide-react';

// Mapping local: a landing lê `courses` sem depender do useDataStore (que só
// inicializa após login). Reaproveita o mesmo shape que dataStore.ts monta.
interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  instructor: string | null;
  instructor_photo: string | null;
  duration: string | null;
  level: string | null;
  rating: number | null;
  enrolled: number | null;
  restricted_plans: string[] | null;
  modules: unknown;
  thumbnail: string | null;
  status: string | null;
  created_at: string | null;
}

const fromDbCourse = (row: CourseRow): Course => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  category: row.category ?? '',
  instructor: row.instructor ?? '',
  instructorPhoto: row.instructor_photo ?? undefined,
  duration: row.duration ?? '',
  level: (row.level as Course['level']) ?? 'iniciante',
  rating: row.rating ?? 0,
  enrolled: row.enrolled ?? 0,
  restrictedPlans: row.restricted_plans ?? [],
  modules: (row.modules as Course['modules']) ?? [],
  certificateConfig: {
    enableCertificate: false,
    requireCompletion: true,
    requirePassingGrade: false,
    passingGrade: 70,
  },
  thumbnail: row.thumbnail ?? undefined,
  status: (row.status as Course['status']) ?? 'published',
  createdAt: row.created_at ?? undefined,
});

const FEATURES = [
  {
    icon: ListChecks,
    title: 'Trilhas por perfil',
    description: 'Onboarding pensado para o seu momento, do primeiro acesso à operação completa.',
  },
  {
    icon: Award,
    title: 'Certificação real',
    description: 'Conclua os cursos, ganhe certificados e comprove o domínio da plataforma.',
  },
  {
    icon: Zap,
    title: 'Sempre atualizado',
    description: 'Novos conteúdos entram na vitrine na hora que são publicados.',
  },
];

export const Landing = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCourses = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12);

    setCourses(((data ?? []) as CourseRow[]).map(fromDbCourse));
    setIsLoading(false);
  };

  useEffect(() => {
    loadCourses();

    if (!isSupabaseConfigured()) return;

    // Realtime: qualquer alteração em `courses` re-puxa a vitrine.
    const channel = supabase
      .channel('landing-courses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        () => loadCourses(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800">
        <div className="container-app flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-surface-900 dark:text-surface-100">
              Recrutei<span className="text-primary-600">Educa</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              className="p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/login">
              <Button>
                Acessar
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] bg-primary-500 rounded-full blur-3xl" />
        </div>

        <div className="container-app relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-primary-100 text-sm mb-6">
              <Sparkles size={14} />
              <span>A Academy oficial da Recrutei</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Aprenda a recrutar<br />
              <span className="bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                com quem entende do assunto
              </span>
            </h1>

            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Cursos, trilhas e certificações para dominar o Recrutei e transformar
              o seu processo de recrutamento — do primeiro acesso à operação completa.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/login">
                <Button size="lg" className="!bg-white !text-primary-700 hover:!bg-primary-50 shadow-xl shadow-primary-900/30">
                  Entrar na plataforma
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="#vitrine">
                <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
                  <Play size={18} />
                  Ver cursos
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="p-6 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <feature.icon size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-100 mb-1">
                {feature.title}
              </h3>
              <p className="text-surface-500 dark:text-surface-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vitrine */}
      <section id="vitrine" className="container-app pb-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100">
              Cursos disponíveis agora
            </h2>
            <p className="text-surface-500 dark:text-surface-300 mt-1">
              A vitrine atualiza automaticamente quando um novo curso é publicado.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-300">
            <Users size={16} />
            <span>{courses.length} {courses.length === 1 ? 'curso' : 'cursos'} em destaque</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-xl bg-surface-100 dark:bg-surface-800 animate-pulse"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <BookOpen size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-300">
              Nenhum curso publicado no momento. Volte em breve!
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {courses.map((course) => (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <Link to="/login">
            <Button size="lg">
              Comece agora
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="container-app py-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-surface-500 dark:text-surface-300">
            © {new Date().getFullYear()} RecruteiEduca. Todos os direitos reservados.
          </p>
          <Link to="/login" className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
            Entrar
          </Link>
        </div>
      </footer>
    </div>
  );
};
