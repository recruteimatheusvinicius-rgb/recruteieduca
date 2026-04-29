import { Link } from 'react-router-dom';
import { Clock, Star, Users, Play, BookOpen } from 'lucide-react';
import { Badge } from './Badge';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  progress?: number;
  showProgress?: boolean;
}

export const CourseCard = ({ course, progress = 0, showProgress = false }: CourseCardProps) => {
  const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    'Programação': 'primary',
    'Design': 'info',
    'Marketing': 'warning',
    'Negócios': 'success',
    'default': 'primary',
  };

  const categoryVariant = categoryColors[course.category] || categoryColors['default'];

  return (
    <Link 
      to={`/course/${course.id}`}
      className="group block bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden card-hover"
    >
      <div className="relative aspect-video bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={40} className="text-surface-300 dark:text-surface-600" />
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <Badge variant={categoryVariant}>{course.category}</Badge>
        </div>
        
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-200 dark:bg-surface-700">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-surface-500 dark:text-surface-200 mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-300">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {course.duration}
          </span>
          {course.rating && (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              {course.rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={14} />
            {course.enrolled || 0}
          </span>
        </div>

        {showProgress && (
          <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-500 dark:text-surface-300">Progresso</span>
              <span className="font-medium text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

interface CourseCardHorizontalProps {
  course: Course;
}

export const CourseCardHorizontal = ({ course }: CourseCardHorizontalProps) => {
  return (
    <Link 
      to={`/course/${course.id}`}
      className="group flex gap-4 p-3 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card transition-all"
    >
      <div className="relative w-32 h-20 flex-shrink-0 bg-surface-100 dark:bg-surface-700 rounded-lg overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={20} className="text-surface-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-surface-900 dark:text-surface-100 truncate group-hover:text-primary-600 transition-colors">
          {course.title}
        </h4>
        <p className="text-sm text-surface-500 dark:text-surface-300 truncate">
          {course.instructor}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-surface-400 dark:text-surface-300">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} aulas
          </span>
        </div>
      </div>
    </Link>
  );
};