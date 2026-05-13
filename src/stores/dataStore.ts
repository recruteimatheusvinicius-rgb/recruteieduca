import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockCourses } from '../data/courses';
import { mockUsers, mockPlans, mockCategories, mockFormations } from '../data/users';
import { mockHelpArticles } from '../data/helpArticles';
import type { Course, User, HelpArticle, Plan, Category, Formation, CourseLevel } from '../types';

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
  addPlan: (plan: Plan) => Promise<void>;
  updatePlan: (id: string, plan: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  
  // Category operations
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Formation operations
  addFormation: (formation: Formation) => Promise<void>;
  updateFormation: (id: string, formation: Partial<Formation>) => Promise<void>;
  deleteFormation: (id: string) => Promise<void>;
  
  // User operations
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
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
          courses: (coursesRes.data || []) as Course[],
          users: (usersRes.data || []) as User[],
          categories: (categoriesRes.data || []) as Category[],
          plans: (plansRes.data || []) as Plan[],
          formations: (formationsRes.data || []) as Formation[],
          helpArticles: (helpArticlesRes.data || []) as HelpArticle[],
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
      const { data, error } = await supabase
        .from('courses')
        .insert([{ ...course, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({ courses: [data as Course, ...state.courses] }));
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
    const updatedCourse = { ...course, updated_at: new Date().toISOString() };
    
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('courses')
        .update(updatedCourse)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? (data as Course) : c)),
        }));
        return true;
      }

      console.error('Failed to update course:', error);
      return false;
    } else {
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? { ...c, ...updatedCourse } : c)),
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
      }
    } else {
      set((state) => ({ plans: [...state.plans, plan] }));
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
      }
    } else {
      set((state) => ({ plans: state.plans.map((p) => (p.id === id ? { ...p, ...plan } : p)) }));
    }
  },

  deletePlan: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (!error) {
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
      }
    } else {
      set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
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
      }
    } else {
      set((state) => ({ categories: [...state.categories, category] }));
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
      }
    } else {
      set((state) => ({ categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c)) }));
    }
  },

  deleteCategory: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
      }
    } else {
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
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
      }
    } else {
      set((state) => ({ formations: [...state.formations, formation] }));
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
      }
    } else {
      set((state) => ({ formations: state.formations.map((f) => (f.id === id ? { ...f, ...formation } : f)) }));
    }
  },

  deleteFormation: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('formations').delete().eq('id', id);
      if (!error) {
        set((state) => ({ formations: state.formations.filter((f) => f.id !== id) }));
      }
    } else {
      set((state) => ({ formations: state.formations.filter((f) => f.id !== id) }));
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
      }
    } else {
      set((state) => ({ users: [...state.users, user] }));
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
      }
    } else {
      set((state) => ({ users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u)) }));
    }
  },

  deleteUser: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) {
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      }
    } else {
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
    }
  },

  // Level operations (local only)
  addLevel: async (level) => set((state) => ({ levels: [...state.levels, level] })),
  updateLevel: async (index, level) => set((state) => ({ levels: state.levels.map((l, i) => (i === index ? level : l)) })),
  deleteLevel: async (index) => set((state) => ({ levels: state.levels.filter((_, i) => i !== index) })),
}));