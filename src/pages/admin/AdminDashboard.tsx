import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BookOpen, Users, GraduationCap, Tag } from 'lucide-react';

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ${d === 1 ? 'dia' : 'dias'} atrás`;
  return date.toLocaleDateString('pt-BR');
};

export const AdminDashboard = () => {
  const { courses, users, categories, formations } = useDataStore();

  // Estatísticas reais agregadas do dataStore
  const stats = useMemo(() => {
    const students = users.filter(u => u.role === 'student').length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;
    const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrolled || 0), 0);

    return [
      { label: 'Total de Alunos',     value: students,          icon: Users },
      { label: 'Cursos Publicados',   value: publishedCourses,  icon: BookOpen },
      { label: 'Matrículas',          value: totalEnrollments,  icon: GraduationCap },
      { label: 'Categorias',          value: categories.length, icon: Tag },
    ];
  }, [courses, users, categories]);

  // Top 5 cursos com mais alunos matriculados (publicados)
  const popularCourses = useMemo(() => {
    return [...courses]
      .filter(c => c.status === 'published')
      .sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0))
      .slice(0, 5);
  }, [courses]);

  // Últimos 5 alunos registrados (ordem por createdAt desc)
  const recentStudents = useMemo(() => {
    return [...users]
      .filter(u => u.role === 'student')
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);
  }, [users]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Dashboard
              </h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">
                Visão geral da plataforma
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/courses">
                <Button variant="secondary" size="sm" className="rounded-xl font-semibold">
                  <BookOpen size={18} />
                  Ver Cursos
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button size="sm" className="rounded-xl font-semibold">
                  <Users size={18} />
                  Ver Usuários
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="p-5 rounded-2xl shadow-card hover:shadow-hover transition-shadow">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  index % 2 === 0
                    ? 'bg-primary-50 dark:bg-primary-900/30'
                    : 'bg-violet-100 dark:bg-violet-900/30'
                }`}
              >
                <stat.icon
                  size={20}
                  className={index % 2 === 0 ? 'text-primary-600 dark:text-primary-400' : 'text-violet-600 dark:text-violet-300'}
                />
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {stat.value.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                Cursos Populares
              </h2>
              <Link to="/admin/courses" className="text-sm font-medium text-primary-500 hover:text-primary-600 cursor-pointer">
                Ver todos
              </Link>
            </div>
            {popularCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="mx-auto text-surface-300 dark:text-surface-600 mb-2" />
                <p className="text-sm text-surface-500 dark:text-surface-300">
                  Nenhum curso publicado ainda.
                </p>
                <Link to="/admin/courses/create">
                  <Button size="sm" variant="secondary" className="mt-3">
                    Criar primeiro curso
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {popularCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/admin/courses/${course.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-violet-600 dark:text-violet-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                        {course.title}
                      </p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {course.enrolled || 0} {(course.enrolled || 0) === 1 ? 'aluno' : 'alunos'}
                      </p>
                    </div>
                    {course.rating ? (
                      <Badge variant="success">{course.rating.toFixed(1)}★</Badge>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                Novos Alunos
              </h2>
              <Link to="/admin/users" className="text-sm font-medium text-primary-500 hover:text-primary-600 cursor-pointer">
                Ver todos
              </Link>
            </div>
            {recentStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto text-surface-300 dark:text-surface-600 mb-2" />
                <p className="text-sm text-surface-500 dark:text-surface-300">
                  Nenhum aluno cadastrado ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentStudents.map((user) => (
                  <Link
                    key={user.id}
                    to={`/admin/users/${user.id}?mode=view`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Users size={18} className="text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs text-surface-400 dark:text-surface-500 shrink-0">
                      {formatRelativeTime(user.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {formations.length > 0 && (
          <Card className="p-6 mt-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                Formações ({formations.length})
              </h2>
              <Link to="/admin/formations" className="text-sm font-medium text-primary-500 hover:text-primary-600 cursor-pointer">
                Gerenciar
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formations.slice(0, 6).map((f) => (
                <Link
                  key={f.id}
                  to={`/admin/formations/${f.id}`}
                  className="p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer border border-surface-100 dark:border-surface-700"
                >
                  <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                    {f.title}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-300 mt-1">
                    {f.courses?.length || 0} cursos · {f.level}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
