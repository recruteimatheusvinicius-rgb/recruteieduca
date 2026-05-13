import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Edit, Trash2, Eye, 
  BookOpen, Users, Tag, DollarSign, GraduationCap,
  BarChart3
} from 'lucide-react';

type TabType = 'dashboard' | 'courses' | 'formations' | 'users' | 'categories' | 'plans';

export const AdminManage = () => {
  const navigate = useNavigate();
  const { courses, users, formations, categories, plans, deleteCourse, deleteUser, deletePlan, deleteFormation, deleteCategory } = useDataStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TabType; label: string; icon: typeof BarChart3 }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'formations', label: 'Formações', icon: GraduationCap },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'plans', label: 'Planos', icon: DollarSign },
  ];

  const handleDelete = (type: string, id: string) => {
    if (!confirm(`Tem certeza que deseja excluir este ${type}?`)) return;
    
    switch (type) {
      case 'course': deleteCourse(id); break;
      case 'user': deleteUser(id); break;
      case 'plan': deletePlan(id); break;
      case 'formation': deleteFormation(id); break;
      case 'category': deleteCategory(id); break;
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('courses')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{courses.length}</p>
            <p className="text-sm text-surface-500">Cursos</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('formations')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <GraduationCap size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{formations.length}</p>
            <p className="text-sm text-surface-500">Formações</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('users')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{users.length}</p>
            <p className="text-sm text-surface-500">Usuários</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('categories')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <Tag size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{categories.length}</p>
            <p className="text-sm text-surface-500">Categorias</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('plans')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
            <DollarSign size={20} className="text-pink-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{plans.length}</p>
            <p className="text-sm text-surface-500">Planos</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCourses = () => {
    const filtered = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/admin/courses/create">
            <Button><Plus size={18} /> Novo Curso</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Curso</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Nível</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course.id} className="border-b border-surface-100 dark:border-surface-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                        <BookOpen size={18} className="text-surface-400" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-surface-100">{course.title}</p>
                        <p className="text-sm text-surface-500">{course.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="primary">{course.category}</Badge></td>
                  <td className="py-3 px-4 capitalize">{course.level}</td>
                  <td className="py-3 px-4">
                    <Badge variant={course.status === 'published' ? 'success' : 'warning'}>
                      {course.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/courses/${course.id}`} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 cursor-pointer">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/admin/courses/${course.id}`} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 cursor-pointer">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete('course', course.id)} className="p-2 rounded-lg hover:bg-surface-100 text-red-500 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-8 text-surface-500">Nenhum curso encontrado</p>}
      </div>
    );
  };

  const renderFormations = () => {
    const filtered = formations.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/admin/formations')}><Plus size={18} /> Nova Formação</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((formation) => (
            <Card key={formation.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">{formation.title}</h3>
                <div className="flex gap-1">
                  <button onClick={() => navigate('/admin/formations')} className="p-1 rounded hover:bg-surface-100 text-surface-500">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete('formation', formation.id)} className="p-1 rounded hover:bg-surface-100 text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-surface-500 mb-2">{formation.courses.length} cursos • {formation.duration}</p>
              <Badge variant="primary">{formation.level}</Badge>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center py-8 text-surface-500">Nenhuma formação encontrada</p>}
      </div>
    );
  };

  const renderUsers = () => {
    const filtered = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/admin/users')}><Plus size={18} /> Novo Usuário</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Usuário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Papel</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-surface-100 dark:border-surface-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-100">{user.name}</p>
                      <p className="text-sm text-surface-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'admin' ? 'warning' : 'primary'}>{user.role}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>{user.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate('/admin/users')} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => navigate('/admin/users')} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete('user', user.id)} className="p-2 rounded-lg hover:bg-surface-100 text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/admin/categories')}><Plus size={18} /> Nova Categoria</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">{category.name}</h3>
              </div>
              <p className="text-sm text-surface-500 mb-2">{category.description}</p>
              <p className="text-sm text-surface-500">{category.courseCount} cursos</p>
              <div className="flex gap-1 mt-3">
                <button onClick={() => navigate('/admin/categories')} className="p-1 rounded hover:bg-surface-100 text-surface-500">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete('category', category.id)} className="p-1 rounded hover:bg-surface-100 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPlans = () => {
    const filtered = plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/admin/plans')}><Plus size={18} /> Novo Plano</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <Card key={plan.id} className={`p-4 ${plan.isPopular ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">{plan.name}</h3>
              </div>
              <p className="text-sm text-surface-500">
                {plan.courseRestrictions?.length === 0 ? 'Acesso livre' : `${plan.courseRestrictions?.length} cursos restritos`}
              </p>
              <div className="flex gap-1 mt-3">
                <button onClick={() => navigate('/admin/plans')} className="p-1 rounded hover:bg-surface-100 text-surface-500">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete('plan', plan.id)} className="p-1 rounded hover:bg-surface-100 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        {activeTab !== 'dashboard' && (
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100"
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'formations' && renderFormations()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'plans' && renderPlans()}
      </div>
    </div>
  );
};