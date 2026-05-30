-- Add DEFAULT gen_random_uuid()::text to id columns that had no default.
-- Required so upserts without an explicit `id` in the payload succeed on INSERT.
-- The onConflict upsert path (UPDATE) is unaffected — id is not in those payloads.

ALTER TABLE user_enrollments ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE user_progress     ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
