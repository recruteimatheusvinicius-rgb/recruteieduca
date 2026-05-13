import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AchievementRow {
  name?: string | null;
  description?: string | null;
  earned_at?: string | null;
}

interface ProgressRow {
  course_id?: string | null;
  completed_at?: string | null;
}
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';
import { 
  User, Mail, Phone, Calendar, Award, BookOpen, Clock, TrendingUp, 
  Edit2, Camera, Briefcase, Star, ChevronRight, Settings,
  BookMarked, MessageSquare, Bell, X, Save
} from 'lucide-react';

export const StudentProfile = () => {
  const { courses } = useDataStore();
  const { user, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates' | 'activity'>('courses');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});
  const [statsData, setStatsData] = useState({ enrolled: 0, hours: '0h', certificates: 0, streak: 'Sem dados' });
  const [recentActivities, setRecentActivities] = useState<{ text: string; time: string; }[]>([]);
  const [achievements, setAchievements] = useState<{ icon: typeof Star; label: string; description: string; date: string }[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user || !isSupabaseConfigured()) {
        setAchievements([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false });

        if (error) {
          console.error('Error loading achievements:', error);
          setAchievements([]);
          return;
        }

        if (data && data.length > 0) {
          const achievementRows = data as AchievementRow[];
          const mappedAchievements = achievementRows.map((a) => ({
            icon: Star,
            label: a.name ?? 'Conquista',
            description: a.description ?? '',
            date: a.earned_at ? new Date(a.earned_at).toLocaleDateString('pt-BR') : '',
          }));
          setAchievements(mappedAchievements);
        } else {
          setAchievements([]);
        }
      } catch (err) {
        console.error('Error loading achievements:', err);
        setAchievements([]);
      }
    };

    loadAchievements();
  }, [user]);

  const parseDurationMinutes = (duration: string | undefined) => {
    if (!duration) return 0;
    const hourMatch = duration.match(/(\d+)\s*h/);
    const minuteMatch = duration.match(/(\d+)\s*min/);
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return hours * 60 + minutes;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes <= 0) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  const computeStreak = (dates: string[]) => {
    const uniqueDays = Array.from(new Set(dates.map((date) => date.slice(0, 10))));
    if (uniqueDays.length === 0) return 0;

    const sortedDays = uniqueDays.sort((a, b) => Number(new Date(b)) - Number(new Date(a)));
    let streak = 0;
    const current = new Date();

    while (true) {
      const isoDate = current.toISOString().slice(0, 10);
      if (sortedDays.includes(isoDate)) {
        streak += 1;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Há pouco';
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
  };

  useEffect(() => {
    const loadStats = async () => {
      if (!user || !isSupabaseConfigured()) {
        return;
      }

      try {
        const [{ data: enrollmentData, error: enrollmentError }, { data: progressData, error: progressError }] = await Promise.all([
          supabase
            .from('user_enrollments')
            .select('course_id, progress')
            .eq('user_id', user.id),
          supabase
            .from('user_progress')
            .select('course_id, completed_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(3),
        ]);

        const enrollmentMap: Record<string, number> = {};
        if (enrollmentData && !enrollmentError) {
          enrollmentData.forEach((enrollment) => {
            if (enrollment.course_id) {
              enrollmentMap[enrollment.course_id] = enrollment.progress ?? 0;
            }
          });
        }

        setEnrollments(enrollmentMap);

        const progressRows = (progressData ?? []) as ProgressRow[];

        const enrolledCoursesList = courses.filter((course) => enrollmentMap[course.id] !== undefined);
        const enrolledCount = enrolledCoursesList.length;
        const totalMinutes = enrolledCoursesList.reduce(
          (sum, course) => sum + parseDurationMinutes(course.duration),
          0
        );
        const completedCount = Object.values(enrollmentMap).filter((progress) => progress >= 100).length;
        const streak = progressRows && !progressError
          ? computeStreak(progressRows.map((item) => item.completed_at || ''))
          : 0;

        setStatsData({
          enrolled: enrolledCount,
          hours: formatMinutes(totalMinutes),
          certificates: completedCount,
          streak: streak > 0 ? `${streak} dias` : 'Sem dados',
        });

        if (progressRows && !progressError) {
          setRecentActivities(
            progressRows.map((item) => {
              const course = courses.find((courseItem) => courseItem.id === item.course_id);
              return {
                text: course ? `Concluiu ${course.title}` : 'Concluiu uma atividade',
                time: getRelativeTime(item.completed_at ?? null),
              };
            })
          );
        }
      } catch (error) {
        console.error('Falha ao carregar estatísticas do usuário:', error);
      }
    };

    loadStats();
  }, [user, courses]);

  const enrolledCourses = useMemo(() => {
    return courses.filter((course) => enrollments[course.id] !== undefined).slice(0, 4);
  }, [courses, enrollments]);

  const certificateCourses = useMemo(() => {
    return courses.filter((course) => (enrollments[course.id] ?? 0) >= 100);
  }, [courses, enrollments]);

  const stats = [
    { icon: BookOpen, label: 'Cursos Inscritos', value: statsData.enrolled },
    { icon: Clock, label: 'Horas de Estudo', value: statsData.hours },
    { icon: Award, label: 'Certificados', value: statsData.certificates },
    { icon: TrendingUp, label: 'Sequência', value: statsData.streak },
  ];

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Por favor, insira seu nome');
      return;
    }

    const { updateProfile } = useAuthStore.getState();
    const success = await updateProfile(editName.trim());
    
    if (success) {
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } else {
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const isAdmin = user?.role === 'admin';
  const roleLabel = isAdmin ? 'Administrador' : 'Estudante';

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container-app py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/20">
                <User size={48} className="text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                <Camera size={18} className="text-surface-600 cursor-pointer" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-bold bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 focus:outline-none focus:border-white"
                    placeholder="Seu nome"
                  />
                ) : (
                  <h1 className="text-3xl font-bold">{user?.name || 'Usuário'}</h1>
                )}
                {isAdmin && <Badge variant="warning">Admin</Badge>}
              </div>
              <p className="text-primary-100 mb-4">{user?.email || 'email@example.com'} • {roleLabel}</p>
              
              <div className="flex flex-wrap gap-4 text-primary-100 text-sm">
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Sem dados'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                  >
                    <X size={18} />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="!bg-white !text-primary-600 hover:!bg-primary-50"
                  >
                    <Save size={18} />
                    Salvar
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/settings">
                    <Button variant="secondary" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                      <Settings size={18} />
                      Configurações
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      setEditName(user?.name || '');
                      setIsEditing(true);
                    }}
                    className="!bg-white !text-primary-600 hover:!bg-primary-50"
                  >
                    <Edit2 size={18} />
                    Editar Perfil
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <stat.icon size={24} className="text-primary-200 mb-2" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'courses' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  Meus Cursos
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'certificates' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  Certificados
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'activity' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  Atividade
                </button>
              </div>

              {activeTab === 'courses' && (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/course/${course.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card transition-all group cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={24} className="text-surface-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 transition-colors truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-surface-500 dark:text-surface-300">{course.instructor}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${enrollments[course.id] ?? 0}%` }} />
                          </div>
                          <span className="text-xs text-surface-500">{enrollments[course.id] ?? 0}%</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-surface-400 group-hover:text-primary-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificateCourses.length > 0 ? (
                    certificateCourses.map((course) => (
                      <div key={course.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-surface-800 dark:to-surface-700">
                        <div className="flex items-center gap-3 mb-3">
                          <Award size={24} className="text-amber-500" />
                          <div>
                            <h3 className="font-medium text-surface-900 dark:text-surface-100">{course.title}</h3>
                            <p className="text-xs text-surface-500">Certificado disponível</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full">
                          Download PDF
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-500">
                      Nenhum certificado encontrado para o momento.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <BookMarked size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-surface-900 dark:text-surface-100">{activity.text}</p>
                          <p className="text-xs text-surface-500">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-500">
                      Nenhuma atividade recente disponível.
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Conquistas
              </h2>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-700/50">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <achievement.icon size={24} className="text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-surface-900 dark:text-surface-100">{achievement.label}</h3>
                        <p className="text-xs text-surface-500">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-500 text-center">
                  Nenhuma conquista conquistada ainda. Complete cursos para ganhar conquistas!
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Informações Pessoais
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                    <Mail size={18} className="text-surface-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">E-mail</p>
                    <p className="text-sm text-surface-900 dark:text-surface-100">{user?.email ?? 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-surface-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Telefone</p>
                    <p className="text-sm text-surface-900 dark:text-surface-100">{user?.phone ?? 'Não informado'}</p>
                  </div>
                </div>
                {user?.role && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                      <Briefcase size={18} className="text-surface-500" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Cargo</p>
                      <p className="text-sm text-surface-900 dark:text-surface-100">{user.role === 'admin' ? 'Administrador' : 'Estudante'}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Notificações
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Bell, label: 'Novas aulas disponíveis', active: true },
                  { icon: Award, label: 'Certificados disponíveis', active: true },
                  { icon: MessageSquare, label: 'Novas mensagens', active: false },
                ].map((notification, i) => (
                  <label key={i} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-surface-600 dark:text-surface-300">{notification.label}</span>
                    <input 
                      type="checkbox" 
                      defaultChecked={notification.active}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" 
                    />
                  </label>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};