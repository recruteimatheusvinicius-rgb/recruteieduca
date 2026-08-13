import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockCourses } from '../data/courses';
import { mockUsers, mockPlans, mockCategories, mockFormations } from '../data/users';
import { mockHelpArticles } from '../data/helpArticles';
import type { Course, User, HelpArticle, Plan, Category, Formation, CourseLevel } from '../types';

// ---- Mapping helpers para a tabela `courses` ----
// Schema do banco usa snake_case; o tipo Course usa camelCase.
// Sem isto, INSERT/UPDATE rejeita colunas (`instructorPhoto` não existe) e SELECT
// retorna campos vazios no front.
interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  instructor: string | null;
  instructor_photo: string | null;
  instructor_bio: string | null;
  duration: string | null;
  level: string | null;
  rating: number | null;
  enrolled: number | null;
  restricted_plans: string[] | null;
  modules: unknown;
  certificate_config: unknown;
  thumbnail: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const toDbCourse = (c: Partial<Course>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.title !== undefined) row.title = c.title;
  if (c.description !== undefined) row.description = c.description;
  if (c.category !== undefined) row.category = c.category;
  if (c.instructor !== undefined) row.instructor = c.instructor;
  if (c.instructorPhoto !== undefined) row.instructor_photo = c.instructorPhoto;
  if (c.instructorBio !== undefined) row.instructor_bio = c.instructorBio;
  if (c.duration !== undefined) row.duration = c.duration;
  if (c.level !== undefined) row.level = c.level;
  if (c.rating !== undefined) row.rating = c.rating;
  if (c.enrolled !== undefined) row.enrolled = c.enrolled;
  if (c.restrictedPlans !== undefined) row.restricted_plans = c.restrictedPlans;
  if (c.modules !== undefined) row.modules = c.modules;
  if (c.certificateConfig !== undefined) row.certificate_config = c.certificateConfig;
  if (c.thumbnail !== undefined) row.thumbnail = c.thumbnail;
  if (c.status !== undefined) row.status = c.status;
  if (c.createdAt !== undefined) row.created_at = c.createdAt;
  if (c.updatedAt !== undefined) row.updated_at = c.updatedAt;
  return row;
};

interface HelpArticleRow {
  id: string;
  title: string;
  content: string;
  category: string;
  video_url: string | null;
}

const fromDbHelpArticle = (row: HelpArticleRow): HelpArticle => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  videoUrl: row.video_url ?? undefined,
});

const fromDbCourse = (row: CourseRow): Course => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  category: row.category ?? '',
  instructor: row.instructor ?? '',
  instructorPhoto: row.instructor_photo ?? undefined,
  instructorBio: row.instructor_bio ?? undefined,
  duration: row.duration ?? '',
  level: (row.level as Course['level']) ?? 'iniciante',
  rating: row.rating ?? 0,
  enrolled: row.enrolled ?? 0,
  restrictedPlans: row.restricted_plans ?? [],
  modules: (row.modules as Course['modules']) ?? [],
  certificateConfig: (row.certificate_config as Course['certificateConfig']) ?? {
    enableCertificate: false,
    requireCompletion: true,
    requirePassingGrade: false,
    passingGrade: 70,
  },
  thumbnail: row.thumbnail ?? undefined,
  status: (row.status as Course['status']) ?? 'draft',
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

interface DataState {
  courses: Course[];
  users: User[];
  helpArticles: HelpArticle[];
  plans: Plan[];
  categories: Category[];
  formations: Formation[];
  levels: CourseLevel[];
  loading: boolean;
  initialized: boolean;
  
  // Initialize data (from Supabase or mock)
  initialize: () => Promise<void>;
  
  // Course operations
  addCourse: (course: Course) => Promise<boolean>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<boolean>;
  updateCourseStatus: (id: string, status: Course['status']) => Promise<boolean>;
  reorderCourses: (startIndex: number, endIndex: number) => Promise<void>;
  deleteCourse: (id: string) => Promise<boolean>;
  
