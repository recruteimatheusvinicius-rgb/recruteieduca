import type { Course, User, Plan, Category, Formation, Company } from '../types';

export type Database = {
  public: {
    Tables: {
      help_articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          video_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: string;
          video_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          title: string;
          content: string;
          category: string;
          video_url: string | null;
          created_at: string;
          updated_at: string;
        }>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id'> & { id?: string };
        Update: Partial<Course>;
      };
      profiles: {
        Row: User;
        Insert: Omit<User, 'id'> & { id?: string };
        Update: Partial<User>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'> & { id?: string };
        Update: Partial<Category>;
      };
      plans: {
        Row: Plan;
        Insert: Omit<Plan, 'id'> & { id?: string };
        Update: Partial<Plan>;
      };
      formations: {
        Row: Formation;
        Insert: Omit<Formation, 'id'> & { id?: string };
        Update: Partial<Formation>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id'> & { id?: string };
        Update: Partial<Company>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          lesson_id: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          lesson_id?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          course_id: string;
          lesson_id: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        }>;
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress?: number;
          enrolled_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          enrolled_at: string;
        }>;
      };
    };
  };
};