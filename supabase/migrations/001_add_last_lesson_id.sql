-- Migration: Add last_lesson_id to enrollments table
-- Date: 2026-04-26
-- Description: Tracks the last lesson accessed by user in each course

-- Add column to track last lesson accessed
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS last_lesson_id TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON user_enrollments(user_id, course_id);

-- Add index for last_lesson_id queries
CREATE INDEX IF NOT EXISTS idx_enrollments_last_lesson ON user_enrollments(last_lesson_id);

-- Update RLS policy to allow updating last_lesson_id
-- (Already covered by existing update policy)

-- Create view for user course progress with last lesson
CREATE OR REPLACE VIEW user_course_progress AS
SELECT 
    ue.user_id,
    ue.course_id,
    ue.progress,
    ue.last_lesson_id,
    ue.enrolled_at,
    ue.status,
    COUNT(up.id) FILTER (WHERE up.completed = true) as completed_lessons,
    COUNT(l.id) as total_lessons
FROM user_enrollments ue
LEFT JOIN user_progress up ON ue.user_id = up.user_id AND ue.course_id = up.course_id
LEFT JOIN lessons l ON l.course_id = ue.course_id
GROUP BY ue.user_id, ue.course_id, ue.progress, ue.last_lesson_id, ue.enrolled_at, ue.status;