  // Plan operations
  addPlan: (plan: Plan) => Promise<boolean>;
  updatePlan: (id: string, plan: Partial<Plan>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;

  // Category operations
  addCategory: (category: Category) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Formation operations
  addFormation: (formation: Formation) => Promise<boolean>;
  updateFormation: (id: string, formation: Partial<Formation>) => Promise<boolean>;
  deleteFormation: (id: string) => Promise<boolean>;

  // User operations
  addUser: (user: User) => Promise<boolean>;
  updateUser: (id: string, user: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  
  // Level operations
  addLevel: (level: CourseLevel) => Promise<void>;
  updateLevel: (index: number, level: CourseLevel) => Promise<void>;
  deleteLevel: (index: number) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  courses: [],
  users: [],
  helpArticles: [],
  plans: [],
  categories: [],
  formations: [],
  levels: ['iniciante', 'intermediario', 'avancado'],
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      if (isSupabaseConfigured()) {
        // Fetch from Supabase
        const [coursesRes, usersRes, categoriesRes, plansRes, formationsRes, helpArticlesRes] = await Promise.all([
          supabase.from('courses').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('name'),
          supabase.from('plans').select('*').order('name'),
          supabase.from('formations').select('*').order('created_at', { ascending: false }),
          supabase.from('help_articles').select('*').order('created_at', { ascending: false }),
        ]);

        set({
          courses: ((coursesRes.data || []) as CourseRow[]).map(fromDbCourse),
          helpArticles: ((helpArticlesRes.data || []) as HelpArticleRow[]).map(fromDbHelpArticle),
          users: (usersRes.data || []) as User[],
          categories: (categoriesRes.data || []) as Category[],
          plans: (plansRes.data || []) as Plan[],
          formations: (formationsRes.data || []) as Formation[],
          initialized: true,
        });
      } else {
        // Use mock data
        set({
          courses: mockCourses,
          users: mockUsers,
          helpArticles: mockHelpArticles,
          plans: mockPlans,
          categories: mockCategories,
          formations: mockFormations,
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Fallback to mock data
      set({
        courses: mockCourses,
        users: mockUsers,
        helpArticles: mockHelpArticles,
        plans: mockPlans,
        categories: mockCategories,
        formations: mockFormations,
        initialized: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  // Course operations
  addCourse: async (course) => {
    if (isSupabaseConfigured()) {
      const now = new Date().toISOString();
      const row = toDbCourse({ ...course, createdAt: course.createdAt ?? now, updatedAt: now });
      const { data, error } = await supabase
        .from('courses')
        .insert([row])
        .select()
        .single();

      if (!error && data) {
        const mapped = fromDbCourse(data as CourseRow);
        set((state) => ({ courses: [mapped, ...state.courses] }));
        return true;
      }

      console.error('Failed to add course:', error);
      return false;
    } else {
      set((state) => ({ courses: [...state.courses, course] }));
      return true;
    }
  },

  updateCourse: async (id, course) => {
    const patch = toDbCourse({ ...course, updatedAt: new Date().toISOString() });

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('courses')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const mapped = fromDbCourse(data as CourseRow);
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? mapped : c)),
        }));
        return true;
      }

      console.error('Failed to update course:', error);
      return false;
    } else {
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? { ...c, ...course, updatedAt: new Date().toISOString() } : c)),
      }));
      return true;
    }
  },

  updateCourseStatus: async (id, status) => {
    return get().updateCourse(id, { status });
  },

  reorderCourses: async (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.courses);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { courses: result };
    });
  },

  deleteCourse: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) {
        set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
        return true;
      }

      console.error('Failed to delete course:', error);
      return false;
    } else {
      set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
      return true;
    }
  },

  // Plan operations
  addPlan: async (plan) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('plans')
        .insert([{ ...plan, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ plans: [...state.plans, data as Plan] }));
        return true;
      }
      console.error('Failed to add plan:', error);
      return false;
    } else {
      set((state) => ({ plans: [...state.plans, plan] }));
      return true;
    }
  },

  updatePlan: async (id, plan) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('plans')
        .update(plan)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ plans: state.plans.map((p) => (p.id === id ? (data as Plan) : p)) }));
        return true;
      }
      console.error('Failed to update plan:', error);
      return false;
    } else {
      set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, ...plan } : p)) }));
      return true;
    }
  },

  deletePlan: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (!error) {
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
        return true;
      }
      console.error('Failed to delete plan:', error);
      return false;
    } else {
      set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
      return true;
    }
  },

  // Category operations
  addCategory: async (category) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ categories: [...state.categories, data as Category] }));
        return true;
      }
      console.error('Failed to add category:', error);
      return false;
    } else {
      set((state) => ({ categories: [...state.categories, category] }));
      return true;
    }
  },

  updateCategory: async (id, category) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ categories: state.categories.map((c) => (c.id === id ? (data as Category) : c)) }));
        return true;
      }
      console.error('Failed to update category:', error);
      return false;
    } else {
      set((state) => ({ categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c)) }));
      return true;
    }
  },

  deleteCategory: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
        return true;
      }
      console.error('Failed to delete category:', error);
      return false;
    } else {
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
      return true;
    }
  },

  // Formation operations
  addFormation: async (formation) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('formations')
        .insert([{ ...formation, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ formations: [...state.formations, data as Formation] }));
        return true;
      }
      console.error('Failed to add formation:', error);
      return false;
    } else {
      set((state) => ({ formations: [...state.formations, formation] }));
      return true;
    }
  },

  updateFormation: async (id, formation) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('formations')
        .update(formation)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ formations: state.formations.map((f) => (f.id === id ? (data as Formation) : f)) }));
        return true;
      }
      console.error('Failed to update formation:', error);
      return false;
    } else {
      set((state) => ({ formations: state.formations.map((f) => (f.id === id ? { ...f, ...formation } : f)) }));
      return true;
    }
  },

  deleteFormation: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('formations').delete().eq('id', id);
      if (!error) {
        set((state) => ({ formations: state.formations.filter((f) => f.id !== id) }));
        return true;
      }
      console.error('Failed to delete formation:', error);
      return false;
    } else {
      set((state) => ({ formations: state.formations.filter((f) => f.id !== id) }));
      return true;
    }
  },

  // User operations
  addUser: async (user) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...user, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ users: [...state.users, data as User] }));
        return true;
      }
      console.error('Failed to add user:', error);
      return false;
    } else {
      set((state) => ({ users: [...state.users, user] }));
      return true;
    }
  },

  updateUser: async (id, user) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update(user)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        set((state) => ({ users: state.users.map((u) => (u.id === id ? (data as User) : u)) }));
        return true;
      }
      console.error('Failed to update user:', error);
      return false;
    } else {
      set((state) => ({ users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)) }));
      return true;
    }
  },

  deleteUser: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) {
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
        return true;
      }
      console.error('Failed to delete user:', error);
      return false;
    } else {
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      return true;
    }
  },

  // Level operations (local only)
  addLevel: async (level) => set((state) => ({ levels: [...state.levels, level] })),
  updateLevel: async (index, level) => set((state) => ({ levels: state.levels.map((l, i) => (i === index ? level : l)) })),
  deleteLevel: async (index) => set((state) => ({ levels: state.levels.filter((_, i) => i !== index) })),
}));