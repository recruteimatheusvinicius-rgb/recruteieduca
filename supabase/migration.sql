-- ============================================
-- TABELAS DO RECRUTEIEDUCA
-- ============================================

-- Tabela de Artigos de Ajuda
CREATE TABLE IF NOT EXISTS help_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  instructor TEXT,
  instructor_photo TEXT,
  instructor_bio TEXT,
  duration TEXT,
  level TEXT DEFAULT 'iniciante',
  rating REAL DEFAULT 0,
  enrolled INTEGER DEFAULT 0,
  restricted_plans TEXT[] DEFAULT '{}',
  modules JSONB DEFAULT '[]'::jsonb,
  certificate_config JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#16a34a',
  course_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  course_restrictions TEXT[] DEFAULT '{}',
  formation_restrictions TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#16a34a',
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Formações
CREATE TABLE IF NOT EXISTS formations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  level TEXT DEFAULT 'iniciante',
  courses TEXT[] DEFAULT '{}',
  certificate_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Conquistas dos Usuários
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Lições
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'video' CHECK (type IN ('video', 'quiz', 'reading', 'guide', 'assessment')),
  content TEXT,
  video_url TEXT,
  video_text TEXT,
  duration TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Matrículas de Usuários
CREATE TABLE IF NOT EXISTS user_enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES plans(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'dropped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Tabela de Progresso do Usuário
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS user_certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Recuperação de Senha
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Logs de Email
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  external_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna company_id na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES companies(id);

-- Índice para performance em consultas por empresa
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);

-- Trigger para excluir usuários quando empresa for excluída
CREATE OR REPLACE FUNCTION delete_company_users()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM profiles WHERE company_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_company_delete ON companies;
CREATE TRIGGER on_company_delete
BEFORE DELETE ON companies
FOR EACH ROW EXECUTE FUNCTION delete_company_users();

-- Habilitar RLS para companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read companies" ON companies;
DROP POLICY IF EXISTS "Allow insert companies" ON companies;
DROP POLICY IF EXISTS "Allow update companies" ON companies;
DROP POLICY IF EXISTS "Allow delete companies" ON companies;
CREATE POLICY "Allow read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow insert companies" ON companies FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow update companies" ON companies FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow delete companies" ON companies FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para courses
-- READ: público (todos podem ver cursos)
-- INSERT/UPDATE/DELETE: apenas admins
DROP POLICY IF EXISTS "Allow read courses" ON courses;
DROP POLICY IF EXISTS "Allow insert courses" ON courses;
DROP POLICY IF EXISTS "Allow update courses" ON courses;
DROP POLICY IF EXISTS "Allow delete courses" ON courses;
CREATE POLICY "Allow read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow insert courses" ON courses FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow update courses" ON courses FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow delete courses" ON courses FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para profiles
-- READ: público (todos podem ver perfis)
-- INSERT/UPDATE: apenas próprio usuário (id = auth.uid())
DROP POLICY IF EXISTS "Allow read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow update profiles" ON profiles;
CREATE POLICY "Allow read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Allow update profiles" ON profiles FOR UPDATE USING (auth.uid()::text = id);

-- Políticas para categories
DROP POLICY IF EXISTS "Allow read categories" ON categories;
CREATE POLICY "Allow read categories" ON categories FOR SELECT USING (true);

-- Políticas para plans
DROP POLICY IF EXISTS "Allow read plans" ON plans;
CREATE POLICY "Allow read plans" ON plans FOR SELECT USING (true);

-- Políticas para formations
DROP POLICY IF EXISTS "Allow read formations" ON formations;
CREATE POLICY "Allow read formations" ON formations FOR SELECT USING (true);

-- Políticas para user_achievements
DROP POLICY IF EXISTS "Allow read user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Allow insert user_achievements" ON user_achievements;
CREATE POLICY "Allow read user_achievements" ON user_achievements FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Allow insert user_achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Políticas para lessons
DROP POLICY IF EXISTS "Allow read lessons" ON lessons;
CREATE POLICY "Allow read lessons" ON lessons FOR SELECT USING (true);

-- Políticas para user_enrollments
DROP POLICY IF EXISTS "Allow read user_enrollments" ON user_enrollments;
DROP POLICY IF EXISTS "Allow insert user_enrollments" ON user_enrollments;
DROP POLICY IF EXISTS "Allow update user_enrollments" ON user_enrollments;
CREATE POLICY "Allow read user_enrollments" ON user_enrollments FOR SELECT USING (
  auth.uid()::text = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow insert user_enrollments" ON user_enrollments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Allow update user_enrollments" ON user_enrollments FOR UPDATE USING (auth.uid()::text = user_id);

-- Políticas para user_progress
DROP POLICY IF EXISTS "Allow read user_progress" ON user_progress;
DROP POLICY IF EXISTS "Allow insert user_progress" ON user_progress;
DROP POLICY IF EXISTS "Allow update user_progress" ON user_progress;
CREATE POLICY "Allow read user_progress" ON user_progress FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Allow insert user_progress" ON user_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Allow update user_progress" ON user_progress FOR UPDATE USING (auth.uid()::text = user_id);

-- Políticas para user_certificates
DROP POLICY IF EXISTS "Allow read user_certificates" ON user_certificates;
CREATE POLICY "Allow read user_certificates" ON user_certificates FOR SELECT USING (
  auth.uid()::text = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para password_resets
DROP POLICY IF EXISTS "Allow insert password_resets" ON password_resets;
DROP POLICY IF EXISTS "Allow read password_resets" ON password_resets;
CREATE POLICY "Allow insert password_resets" ON password_resets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read password_resets" ON password_resets FOR SELECT USING (token IS NOT NULL);

-- Políticas para notifications
DROP POLICY IF EXISTS "Allow read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow update notifications" ON notifications;
CREATE POLICY "Allow read notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Allow insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Allow update notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id);

-- Políticas para email_logs
DROP POLICY IF EXISTS "Allow read email_logs" ON email_logs;
DROP POLICY IF EXISTS "Allow insert email_logs" ON email_logs;
CREATE POLICY "Allow read email_logs" ON email_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert email_logs" ON email_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- DADOS INICIAIS
-- ============================================

INSERT INTO categories (id, name, description, color, course_count) VALUES
  ('cat-1', 'Desenvolvimento Web', 'Cursos de desenvolvimento web e frontend', '#3b82f6', 3),
  ('cat-2', 'Mobile', 'Cursos de desenvolvimento mobile', '#8b5cf6', 2),
  ('cat-3', 'Data Science', 'Cursos de análise de dados e machine learning', '#10b981', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (id, name, features, color, is_popular) VALUES
  ('plan-free', 'Gratuito', ARRAY['Acesso a cursos básicos', 'Certificados básicos'], '#16a34a', false),
  ('plan-pro', 'Pro', ARRAY['Acesso a todos os cursos', 'Certificados premium', 'Suporte prioritário'], '#f59e0b', true),
  ('plan-enterprise', 'Enterprise', ARRAY['Acesso ilimitado', 'Certificados personalizados', 'Suporte 24/7', 'Dashboard corporativo'], '#ef4444', false)
ON CONFLICT (id) DO NOTHING;