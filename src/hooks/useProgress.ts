import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ProgressData {
  completed: boolean;
  completed_at: string | null;
}

export interface EnrollmentData {
  progress: number;
  last_lesson_id: string | null;
  enrolled_at: string;
  status: string;
}

export const progressService = {
  async getEnrollment(userId: string, courseId: string): Promise<EnrollmentData | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('progress, last_lesson_id, enrolled_at, status')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error) {
        console.error('Error fetching enrollment:', error);
        return null;
      }

      return data as EnrollmentData;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  },

  async getCompletedLessons(userId: string, courseId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching completed lessons:', error);
        return [];
      }

      return data?.map(item => item.lesson_id) || [];
    } catch (error) {
      console.error('Error fetching completed lessons:', error);
      return [];
    }
  },

  async saveLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    completed: boolean
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: completed,
          completed_at: completed ? now : null,
          updated_at: now,
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (error) {
        console.error('Error saving lesson progress:', error);
        return false;
      }

      await this.updateCourseProgress(userId, courseId);
      return true;
    } catch (error) {
      console.error('Error saving lesson progress:', error);
      return false;
    }
  },

  async updateCourseProgress(userId: string, courseId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const [lessonsRes, progressRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('id')
          .eq('course_id', courseId),
        supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('completed', true),
      ]);

      const totalLessons = lessonsRes.data?.length || 0;
      const completedLessons = progressRes.data?.length || 0;

      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;

      const status = progressPercentage >= 100 ? 'completed' : 'in_progress';

      const { error } = await supabase
        .from('enrollments')
        .upsert({
          user_id: userId,
          course_id: courseId,
          progress: progressPercentage,
          status: status,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,course_id',
        });

      if (error) {
        console.error('Error updating course progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating course progress:', error);
      return false;
    }
  },

  async updateLastLesson(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .upsert({
          user_id: userId,
          course_id: courseId,
          last_lesson_id: lessonId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,course_id',
        });

      if (error) {
        console.error('Error updating last lesson:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating last lesson:', error);
      return false;
    }
  },

  async enrollInCourse(userId: string, courseId: string, firstLessonId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .upsert({
          user_id: userId,
          course_id: courseId,
          progress: 0,
          status: 'in_progress',
          last_lesson_id: firstLessonId,
          enrolled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,course_id',
        });

      if (error) {
        console.error('Error enrolling in course:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }
  },

  async getNextIncompleteLesson(
    userId: string, 
    courseId: string, 
    allLessons: { id: string }[]
  ): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      return allLessons[0]?.id || null;
    }

    try {
      const completedLessons = await this.getCompletedLessons(userId, courseId);
      
      const nextLesson = allLessons.find(lesson => 
        !completedLessons.includes(lesson.id)
      );

      return nextLesson?.id || null;
    } catch (error) {
      console.error('Error finding next lesson:', error);
      return allLessons[0]?.id || null;
    }
  },
};