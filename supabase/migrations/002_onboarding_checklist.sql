-- Migration: Onboarding Checklist (tracks, templates, progress) + storage bucket
-- Date: 2026-06-30
-- Description: Checklist de onboarding por track de cliente (Self-service, Guided
-- Growth, Enterprise Deploy, Rescue/Recover), com etapas que podem referenciar
-- aulas/cursos existentes da Academy, calls e milestones manuais. Camada nova e
-- dedicada (não reaproveita Course/Module/Lesson), pois esses tipos só modelam
-- conteúdo educacional, não processo de CS (calls, milestones do produto).

-- ============================================
-- 1. Track de onboarding na empresa
-- ============================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_track TEXT
  CHECK (onboarding_track IN ('self_service', 'guided_growth', 'enterprise_deploy', 'rescue_recover'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_track_assigned_at TIMESTAMPTZ;

-- ============================================
-- 2. Templates de checklist por track (1 template ativo por track no MVP)
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_templates (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL CHECK (track IN ('self_service', 'guided_growth', 'enterprise_deploy', 'rescue_recover')),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_track ON checklist_templates(track) WHERE is_active = TRUE;

-- ============================================
-- 3. Itens do template (etapas do checklist)
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_template_items (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('academy_lesson', 'call', 'manual_milestone', 'certificate')),
  "order" INTEGER NOT NULL DEFAULT 0,
  blocks_next BOOLEAN DEFAULT TRUE,
  scope TEXT NOT NULL DEFAULT 'company' CHECK (scope IN ('company', 'user')),
  -- referência opcional a uma aula/curso da Academy, sem FK: course_id não tem
  -- REFERENCES porque o courses.id real do projeto é UUID (diverge do TEXT
  -- declarado em supabase/migration.sql) e lesson_id não tem FK pois a tabela
  -- `lessons` fica vazia (fonte de verdade é o JSONB courses.modules).
  course_id TEXT,
  lesson_id TEXT,
  -- reservado para fase futura: webhook do produto Recrutei populando este item
  -- automaticamente (ex: 'first_vacancy_published')
  product_event_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checklist_items_template ON checklist_template_items(template_id, "order");

-- ============================================
-- 4. Progresso de cada item, por empresa (e por usuário quando scope='user')
-- ============================================
-- company_id/user_id/completed_by não têm FK para companies(id)/profiles(id):
-- esses ids são UUID no banco real do projeto (diverge do TEXT declarado em
-- supabase/migration.sql), então uma FK aqui falharia por incompatibilidade de
-- tipo, igual já aconteceu com course_id. São validados pela aplicação, não
-- pelo banco — mesmo tratamento dado a course_id/lesson_id acima.
CREATE TABLE IF NOT EXISTS checklist_item_progress (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  template_item_id TEXT NOT NULL REFERENCES checklist_template_items(id) ON DELETE CASCADE,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checklist_progress_company ON checklist_item_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_checklist_progress_user ON checklist_item_progress(user_id);

-- Unicidade: 1 linha "company-level" por item (user_id NULL) e 1 linha por
-- usuário quando o item é scope='user'. Usa índices parciais em vez de
-- `UNIQUE NULLS NOT DISTINCT` para não depender de Postgres 15+.
CREATE UNIQUE INDEX IF NOT EXISTS idx_checklist_progress_company_scope
  ON checklist_item_progress(company_id, template_item_id) WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checklist_progress_user_scope
  ON checklist_item_progress(company_id, template_item_id, user_id) WHERE user_id IS NOT NULL;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_item_progress ENABLE ROW LEVEL SECURITY;

-- templates/items: leitura pública (cliente precisa ver o que falta), escrita só admin
DROP POLICY IF EXISTS "Allow read checklist_templates" ON checklist_templates;
CREATE POLICY "Allow read checklist_templates" ON checklist_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write checklist_templates" ON checklist_templates;
CREATE POLICY "Allow write checklist_templates" ON checklist_templates FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Allow read checklist_template_items" ON checklist_template_items;
CREATE POLICY "Allow read checklist_template_items" ON checklist_template_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write checklist_template_items" ON checklist_template_items;
CREATE POLICY "Allow write checklist_template_items" ON checklist_template_items FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- progress: usuário só vê/edita progresso da PRÓPRIA empresa; admin vê/edita tudo
DROP POLICY IF EXISTS "Allow read checklist_item_progress" ON checklist_item_progress;
CREATE POLICY "Allow read checklist_item_progress" ON checklist_item_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (company_id::text = checklist_item_progress.company_id OR role = 'admin')
  )
);
DROP POLICY IF EXISTS "Allow insert checklist_item_progress" ON checklist_item_progress;
CREATE POLICY "Allow insert checklist_item_progress" ON checklist_item_progress FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (company_id::text = checklist_item_progress.company_id OR role = 'admin')
  )
);
DROP POLICY IF EXISTS "Allow update checklist_item_progress" ON checklist_item_progress;
CREATE POLICY "Allow update checklist_item_progress" ON checklist_item_progress FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (company_id::text = checklist_item_progress.company_id OR role = 'admin')
  )
);

-- ============================================
-- 5. Storage bucket para imagens de conteúdo (editor de artigo/aula)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-content', 'lesson-content', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read lesson-content" ON storage.objects;
CREATE POLICY "Public read lesson-content" ON storage.objects
  FOR SELECT USING (bucket_id = 'lesson-content');

DROP POLICY IF EXISTS "Admin upload lesson-content" ON storage.objects;
CREATE POLICY "Admin upload lesson-content" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lesson-content' AND auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin delete lesson-content" ON storage.objects;
CREATE POLICY "Admin delete lesson-content" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lesson-content' AND auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
