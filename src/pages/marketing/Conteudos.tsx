import { Link } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { GraduationCap, Video, Zap, FileText, ArrowRight } from 'lucide-react';

const contentTypes = [
  {
    icon: Video,
    title: 'Webinars',
    description: 'Transmissões ao vivo e gravadas com especialistas em recrutamento e educação corporativa.',
  },
  {
    icon: Zap,
    title: 'Pílulas',
    description: 'Conteúdos curtos e diretos para aprender em poucos minutos, no seu ritmo.',
  },
  {
    icon: FileText,
    title: 'Materiais',
    description: 'Guias, templates e e-books prontos para usar no dia a dia de recrutamento.',
  },
];

export const Conteudos = () => {
  const { formations } = useDataStore();

  return (
    <section className="container-app py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">
          Conteúdos
        </h1>
        <p className="text-surface-500 dark:text-surface-300">
          Além dos cursos, o time tem acesso a trilhas de formação e a conteúdos rápidos pra
          aprender no dia a dia — tudo dentro da mesma conta.
        </p>
      </div>

      {formations.length > 0 && (
        <div className="mb-16">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-5 flex items-center gap-2">
            <GraduationCap size={20} className="text-primary-600 dark:text-primary-400" />
            Trilhas de formação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {formations.map((formation) => (
              <Card key={formation.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge>{formation.level}</Badge>
                  <span className="text-xs text-surface-400 dark:text-surface-500">{formation.duration}</span>
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1.5">
                  {formation.title}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-300 line-clamp-2">
                  {formation.description}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-3">
                  {formation.courses.length} curso(s)
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-5">
        Conteúdos rápidos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {contentTypes.map((item) => (
          <Card key={item.title} className="p-7 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <item.icon size={22} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-2">{item.title}</h3>
            <p className="text-sm text-surface-500 dark:text-surface-300">{item.description}</p>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link to="/login">
          <Button>
            Entrar para acessar tudo
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </section>
  );
};
