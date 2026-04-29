import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockChartData = [
  { name: 'Jan', alunos: 400 },
  { name: 'Fev', alunos: 300 },
  { name: 'Mar', alunos: 600 },
  { name: 'Abr', alunos: 800 },
  { name: 'Mai', alunos: 650 },
  { name: 'Jun', alunos: 900 },
];

const recentCourses = [
  { id: '1', title: 'React Avançado', students: 245, completion: 78, status: 'active' },
  { id: '2', title: 'TypeScript Fundamentals', students: 189, completion: 65, status: 'active' },
  { id: '3', title: 'Node.js API', students: 156, completion: 82, status: 'active' },
];

const recentUsers = [
  { id: '1', name: 'Maria Santos', course: 'React Avançado', date: '2 horas atrás' },
  { id: '2', name: 'Pedro Oliveira', course: 'TypeScript', date: '5 horas atrás' },
  { id: '3', name: 'Ana Costa', course: 'Node.js', date: '1 dia atrás' },
];

export const AdminDashboard = () => {
  const stats = [
    { 
      label: 'Total de Alunos', 
      value: '1,250', 
      change: '+12%', 
      isPositive: true,
      icon: Users 
    },
    { 
      label: 'Cursos Ativos', 
      value: '15', 
      change: '+3', 
      isPositive: true,
      icon: BookOpen 
    },
    { 
      label: 'Receita Mensal', 
      value: 'R$ 45,000', 
      change: '+8%', 
      isPositive: true,
      icon: DollarSign 
    },
    { 
      label: 'Taxa de Conclusão', 
      value: '78%', 
      change: '-2%', 
      isPositive: false,
      icon: TrendingUp 
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Dashboard
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Visão geral da plataforma
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/courses">
                <Button variant="secondary" size="sm">
                  <BookOpen size={18} />
                  Ver Cursos
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button size="sm">
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
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <stat.icon size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</p>
              <p className="text-sm text-surface-500 dark:text-surface-300">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Evolução de Alunos
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="alunos" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                Cursos Populares
              </h2>
              <Link to="/admin/courses" className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                Ver todos
              </Link>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{course.title}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-300">{course.students} alunos</p>
                  </div>
                  <Badge variant="success">{course.completion}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                Novos Alunos
              </h2>
              <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                Ver todos
              </Link>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <Users size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{user.name}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-300">{user.course}</p>
                  </div>
                  <span className="text-xs text-surface-400">{user.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};