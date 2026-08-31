import { Link } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Button } from '../../components/ui/Button';
import { CourseCard } from '../../components/ui/CourseCard';
import { BookOpen, ArrowRight } from 'lucide-react';

export const Cursos = () => {
  const { courses, initialized } = useDataStore();
  const publishedCourses = courses.filter((c) => c.status === 'published');

  return (
    <section className="container-app py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">
          Cursos
        </h1>
        <p className="text-surface-500 dark:text-surface-300">
          Um catálogo em constante crescimento, feito para o dia a dia de quem recruta: entrevistas,
          employer branding, onboarding, dados e muito mais.
        </p>
      </div>

      {publishedCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/login">
              <Button variant="secondary">
                Entrar para começar a estudar
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-surface-400 dark:text-surface-500">
          <BookOpen size={40} className="mx-auto mb-3" />
          <p>{initialized ? 'Nenhum curso publicado no momento.' : 'Carregando cursos...'}</p>
        </div>
      )}
    </section>
  );
};
