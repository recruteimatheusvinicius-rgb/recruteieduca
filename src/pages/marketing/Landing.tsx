import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CourseCard } from '../../components/ui/CourseCard';
import { Footer } from '../../components/ui/Footer';
import {
  BookOpen, GraduationCap, Award, Users, ArrowRight,
  Building2, KeyRound, UserCheck, MessageCircle,
} from 'lucide-react';

const navLinks = [
  { href: '#inicio', label: 'Início' },
  { href: '#cursos', label: 'Cursos' },
  { href: '#como-fazer-parte', label: 'Como fazer parte' },
];

export const Landing = () => {
  const { courses, formations, initialize } = useDataStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Quem já está logado não deveria ver a landing — manda direto pra área dele
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const publishedCourses = courses.filter((c) => c.status === 'published');
  const featuredCourses = publishedCourses.slice(0, 6);

  const stats = [
    { icon: BookOpen, value: `${publishedCourses.length}+`, label: 'Cursos disponíveis' },
    { icon: GraduationCap, value: `${formations.length}+`, label: 'Trilhas de formação' },
    { icon: Award, value: 'Certificados', label: 'Ao concluir cada curso' },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg border-b border-surface-200 dark:border-surface-800">
        <div className="container-app flex items-center justify-between h-16">
          <Logo size={34} />
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Link to="/login">
            <Button>
              Entrar
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section id="inicio" className="bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-600 text-white">
        <div className="container-app py-20 md:py-28 text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary-200 mb-4">
            Educação corporativa para recrutamento
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 max-w-3xl mx-auto">
            Treinamento para transformar times de R&amp;H de verdade
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-9">
            A RecruteiEduca reúne cursos, trilhas, webinars e materiais para times de recrutamento
            e seleção evoluírem no seu próprio ritmo — direto de dentro do ecossistema Recrutei.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login">
              <Button size="lg" className="!bg-white !text-primary-700 hover:!bg-primary-50">
                Entrar na plataforma
                <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#cursos">
              <Button size="lg" variant="secondary" className="!bg-white/10 !border-white/25 !text-white hover:!bg-white/20">
                Ver cursos
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 border border-white/15 rounded-xl p-5">
                <stat.icon size={22} className="mx-auto mb-2 text-primary-200" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section id="cursos" className="container-app py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">
            Cursos e conteúdos
          </h2>
          <p className="text-surface-500 dark:text-surface-300">
            Um catálogo em constante crescimento, feito para o dia a dia de quem recruta: entrevistas,
            employer branding, onboarding, dados e muito mais.
          </p>
        </div>

        {featuredCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/login">
                <Button variant="secondary">
                  Entrar para ver o catálogo completo
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-surface-400 dark:text-surface-500">
            <BookOpen size={40} className="mx-auto mb-3" />
            <p>Carregando cursos...</p>
          </div>
        )}
      </section>

      {/* COMO FAZER PARTE */}
      <section id="como-fazer-parte" className="bg-white dark:bg-surface-800 border-y border-surface-200 dark:border-surface-700">
        <div className="container-app py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">
              Como fazer parte
            </h2>
            <p className="text-surface-500 dark:text-surface-300">
              A RecruteiEduca é um benefício do ecossistema Recrutei — o acesso é liberado para
              empresas que já usam o nosso ATS de recrutamento e seleção.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-7 text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                1. Sua empresa usa o ATS Recrutei
              </h3>
              <p className="text-sm text-surface-500 dark:text-surface-300">
                O acesso à RecruteiEduca já vem incluído para empresas com um plano ativo no
                sistema de recrutamento e seleção da Recrutei.
              </p>
            </Card>
            <Card className="p-7 text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <KeyRound size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                2. O admin libera o acesso
              </h3>
              <p className="text-sm text-surface-500 dark:text-surface-300">
                O administrador da conta convida cada pessoa do time, que recebe um link para
                criar a própria senha.
              </p>
            </Card>
            <Card className="p-7 text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserCheck size={22} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">
                3. O time começa a aprender
              </h3>
              <p className="text-sm text-surface-500 dark:text-surface-300">
                Cursos, trilhas e certificados liberados na hora — sem custo adicional, direto
                pela conta da empresa.
              </p>
            </Card>
          </div>

          <Card className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-surface-800">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-surface-900 dark:text-surface-100 mb-1">
                Ainda não é cliente do ATS Recrutei?
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-300">
                Fale com a nossa equipe para conhecer o sistema e liberar a RecruteiEduca para o seu time.
              </p>
            </div>
            <Button onClick={() => window.Tawk_API?.toggle()} className="flex-shrink-0">
              <MessageCircle size={16} />
              Fale conosco
            </Button>
          </Card>

          <div className="flex items-center justify-center gap-2 mt-10 text-sm text-surface-400 dark:text-surface-500">
            <Users size={15} />
            Já tem uma conta liberada pela sua empresa?
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline cursor-pointer">
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
