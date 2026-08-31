import { Link } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Button } from '../../components/ui/Button';
import { BookOpen, GraduationCap, Award, ArrowRight } from 'lucide-react';

export const Home = () => {
  const { courses, formations } = useDataStore();
  const publishedCourses = courses.filter((c) => c.status === 'published');

  const stats = [
    { icon: BookOpen, value: `${publishedCourses.length}+`, label: 'Cursos disponíveis' },
    { icon: GraduationCap, value: `${formations.length}+`, label: 'Trilhas de formação' },
    { icon: Award, value: 'Certificados', label: 'Ao concluir cada curso' },
  ];

  return (
    <section className="bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-600 text-white">
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
          <Link to="/cursos">
            <Button size="lg" variant="secondary" className="!bg-white/10 !border-white/25 !text-white hover:!bg-white/20">
              Ver cursos
            </Button>
          </Link>
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
  );
};
