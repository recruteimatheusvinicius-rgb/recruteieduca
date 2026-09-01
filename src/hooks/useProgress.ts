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

/**
 * Helper: conta o total de aulas de um curso lendo do JSONB courses.modules.
 * O admin grava o curso inteiro (módulos + aulas aninhadas) no campo `modules`,
 * então NÃO podemos usar `SELECT FROM lessons WHERE course_id=...` (tabela vazia).
 */
async function countCourseLessons(courseId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('modules')
      .eq('id', courseId)
      .single();
    if (error || !data) return 0;
    const modules = (data.modules as Array<{ lessons?: unknown[] }> | null) ?? [];
    return modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0);
  } catch (err) {
    console.error('countCourseLessons error:', err);
    return 0;
  }
}

export const progressService = {
  async getEnrollment(userId: string, courseId: string): Promise<EnrollmentData | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      // maybeSingle: retorna null em vez de erro quando não há linha
      const { data, error } = await supabase
        .from('user_enrollments')
        .select('progress, last_lesson_id, enrolled_at, status')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching enrollment:', error);
        return null;
      }
      return (data as EnrollmentData) ?? null;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  },

  async getCompletedLessons(userId: string, courseId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) return [];

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
      return data?.map((item) => item.lesson_id as string) ?? [];
    } catch (error) {
      console.error('Error fetching completed lessons:', error);
      return [];
    }
  },

  async saveLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    completed: boolean,
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? now : null,
        updated_at: now,
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id,lesson_id', ignoreDuplicates: false });

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
    if (!isSupabaseConfigured()) return false;

    try {
      // Total de aulas vem do JSONB do curso, NÃO da tabela `lessons` (sempre vazia)
      const [totalLessons, completedRes] = await Promise.all([
        countCourseLessons(courseId),
        supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('completed', true),
      ]);

      const completedLessons = completedRes.data?.length ?? 0;
      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const status = progressPercentage >= 100 ? 'completed' : 'in_progress';

      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        course_id: courseId,
        progress: progressPercentage,
        status,
        updated_at: now,
        ...(progressPercentage >= 100 ? { completed_at: now } : {}),
      };

      const { error } = await supabase
        .from('user_enrollments')
        .upsert(payload, { onConflict: 'user_id,course_id', ignoreDuplicates: false });

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
    if (!isSupabaseConfigured()) return false;

    try {
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        course_id: courseId,
        last_lesson_id: lessonId,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_enrollments')
        .upsert(payload, { onConflict: 'user_id,course_id', ignoreDuplicates: false });

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

  async enrollInCourse(
    userId: string,
    courseId: string,
    firstLessonId: string,
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        course_id: courseId,
        progress: 0,
        status: 'in_progress',
        last_lesson_id: firstLessonId,
        enrolled_at: now,
        updated_at: now,
      };

      const { error } = await supabase
        .from('user_enrollments')
        .upsert(payload, { onConflict: 'user_id,course_id', ignoreDuplicates: false });

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

  /**
   * Progresso de vídeo (posição/percentual) de UMA aula — usado pelo CourseVideoPlayer
   * pra retomar de onde parou e pra travar o avanço além do ponto mais assistido.
   * Reaproveita as colunas `time_spent`/`progress_percentage` já existentes em
   * user_progress (mesma linha que `saveLessonProgress` usa pro toggle manual).
   */
  async getLessonVideoProgress(
    userId: string,
    lessonId: string,
  ): Promise<{ timeSpent: number; progressPercentage: number; completed: boolean } | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('time_spent, progress_percentage, completed')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        timeSpent: data.time_spent ?? 0,
        progressPercentage: data.progress_percentage ?? 0,
        completed: data.completed ?? false,
      };
    } catch (error) {
      console.error('Error fetching lesson video progress:', error);
      return null;
    }
  },

  async saveVideoProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    currentTime: number,
    duration: number,
  ): Promise<{ completed: boolean } | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const progressPercentage = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
      const completed = progressPercentage >= 90;
      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        time_spent: Math.round(currentTime),
        progress_percentage: Math.round(progressPercentage * 100) / 100,
        completed,
        ...(completed ? { completed_at: now } : {}),
        updated_at: now,
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id,lesson_id', ignoreDuplicates: false });

      if (error) {
        console.error('Error saving video progress:', error);
        return null;
      }

      if (completed) {
        await this.updateCourseProgress(userId, courseId);
      }
      return { completed };
    } catch (error) {
      console.error('Error saving video progress:', error);
      return null;
    }
  },

  async getNextIncompleteLesson(
    userId: string,
    courseId: string,
    allLessons: { id: string }[],
  ): Promise<string | null> {
    if (!isSupabaseConfigured()) return allLessons[0]?.id ?? null;

    try {
      const completedLessons = await this.getCompletedLessons(userId, courseId);
      const nextLesson = allLessons.find((l) => !completedLessons.includes(l.id));
      return nextLesson?.id ?? null;
    } catch (error) {
      console.error('Error finding next lesson:', error);
      return allLessons[0]?.id ?? null;
    }
  },
};
