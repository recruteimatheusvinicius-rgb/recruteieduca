import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../stores/dataStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Search, Plus, Edit, Trash2, Eye, 
  BookOpen, Users, Clock, Star, Upload, GripVertical, EyeOff
} from 'lucide-react';
import type { Course } from '../../types';

interface SortableRowProps {
  course: Course;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const SortableRow = ({ course, onDelete, onToggleStatus }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <button 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
          >
            <GripVertical size={16} />
          </button>
          <div className="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="text-surface-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
              {course.title}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-300 truncate">
              {course.instructor}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="primary">{course.category}</Badge>
      </td>
      <td className="py-3 px-4 text-surface-600 dark:text-surface-300">
        {course.enrolled || 0}
      </td>
      <td className="py-3 px-4 text-surface-600 dark:text-surface-300">
        {course.duration}
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-surface-600 dark:text-surface-300">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          {course.rating?.toFixed(1) || '-'}
        </span>
      </td>
      <td className="py-3 px-4">
        <button
          onClick={onToggleStatus}
          className="flex items-center gap-1 text-sm font-medium hover:underline cursor-pointer"
          title={course.status === 'published' ? 'Despublicar' : 'Publicar'}
        >
          <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'secondary'}>
            {course.status === 'published' ? 'Publicado' : course.status === 'draft' ? 'Rascunho' : 'Arquivado'}
          </Badge>
          {course.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} className="text-primary-500" />}
        </button>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/admin/courses/${course.id}`} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <Eye size={16} />
          </Link>
          <Link to={`/admin/courses/${course.id}`} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <Edit size={16} />
          </Link>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-red-500 cursor-pointer">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const CourseManagement = () => {
  const { courses, deleteCourse, updateCourseStatus, reorderCourses } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courseList, setCourseList] = useState(courses);

  useEffect(() => {
    setCourseList(courses);
  }, [courses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categories = ['all', ...new Set(courses.map(c => c.category))];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = courseList.findIndex(c => c.id === active.id);
      const newIndex = courseList.findIndex(c => c.id === over.id);
      
      const newOrder = arrayMove(courseList, oldIndex, newIndex);
      setCourseList(newOrder);
      reorderCourses(oldIndex, newIndex);
      toast.success('Ordem dos cursos atualizada');
    }
  };

  const handleDelete = (id: string) => {
    const course = courses.find(c => c.id === id);
    toast.warning(`Tem certeza que deseja excluir o curso "${course?.title}"?`, {
      action: {
        label: 'Excluir',
        onClick: async () => {
          const deleted = await deleteCourse(id);
          if (deleted) {
            toast.success('Curso excluído com sucesso!');
          } else {
            toast.error('Não foi possível excluir o curso. Tente novamente.');
          }
        },
      },
      duration: 5000,
    });
  };

  const handleToggleStatus = async (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    
    const newStatus: Course['status'] = course.status === 'published' ? 'draft' : 'published';
    const updated = await updateCourseStatus(id, newStatus);
    if (updated) {
      toast.success(newStatus === 'published' ? 'Curso publicado com sucesso!' : 'Curso arquivado como rascunho');
    } else {
      toast.error('Não foi possível alterar o status do curso. Tente novamente.');
    }
  };

  const filteredCourses = courseList.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total de Cursos', value: courses.length, icon: BookOpen },
    { label: 'Total de Alunos', value: '1,250', icon: Users },
    { label: 'Horas de Conteúdo', value: '120h', icon: Clock },
    { label: 'Nota Média', value: '4.5', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Gerenciamento de Cursos
              </h1>
              <p className="text-surface-500 dark:text-surface-300 mt-1">
                Gerencie todos os cursos da plataforma
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">
                <Upload size={18} />
                Importar
              </Button>
              <Link to="/admin/courses/create">
                <Button>
                  <Plus size={18} />
                  Novo Curso
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <stat.icon size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stat.value}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-300">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300 w-12"></th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Curso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Alunos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Duração</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Nota</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-surface-500 dark:text-surface-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={filteredCourses.map(c => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {filteredCourses.map((course) => (
                      <SortableRow
                        key={course.id}
                        course={course}
                        onDelete={() => handleDelete(course.id)}
                        onToggleStatus={() => handleToggleStatus(course.id)}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
              <p className="text-surface-500 dark:text-surface-300">Nenhum curso encontrado</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};