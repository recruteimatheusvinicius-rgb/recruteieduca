import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:eIub8ejwYGGEUy0J@db.bilmsmifaflzeguuzqml.supabase.co:5432/postgres';

const sql = `
-- ============================================
-- TABELAS DO RECRUTEIEDUCA
-- ============================================

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

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- Políticas (permite tudo por enquanto)
CREATE POLICY IF NOT EXISTS "Allow read courses" ON courses FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert courses" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow update courses" ON courses FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow delete courses" ON courses FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "Allow read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow update profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow read categories" ON categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read plans" ON plans FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read formations" ON formations FOR SELECT USING (true);

-- ============================================
-- DADOS INICIAIS (SEED)
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
`;

async function createTables() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase!');
    
    await client.query(sql);
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Verificar tabelas criadas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tabelas criadas:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

createTables();